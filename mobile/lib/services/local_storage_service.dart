import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/submission.dart';

class LocalStorageService {
  static const String _draftsKey = 'drafts';
  SharedPreferences? _prefs;

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<List<Submission>> getDrafts() async {
    if (_prefs == null) await initialize();
    
    final draftsJson = _prefs!.getString(_draftsKey);
    if (draftsJson == null) return [];

    final List<dynamic> data = json.decode(draftsJson);
    return data.map((json) => Submission.fromJson(json)).toList();
  }

  Future<void> saveDraft(Submission submission) async {
    if (_prefs == null) await initialize();

    final drafts = await getDrafts();
    final index = drafts.indexWhere((d) => d.id == submission.id);

    if (index >= 0) {
      drafts[index] = submission;
    } else {
      drafts.add(submission);
    }

    await _prefs!.setString(
      _draftsKey,
      json.encode(drafts.map((d) => d.toJson()).toList()),
    );
  }

  Future<void> deleteDraft(String id) async {
    if (_prefs == null) await initialize();

    final drafts = await getDrafts();
    drafts.removeWhere((d) => d.id == id);

    await _prefs!.setString(
      _draftsKey,
      json.encode(drafts.map((d) => d.toJson()).toList()),
    );
  }
}

