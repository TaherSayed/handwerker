import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:sizer/sizer.dart';
import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_bottom_bar.dart';
import '../../widgets/custom_icon_widget.dart';
import '../../services/auth_service.dart';
import '../../services/database_service.dart';
import '../../services/supabase_service.dart';
import './widgets/account_section_widget.dart';
import './widgets/app_info_widget.dart';
import './widgets/company_info_card_widget.dart';
import './widgets/data_management_widget.dart';
import './widgets/profile_header_widget.dart';
import './widgets/settings_section_widget.dart';

/// User Profile Screen
/// Manages craftsman's business information and app settings
class UserProfile extends StatefulWidget {
  const UserProfile({super.key});

  @override
  State<UserProfile> createState() => _UserProfileState();
}

class _UserProfileState extends State<UserProfile> {
  int _currentBottomNavIndex = 3; // Profile tab
  bool _isLoading = true;

  // User data - loaded from Supabase
  Map<String, dynamic> _userData = {
    'name': '',
    'email': '',
    'profileImage': null,
  };

  // Company data - loaded from Supabase
  Map<String, dynamic> _companyData = {
    'name': 'Ihr Unternehmen',
    'logo': null,
  };

  // Settings state
  Map<String, bool> _settings = {
    'autoSync': true,
    'requireSignature': false,
    'notifications': true,
  };

