import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

/// Database service for all Supabase operations
/// Handles CRUD operations for contacts, forms, visits, and reports
class DatabaseService {
  static DatabaseService? _instance;
  static DatabaseService get instance {
    if (_instance == null) {
      if (!SupabaseService.isConfigured) {
        throw Exception(
          'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
        );
      }
      _instance = DatabaseService._(SupabaseService.instance.client);
    }
    return _instance!;
  }

  final SupabaseClient _client;

  DatabaseService._(this._client);

  /// Factory constructor for custom client (for testing)
  factory DatabaseService.withClient(SupabaseClient client) {
    return DatabaseService._(client);
  }

  // ========================================
  // CONTACTS
  // ========================================

  /// Get all contacts for current user
  Future<List<Map<String, dynamic>>> getContacts({
    String? searchQuery,
    bool? isFavorite,
  }) async {
    try {
      var query = _client.from('contacts').select();

      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.or(
            'full_name.ilike.%$searchQuery%,email.ilike.%$searchQuery%,company.ilike.%$searchQuery%');
      }

      if (isFavorite != null) {
        query = query.eq('is_favorite', isFavorite);
      }

      final response = await query.order('full_name', ascending: true);
      return List<Map<String, dynamic>>.from(response);
    } catch (error) {
      throw Exception('Failed to fetch contacts: $error');
    }
  }

  /// Get single contact by ID
  Future<Map<String, dynamic>> getContact(String contactId) async {
    try {
      final response =
          await _client.from('contacts').select().eq('id', contactId).single();
      return response;
    } catch (error) {
      throw Exception('Failed to fetch contact: $error');
    }
  }

  /// Create new contact
  Future<Map<String, dynamic>> createContact(
      Map<String, dynamic> contactData) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final response = await _client
          .from('contacts')
          .insert({...contactData, 'user_id': userId})
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to create contact: $error');
    }
  }

  /// Update existing contact
  Future<Map<String, dynamic>> updateContact(
      String contactId, Map<String, dynamic> updates) async {
    try {
      final response = await _client
          .from('contacts')
          .update(updates)
          .eq('id', contactId)
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to update contact: $error');
    }
  }

  /// Toggle favorite status
  Future<void> toggleContactFavorite(String contactId, bool isFavorite) async {
    try {
      await _client
          .from('contacts')
          .update({'is_favorite': isFavorite}).eq('id', contactId);
    } catch (error) {
      throw Exception('Failed to toggle favorite: $error');
    }
  }

  /// Delete contact
  Future<void> deleteContact(String contactId) async {
    try {
      await _client.from('contacts').delete().eq('id', contactId);
    } catch (error) {
      throw Exception('Failed to delete contact: $error');
    }
  }

  // ========================================
  // FORM TEMPLATES
  // ========================================

  /// Get all form templates
  Future<List<Map<String, dynamic>>> getFormTemplates(
      {String? searchQuery}) async {
    try {
      var query = _client.from('form_templates').select();

      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query
            .or('name.ilike.%$searchQuery%,description.ilike.%$searchQuery%');
      }

      final response = await query.order('name', ascending: true);
      return List<Map<String, dynamic>>.from(response);
    } catch (error) {
      throw Exception('Failed to fetch form templates: $error');
    }
  }

  /// Get single form template
  Future<Map<String, dynamic>> getFormTemplate(String templateId) async {
    try {
      final response = await _client
          .from('form_templates')
          .select()
          .eq('id', templateId)
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to fetch form template: $error');
    }
  }

  /// Create new form template
  Future<Map<String, dynamic>> createFormTemplate(String name,
      String? description, List<Map<String, dynamic>> fields) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final response = await _client
          .from('form_templates')
          .insert({
            'user_id': userId,
            'name': name,
            'description': description,
            'fields': fields,
          })
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to create form template: $error');
    }
  }

  /// Update form template
  Future<Map<String, dynamic>> updateFormTemplate(
      String templateId, Map<String, dynamic> updates) async {
    try {
      final response = await _client
          .from('form_templates')
          .update(updates)
          .eq('id', templateId)
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to update form template: $error');
    }
  }

  /// Delete form template
  Future<void> deleteFormTemplate(String templateId) async {
    try {
      await _client.from('form_templates').delete().eq('id', templateId);
    } catch (error) {
      throw Exception('Failed to delete form template: $error');
    }
  }

  // ========================================
  // VISITS
  // ========================================

  /// Get all visits with optional filters
  Future<List<Map<String, dynamic>>> getVisits({
    String? status,
    String? contactId,
    int? limit,
  }) async {
    try {
      var query =
          _client.from('visits').select('*, contacts(*), form_templates(name)');

      if (status != null) {
        query = query.eq('status', status);
      }

      if (contactId != null) {
        query = query.eq('contact_id', contactId);
      }

      final orderedQuery = query.order('visit_date', ascending: false);

      final response = limit != null
          ? await orderedQuery.limit(limit)
          : await orderedQuery;
      return List<Map<String, dynamic>>.from(response);
    } catch (error) {
      throw Exception('Failed to fetch visits: $error');
    }
  }

  /// Get single visit with full details
  Future<Map<String, dynamic>> getVisit(String visitId) async {
    try {
      final response = await _client
          .from('visits')
          .select(
              '*, contacts(*), form_templates(*), visit_photos(*), pdf_reports(*)')
          .eq('id', visitId)
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to fetch visit: $error');
    }
  }

  /// Create new visit
  Future<Map<String, dynamic>> createVisit(String contactId,
      String formTemplateId, Map<String, dynamic> formData) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final response = await _client
          .from('visits')
          .insert({
            'user_id': userId,
            'contact_id': contactId,
            'form_template_id': formTemplateId,
            'visit_code':
                'B-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch % 10000}',
            'form_data': formData,
          })
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to create visit: $error');
    }
  }

  /// Update visit (auto-save)
  Future<Map<String, dynamic>> updateVisit(
      String visitId, Map<String, dynamic> updates) async {
    try {
      final response = await _client
          .from('visits')
          .update(updates)
          .eq('id', visitId)
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to update visit: $error');
    }
  }

  /// Complete visit
  Future<Map<String, dynamic>> completeVisit(
      String visitId, Map<String, dynamic> finalData) async {
    try {
      final response = await _client
          .from('visits')
          .update({
            'form_data': finalData,
            'status': 'completed',
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', visitId)
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to complete visit: $error');
    }
  }

  /// Delete visit
  Future<void> deleteVisit(String visitId) async {
    try {
      await _client.from('visits').delete().eq('id', visitId);
    } catch (error) {
      throw Exception('Failed to delete visit: $error');
    }
  }

  // ========================================
  // STATISTICS
  // ========================================

  /// Get dashboard statistics
  Future<Map<String, dynamic>> getDashboardStatistics() async {
    try {
      final visitsData =
          await _client.from('visits').select('id, status').count();

      final completedData = await _client
          .from('visits')
          .select('id')
          .eq('status', 'completed')
          .count();

      final draftData = await _client
          .from('visits')
          .select('id')
          .eq('status', 'draft')
          .count();

      return {
        'total_visits': visitsData.count,
        'completed': completedData.count,
        'pending_reports': draftData.count,
        'sync_status': 'Alles synchronisiert',
      };
    } catch (error) {
      throw Exception('Failed to fetch statistics: $error');
    }
  }

  // ========================================
  // USER PROFILE
  // ========================================

  /// Get current user profile
  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final response = await _client
          .from('user_profiles')
          .select()
          .eq('id', userId)
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to fetch user profile: $error');
    }
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateUserProfile(
      Map<String, dynamic> updates) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final response = await _client
          .from('user_profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
      return response;
    } catch (error) {
      throw Exception('Failed to update user profile: $error');
    }
  }
}
