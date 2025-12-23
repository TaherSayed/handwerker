import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../services/local_storage_service.dart';
import '../models/submission.dart';

class SubmissionsProvider with ChangeNotifier {
  final _apiService = ApiService();
  final _localStorage = LocalStorageService();
  
  List<Submission> _submissions = [];
  List<Submission> _drafts = [];
  bool _isLoading = false;
  String? _error;

  List<Submission> get submissions => _submissions;
  List<Submission> get drafts => _drafts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> initialize() async {
    await _localStorage.initialize();
    await loadDrafts();
  }

  Future<void> loadSubmissions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _submissions = await _apiService.getSubmissions();
    } catch (e) {
      _error = e.toString();
      debugPrint('Load submissions error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadDrafts() async {
    try {
      _drafts = await _localStorage.getDrafts();
      notifyListeners();
    } catch (e) {
      debugPrint('Load drafts error: $e');
    }
  }

  Future<void> saveDraft(Submission submission) async {
    try {
      await _localStorage.saveDraft(submission);
      await loadDrafts();
    } catch (e) {
      debugPrint('Save draft error: $e');
      rethrow;
    }
  }

  Future<void> submitSubmission(Submission submission) async {
    try {
      await _apiService.createSubmission(submission);
      await _localStorage.deleteDraft(submission.id);
      await loadDrafts();
      await loadSubmissions();
    } catch (e) {
      debugPrint('Submit submission error: $e');
      rethrow;
    }
  }

  Future<void> syncDrafts() async {
    try {
      for (var draft in _drafts) {
        if (draft.status == 'submitted') {
          await submitSubmission(draft);
        }
      }
    } catch (e) {
      debugPrint('Sync drafts error: $e');
    }
  }
}

