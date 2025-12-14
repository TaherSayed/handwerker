import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Settings section widget with toggle switches
/// Manages app preferences and behavior settings
class SettingsSectionWidget extends StatelessWidget {
  final Map<String, bool> settings;
  final Function(String, bool) onSettingChanged;

  const SettingsSectionWidget({
    super.key,
    required this.settings,
    required this.onSettingChanged,
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
                iconName: 'settings',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Settings',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          _buildSettingItem(
            context,
            'Auto-sync when online',
            'autoSync',
            settings['autoSync'] ?? true,
            'Automatically sync data when internet connection is available',
          ),
          Divider(
              height: 3.h,
              color: theme.colorScheme.outline.withValues(alpha: 0.2)),
          _buildSettingItem(
            context,
            'Require signature in PDFs',
            'requireSignature',
            settings['requireSignature'] ?? false,
            'Add signature field to all generated PDF reports',
          ),
          Divider(
              height: 3.h,
              color: theme.colorScheme.outline.withValues(alpha: 0.2)),
          _buildSettingItem(
            context,
            'Enable notifications',
            'notifications',
            settings['notifications'] ?? true,
            'Receive notifications for sync status and updates',
          ),
        ],
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context,
    String title,
    String key,
    bool value,
    String description,
  ) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              SizedBox(height: 0.5.h),
              Text(
                description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        SizedBox(width: 3.w),
        Switch(
          value: value,
          onChanged: (newValue) => onSettingChanged(key, newValue),
        ),
      ],
    );
  }
}
