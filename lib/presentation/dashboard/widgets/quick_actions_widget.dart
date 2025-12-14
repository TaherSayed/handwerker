import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Quick actions widget for primary user actions
///
/// Features:
/// - New Visit button
/// - Create Form Template button
/// - Thumb-friendly positioning
/// - Tool-themed icons
class QuickActionsWidget extends StatelessWidget {
  final VoidCallback onNewVisit;
  final VoidCallback onCreateForm;

  const QuickActionsWidget({
    super.key,
    required this.onNewVisit,
    required this.onCreateForm,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Schnellaktionen',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 2.h),
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                context: context,
                icon: 'add_location',
                label: 'Neuer Besuch',
                subtitle: 'Kundenbesuch starten',
                color: theme.colorScheme.primary,
                onPressed: onNewVisit,
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: _buildActionButton(
                context: context,
                icon: 'description',
                label: 'Formular erstellen',
                subtitle: 'Vorlage erstellen',
                color: theme.colorScheme.secondary,
                onPressed: onCreateForm,
              ),
            ),
          ],
        ),
      ],
    );
  }

  /// Build action button
  Widget _buildActionButton({
    required BuildContext context,
    required String icon,
    required String label,
    required String subtitle,
    required Color color,
    required VoidCallback onPressed,
  }) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: color.withValues(alpha: 0.3),
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: CustomIconWidget(
                  iconName: icon,
                  size: 28,
                  color: theme.colorScheme.surface,
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                label,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              SizedBox(height: 0.5.h),
              Text(
                subtitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
