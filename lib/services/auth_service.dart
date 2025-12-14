import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import 'google_contacts_service.dart';

/// Authentication service for handling multiple auth methods with Supabase
/// Supports Google Sign-In (OAuth + native) and email/password authentication
class AuthService {
  SupabaseClient? _client;

  // Validate Supabase configuration on initialization
  AuthService() {
    _validateSupabaseConfiguration();
  }

  // Lazy-load the client to avoid exceptions during initialization
  SupabaseClient get _getClient {
    if (!SupabaseService.isConfigured) {
      throw Exception(
        'Supabase is not configured. Please run the app with:\n'
        'flutter run --dart-define-from-file=env.json',
      );
    }
    return _client ??= SupabaseService.instance.client;
  }

  /// Validates that Supabase is properly configured
  void _validateSupabaseConfiguration() {
    if (SupabaseService.supabaseUrl.isEmpty ||
        SupabaseService.supabaseAnonKey.isEmpty) {
      debugPrint('⚠️ WARNING: Supabase credentials not configured');
      debugPrint(
        'Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables',
      );
    } else {
      debugPrint('✅ Supabase configured successfully');
      debugPrint('URL: ${SupabaseService.supabaseUrl}');
    }
  }

  /// Signs in with Google - platform-aware implementation
  /// **WEB**: Uses Supabase OAuth redirect flow
  /// **MOBILE**: Uses native Google Sign-In with ID token
  Future<AuthResponse> signInWithGoogle() async {
    // Check Supabase configuration first
    if (!SupabaseService.isConfigured) {
      throw Exception(
        'Supabase ist nicht konfiguriert.\n\n'
        'Um Google Sign-In zu verwenden, müssen Sie zunächst Supabase einrichten:\n\n'
        '1. Öffnen Sie Ihr Supabase-Projekt Dashboard\n'
        '2. Gehen Sie zu Settings > API\n'
        '3. Kopieren Sie die Project URL und anon/public key\n'
        '4. Starten Sie die App neu mit:\n'
        '   flutter run --dart-define=SUPABASE_URL=ihre_url --dart-define=SUPABASE_ANON_KEY=ihr_key',
      );
    }

    if (kIsWeb) {
      // For Flutter web, use Supabase OAuth redirect flow
      return await _signInWithGoogleWeb();
    } else {
      // Mobile: Use native Google Sign-In with ID token
      return await _signInWithGoogleNative();
    }
  }

