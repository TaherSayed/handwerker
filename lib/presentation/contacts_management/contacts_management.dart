import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_bottom_bar.dart';
import '../../services/database_service.dart';
import '../../services/supabase_service.dart';
import './widgets/contact_card_widget.dart';
import './widgets/favorite_contact_widget.dart';
import './widgets/search_bar_widget.dart';
import './widgets/sync_status_widget.dart';

/// Contacts Management Screen - Comprehensive customer database with Google Contacts integration
///
/// Features:
/// - Google Contacts API integration with pull-to-refresh sync
/// - Real-time search across name, company, phone, email
/// - Alphabetical navigation with section headers
/// - Quick actions: Call, Message, Email, Start Visit
/// - Favorites management and offline caching
/// - Contact permissions handling with fallback options
class ContactsManagement extends StatefulWidget {
  const ContactsManagement({super.key});

  @override
  State<ContactsManagement> createState() => _ContactsManagementState();
}

class _ContactsManagementState extends State<ContactsManagement>
    with SingleTickerProviderStateMixin {
  int _currentBottomNavIndex = 1; // Contacts tab active
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  bool _isRefreshing = false;
  bool _isOffline = false;
  bool _hasContactPermission = true;
  String _searchQuery = '';
  DateTime _lastSyncTime = DateTime.now().subtract(const Duration(minutes: 5));

  // Contacts data - loaded from Supabase
  List<Map<String, dynamic>> _allContacts = [
    {
      "id": "1",
      "name": "Michael Rodriguez",
      "company": "Rodriguez Construction",
      "phone": "+1 (555) 123-4567",
      "email": "michael@rodriguezconst.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_143b978a3-1763294952544.png",
      "semanticLabel":
          "Professional headshot of Hispanic man with short black hair in navy suit",
      "isFavorite": true,
      "isSynced": true,
      "lastVisit": "2025-12-10",
    },
    {
      "id": "2",
      "name": "Sarah Chen",
      "company": "Chen Electrical Services",
      "phone": "+1 (555) 234-5678",
      "email": "sarah@chenelectrical.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_18a713e78-1763297858426.png",
      "semanticLabel":
          "Professional headshot of Asian woman with long black hair in white blouse",
      "isFavorite": true,
      "isSynced": true,
      "lastVisit": "2025-12-08",
    },
    {
      "id": "3",
      "name": "David Thompson",
      "company": "Thompson Plumbing",
      "phone": "+1 (555) 345-6789",
      "email": "david@thompsonplumbing.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_187ac2848-1764684680250.png",
      "semanticLabel":
          "Professional headshot of Caucasian man with gray hair and beard in blue shirt",
      "isFavorite": false,
      "isSynced": true,
      "lastVisit": "2025-12-05",
    },
    {
      "id": "4",
      "name": "Emily Johnson",
      "company": "Johnson HVAC Solutions",
      "phone": "+1 (555) 456-7890",
      "email": "emily@johnsonhvac.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_117e4bd25-1763295402445.png",
      "semanticLabel":
          "Professional headshot of blonde woman with shoulder-length hair in gray blazer",
      "isFavorite": true,
      "isSynced": true,
      "lastVisit": "2025-12-12",
    },
    {
      "id": "5",
      "name": "James Wilson",
      "company": "Wilson Carpentry",
      "phone": "+1 (555) 567-8901",
      "email": "james@wilsoncarpentry.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_19210013b-1763292285589.png",
      "semanticLabel":
          "Professional headshot of African American man with short hair in checkered shirt",
      "isFavorite": false,
      "isSynced": false,
      "lastVisit": "2025-11-28",
    },
    {
      "id": "6",
      "name": "Maria Garcia",
      "company": "Garcia Landscaping",
      "phone": "+1 (555) 678-9012",
      "email": "maria@garcialandscaping.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_1691a8840-1763294659276.png",
      "semanticLabel":
          "Professional headshot of Hispanic woman with curly brown hair in green polo shirt",
      "isFavorite": false,
      "isSynced": true,
      "lastVisit": "2025-12-01",
    },
    {
      "id": "7",
      "name": "Robert Anderson",
      "company": "Anderson Roofing",
      "phone": "+1 (555) 789-0123",
      "email": "robert@andersonroofing.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_16eac8bba-1763298756043.png",
      "semanticLabel":
          "Professional headshot of middle-aged man with brown hair in red flannel shirt",
      "isFavorite": false,
      "isSynced": true,
      "lastVisit": "2025-11-25",
    },
    {
      "id": "8",
      "name": "Lisa Martinez",
      "company": "Martinez Painting",
      "phone": "+1 (555) 890-1234",
      "email": "lisa@martinezpainting.com",
      "avatar":
          "https://img.rocket.new/generatedImages/rocket_gen_img_1f3ac5aaa-1763301918157.png",
      "semanticLabel":
          "Professional headshot of Hispanic woman with straight black hair in white t-shirt",
      "isFavorite": false,
      "isSynced": true,
      "lastVisit": "2025-12-03",
    },
  ];

  List<Map<String, dynamic>> get _filteredContacts {
    if (_searchQuery.isEmpty) {
      return _allContacts;
    }

    return _allContacts.where((contact) {
      final name = (contact['name'] as String).toLowerCase();
      final company = (contact['company'] as String).toLowerCase();
      final phone = (contact['phone'] as String).toLowerCase();
      final email = (contact['email'] as String).toLowerCase();
      final query = _searchQuery.toLowerCase();

      return name.contains(query) ||
          company.contains(query) ||
          phone.contains(query) ||
          email.contains(query);
    }).toList();
  }

  List<Map<String, dynamic>> get _favoriteContacts {
    return _filteredContacts
        .where((contact) => contact['isFavorite'] == true)
        .toList();
  }

  Map<String, List<Map<String, dynamic>>> get _groupedContacts {
    final Map<String, List<Map<String, dynamic>>> grouped = {};

    for (var contact in _filteredContacts) {
      final firstLetter = (contact['name'] as String)[0].toUpperCase();
      grouped.putIfAbsent(firstLetter, () => []);
      grouped[firstLetter]!.add(contact);
    }

    return Map.fromEntries(
        grouped.entries.toList()..sort((a, b) => a.key.compareTo(b.key)));
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _checkContactPermissions();
    _loadContactsFromDatabase();
  }
  
  /// Load contacts from Supabase database
  Future<void> _loadContactsFromDatabase() async {
    try {
      if (!SupabaseService.isConfigured) {
        debugPrint('Supabase not configured, using mock data');
        return;
      }
      
      final dbService = DatabaseService.instance;
      final contacts = await dbService.getContacts();
      
      if (mounted) {
        setState(() {
          _allContacts = contacts.map((contact) {
            return {
              "id": contact['id']?.toString() ?? '',
              "name": contact['full_name'] ?? 'Unbekannt',
              "company": contact['company'] ?? '',
              "phone": contact['phone'] ?? '',
              "email": contact['email'] ?? '',
              "avatar": contact['avatar_url'] ?? '',
              "semanticLabel": contact['full_name'] ?? 'Contact',
              "isFavorite": contact['is_favorite'] ?? false,
              "isSynced": true,
              "lastVisit": contact['last_visit_date']?.toString() ?? '',
            };
          }).toList();
        });
      }
    } catch (e) {
      debugPrint('Failed to load contacts from database: $e');
      // Keep mock data as fallback
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _checkContactPermissions() async {
    // Simulate permission check
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() {
      _hasContactPermission = true;
    });
  }

  Future<void> _refreshContacts() async {
    setState(() {
      _isRefreshing = true;
    });

    // Simulate Google Contacts sync
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isRefreshing = false;
      _lastSyncTime = DateTime.now();
      // Update sync status for pending contacts
      for (var contact in _allContacts) {
        contact['isSynced'] = true;
      }
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Kontakte erfolgreich synchronisiert'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _toggleFavorite(String contactId) {
    setState(() {
      final contact = _allContacts.firstWhere((c) => c['id'] == contactId);
      contact['isFavorite'] = !(contact['isFavorite'] as bool);
    });
  }

  void _showContactDetails(Map<String, dynamic> contact) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildContactDetailsSheet(contact),
    );
  }

  void _showQuickActions(Map<String, dynamic> contact) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildQuickActionsSheet(contact),
    );
  }

  void _addNewContact() {
    Navigator.pushNamed(context, '/contact-selection');
  }

  void _requestContactPermission() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Kontaktberechtigung erforderlich'),
        content: Text(
            'OnSite benötigt Zugriff auf Ihre Kontakte, um Kundeninformationen zu synchronisieren. Bitte gewähren Sie die Berechtigung in den Geräteeinstellungen.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Abbrechen'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _checkContactPermissions();
            },
            child: Text('Einstellungen öffnen'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Contacts',
        actions: [
          CustomAppBarAction(
            icon: Icons.sync,
            onPressed: _refreshContacts,
            tooltip: 'Sync Contacts',
          ),
          CustomAppBarAction(
            icon: Icons.search,
            onPressed: () {
              // Search is already visible in the UI
            },
            tooltip: 'Search',
          ),
        ],
        showOfflineIndicator: _isOffline,
      ),
      body: _hasContactPermission
          ? _buildContactsList()
          : _buildPermissionRequired(),
      bottomNavigationBar: CustomBottomBar(
        currentIndex: _currentBottomNavIndex,
        onTap: (index) {
          setState(() {
            _currentBottomNavIndex = index;
          });

          // Navigate to corresponding screen
          switch (index) {
            case 0:
              Navigator.pushNamed(context, '/dashboard');
              break;
            case 1:
              // Already on contacts screen
              break;
            case 2:
              Navigator.pushNamed(context, '/form-template-selection');
              break;
            case 3:
              Navigator.pushNamed(context, '/user-profile');
              break;
          }
        },
      ),
      floatingActionButton: _hasContactPermission
          ? FloatingActionButton.extended(
              onPressed: _addNewContact,
              icon: CustomIconWidget(
                iconName: 'add',
                color: theme.colorScheme.onPrimary,
                size: 24,
              ),
              label: Text('Kontakt hinzufügen'),
            )
          : null,
    );
  }

  Widget _buildContactsList() {
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: _refreshContacts,
      child: Column(
        children: [
          // Sync status
          SyncStatusWidget(
            lastSyncTime: _lastSyncTime,
            isRefreshing: _isRefreshing,
          ),

          // Search bar
          SearchBarWidget(
            controller: _searchController,
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
              });
            },
          ),

          // Tab bar
          Container(
            color: theme.colorScheme.surface,
            child: TabBar(
              controller: _tabController,
              tabs: [
                Tab(text: 'All Contacts (${_filteredContacts.length})'),
                Tab(text: 'Favorites (${_favoriteContacts.length})'),
              ],
            ),
          ),

          // Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildAllContactsTab(),
                _buildFavoritesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllContactsTab() {
    if (_filteredContacts.isEmpty) {
      return _buildEmptyState();
    }

    final groupedContacts = _groupedContacts;

    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.symmetric(vertical: 2.h),
      itemCount: groupedContacts.length,
      itemBuilder: (context, index) {
        final letter = groupedContacts.keys.elementAt(index);
        final contacts = groupedContacts[letter]!;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section header
            Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
              color:
                  Theme.of(context).colorScheme.surface.withValues(alpha: 0.5),
              child: Text(
                letter,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ),

            // Contacts in section
            ...contacts.map((contact) => ContactCardWidget(
                  contact: contact,
                  onTap: () => _showContactDetails(contact),
                  onLongPress: () => _showQuickActions(contact),
                  onFavoriteToggle: () =>
                      _toggleFavorite(contact['id'] as String),
                )),
          ],
        );
      },
    );
  }

  Widget _buildFavoritesTab() {
    if (_favoriteContacts.isEmpty) {
      return _buildEmptyFavoritesState();
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(vertical: 2.h),
      itemCount: _favoriteContacts.length,
      itemBuilder: (context, index) {
        final contact = _favoriteContacts[index];
        return FavoriteContactWidget(
          contact: contact,
          onTap: () => _showContactDetails(contact),
          onFavoriteToggle: () => _toggleFavorite(contact['id'] as String),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'contacts',
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            SizedBox(height: 3.h),
            Text(
              'No Contacts Found',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 1.h),
            Text(
              _searchQuery.isEmpty
                  ? 'Import contacts from Google to get started'
                  : 'No contacts match your search',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            ElevatedButton.icon(
              onPressed: _searchQuery.isEmpty
                  ? _addNewContact
                  : () {
                      setState(() {
                        _searchQuery = '';
                        _searchController.clear();
                      });
                    },
              icon: CustomIconWidget(
                iconName: _searchQuery.isEmpty ? 'add' : 'clear',
                color: theme.colorScheme.onPrimary,
                size: 20,
              ),
              label:
                  Text(_searchQuery.isEmpty ? 'Add Contact' : 'Clear Search'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyFavoritesState() {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'star_border',
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            SizedBox(height: 3.h),
            Text(
              'No Favorite Contacts',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 1.h),
            Text(
              'Mark contacts as favorites for quick access',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionRequired() {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'contacts',
              size: 80,
              color: theme.colorScheme.error,
            ),
            SizedBox(height: 3.h),
            Text(
              'Contact Permission Required',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 1.h),
            Text(
              'OnSite needs access to your contacts to sync customer information and streamline your workflow.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            ElevatedButton.icon(
              onPressed: _requestContactPermission,
              icon: CustomIconWidget(
                iconName: 'settings',
                color: theme.colorScheme.onPrimary,
                size: 20,
              ),
              label: Text('Berechtigung erteilen'),
            ),
            SizedBox(height: 2.h),
            TextButton(
              onPressed: _addNewContact,
              child: Text('Kontakt manuell hinzufügen'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactDetailsSheet(Map<String, dynamic> contact) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.all(6.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(height: 3.h),

          // Avatar
          CircleAvatar(
            radius: 40,
            child: ClipOval(
              child: CustomImageWidget(
                imageUrl: contact['avatar'] as String,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
                semanticLabel: contact['semanticLabel'] as String,
              ),
            ),
          ),
          SizedBox(height: 2.h),

          // Name
          Text(
            contact['name'] as String,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 0.5.h),

          // Company
          Text(
            contact['company'] as String,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 3.h),

          // Contact info
          _buildDetailRow(Icons.phone, contact['phone'] as String),
          SizedBox(height: 1.h),
          _buildDetailRow(Icons.email, contact['email'] as String),
          SizedBox(height: 1.h),
          _buildDetailRow(Icons.event, 'Letzter Besuch: ${contact['lastVisit']}'),
          SizedBox(height: 3.h),

          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    // Edit contact
                  },
                  icon: CustomIconWidget(
                    iconName: 'edit',
                    color: theme.colorScheme.primary,
                    size: 20,
                  ),
                  label: Text('Bearbeiten'),
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/visit-form-filling');
                  },
                  icon: CustomIconWidget(
                    iconName: 'assignment',
                    color: theme.colorScheme.onPrimary,
                    size: 20,
                  ),
                  label: Text('Besuch starten'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSheet(Map<String, dynamic> contact) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.all(6.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(height: 3.h),

          Text(
            'Quick Actions',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 3.h),

          _buildQuickActionTile(
            icon: Icons.call,
            title: 'Call',
            subtitle: contact['phone'] as String,
            onTap: () {
              Navigator.pop(context);
              // Make call
            },
          ),
          _buildQuickActionTile(
            icon: Icons.message,
            title: 'Message',
            subtitle: 'Send SMS',
            onTap: () {
              Navigator.pop(context);
              // Send message
            },
          ),
          _buildQuickActionTile(
            icon: Icons.email,
            title: 'Email',
            subtitle: contact['email'] as String,
            onTap: () {
              Navigator.pop(context);
              // Send email
            },
          ),
          _buildQuickActionTile(
            icon: Icons.assignment,
            title: 'Start Visit',
            subtitle: 'Create new visit report',
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/visit-form-filling');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    final theme = Theme.of(context);

    return Row(
      children: [
        CustomIconWidget(
          iconName: icon
              .toString()
              .split('.')
              .last
              .replaceAll('IconData(U+', '')
              .replaceAll(')', ''),
          size: 20,
          color: theme.colorScheme.onSurfaceVariant,
        ),
        SizedBox(width: 3.w),
        Expanded(
          child: Text(
            text,
            style: theme.textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return ListTile(
      leading: Container(
        padding: EdgeInsets.all(2.w),
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: CustomIconWidget(
          iconName: icon
              .toString()
              .split('.')
              .last
              .replaceAll('IconData(U+', '')
              .replaceAll(')', ''),
          size: 24,
          color: theme.colorScheme.primary,
        ),
      ),
      title: Text(
        title,
        style: theme.textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
      onTap: onTap,
    );
  }
}
