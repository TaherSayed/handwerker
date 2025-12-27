import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/form_template.dart';
import '../models/submission.dart';

class ApiService {
  final _supabase = Supabase.instance.client;
  final String _baseUrl = const String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  Future<Map<String, String>> _getHeaders() async {
    final session = _supabase.auth.currentSession;
    if (session == null) {
      throw Exception('Not authenticated');
    }

    return {
      'Authorization': 'Bearer ${session.accessToken}',
      'Content-Type': 'application/json',
    };
  }

  Future<List<FormTemplate>> getTemplates() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$_baseUrl/templates?is_archived=false'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => FormTemplate.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load templates');
    }
  }

  Future<List<Submission>> getSubmissions() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$_baseUrl/submissions'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Submission.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load submissions');
    }
  }

  Future<Submission> createSubmission(Submission submission) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/submissions'),
      headers: headers,
      body: json.encode(submission.toJson()),
    );

    if (response.statusCode == 201) {
      return Submission.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create submission');
    }
  }

  Future<Map<String, dynamic>> generatePDF(String submissionId) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/submissions/$submissionId/pdf'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to generate PDF');
    }
  }

  Future<Map<String, dynamic>> getSignedUploadUrl(
    String bucket,
    String fileName,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/uploads/signed-url'),
      headers: headers,
      body: json.encode({
        'bucket': bucket,
        'file_name': fileName,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to get signed upload URL');
    }
  }

  Future<String> uploadFile(File file, String bucket) async {
    final fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}';
    final signedUrlResponse = await getSignedUploadUrl(bucket, fileName);
    
    final signedUrl = signedUrlResponse['signed_url'];
    final path = signedUrlResponse['path'];

    if (signedUrl == null) throw Exception('Failed to get signed URL');

    final response = await http.put(
      Uri.parse(signedUrl),
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: await file.readAsBytes(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to upload file');
    }

    final publicUrl = _supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return publicUrl;
  }
}

