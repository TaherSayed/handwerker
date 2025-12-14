import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Statistics card widget displaying key metrics
///
/// Features (German):
/// - Kürzliche Besuche Zähler
/// - Ausstehende Berichte Zähler
/// - Synchronisierungsstatus
/// - Online/Offline Indikator
class StatisticsCardWidget extends StatelessWidget {
  final Map<String, dynamic> statistics;
  final bool isOnline;
  final bool isSyncing;
  final DateTime lastSyncTime;

  const StatisticsCardWidget({
    super.key,
    required this.statistics,
    required this.isOnline,
    required this.isSyncing,
    required this.lastSyncTime,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  context: context,
                  icon: 'assignment',
                  label: 'Besuche',
                  value: statistics['recentVisits'].toString(),
                  color: theme.colorScheme.primary,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildStatItem(
                  context: context,
                  icon: 'description',
                  label: 'Berichte',
                  value: statistics['pendingReports'].toString(),
                  color: theme.colorScheme.secondary,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          _buildSyncStatus(context, theme),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required BuildContext context,
    required String icon,
    required String label,
    required String value,
    required Color color,
  }) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$label Details - Funktion wird implementiert'),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      borderRadius: BorderRadius.circular(8.0),
      child: Container(
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(2.w),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(6.0),
              ),
              child: CustomIconWidget(
                iconName: icon,
                size: 20,
                color: theme.colorScheme.surface,
              ),
            ),
            SizedBox(width: 2.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    label,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatus(BuildContext context, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(2.w),
      decoration: BoxDecoration(
        color: isOnline
            ? theme.colorScheme.tertiary.withValues(alpha: 0.1)
            : theme.colorScheme.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        children: [
          if (isSyncing)
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  theme.colorScheme.tertiary,
                ),
              ),
            )
          else
            CustomIconWidget(
              iconName: isOnline ? 'check_circle' : 'error',
              size: 16,
              color: isOnline
                  ? theme.colorScheme.tertiary
                  : theme.colorScheme.error,
            ),
          SizedBox(width: 2.w),
          Expanded(
            child: Text(
              isSyncing
                  ? 'Synchronisierung läuft...'
                  : isOnline
                      ? statistics['syncStatus']
                      : 'Offline',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            _formatLastSync(),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  String _formatLastSync() {
    final now = DateTime.now();
    final difference = now.difference(lastSyncTime);

    if (difference.inMinutes < 1) {
      return 'Gerade eben';
    } else if (difference.inMinutes < 60) {
      return 'vor ${difference.inMinutes}m';
    } else {
      return 'vor ${difference.inHours}h';
    }
  }
}
