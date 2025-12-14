import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Data management widget
/// Shows storage usage, cached data, and sync status
class DataManagementWidget extends StatelessWidget {
  final Map<String, dynamic> dataStats;
  final VoidCallback onClearCache;
  final VoidCallback onExportData;

  const DataManagementWidget({
    super.key,
    required this.dataStats,
    required this.onClearCache,
    required this.onExportData,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'storage',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Data Management',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          _buildStatItem(
            context,
            'Storage Used',
            dataStats['storageUsed'] as String? ?? '0 MB',
            'cloud_upload',
          ),
          SizedBox(height: 1.5.h),
          _buildStatItem(
            context,
            'Cached Contacts',
            '${dataStats['cachedContacts'] ?? 0} contacts',
            'contacts',
          ),
          SizedBox(height: 1.5.h),
          _buildStatItem(
            context,
            'Offline Forms',
            '${dataStats['offlineForms'] ?? 0} forms',
            'description',
          ),
          SizedBox(height: 1.5.h),
          _buildSyncStatus(context),
          SizedBox(height: 2.h),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onClearCache,
                  icon: CustomIconWidget(
                    iconName: 'delete_outline',
                    color: theme.colorScheme.error,
                    size: 5.w,
                  ),
                  label: Text(
                    'Clear Cache',
                    style: TextStyle(color: theme.colorScheme.error),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 1.5.h),
                    side: BorderSide(color: theme.colorScheme.error),
                  ),
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onExportData,
                  icon: CustomIconWidget(
                    iconName: 'download',
                    color: theme.colorScheme.onPrimary,
                    size: 5.w,
                  ),
                  label: Text('Daten exportieren'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 1.5.h),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    String value,
    String iconName,
  ) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Container(
          width: 10.w,
          height: 10.w,
          decoration: BoxDecoration(
            color: theme.colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: CustomIconWidget(
              iconName: iconName,
              color: theme.colorScheme.primary,
              size: 5.w,
            ),
          ),
        ),
        SizedBox(width: 3.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              SizedBox(height: 0.3.h),
              Text(
                value,
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSyncStatus(BuildContext context) {
    final theme = Theme.of(context);
    final lastSync = dataStats['lastSync'] as String? ?? 'Never';
    final pendingUploads = dataStats['pendingUploads'] as int? ?? 0;

    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: pendingUploads > 0
            ? theme.colorScheme.errorContainer
            : theme.colorScheme.tertiaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          CustomIconWidget(
            iconName: pendingUploads > 0 ? 'sync_problem' : 'check_circle',
            color: pendingUploads > 0
                ? theme.colorScheme.error
                : theme.colorScheme.tertiary,
            size: 5.w,
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sync Status',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                SizedBox(height: 0.3.h),
                Text(
                  pendingUploads > 0
                      ? '$pendingUploads items pending'
                      : 'Last sync: $lastSync',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
