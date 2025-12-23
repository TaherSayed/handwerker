import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/form_template.dart';

class TemplatesProvider with ChangeNotifier {
  final _apiService = ApiService();
  List<FormTemplate> _templates = [];
  bool _isLoading = false;
  String? _error;

  List<FormTemplate> get templates => _templates;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadTemplates() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _templates = await _apiService.getTemplates();
    } catch (e) {
      _error = e.toString();
      debugPrint('Load templates error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  FormTemplate? getTemplateById(String id) {
    try {
      return _templates.firstWhere((t) => t.id == id);
    } catch (e) {
      return null;
    }
  }
}