  /// Web Google Sign-In using Supabase OAuth redirect
  Future<AuthResponse> _signInWithGoogleWeb() async {
    try {
      debugPrint('🔐 Starting Google OAuth flow for web...');
      
      // Determine redirect URL
      final redirectUrl = kIsWeb
          ? '${Uri.base.origin}/'
          : 'io.supabase.onsite://login-callback/';
      
      debugPrint('📍 Redirect URL: $redirectUrl');
      debugPrint('📍 Supabase URL: ${SupabaseService.supabaseUrl}');
      debugPrint('📍 Expected Google Redirect URI: ${SupabaseService.supabaseUrl}/auth/v1/callback');
      debugPrint('⚠️ WICHTIG: Diese URL muss in Google Cloud Console eingetragen sein!');

      // Use Supabase's OAuth flow for web
      // This will redirect the user to Google, then back to the app
      final bool initiated = await _getClient.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: redirectUrl,
        authScreenLaunchMode: LaunchMode.externalApplication,
      );

      if (!initiated) {
        throw Exception('OAuth flow konnte nicht gestartet werden');
      }

      debugPrint('✅ Google OAuth flow initiated - redirecting to Google...');
      
      // Note: The user will be redirected to Google for authentication
      // After successful auth, they'll be redirected back to the app
      // The auth state listener will handle the session when user returns
      
      // Wait a moment to allow redirect to happen
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Check if we already have a session (in case redirect was instant)
      final session = _getClient.auth.currentSession;
      if (session != null) {
        final user = _getClient.auth.currentUser;
        if (user != null) {
          return AuthResponse(
            user: user,
            session: session,
          );
        }
      }
      
      // If no session yet, the redirect will handle it
      // Return a response indicating redirect was initiated
      // The auth state listener will handle the actual session
      final currentUser = _getClient.auth.currentUser;
      return AuthResponse(
        user: currentUser,
        session: session,
      );
    } on AuthException catch (e) {
      debugPrint('❌ Supabase OAuth Error: ${e.message}');
      throw Exception(
        'Google Sign-In fehlgeschlagen: ${_cleanError(e.message)}',
      );
    } catch (e) {
      debugPrint('❌ Google OAuth Error: ${e.toString()}');
      throw Exception(
        'Google Sign-In fehlgeschlagen: ${_cleanError(e.toString())}',
      );
    }
  }

  /// Native mobile Google Sign-In using google_sign_in package
  /// This is the CORRECT approach for Flutter mobile apps
  Future<AuthResponse> _signInWithGoogleNative() async {
    try {
      // Validate Supabase connection first
      if (SupabaseService.supabaseUrl.isEmpty) {
        throw Exception(
          'Supabase ist nicht konfiguriert. '
          'Bitte kontaktieren Sie den Administrator.',
        );
      }

      // Get Google Web Client ID from environment
      const webClientId = String.fromEnvironment(
        'GOOGLE_WEB_CLIENT_ID',
        defaultValue: '',
      );

      if (webClientId.isEmpty) {
        throw Exception(
          'GOOGLE_WEB_CLIENT_ID nicht konfiguriert. '
          'Bitte fügen Sie den Web-Client-ID in den Umgebungsvariablen hinzu.',
        );
      }

      // Initialize Google Sign-In with server client ID
      // Include contacts scope to import Google Contacts
      final googleSignIn = GoogleSignIn(
        serverClientId: webClientId,
        scopes: [
          'email',
          'profile',
          'https://www.googleapis.com/auth/contacts.readonly',
        ],
      );

      // Sign out first to force account selection
      await googleSignIn.signOut();

      // Show Google Sign-In UI
      final GoogleSignInAccount? user = await googleSignIn.signIn();

      if (user == null) {
        throw Exception('Anmeldung abgebrochen');
      }

      // Get authentication tokens
      final googleAuth = await user.authentication;
      final idToken = googleAuth.idToken;
      final accessToken = googleAuth.accessToken;

      if (idToken == null) {
        throw Exception('Kein ID-Token von Google erhalten');
      }

      debugPrint('🔐 Attempting Google Sign-In with Supabase...');

      // Sign in to Supabase with Google ID token
      final response = await _getClient.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      if (response.user == null || response.session == null) {
        throw Exception('Authentifizierung bei Supabase fehlgeschlagen');
      }

      debugPrint('✅ Google Sign-In successful');
      
      // Import Google Contacts after successful sign-in
      try {
        debugPrint('📇 Starting Google Contacts import...');
        final contactsService = GoogleContactsService.instance;
        await contactsService.importGoogleContacts(googleAccount: user);
        debugPrint('✅ Google Contacts imported successfully');
      } catch (e) {
        // Don't fail sign-in if contacts import fails
        debugPrint('⚠️ Google Contacts import failed (non-critical): $e');
      }
      
      return response;
    } on AuthException catch (e) {
      debugPrint('❌ Supabase Auth Error: ${e.message}');
      throw Exception(
        'Google Sign-In fehlgeschlagen: ${_cleanError(e.message)}',
      );
    } catch (e) {
      debugPrint('❌ Google Sign-In Error: ${e.toString()}');
      throw Exception(
        'Google Sign-In fehlgeschlagen: ${_cleanError(e.toString())}',
      );
    }
  }

  /// Signs up with email and password
  /// Creates a new user account in Supabase
  Future<AuthResponse> signUpWithEmail({
    required String email,
    required String password,
    String? fullName,
  }) async {
    try {
      // Check Supabase configuration
      if (!SupabaseService.isConfigured) {
        throw Exception(
          'Supabase ist nicht konfiguriert.\n\n'
          'Bitte konfigurieren Sie Supabase zuerst mit den Umgebungsvariablen:\n'
          'SUPABASE_URL und SUPABASE_ANON_KEY',
        );
      }

      debugPrint('📧 Attempting email sign-up for: $email');

      final response = await _getClient.auth.signUp(
        email: email,
        password: password,
        data: fullName != null ? {'full_name': fullName} : null,
      );

      if (response.user == null) {
        throw Exception(
          'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        );
      }

      debugPrint('✅ Sign-up successful');
      return response;
    } on AuthException catch (e) {
      debugPrint('❌ Supabase Sign-up Error: ${e.message}');

      // Provide more specific error messages
      if (e.message.contains('User already registered')) {
        throw Exception(
          'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.',
        );
      }

      throw Exception(
        'Registrierung fehlgeschlagen: ${_cleanError(e.message)}',
      );
    } catch (e) {
      debugPrint('❌ Sign-up Error: ${e.toString()}');
      throw Exception(
        'Registrierung fehlgeschlagen: ${_cleanError(e.toString())}',
      );
    }
  }

  /// Signs in with email and password
  /// Authenticates existing user credentials
  Future<AuthResponse> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      // Check Supabase configuration
      if (!SupabaseService.isConfigured) {
        throw Exception(
          'Supabase ist nicht konfiguriert.\n\n'
          'Bitte konfigurieren Sie Supabase zuerst mit den Umgebungsvariablen:\n'
          'SUPABASE_URL und SUPABASE_ANON_KEY',
        );
      }

      debugPrint('📧 Attempting email sign-in for: $email');

      final response = await _getClient.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user == null || response.session == null) {
        throw Exception('Ungültige Anmeldedaten oder Sitzungsfehler');
      }

      debugPrint('✅ Sign-in successful');
      debugPrint('User ID: ${response.user!.id}');
      debugPrint('Session valid: ${response.session != null}');

      return response;
    } on AuthException catch (e) {
      debugPrint('❌ Supabase Sign-in Error: ${e.message}');

      // Handle specific authentication errors
      if (e.message.toLowerCase().contains('invalid login credentials')) {
        throw Exception(
          'Ungültige Anmeldedaten.\n\n'
          'Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.\n'
          'Falls Sie noch kein Konto haben, registrieren Sie sich bitte zuerst.',
        );
      } else if (e.message.toLowerCase().contains('email not confirmed')) {
        throw Exception(
          'E-Mail noch nicht bestätigt.\n\n'
          'Bitte überprüfen Sie Ihren Posteingang und bestätigen Sie Ihre E-Mail-Adresse.',
        );
      }

      throw Exception('Anmeldung fehlgeschlagen: ${_cleanError(e.message)}');
    } catch (e) {
      debugPrint('❌ Sign-in Error: ${e.toString()}');
      throw Exception('Anmeldung fehlgeschlagen: ${_cleanError(e.toString())}');
    }
  }

  /// Sends a password reset email
  /// Allows users to reset their password via email link
  Future<void> resetPassword({required String email}) async {
    try {
      await _getClient.auth.resetPasswordForEmail(
        email,
        redirectTo: kIsWeb
            ? '${Uri.base.origin}/#/reset-password'
            : 'io.supabase.onsite://reset-password',
      );
    } catch (e) {
      throw Exception(
        'Passwort-Reset fehlgeschlagen: ${_cleanError(e.toString())}',
      );
    }
  }

  /// Updates user password
  /// Requires user to be authenticated
  Future<void> updatePassword({required String newPassword}) async {
    try {
      final response = await _getClient.auth.updateUser(
        UserAttributes(password: newPassword),
      );

      if (response.user == null) {
        throw Exception('Passwort-Aktualisierung fehlgeschlagen');
      }
    } catch (e) {
      throw Exception(
        'Passwort-Aktualisierung fehlgeschlagen: ${_cleanError(e.toString())}',
      );
    }
  }

  /// Signs out the current user (handles all auth methods)
  Future<void> signOut() async {
    try {
      // Sign out from Google Sign-In on mobile
      if (!kIsWeb) {
        final googleSignIn = GoogleSignIn();
        if (await googleSignIn.isSignedIn()) {
          await googleSignIn.signOut();
        }
      }

      // Sign out from Supabase
      await _getClient.auth.signOut();
    } catch (e) {
      throw Exception('Abmeldung fehlgeschlagen: ${_cleanError(e.toString())}');
    }
  }

  /// Cleans error messages for better user experience
  String _cleanError(String error) {
    // Remove technical stack traces and make errors user-friendly
    if (error.contains('Exception:')) {
      error = error.split('Exception:').last.trim();
    }
    if (error.contains('Error:')) {
      error = error.split('Error:').last.trim();
    }
    return error;
  }

  /// Gets the current authenticated user
  User? get currentUser {
    if (!SupabaseService.isConfigured) return null;
    try {
      return _getClient.auth.currentUser;
    } catch (e) {
      return null;
    }
  }

  /// Checks if user is currently authenticated
  bool get isAuthenticated => currentUser != null;

  /// Stream of authentication state changes
  Stream<AuthState> get authStateChanges {
    if (!SupabaseService.isConfigured) {
      return Stream<AuthState>.value(AuthState(AuthChangeEvent.initialSession, null));
    }
    try {
      return _getClient.auth.onAuthStateChange;
    } catch (e) {
      return Stream<AuthState>.value(AuthState(AuthChangeEvent.initialSession, null));
    }
  }

  /// Gets the current user's email
  String? get userEmail => currentUser?.email;

  /// Gets the current user's display name
  String? get userName {
    final user = currentUser;
    if (user == null) return null;
    
    // Try multiple sources for user name
    final metadata = user.userMetadata;
    if (metadata != null) {
      // Try full_name first
      if (metadata['full_name'] != null) {
        return metadata['full_name'] as String?;
      }
      // Try name
      if (metadata['name'] != null) {
        return metadata['name'] as String?;
      }
      // Try display_name
      if (metadata['display_name'] != null) {
        return metadata['display_name'] as String?;
      }
    }
    
    // Fallback to email username
    if (user.email != null) {
      final emailParts = user.email!.split('@');
      if (emailParts.isNotEmpty) {
        return emailParts[0];
      }
    }
    
    return null;
  }

  /// Gets the current user's profile picture URL
  String? get userPhotoUrl =>
      currentUser?.userMetadata?['avatar_url'] as String?;
}
