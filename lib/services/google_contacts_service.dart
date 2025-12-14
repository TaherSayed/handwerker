import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'database_service.dart';

/// Service for importing contacts from Google Contacts API
class GoogleContactsService {
  static GoogleContactsService? _instance;
  static GoogleContactsService get instance =>
      _instance ??= GoogleContactsService._();

  GoogleContactsService._();

  /// Import contacts from Google Contacts API
  /// Requires Google Sign-In with contacts scope
  Future<List<Map<String, dynamic>>> importGoogleContacts({
    GoogleSignInAccount? googleAccount,
    String? accessToken,
  }) async {
    try {
      debugPrint('📇 Starting Google Contacts import...');

      // Get access token from either Google Sign-In account or provided token
      String? token = accessToken;
      if (token == null && googleAccount != null) {
        final googleAuth = await googleAccount.authentication;
        token = googleAuth.accessToken;
      }

      if (token == null) {
        throw Exception('Kein Access Token von Google erhalten');
      }

      // Request contacts from Google People API
      // Using People API v1 which is the recommended API for contacts
      final response = await http.get(
        Uri.parse(
          'https://people.googleapis.com/v1/people/me/connections'
          '?personFields=names,emailAddresses,phoneNumbers,organizations,photos',
        ),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        debugPrint('❌ Google Contacts API Error: ${response.statusCode}');
        debugPrint('Response: ${response.body}');
        throw Exception(
          'Fehler beim Abrufen der Kontakte: ${response.statusCode}',
        );
      }

      final data = json.decode(response.body);
      final connections = data['connections'] as List<dynamic>? ?? [];

      debugPrint('✅ Found ${connections.length} contacts from Google');

      // Transform Google Contacts format to our format
      final contacts = <Map<String, dynamic>>[];

      for (var connection in connections) {
        try {
          final names = connection['names'] as List<dynamic>? ?? [];
          final emails = connection['emailAddresses'] as List<dynamic>? ?? [];
          final phones = connection['phoneNumbers'] as List<dynamic>? ?? [];
          final organizations =
              connection['organizations'] as List<dynamic>? ?? [];
          final photos = connection['photos'] as List<dynamic>? ?? [];

          // Get primary name or first available name
          String fullName = 'Unbekannt';
          if (names.isNotEmpty) {
            final primaryName = names.firstWhere(
              (n) => n['metadata']?['primary'] == true,
              orElse: () => names.first,
            );
            fullName = primaryName['displayName'] ?? 
                      '${primaryName['givenName'] ?? ''} ${primaryName['familyName'] ?? ''}'.trim();
          }

          // Get primary email
          String email = '';
          if (emails.isNotEmpty) {
            final primaryEmail = emails.firstWhere(
              (e) => e['metadata']?['primary'] == true,
              orElse: () => emails.first,
            );
            email = primaryEmail['value'] ?? '';
          }

          // Get primary phone
          String phone = '';
          if (phones.isNotEmpty) {
            final primaryPhone = phones.firstWhere(
              (p) => p['metadata']?['primary'] == true,
              orElse: () => phones.first,
            );
            phone = primaryPhone['value'] ?? '';
          }

          // Get company/organization
          String company = '';
          if (organizations.isNotEmpty) {
            final primaryOrg = organizations.firstWhere(
              (o) => o['metadata']?['primary'] == true,
              orElse: () => organizations.first,
            );
            company = primaryOrg['name'] ?? '';
          }

          // Get photo URL
          String photoUrl = '';
          if (photos.isNotEmpty) {
            final primaryPhoto = photos.firstWhere(
              (p) => p['metadata']?['primary'] == true,
              orElse: () => photos.first,
            );
            photoUrl = primaryPhoto['url'] ?? '';
          }

          // Only add contacts with at least a name
          if (fullName.isNotEmpty && fullName != 'Unbekannt') {
            contacts.add({
              'full_name': fullName,
              'email': email,
              'phone': phone,
              'company': company,
              'avatar_url': photoUrl,
              'is_favorite': false,
            });
          }
        } catch (e) {
          debugPrint('⚠️ Error processing contact: $e');
          // Continue with next contact
        }
      }

      debugPrint('✅ Processed ${contacts.length} contacts');

      // Save contacts to Supabase
      if (contacts.isNotEmpty) {
        await _saveContactsToDatabase(contacts);
      }

      return contacts;
    } catch (e) {
      debugPrint('❌ Google Contacts import error: $e');
      rethrow;
    }
  }

  /// Save imported contacts to Supabase database
  Future<void> _saveContactsToDatabase(
    List<Map<String, dynamic>> contacts,
  ) async {
    try {
      final dbService = DatabaseService.instance;
      int savedCount = 0;
      int skippedCount = 0;

      for (var contact in contacts) {
        try {
          // Check if contact already exists (by email or name)
          final existingContacts = await dbService.getContacts(
            searchQuery: contact['email']?.toString() ?? contact['full_name'],
          );

          // Check if contact with same email or name exists
          final exists = existingContacts.any((existing) {
            final existingEmail = existing['email']?.toString().toLowerCase() ?? '';
            final existingName = existing['full_name']?.toString().toLowerCase() ?? '';
            final newEmail = (contact['email']?.toString() ?? '').toLowerCase();
            final newName = (contact['full_name']?.toString() ?? '').toLowerCase();

            return (newEmail.isNotEmpty && existingEmail == newEmail) ||
                   (newName.isNotEmpty && existingName == newName);
          });

          if (!exists) {
            await dbService.createContact(contact);
            savedCount++;
          } else {
            skippedCount++;
          }
        } catch (e) {
          debugPrint('⚠️ Error saving contact ${contact['full_name']}: $e');
          // Continue with next contact
        }
      }

      debugPrint('✅ Saved $savedCount new contacts, skipped $skippedCount duplicates');
    } catch (e) {
      debugPrint('❌ Error saving contacts to database: $e');
      rethrow;
    }
  }
}

