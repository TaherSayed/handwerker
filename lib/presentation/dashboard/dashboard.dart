import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_bottom_bar.dart';
import '../../services/auth_service.dart';
import '../../services/database_service.dart';
import './widgets/quick_actions_widget.dart';
import './widgets/recent_visit_card_widget.dart';
import './widgets/statistics_card_widget.dart';

/// Dashboard screen - Main hub for craftsmen to access visits, actions, and statistics
///
/// Features:
/// - Tab bar navigation with Dashboard active
/// - Personalized greeting with company name
/// - Statistics cards (visits, reports, sync status)
/// - Quick action buttons (New Visit, Create Form)
/// - Recent visits list with swipe actions
/// - Pull-to-refresh sync functionality
/// - Offline indicator and cached data markers
/// - Floating action button for new visits
class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  int _currentBottomNavIndex = 0;
  bool _isOnline = true;
  bool _isSyncing = false;
  DateTime _lastSyncTime = DateTime.now();

  // User data - loaded from Supabase
  String _userName = "";
  String _companyName = "";
  
  // Statistics data - loaded from Supabase
  Map<String, dynamic> _statistics = {
    "recentVisits": 0,
    "pendingReports": 0,
    "syncStatus": "Wird geladen...",
  };

  // Recent visits data - loaded from Supabase
  List<Map<String, dynamic>> _recentVisits = [];

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
    _loadUserData();
    _loadStatistics();
    _loadRecentVisits();
  }
  
  /// Load user data from Supabase
  Future<void> _loadUserData() async {
    try {
      final authService = AuthService();
      final userName = authService.userName ?? authService.userEmail ?? "Benutzer";
      final companyName = "Ihr Unternehmen"; // TODO: Load from user profile
      
      if (mounted) {
        setState(() {
          _userName = userName;
          _companyName = companyName;
        });
      }
    } catch (e) {
      debugPrint('Failed to load user data: $e');
    }
  }
  
  /// Load statistics from Supabase
  Future<void> _loadStatistics() async {
    try {
      final dbService = DatabaseService.instance;
      final visits = await dbService.getVisits(limit: 100);
      final pendingReports = visits.where((v) => v['status'] == 'draft').length;
      
      if (mounted) {
        setState(() {
          _statistics = {
            "recentVisits": visits.length,
            "pendingReports": pendingReports,
            "syncStatus": "Alles synchronisiert",
          };
        });
      }
    } catch (e) {
      debugPrint('Failed to load statistics: $e');
      if (mounted) {
        setState(() {
          _statistics["syncStatus"] = "Fehler beim Laden";
        });
      }
    }
  }
  
  /// Load recent visits from Supabase
  Future<void> _loadRecentVisits() async {
    try {
      final dbService = DatabaseService.instance;
      final visits = await dbService.getVisits(limit: 10);
      
      if (mounted) {
        setState(() {
          _recentVisits = visits.map((visit) {
            // Safely parse visit_date
            DateTime visitDate = DateTime.now();
            try {
              final visitDateStr = visit['visit_date']?.toString();
              if (visitDateStr != null && visitDateStr.isNotEmpty) {
                visitDate = DateTime.parse(visitDateStr);
              }
            } catch (e) {
              debugPrint('Error parsing visit_date: $e');
            }
            
            // Safely get customer name
            String customerName = 'Unbekannt';
            try {
              final contacts = visit['contacts'];
              if (contacts != null) {
                if (contacts is Map) {
                  customerName = contacts['full_name']?.toString() ?? 'Unbekannt';
                } else if (contacts is List && contacts.isNotEmpty) {
                  customerName = contacts[0]?['full_name']?.toString() ?? 'Unbekannt';
                }
              }
            } catch (e) {
              debugPrint('Error getting customer name: $e');
            }
            
            // Safely get form template name
            String formTemplate = 'Unbekannt';
            try {
              final formTemplates = visit['form_templates'];
              if (formTemplates != null) {
                if (formTemplates is Map) {
                  formTemplate = formTemplates['name']?.toString() ?? 'Unbekannt';
                }
              }
            } catch (e) {
              debugPrint('Error getting form template: $e');
            }
            
            return {
              "id": visit['id']?.toString() ?? '',
              "customerName": customerName,
              "visitDate": visitDate,
              "formTemplate": formTemplate,
              "status": visit['status']?.toString() ?? 'draft',
              "isSynced": visit['status']?.toString() == 'completed',
            };
          }).toList();
        });
      }
    } catch (e) {
      debugPrint('Failed to load recent visits: $e');
    }
  }

  /// Check network connectivity status
  Future<void> _checkConnectivity() async {
    // Simulate connectivity check
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() {
        _isOnline = true;
      });
    }
  }

  /// Handle pull-to-refresh sync
  Future<void> _handleRefresh() async {
    if (!_isOnline) {
      _showOfflineMessage();
      return;
    }

    setState(() {
      _isSyncing = true;
    });

    // Reload all data from Supabase
    await Future.wait([
      _loadUserData(),
      _loadStatistics(),
      _loadRecentVisits(),
    ]);

    if (mounted) {
      setState(() {
        _isSyncing = false;
        _lastSyncTime = DateTime.now();
      });

      _showSyncSuccessMessage();
    }
  }

  /// Show offline message
  void _showOfflineMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
            'Sie sind offline. Verbinden Sie sich, um Daten zu synchronisieren.'),
        backgroundColor: Theme.of(context).colorScheme.error,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Show sync success message
  void _showSyncSuccessMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Daten erfolgreich synchronisiert'),
        backgroundColor: Theme.of(context).colorScheme.tertiary,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  /// Handle visit card swipe actions
  void _handleVisitAction(String action, Map<String, dynamic> visit) {
    switch (action) {
      case 'view':
        Navigator.pushNamed(context, AppRoutes.pdfPreview, arguments: visit);
        break;
      case 'share':
        _shareReport(visit);
        break;
      case 'edit':
        Navigator.pushNamed(context, AppRoutes.visitFormFilling,
            arguments: visit);
        break;
    }
  }

  /// Share report functionality
  void _shareReport(Map<String, dynamic> visit) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Bericht wird geteilt für ${visit["customerName"]}'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  /// Navigate to new visit flow
  void _startNewVisit() {
    Navigator.pushNamed(context, AppRoutes.contactSelection);
  }

  /// Navigate to form builder
  void _createFormTemplate() {
    Navigator.pushNamed(context, AppRoutes.formBuilder);
  }

  /// Format date for display
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inHours < 24) {
      if (difference.inHours < 1) {
        return 'vor ${difference.inMinutes} Minuten';
      }
      return 'vor ${difference.inHours} Stunden';
    } else if (difference.inDays < 7) {
      return 'vor ${difference.inDays} Tagen';
    } else {
      return '${date.day}.${date.month}.${date.year}';
    }
  }

  /// Get current date formatted
  String _getCurrentDate() {
    final now = DateTime.now();
    final months = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember'
    ];
    return '${now.day}. ${months[now.month - 1]} ${now.year}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'OnSite',
        style: CustomAppBarStyle.noLeading,
        showOfflineIndicator: !_isOnline,
        actions: [
          CustomAppBarAction(
            icon: Icons.notifications_outlined,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Benachrichtigungen werden noch implementiert'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            tooltip: 'Benachrichtigungen',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        child: CustomScrollView(
          slivers: [
            // Sticky header with greeting
            SliverToBoxAdapter(
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  border: Border(
                    bottom: BorderSide(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hallo, $_userName',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      _companyName,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Row(
                      children: [
                        CustomIconWidget(
                          iconName: 'calendar_today',
                          size: 14,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        SizedBox(width: 1.w),
                        Text(
                          _getCurrentDate(),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Statistics cards
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(4.w),
                child: StatisticsCardWidget(
                  statistics: _statistics,
                  isOnline: _isOnline,
                  isSyncing: _isSyncing,
                  lastSyncTime: _lastSyncTime,
                ),
              ),
            ),

            // Quick actions section
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 4.w),
                child: QuickActionsWidget(
                  onNewVisit: _startNewVisit,
                  onCreateForm: _createFormTemplate,
                ),
              ),
            ),

            // Recent visits header
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(4.w, 3.h, 4.w, 1.h),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Kürzliche Besuche',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Alle Besuche anzeigen - Funktion wird implementiert'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Text(
                        'Alle anzeigen',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Recent visits list
            _recentVisits.isEmpty
                ? SliverFillRemaining(
                    child: _buildEmptyState(theme),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final visit = _recentVisits[index];
                        return Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: 4.w,
                            vertical: 1.h,
                          ),
                          child: RecentVisitCardWidget(
                            visit: visit,
                            onAction: _handleVisitAction,
                            formatDate: _formatDate,
                          ),
                        );
                      },
                      childCount: _recentVisits.length,
                    ),
                  ),

            // Bottom padding
            SliverToBoxAdapter(
              child: SizedBox(height: 10.h),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _startNewVisit,
        icon: CustomIconWidget(
          iconName: 'add',
          size: 24,
          color: theme.colorScheme.onPrimary,
        ),
        label: Text(
          'Besuch starten',
          style: theme.textTheme.labelLarge?.copyWith(
            color: theme.colorScheme.onPrimary,
          ),
        ),
      ),
      bottomNavigationBar: CustomBottomBar(
        currentIndex: _currentBottomNavIndex,
        onTap: (index) {
          setState(() {
            _currentBottomNavIndex = index;
          });

          // Navigate based on index
          switch (index) {
            case 0:
              // Already on dashboard
              break;
            case 1:
              Navigator.pushNamed(context, AppRoutes.contactsManagement);
              break;
            case 2:
              Navigator.pushNamed(context, AppRoutes.formTemplateSelection);
              break;
            case 3:
              Navigator.pushNamed(context, AppRoutes.userProfile);
              break;
          }
        },
      ),
    );
  }

  /// Build empty state when no visits exist
  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(8.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              CustomIconWidget(
                iconName: 'assignment_outlined',
                size: 80,
                color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
              ),
              SizedBox(height: 3.h),
              Text(
                'Noch keine Besuche',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Starten Sie Ihren ersten Kundenbesuch, um ihn hier zu sehen',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 4.h),
              ElevatedButton.icon(
                onPressed: _startNewVisit,
                icon: CustomIconWidget(
                  iconName: 'add',
                  size: 20,
                  color: theme.colorScheme.onPrimary,
                ),
                label: const Text('Ersten Besuch erstellen'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
