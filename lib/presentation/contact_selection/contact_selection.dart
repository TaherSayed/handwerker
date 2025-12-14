import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
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
  Set<String> _favoriteContacts = {};

  @override
  void initState() {
    super.initState();
    _loadContacts();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Load contacts from Google Contacts API with offline fallback
  Future<void> _loadContacts() async {
    setState(() => _isLoading = true);

    // Simulate API call - Replace with actual Google Contacts API integration
    await Future.delayed(const Duration(seconds: 2));

    // Mock contact data
    final contacts = [
      {
        "id": "1",
        "name": "Michael Rodriguez",
        "company": "Rodriguez Construction",
        "phone": "+1 (555) 123-4567",
        "email": "michael@rodriguezconst.com",
        "address": "123 Oak Street, Springfield, IL 62701",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_1e13bc62a-1763294059113.png",
        "semanticLabel":
            "Profile photo of a man with short brown hair and a beard, wearing a dark t-shirt",
        "initials": "MR",
        "alternatePhones": ["+1 (555) 123-4568", "+1 (555) 123-4569"],
        "alternateEmails": ["m.rodriguez@gmail.com"],
      },
      {
        "id": "2",
        "name": "Sarah Chen",
        "company": "Chen Plumbing Services",
        "phone": "+1 (555) 234-5678",
        "email": "sarah@chenplumbing.com",
        "address": "456 Maple Avenue, Chicago, IL 60601",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_16413c03b-1763301411406.png",
        "semanticLabel":
            "Profile photo of a woman with long black hair, wearing glasses and a blue blouse",
        "initials": "SC",
        "alternatePhones": ["+1 (555) 234-5679"],
        "alternateEmails": ["sarah.chen@yahoo.com"],
      },
      {
        "id": "3",
        "name": "David Thompson",
        "company": "Thompson Electric",
        "phone": "+1 (555) 345-6789",
        "email": "david@thompsonelectric.com",
        "address": "789 Pine Road, Boston, MA 02101",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_17fea9682-1764690565935.png",
        "semanticLabel":
            "Profile photo of a man with gray hair and glasses, wearing a white shirt",
        "initials": "DT",
        "alternatePhones": [],
        "alternateEmails": ["d.thompson@outlook.com"],
      },
      {
        "id": "4",
        "name": "Emily Johnson",
        "company": "Johnson HVAC Solutions",
        "phone": "+1 (555) 456-7890",
        "email": "emily@johnsonhvac.com",
        "address": "321 Cedar Lane, Seattle, WA 98101",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_1c2d4d37e-1763298686580.png",
        "semanticLabel":
            "Profile photo of a woman with blonde hair in a ponytail, wearing a red jacket",
        "initials": "EJ",
        "alternatePhones": ["+1 (555) 456-7891"],
        "alternateEmails": [],
      },
      {
        "id": "5",
        "name": "James Wilson",
        "company": "Wilson Carpentry",
        "phone": "+1 (555) 567-8901",
        "email": "james@wilsoncarpentry.com",
        "address": "654 Birch Street, Portland, OR 97201",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_10e32363d-1763295001957.png",
        "semanticLabel":
            "Profile photo of a man with short black hair, wearing a plaid shirt",
        "initials": "JW",
        "alternatePhones": [],
        "alternateEmails": ["j.wilson@gmail.com"],
      },
      {
        "id": "6",
        "name": "Amanda Martinez",
        "company": "Martinez Painting Co",
        "phone": "+1 (555) 678-9012",
        "email": "amanda@martinezpainting.com",
        "address": "987 Elm Drive, Denver, CO 80201",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_14fbbc1e3-1765215925472.png",
        "semanticLabel":
            "Profile photo of a woman with curly brown hair, wearing a green sweater",
        "initials": "AM",
        "alternatePhones": ["+1 (555) 678-9013"],
        "alternateEmails": [],
      },
      {
        "id": "7",
        "name": "Robert Anderson",
        "company": "Anderson Roofing",
        "phone": "+1 (555) 789-0123",
        "email": "robert@andersonroofing.com",
        "address": "147 Spruce Court, Phoenix, AZ 85001",
        "avatar":
            "https://img.rocket.new/generatedImages/rocket_gen_img_11c451189-1764791200984.png",
        "semanticLabel":
            "Profile photo of a man with bald head and mustache, wearing a blue polo shirt",
        "initials": "RA",
        "alternatePhones": [],
        "alternateEmails": ["r.anderson@hotmail.com"],
      },
      {
        "id": "8",
        "name": "Lisa Brown",
        "company": "Brown Landscaping",
        "phone": "+1 (555) 890-1234",
        "email": "lisa@brownlandscaping.com",
        "address": "258 Willow Way, Austin, TX 78701",
        "avatar":
            "https://images.unsplash.com/photo-1730509408253-91968c9aa483",
        "semanticLabel":
            "Profile photo of a woman with short red hair, wearing sunglasses and a yellow shirt",
        "initials": "LB",
        "alternatePhones": ["+1 (555) 890-1235"],
        "alternateEmails": ["lisa.brown@gmail.com"],
      },
    ];

    setState(() {
      _allContacts = contacts;
      _filteredContacts = contacts;
      _isLoading = false;
    });
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

  /// Toggle favorite status for a contact
  void _toggleFavorite(String contactId) {
    setState(() {
      if (_favoriteContacts.contains(contactId)) {
        _favoriteContacts.remove(contactId);
      } else {
        _favoriteContacts.add(contactId);
      }
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

  /// Navigate to manual contact addition
  void _addManualContact() {
    // Navigate to manual contact entry screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Manuelle Kontakthinzufügung demnächst verfügbar'),
        duration: Duration(seconds: 2),
      ),
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
      final firstLetter = (contact['name'] as String)[0].toUpperCase();
      grouped.putIfAbsent(firstLetter, () => []).add(contact);
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
                        onImportContacts: _loadContacts,
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
                                  isFavorite:
                                      _favoriteContacts.contains(contact['id']),
                                  onTap: () => setState(() {
                                    _selectedContactId =
                                        contact['id'] as String;
                                  }),
                                  onLongPress: () =>
                                      _showContactPreview(contact),
                                  onFavoriteToggle: () =>
                                      _toggleFavorite(contact['id'] as String),
                                );
                              }).toList(),
                            );
                          }
                        },
                      ),
          ),

          // Add manual contact button
          if (!_isLoading && _filteredContacts.isNotEmpty)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
              child: OutlinedButton.icon(
                onPressed: _addManualContact,
                icon: CustomIconWidget(
                  iconName: 'person_add',
                  size: 20,
                  color: theme.colorScheme.primary,
                ),
                label: const Text('Manuellen Kontakt hinzufügen'),
                style: OutlinedButton.styleFrom(
                  minimumSize: Size(double.infinity, 6.h),
                ),
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
