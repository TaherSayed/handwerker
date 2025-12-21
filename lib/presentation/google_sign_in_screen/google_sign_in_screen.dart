import 'package:flutter/material.dart';
import 'package:sign_in_button/sign_in_button.dart';
import 'package:sizer/sizer.dart';

import 'package:flutter/foundation.dart' show kIsWeb;
import '../../../core/app_export.dart';
import '../../services/auth_service.dart';
import '../../services/supabase_service.dart';
import '../../services/google_contacts_service.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Google Sign-In Screen for OnSite Application
///
/// Provides multiple authentication options:
/// - Google OAuth (primary method)
/// - Email/Password (backup method while troubleshooting OAuth)
///
/// Features professional branding, privacy transparency, and platform-optimized
/// sign-in flow with proper error handling and loading states.
class GoogleSignInScreen extends StatefulWidget {
  const GoogleSignInScreen({super.key});

  @override
  State<GoogleSignInScreen> createState() => _GoogleSignInScreenState();
}

class _GoogleSignInScreenState extends State<GoogleSignInScreen> {
  bool _isLoading = false;
  String? _errorMessage;
  late final AuthService _authService;


  // Track if navigation is in progress to prevent multiple navigations
  bool _isNavigating = false;

  // Add retry mechanism
  int _signInAttempts = 0;
  static const int _maxSignInAttempts = 3;

  @override
  void initState() {
    super.initState();
    // Initialize AuthService - it handles unconfigured state gracefully
    _authService = AuthService();
    _checkExistingAuth();
    _setupAuthListener();
    _checkSupabaseConfiguration();
  }

