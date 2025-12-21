import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';

import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../services/database_service.dart';
import '../../services/supabase_service.dart';
import '../../services/google_contacts_service.dart';
import './widgets/contact_card_widget.dart';
import './widgets/empty_state_widget.dart';
import './widgets/search_bar_widget.dart';
import './widgets/section_header_widget.dart';

/// Contact Selection Screen for choosing customers from Google Contacts
///
/// Features:
/// - Real-time search with debounced input
/// - Alphabetically sorted contact list
/// - Progressive loading with skeleton cards
/// - Long-press preview with full contact details
/// - Swipe actions for favoriting
/// - Alphabetical section headers with jump-scroll
/// - Manual contact addition
/// - Offline mode with cached contacts
/// - Permission handling
class ContactSelection extends StatefulWidget {
  const ContactSelection({super.key});

  @override
  State<ContactSelection> createState() => _ContactSelectionState();
}

class _ContactSelectionState extends State<ContactSelection> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  bool _isLoading = true;
  bool _isOffline = false;
  String _searchQuery = '';
  String? _selectedContactId;
  List<Map<String, dynamic>> _allContacts = [];
  List<Map<String, dynamic>> _filteredContacts = [];

  @override
  void initState() {
    super.initState();
    _loadContacts();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Reload contacts when screen becomes visible (e.g., after Google Sign-In)
    if (_allContacts.isEmpty && !_isLoading) {
      _loadContacts();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Load contacts from Supabase database
  Future<void> _loadContacts() async {
    setState(() => _isLoading = true);

    try {
      // Check if Supabase is configured
      if (!SupabaseService.isConfigured) {
        setState(() {
          _allContacts = [];
          _filteredContacts = [];
          _isLoading = false;
          _isOffline = true;
        });
        return;
      }

      // Load contacts from database
      final dbService = DatabaseService.instance;
      final dbContacts = await dbService.getContacts();

      // Transform database format to UI format
      final contacts = dbContacts.map((contact) {
        final fullName = contact['full_name']?.toString() ?? 'Unbekannt';
        final nameParts = fullName.split(' ');
        final initials = nameParts.length >= 2
            ? '${nameParts[0][0]}${nameParts[1][0]}'
            : fullName.isNotEmpty
                ? fullName[0]
                : '?';

        return {
          'id': contact['id']?.toString() ?? '',
          'name': fullName,
          'company': contact['company']?.toString() ?? '',
          'phone': contact['phone']?.toString() ?? '',
          'email': contact['email']?.toString() ?? '',
          'avatar': contact['avatar_url']?.toString(),
          'initials': initials.toUpperCase(),
          'semanticLabel': 'Profile photo of $fullName',
        };
      }).toList();

      setState(() {
        _allContacts = contacts;
        _filteredContacts = contacts;
        _isLoading = false;
        _isOffline = false;
      });
    } catch (e) {
      debugPrint('❌ Error loading contacts: $e');
      setState(() {
        _allContacts = [];
        _filteredContacts = [];
        _isLoading = false;
        _isOffline = true;
      });
    }
  }

  /// Import Google Contacts manually
  Future<void> _importGoogleContacts() async {
    if (!SupabaseService.isConfigured) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Supabase ist nicht konfiguriert'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (kIsWeb) {
        // For web, use Google Sign-In directly to get access token for contacts
        const webClientId = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID', defaultValue: '');
        if (webClientId.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('GOOGLE_WEB_CLIENT_ID nicht konfiguriert'),
              backgroundColor: Colors.red,
            ),
          );
          setState(() => _isLoading = false);
          return;
        }

        // Use Google Sign-In for web to get contacts access token
        final googleSignIn = GoogleSignIn(
          clientId: webClientId,
          scopes: [
            'email',
            'profile',
            'https://www.googleapis.com/auth/contacts.readonly',
          ],
        );

        // Try to sign in silently first (if already signed in)
        var googleAccount = await googleSignIn.signInSilently();
        
        // If silent sign-in fails, show sign-in dialog
        googleAccount ??= await googleSignIn.signIn();

        if (googleAccount == null) {
          setState(() => _isLoading = false);
          return; // User cancelled
        }

        // Import contacts using the Google account
        final contactsService = GoogleContactsService.instance;
        await contactsService.importGoogleContacts(googleAccount: googleAccount);

        // Reload contacts from database
        await _loadContacts();

        if (mounted) {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Kontakte erfolgreich importiert'),
              backgroundColor: Colors.green,
            ),
          );
        }
        return;
      }

      // For mobile: Use Google Sign-In to get access token
      const webClientId = String.fromEnvironment('GOOGLE_WEB_CLIENT_ID', defaultValue: '');
      if (webClientId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('GOOGLE_WEB_CLIENT_ID nicht konfiguriert'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() => _isLoading = false);
        return;
      }

      final googleSignIn = GoogleSignIn(
        serverClientId: webClientId,
        scopes: [
          'email',
          'profile',
          'https://www.googleapis.com/auth/contacts.readonly',
        ],
      );

      final googleAccount = await googleSignIn.signIn();
      if (googleAccount == null) {
        setState(() => _isLoading = false);
        return; // User cancelled
      }

      // Import contacts
      final contactsService = GoogleContactsService.instance;
      await contactsService.importGoogleContacts(googleAccount: googleAccount);

      // Reload contacts from database
      await _loadContacts();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Kontakte erfolgreich importiert'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      debugPrint('❌ Error importing contacts: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Fehler beim Importieren: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Handle search input with debouncing
  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.toLowerCase();
      _filteredContacts = _allContacts.where((contact) {
        final name = (contact['name'] as String).toLowerCase();
        final company = (contact['company'] as String).toLowerCase();
        final phone = (contact['phone'] as String).toLowerCase();
        return name.contains(_searchQuery) ||
            company.contains(_searchQuery) ||
            phone.contains(_searchQuery);
      }).toList();
    });
  }


  /// Show contact preview on long press
  void _showContactPreview(Map<String, dynamic> contact) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: 60.h,
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: EdgeInsets.symmetric(vertical: 2.h),
              width: 12.w,
              height: 0.5.h,
              decoration: BoxDecoration(
                color:
                    theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Contact details
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar and name
                    Row(
                      children: [
                        if (contact['avatar'] != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CustomImageWidget(
                              imageUrl: contact['avatar'] as String,
                              width: 16.w,
                              height: 16.w,
                              fit: BoxFit.cover,
                              semanticLabel: contact['semanticLabel'] as String,
                            ),
                          )
                        else
                          Container(
                            width: 16.w,
                            height: 16.w,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              contact['initials'] as String,
                              style: theme.textTheme.titleLarge?.copyWith(
                                color: theme.colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                contact['name'] as String,
                                style: theme.textTheme.titleLarge,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: 0.5.h),
                              Text(
                                contact['company'] as String,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: 3.h),

                    // Phone numbers
                    _buildDetailSection(
                      theme,
                      'Telefonnummern',
                      [
                        contact['phone'] as String,
                        ...(contact['alternatePhones'] as List)
                            .map((p) => p as String),
                      ],
                      Icons.phone,
                    ),

                    SizedBox(height: 2.h),

                    // Email addresses
                    _buildDetailSection(
                      theme,
                      'E-Mail-Adressen',
                      [
                        contact['email'] as String,
                        ...(contact['alternateEmails'] as List)
                            .map((e) => e as String),
                      ],
                      Icons.email,
                    ),

                    SizedBox(height: 2.h),

                    // Address
                    _buildDetailSection(
                      theme,
                      'Adresse',
                      [contact['address'] as String],
                      Icons.location_on,
                    ),
                  ],
                ),
              ),
            ),

            // Action buttons
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(
                  top: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Schließen'),
                    ),
                  ),
                  SizedBox(width: 3.w),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        setState(
                            () => _selectedContactId = contact['id'] as String);
                        Navigator.pop(context);
                      },
                      child: const Text('Auswählen'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailSection(
    ThemeData theme,
    String title,
    List<String> items,
    IconData icon,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CustomIconWidget(
              iconName: icon.codePoint.toRadixString(16),
              size: 20,
              color: theme.colorScheme.primary,
            ),
            SizedBox(width: 2.w),
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        SizedBox(height: 1.h),
        ...items.map((item) => Padding(
              padding: EdgeInsets.only(left: 7.w, bottom: 0.5.h),
              child: Text(
                item,
                style: theme.textTheme.bodyMedium,
              ),
            )),
      ],
    );
  }


  /// Continue with selected contact
  void _continueWithSelection() {
    if (_selectedContactId != null) {
      final selectedContact = _allContacts.firstWhere(
        (contact) => contact['id'] == _selectedContactId,
      );

      // Navigate to form template selection with selected contact
      Navigator.pushNamed(
        context,
        '/form-template-selection',
        arguments: selectedContact,
      );
    }
  }

  /// Group contacts by first letter
  Map<String, List<Map<String, dynamic>>> _groupContactsByLetter() {
    final grouped = <String, List<Map<String, dynamic>>>{};

    for (final contact in _filteredContacts) {
      final name = contact['name']?.toString() ?? '';
      if (name.isNotEmpty) {
        final firstLetter = name[0].toUpperCase();
        grouped.putIfAbsent(firstLetter, () => []).add(contact);
      }
    }

    return Map.fromEntries(
      grouped.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final groupedContacts = _groupContactsByLetter();

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Kunde auswählen',
        actions: [
          CustomAppBarAction(
            icon: Icons.sync,
            onPressed: _loadContacts,
            tooltip: 'Kontakte aktualisieren',
          ),
        ],
        showOfflineIndicator: _isOffline,
      ),
      body: Column(
        children: [
          // Search bar
          SearchBarWidget(
            controller: _searchController,
            onChanged: (value) => _onSearchChanged(),
          ),

          // Contact list
          Expanded(
            child: _isLoading
                ? _buildSkeletonLoader(theme)
                : _filteredContacts.isEmpty
                    ? EmptyStateWidget(
                        onImportContacts: _importGoogleContacts,
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: EdgeInsets.symmetric(
                            horizontal: 4.w, vertical: 2.h),
                        itemCount: groupedContacts.length * 2,
                        itemBuilder: (context, index) {
                          if (index.isEven) {
                            // Section header
                            final letter =
                                groupedContacts.keys.elementAt(index ~/ 2);
                            return SectionHeaderWidget(letter: letter);
                          } else {
                            // Contact cards
                            final letter =
                                groupedContacts.keys.elementAt(index ~/ 2);
                            final contacts = groupedContacts[letter]!;

                            return Column(
                              children: contacts.map((contact) {
                                return ContactCardWidget(
                                  contact: contact,
                                  isSelected:
                                      _selectedContactId == contact['id'],
                                  onTap: () => setState(() {
                                    _selectedContactId =
                                        contact['id'] as String;
                                  }),
                                  onLongPress: () =>
                                      _showContactPreview(contact),
                                );
                              }).toList(),
                            );
                          }
                        },
                      ),
          ),


          // Continue button
          if (_selectedContactId != null)
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.shadow,
                    blurRadius: 8,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: _continueWithSelection,
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 6.h),
                  ),
                  child: const Text('Weiter'),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSkeletonLoader(ThemeData theme) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      itemCount: 8,
      itemBuilder: (context, index) {
        return Container(
          margin: EdgeInsets.only(bottom: 2.h),
          padding: EdgeInsets.all(3.w),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: theme.colorScheme.outline.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              // Avatar skeleton
              Container(
                width: 12.w,
                height: 12.w,
                decoration: BoxDecoration(
                  color:
                      theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              SizedBox(width: 3.w),

              // Text skeletons
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40.w,
                      height: 2.h,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurfaceVariant
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Container(
                      width: 30.w,
                      height: 1.5.h,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurfaceVariant
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Container(
                      width: 25.w,
                      height: 1.5.h,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurfaceVariant
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