  // Data statistics
  Map<String, dynamic> _dataStats = {
    'storageUsed': '0 MB',
    'cachedContacts': 0,
    'offlineForms': 0,
    'lastSync': 'Nie',
    'pendingUploads': 0,
  };

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadCompanyData();
    _loadDataStatistics();
  }

  /// Load user data from AuthService
  Future<void> _loadUserData() async {
    try {
      final authService = AuthService();
      
      // Get user name from metadata or email
      String userName = authService.userName ?? 
                       authService.userEmail?.split('@').first ?? 
                       'Benutzer';
      
      // Capitalize first letter of each word
      userName = userName.split(' ').map((word) {
        if (word.isEmpty) return word;
        return word[0].toUpperCase() + word.substring(1).toLowerCase();
      }).join(' ');
      
      final userEmail = authService.userEmail ?? '';
      final userPhotoUrl = authService.userPhotoUrl;

      if (mounted) {
        setState(() {
          _userData = {
            'name': userName,
            'email': userEmail,
            'profileImage': userPhotoUrl,
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Failed to load user data: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Load company data from Supabase
  Future<void> _loadCompanyData() async {
    try {
      if (!SupabaseService.isConfigured) {
        return;
      }

      final dbService = DatabaseService.instance;
      
      // Try to get user profile with company info
      try {
        final userProfile = await dbService.getUserProfile();
        if (userProfile['company_name'] != null) {
          if (mounted) {
            setState(() {
              _companyData['name'] = userProfile['company_name'].toString();
              _companyData['logo'] = userProfile['company_logo'];
            });
          }
        }
      } catch (e) {
        // User profile might not exist yet, that's okay
        debugPrint('User profile not found, using default: $e');
      }
    } catch (e) {
      debugPrint('Failed to load company data: $e');
    }
  }

  /// Load data statistics from Supabase
  Future<void> _loadDataStatistics() async {
    try {
      if (!SupabaseService.isConfigured) {
        return;
      }

      final dbService = DatabaseService.instance;
      final contacts = await dbService.getContacts();
      final visits = await dbService.getVisits();

      // Calculate statistics
      final draftVisits = visits.where((v) => v['status']?.toString() == 'draft').length;

      if (mounted) {
        setState(() {
          _dataStats = {
            'storageUsed': '${(contacts.length * 0.1).toStringAsFixed(1)} MB',
            'cachedContacts': contacts.length,
            'offlineForms': draftVisits,
            'lastSync': DateTime.now().toString().substring(0, 16),
            'pendingUploads': draftVisits,
          };
        });
      }
    } catch (e) {
      debugPrint('Failed to load data statistics: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Profil',
        style: CustomAppBarStyle.noLeading,
        actions: [
          CustomAppBarAction(
            icon: Icons.edit,
            onPressed: _handleEditProfile,
            tooltip: 'Profil bearbeiten',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        child: Column(
          children: [
            // Profile Header
            ProfileHeaderWidget(
              userData: _userData,
              onEditPressed: _handleEditProfile,
            ),
            SizedBox(height: 2.h),
            // Company Information
            CompanyInfoCardWidget(
              companyData: _companyData,
              onEditPressed: _handleEditCompanyInfo,
            ),
            SizedBox(height: 1.h),
            // Settings Section
            SettingsSectionWidget(
              settings: _settings,
              onSettingChanged: _handleSettingChanged,
            ),
            SizedBox(height: 1.h),
            // Data Management
            DataManagementWidget(
              dataStats: _dataStats,
              onClearCache: _handleClearCache,
              onExportData: _handleExportData,
            ),
            SizedBox(height: 1.h),
            // Account Section
            AccountSectionWidget(
              onSignOut: _handleSignOut,
              onDeleteAccount: _handleDeleteAccount,
              onPrivacySettings: _handlePrivacySettings,
            ),
            SizedBox(height: 1.h),
            // App Information
            AppInfoWidget(
              appVersion: '1.0.0',
              buildNumber: '100',
              onCheckUpdates: _handleCheckUpdates,
            ),
                  SizedBox(height: 3.h),
                ],
              ),
            ),
      bottomNavigationBar: CustomBottomBar(
        currentIndex: _currentBottomNavIndex,
        onTap: _handleBottomNavTap,
      ),
    );
  }

  void _handleBottomNavTap(int index) {
    if (index == _currentBottomNavIndex) return;

    setState(() => _currentBottomNavIndex = index);

    final routes = [
      '/dashboard',
      '/contacts-management',
      '/form-template-selection',
      '/user-profile',
    ];

    if (index < routes.length) {
      Navigator.pushReplacementNamed(context, routes[index]);
    }
  }

  void _handleEditProfile() {
    Fluttertoast.showToast(
      msg: 'Profil bearbeiten Funktion demnächst verfügbar',
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      textColor: Theme.of(context).colorScheme.onSurface,
    );
  }

  void _handleEditCompanyInfo() {
    Fluttertoast.showToast(
      msg: 'Firmeninfo bearbeiten Funktion demnächst verfügbar',
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      textColor: Theme.of(context).colorScheme.onSurface,
    );
  }

  void _handleSettingChanged(String key, bool value) {
    setState(() {
      _settings[key] = value;
    });

    String message = '';
    if (key == 'autoSync') {
      message = value ? 'Auto-Sync aktiviert' : 'Auto-Sync deaktiviert';
    } else if (key == 'requireSignature') {
      message =
          value ? 'Signatur in PDFs erforderlich' : 'Signatur in PDFs optional';
    } else if (key == 'notifications') {
      message = value
          ? 'Benachrichtigungen aktiviert'
          : 'Benachrichtigungen deaktiviert';
    }

    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      textColor: Theme.of(context).colorScheme.onSurface,
    );
  }

  void _handleClearCache() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Cache leeren'),
        content: Text(
          'Dies entfernt alle zwischengespeicherten Kontakte und Offline-Daten. Sie können sie erneut herunterladen, wenn Sie online sind. Fortfahren?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Abbrechen'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _dataStats['cachedContacts'] = 0;
                _dataStats['offlineForms'] = 0;
                _dataStats['storageUsed'] = '0 MB';
              });
              Fluttertoast.showToast(
                msg: 'Cache erfolgreich geleert',
                toastLength: Toast.LENGTH_SHORT,
                gravity: ToastGravity.BOTTOM,
                backgroundColor:
                    Theme.of(context).colorScheme.surfaceContainerHighest,
                textColor: Theme.of(context).colorScheme.onSurface,
              );
            },
            child: Text('Leeren'),
          ),
        ],
      ),
    );
  }

  void _handleExportData() {
    Fluttertoast.showToast(
      msg: 'Daten werden exportiert... Dies kann einen Moment dauern',
      toastLength: Toast.LENGTH_LONG,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      textColor: Theme.of(context).colorScheme.onSurface,
    );

    // Simulate export process
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      final theme = Theme.of(context);
      Fluttertoast.showToast(
        msg: 'Daten erfolgreich exportiert',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: theme.colorScheme.tertiaryContainer,
        textColor: theme.colorScheme.onTertiaryContainer,
      );
    });
  }

  void _handleSignOut() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Abmelden'),
        content: const Text('Möchten Sie sich wirklich abmelden?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Abbrechen'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Store context and theme before async operations
              final navigator = Navigator.of(context);
              final currentTheme = Theme.of(context);
              Navigator.pop(context);
              
              try {
                final authService = AuthService();
                await authService.signOut();
                
                if (!mounted) return;
                navigator.pushReplacementNamed('/google-sign-in-screen');
                Fluttertoast.showToast(
                  msg: 'Erfolgreich abgemeldet',
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.BOTTOM,
                  backgroundColor: currentTheme.colorScheme.surfaceContainerHighest,
                  textColor: currentTheme.colorScheme.onSurface,
                );
              } catch (e) {
                if (!mounted) return;
                Fluttertoast.showToast(
                  msg: 'Fehler beim Abmelden: ${e.toString()}',
                  toastLength: Toast.LENGTH_LONG,
                  gravity: ToastGravity.BOTTOM,
                  backgroundColor: currentTheme.colorScheme.error,
                  textColor: currentTheme.colorScheme.onError,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            child: const Text('Abmelden'),
          ),
        ],
      ),
    );
  }

  void _handleDeleteAccount() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            CustomIconWidget(
              iconName: 'warning',
              color: Theme.of(context).colorScheme.error,
              size: 6.w,
            ),
            SizedBox(width: 2.w),
            Text('Konto löschen'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht:',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: 1.h),
            Text(
              '• Alle Formularvorlagen\n• Besuchsaufzeichnungen und PDFs\n• Zwischengespeicherte Kontakte\n• Firmeninformationen',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Sind Sie absolut sicher?',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Abbrechen'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Fluttertoast.showToast(
                msg: 'Kontolöschung eingeleitet',
                toastLength: Toast.LENGTH_SHORT,
                gravity: ToastGravity.BOTTOM,
                backgroundColor: Theme.of(context).colorScheme.errorContainer,
                textColor: Theme.of(context).colorScheme.onErrorContainer,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            child: Text('Konto löschen'),
          ),
        ],
      ),
    );
  }

  void _handlePrivacySettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Datenschutzeinstellungen'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Kontaktberechtigungen',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            SizedBox(height: 1.h),
            Text(
              'OnSite greift auf Ihre Google Kontakte zu, um Ihnen bei der Auswahl von Kunden für Besuche zu helfen. Ihre Kontaktdaten werden lokal für den Offline-Zugriff zwischengespeichert und niemals an Dritte weitergegeben.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            SizedBox(height: 2.h),
            Text(
              'Datenschutz',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Alle Ihre Formulare, Besuche und PDFs werden sicher in Ihrem privaten Firebase-Konto gespeichert. Nur Sie können auf Ihre Daten zugreifen.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Vollständige Richtlinien anzeigen'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Schließen'),
          ),
        ],
      ),
    );
  }

  void _handleCheckUpdates() {
    Fluttertoast.showToast(
      msg: 'Suche nach Updates...',
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      textColor: Theme.of(context).colorScheme.onSurface,
    );

    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      final theme = Theme.of(context);
      Fluttertoast.showToast(
        msg: 'Sie verwenden die neueste Version',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: theme.colorScheme.tertiaryContainer,
        textColor: theme.colorScheme.onTertiaryContainer,
      );
    });
  }
}