  /// Check Supabase configuration on screen load
  void _checkSupabaseConfiguration() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (SupabaseService.supabaseUrl.isEmpty ||
          SupabaseService.supabaseAnonKey.isEmpty) {
        setState(() {
          _errorMessage = '⚠️ Supabase ist nicht konfiguriert\n\n'
              'Um die Anmeldung zu nutzen, müssen Supabase-Credentials gesetzt werden:\n\n'
              '1. Öffnen Sie: https://app.supabase.com\n'
              '2. Wählen Sie Ihr Projekt\n'
              '3. Gehen Sie zu: Settings → API\n'
              '4. Kopieren Sie:\n'
              '   • Project URL\n'
              '   • anon/public key\n\n'
              '5. Starten Sie die App neu:\n'
              '   flutter run \\\n'
              '     --dart-define=SUPABASE_URL=ihre_url \\\n'
              '     --dart-define=SUPABASE_ANON_KEY=ihr_key\n\n'
              '📝 Hinweis: Die Authentifizierung funktioniert erst nach der Konfiguration.';

          // Show configuration dialog
          _showConfigurationDialog();
        });
      }
    });
  }

  /// Shows configuration instructions dialog
  void _showConfigurationDialog() {
    final theme = Theme.of(context);

    Future.delayed(Duration(milliseconds: 500), () {
      if (!mounted) return;

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: theme.colorScheme.error),
              SizedBox(width: 2.w),
              Expanded(
                child: Text(
                  'Supabase Konfiguration fehlt',
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Um die Authentifizierung zu nutzen, muss Supabase konfiguriert werden:',
                  style: theme.textTheme.bodyMedium,
                ),
                SizedBox(height: 2.h),
                _buildConfigStep(theme, '1', 'Supabase Dashboard öffnen',
                    'https://app.supabase.com'),
                _buildConfigStep(theme, '2', 'Projekt auswählen',
                    'Wählen Sie Ihr OnSite-Projekt'),
                _buildConfigStep(
                    theme, '3', 'API-Einstellungen öffnen', 'Settings → API'),
                _buildConfigStep(theme, '4', 'Credentials kopieren',
                    'Project URL und anon/public key'),
                _buildConfigStep(
                    theme, '5', 'App neu starten', 'Mit --dart-define Flags'),
                SizedBox(height: 2.h),
                Container(
                  padding: EdgeInsets.all(2.w),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(1.w),
                  ),
                  child: Text(
                    'flutter run \\\n  --dart-define=SUPABASE_URL=ihre_url \\\n  --dart-define=SUPABASE_ANON_KEY=ihr_key',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontFamily: 'monospace',
                      fontSize: 10.sp,
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Verstanden'),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildConfigStep(
      ThemeData theme, String number, String title, String description) {
    return Padding(
      padding: EdgeInsets.only(bottom: 1.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6.w,
            height: 6.w,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(width: 2.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  /// Check if user is already authenticated
  void _checkExistingAuth() {
    // Only check if Supabase is configured
    if (!SupabaseService.isConfigured) return;
    
    try {
      if (_authService.isAuthenticated) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!_isNavigating && mounted) {
            _isNavigating = true;
            Navigator.pushReplacementNamed(context, AppRoutes.contactSelection);
          }
        });
      }
    } catch (e) {
      // Ignore errors if Supabase is not configured
      debugPrint('Auth check skipped: $e');
    }
  }

  /// Setup listener for auth state changes with mobile-first approach
  void _setupAuthListener() {
    // Only setup listener if Supabase is configured
    if (!SupabaseService.isConfigured) return;
    
    _authService.authStateChanges.listen(
      (authState) {
        // Only navigate if we have a valid session
        if (authState.session != null && mounted && !_isNavigating) {
          setState(() {
            _isLoading = false;
            _isNavigating = true;
            _errorMessage = null;
            _signInAttempts = 0;
          });

          // Import Google Contacts after successful sign-in (non-blocking)
          _importGoogleContactsAfterSignIn();

          // Navigate to dashboard immediately
          Future.microtask(() {
            if (mounted && !_isNavigating) {
              _isNavigating = true;
              Navigator.pushReplacementNamed(context, AppRoutes.contactSelection);
            }
          });
        }
      },
      onError: (error) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = _getErrorMessage(error.toString());
            _isNavigating = false;
          });
        }
      },
    );
  }

  /// Import Google Contacts after successful sign-in
  Future<void> _importGoogleContactsAfterSignIn() async {
    try {
      const webClientId = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID', defaultValue: '');
      if (webClientId.isEmpty) {
        debugPrint('⚠️ GOOGLE_WEB_CLIENT_ID not configured, skipping contacts import');
        return;
      }

      if (kIsWeb) {
        // On web, after Supabase OAuth, we need to sign in with Google Sign-In
        // to get an access token with contacts scope
        debugPrint('📇 Attempting to import Google Contacts on web...');
        
        final googleSignIn = GoogleSignIn(
          clientId: webClientId,
          scopes: [
            'email',
            'profile',
            'https://www.googleapis.com/auth/contacts.readonly',
          ],
        );

        // Try silent sign-in first (might work if user just signed in)
        var googleAccount = await googleSignIn.signInSilently();
        
        // If silent sign-in fails, try regular sign-in
        // This should be quick since user is already authenticated with Google
        googleAccount ??= await googleSignIn.signIn();
        
        if (googleAccount != null) {
          debugPrint('📇 Importing Google Contacts...');
          final contactsService = GoogleContactsService.instance;
          await contactsService.importGoogleContacts(googleAccount: googleAccount);
          debugPrint('✅ Google Contacts imported successfully');
        } else {
          debugPrint('⚠️ Could not get Google account for contacts import');
        }
      } else {
        // Mobile: Use server client ID
        final googleSignIn = GoogleSignIn(
          serverClientId: webClientId,
          scopes: [
            'email',
            'profile',
            'https://www.googleapis.com/auth/contacts.readonly',
          ],
        );

        final googleAccount = await googleSignIn.signInSilently();
        if (googleAccount != null) {
          debugPrint('📇 Importing Google Contacts...');
          final contactsService = GoogleContactsService.instance;
          await contactsService.importGoogleContacts(googleAccount: googleAccount);
          debugPrint('✅ Google Contacts imported successfully');
        } else {
          debugPrint('⚠️ No Google account found for contacts import');
        }
      }
    } catch (e) {
      // Don't show error to user - contacts import is non-critical
      debugPrint('⚠️ Google Contacts import failed (non-critical): $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 6.w),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Top spacing
                SizedBox(height: 4.h),

                // Branding section
                _buildBrandingSection(theme),

                SizedBox(height: 6.h),

                // Mock credentials display
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer
                        .withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: theme.colorScheme.primary.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: theme.colorScheme.primary,
                            size: 20,
                          ),
                          SizedBox(width: 2.w),
                          Text(
                            'Demo-Anmeldedaten',
                            style: theme.textTheme.titleSmall?.copyWith(
                              color: theme.colorScheme.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 2.h),
                      _buildCredentialRow(theme, 'Handwerker',
                          'max@mustermann.de', 'handwerk123'),
                      SizedBox(height: 1.h),
                      _buildCredentialRow(
                          theme, 'Manager', 'lisa@schmidt.de', 'manager123'),
                      SizedBox(height: 2.h),
                      Text(
                        'Verwenden Sie diese Anmeldedaten zum Testen der App',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 4.h),

                // Authentication section (Google only)
                _buildSignInSection(theme),

                SizedBox(height: 2.h),

                // Footer section
                _buildFooterSection(theme),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Builds the branding section with logo and tagline
  Widget _buildBrandingSection(ThemeData theme) {
    return Column(
      children: [
        // Logo
        Container(
          width: 30.w,
          height: 30.w,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary,
            borderRadius: BorderRadius.circular(4.w),
            boxShadow: [
              BoxShadow(
                color: theme.colorScheme.shadow,
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Center(
            child: CustomIconWidget(
              iconName: 'construction',
              color: theme.colorScheme.onPrimary,
              size: 15.w,
            ),
          ),
        ),

        SizedBox(height: 3.h),

        // App name
        Text(
          'OnSite',
          style: theme.textTheme.headlineLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
        ),

        SizedBox(height: 1.h),

        // Tagline - TRANSLATED TO GERMAN
        Text(
          'Professionelle Außendienst-Berichte',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w400,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  /// Builds the sign-in section with Google button and email/password option
  Widget _buildSignInSection(ThemeData theme) {
    return Column(
      children: [
        // Error message
        if (_errorMessage != null) ...[
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(3.w),
            margin: EdgeInsets.only(bottom: 3.h),
            decoration: BoxDecoration(
              color: theme.colorScheme.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(2.w),
              border: Border.all(
                color: theme.colorScheme.error.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                CustomIconWidget(
                  iconName: 'error_outline',
                  color: theme.colorScheme.error,
                  size: 5.w,
                ),
                SizedBox(width: 2.w),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],

        // Google Sign-In Button
        SizedBox(
          width: double.infinity,
          height: 12.h,
          child: SignInButton(
            Buttons.google,
            text: "Mit Google anmelden",
            onPressed: _isLoading ? () {} : () => _handleGoogleSignIn(),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(2.w),
            ),
            elevation: 2.0,
          ),
        ),

        SizedBox(height: 3.h),

        // Privacy notice
        Container(
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest.withValues(
              alpha: 0.3,
            ),
            borderRadius: BorderRadius.circular(2.w),
            border: Border.all(
              color: theme.colorScheme.outline.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomIconWidget(
                    iconName: 'info_outline',
                    color: theme.colorScheme.primary,
                    size: 5.w,
                  ),
                  SizedBox(width: 2.w),
                  Expanded(
                    child: Text(
                      'OnSite benötigt Zugriff auf Ihre Google-Kontakte, um Ihnen bei der Auswahl von Kunden für Außendienstbesuche zu helfen. Ihre Kontaktdaten werden sicher gespeichert und niemals an Dritte weitergegeben.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 2.h),
              GestureDetector(
                onTap: _showPrivacyPolicy,
                child: Text(
                  'Datenschutzerklärung ansehen',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w500,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // DEPRECATED: Email/password authentication removed - Google Sign-In only
  @Deprecated('Email/password authentication removed')
  Widget _buildEmailPasswordForm(ThemeData theme) {
    return const SizedBox.shrink(); // Removed email/password form
  }

  /// Builds the footer section with terms and data handling
  Widget _buildFooterSection(ThemeData theme) {
    return Column(
      children: [
        Text(
          'Mit der Anmeldung stimmen Sie unseren',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 1.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: _showTermsOfService,
              child: Text(
                'Nutzungsbedingungen',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            Text(
              ' und der ',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            GestureDetector(
              onTap: _showDataHandling,
              child: Text(
                'Datenverarbeitung',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            Text(
              ' zu',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        SizedBox(height: 2.h),
        Text(
          '© 2025 OnSite. Alle Rechte vorbehalten.',
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  /// Handles Google Sign-In process with mobile-first approach
  Future<void> _handleGoogleSignIn() async {
    if (_isNavigating || _isLoading) return;

    // Check Supabase configuration first
    if (!SupabaseService.isConfigured) {
      setState(() {
        _errorMessage = 'Supabase ist nicht konfiguriert. '
            'Bitte starten Sie die App mit --dart-define-from-file=env.json';
      });
      return;
    }

    // On web, we'll use Supabase OAuth redirect flow
    // No need to block it - let it proceed

    if (_signInAttempts >= _maxSignInAttempts) {
      setState(() {
        _errorMessage = 'Zu viele fehlgeschlagene Versuche. '
            'Bitte versuchen Sie es später erneut.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _signInAttempts++;
    });

    try {
      // Call Google Sign-In (works for both web and mobile)
      final response = await _authService.signInWithGoogle();

      // On web, OAuth redirect happens - session may not be immediate
      // On mobile, we get immediate response
      if (response.session != null && response.user != null) {
        // Immediate success (mobile or instant web auth)
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          // Auth state listener will handle navigation
        }
      } else {
        // Web OAuth redirect initiated - keep loading state
        // The auth state listener will handle navigation when user returns
        if (mounted) {
          setState(() {
            _isLoading = true;
            _errorMessage = null;
          });
        }
      }
    } catch (e) {
      final errorMsg = _getErrorMessage(e.toString());

      if (mounted) {
        setState(() {
          _errorMessage = errorMsg;
          _isLoading = false;
          _isNavigating = false;
        });

      }
    }
  }


  // DEPRECATED: Email/password authentication removed
  @Deprecated('Email/password authentication removed')
  Future<void> _handleEmailPasswordAuth() async {
    return; // Email/password authentication removed
  }

  /// Shows dialog prompting user to register
  // DEPRECATED: Email/password authentication removed
  @Deprecated('Email/password authentication removed')
  void _showRegistrationPromptDialog() {
    return; // Email/password authentication removed
  }

  /// Handles forgot password flow
  // DEPRECATED: Email/password authentication removed
  @Deprecated('Email/password authentication removed')
  Future<void> _handleForgotPassword() async {
    return; // Email/password authentication removed
  }

  /// Converts technical errors to user-friendly German messages
  String _getErrorMessage(String error) {
    final lowerError = error.toLowerCase();

    if (lowerError.contains('network') || lowerError.contains('connection')) {
      return 'Netzwerkverbindungsproblem. Bitte überprüfen Sie Ihre Internetverbindung.';
    } else if (lowerError.contains('cancelled') ||
        lowerError.contains('canceled') ||
        lowerError.contains('abgebrochen')) {
      return 'Anmeldung abgebrochen. Bitte versuchen Sie es erneut.';
    } else if (lowerError.contains('timeout')) {
      return 'Zeitüberschreitung der Anfrage. Bitte versuchen Sie es erneut.';
    } else if (lowerError.contains('invalid login credentials') ||
        lowerError.contains('invalid') ||
        lowerError.contains('ungültig')) {
      return 'Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.';
    } else if (lowerError.contains('user not found') ||
        lowerError.contains('benutzer nicht gefunden')) {
      return 'Kein Konto mit dieser E-Mail gefunden. Bitte registrieren Sie sich zuerst.';
    } else if (lowerError.contains('wrong password') ||
        lowerError.contains('falsches passwort')) {
      return 'Falsches Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.';
    } else if (lowerError.contains('email already') ||
        lowerError.contains('e-mail bereits')) {
      return 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.';
    } else if (lowerError.contains('keine gültige sitzung') ||
        lowerError.contains('no valid session') ||
        lowerError.contains('session')) {
      return 'Sitzungsfehler. Bitte versuchen Sie es erneut.';
    } else if (lowerError.contains('403') || lowerError.contains('forbidden')) {
      return 'Zugriff verweigert. Bitte verwenden Sie die E-Mail-Anmeldung.';
    } else if (lowerError.contains('oauth')) {
      return 'OAuth-Authentifizierung fehlgeschlagen. Bitte versuchen Sie die E-Mail-Anmeldung.';
    } else if (lowerError.contains('email not confirmed') ||
        lowerError.contains('email confirmation')) {
      return 'Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrer Inbox.';
    } else {
      // Return the actual error for better debugging
      return 'Fehler: ${error.replaceAll('Exception:', '').trim()}';
    }
  }

  /// Shows privacy policy dialog
  void _showPrivacyPolicy() {
    final theme = Theme.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Datenschutzerklärung',
          style: theme.textTheme.titleLarge,
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Datenerfassung',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'OnSite erfasst und verarbeitet folgende Daten:\n\n'
                '• Google-Kontoinformationen (Name, E-Mail)\n'
                '• Google-Kontaktdaten zur Kundenauswahl\n'
                '• Von Ihnen erstellte Besuchsformulare und Berichte\n'
                '• Unternehmensinformationen und Logo, die Sie angeben',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Datennutzung',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Ihre Daten werden ausschließlich verwendet für:\n\n'
                '• Bereitstellung der Außendienst-Berichtsfunktionen\n'
                '• Sichere Speicherung Ihrer Besuchsdatensätze\n'
                '• Erstellung professioneller PDF-Berichte\n'
                '• Synchronisierung der Daten auf Ihren Geräten',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Datensicherheit',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Wir setzen branchenübliche Sicherheitsmaßnahmen um:\n\n'
                '• Ende-zu-Ende-Verschlüsselung für Datenübertragung\n'
                '• Sichere Firebase Cloud-Speicherung\n'
                '• Mandantenfähige Datenisolierung\n'
                '• Keine Weitergabe von Daten an Dritte',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Schließen',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Shows terms of service dialog
  void _showTermsOfService() {
    final theme = Theme.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Nutzungsbedingungen',
          style: theme.textTheme.titleLarge,
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Annahme der Bedingungen',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Durch den Zugriff auf und die Nutzung von OnSite akzeptieren Sie diese Nutzungsbedingungen und erklären sich damit einverstanden.',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Nutzerverantwortlichkeiten',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Sie verpflichten sich:\n\n'
                '• Genaue Kontoinformationen anzugeben\n'
                '• Die Sicherheit Ihres Kontos zu wahren\n'
                '• Den Dienst nur für rechtmäßige Zwecke zu nutzen\n'
                '• Rechte an geistigem Eigentum zu respektieren',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Dienstverfügbarkeit',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'OnSite ist bemüht, einen zuverlässigen Service bereitzustellen, garantiert jedoch keinen unterbrechungsfreien Zugang. Wir behalten uns das Recht vor, Funktionen nach vorheriger Ankündigung zu ändern oder einzustellen.',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Schließen',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Shows data handling information dialog
  void _showDataHandling() {
    final theme = Theme.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Datenverarbeitung', style: theme.textTheme.titleLarge),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Datenspeicherung',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Ihre Daten werden sicher in Firebase Cloud Firestore gespeichert mit:\n\n'
                '• Automatischer Verschlüsselung im Ruhezustand\n'
                '• Sicheren Übertragungsprotokollen\n'
                '• Regelmäßigen Sicherheitsüberprüfungen\n'
                '• Einhaltung der Datenschutzbestimmungen',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Datenaufbewahrung',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Wir bewahren Ihre Daten so lange auf, wie Ihr Konto aktiv ist. Sie können jederzeit die Löschung Ihrer Daten über Ihre Profileinstellungen beantragen.',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              Text(
                'Drittanbieterdienste',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'OnSite integriert sich mit:\n\n'
                '• Google Sign-In zur Authentifizierung\n'
                '• Google Contacts API für Kundendaten\n'
                '• Firebase-Dienste für Backend-Operationen\n\n'
                'Diese Dienste haben ihre eigenen Datenschutzrichtlinien und Bedingungen.',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Schließen',
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCredentialRow(
      ThemeData theme, String role, String email, String password) {
    return Container(
      padding: EdgeInsets.all(2.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            role,
            style: theme.textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.primary,
            ),
          ),
          SizedBox(height: 0.5.h),
          Row(
            children: [
              Expanded(
                child: Text(
                  email,
                  style: theme.textTheme.bodySmall,
                ),
              ),
              SizedBox(width: 2.w),
              Icon(
                Icons.arrow_forward,
                size: 14,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              SizedBox(width: 2.w),
              Text(
                password,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
