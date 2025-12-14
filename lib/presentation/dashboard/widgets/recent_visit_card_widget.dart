import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Recent visit card widget for displaying visit information
///
/// Features (German):
/// - Besuchsinformationen anzeigen
/// - Status-Badges (abgeschlossen, Entwurf)
/// - Synchronisierungsstatus
/// - Swipe-Aktionen (Ansehen, Teilen, Bearbeiten)
class RecentVisitCardWidget extends StatelessWidget {
  final Map<String, dynamic> visit;
  final Function(String, Map<String, dynamic>) onAction;
  final String Function(DateTime) formatDate;

  const RecentVisitCardWidget({
    super.key,
    required this.visit,
    required this.onAction,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isCompleted = visit['status'] == 'completed';
    final isSynced = visit['isSynced'] ?? false;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
        side: BorderSide(
          color: theme.colorScheme.outline.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () => onAction('view', visit),
        borderRadius: BorderRadius.circular(12.0),
        child: Padding(
          padding: EdgeInsets.all(4.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          visit['customerName'],
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 0.5.h),
                        Text(
                          visit['id'],
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? theme.colorScheme.tertiary.withValues(alpha: 0.1)
                          : theme.colorScheme.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6.0),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CustomIconWidget(
                          iconName: isCompleted ? 'check_circle' : 'edit',
                          size: 14,
                          color: isCompleted
                              ? theme.colorScheme.tertiary
                              : theme.colorScheme.secondary,
                        ),
                        SizedBox(width: 1.w),
                        Text(
                          isCompleted ? 'Abgeschlossen' : 'Entwurf',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isCompleted
                                ? theme.colorScheme.tertiary
                                : theme.colorScheme.secondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 2.h),
              Row(
                children: [
                  CustomIconWidget(
                    iconName: 'description',
                    size: 16,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  SizedBox(width: 2.w),
                  Expanded(
                    child: Text(
                      visit['formTemplate'],
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 1.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CustomIconWidget(
                        iconName: 'access_time',
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      SizedBox(width: 2.w),
                      Text(
                        formatDate(visit['visitDate']),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  if (!isSynced)
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4.0),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CustomIconWidget(
                            iconName: 'sync_disabled',
                            size: 12,
                            color: theme.colorScheme.error,
                          ),
                          SizedBox(width: 1.w),
                          Text(
                            'Nicht synchronisiert',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.error,
                              fontSize: 10.sp,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              SizedBox(height: 2.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: () => onAction('share', visit),
                    icon: CustomIconWidget(
                      iconName: 'share',
                      size: 16,
                      color: theme.colorScheme.primary,
                    ),
                    label: Text(
                      'Teilen',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                  SizedBox(width: 2.w),
                  if (!isCompleted)
                    TextButton.icon(
                      onPressed: () => onAction('edit', visit),
                      icon: CustomIconWidget(
                        iconName: 'edit',
                        size: 16,
                        color: theme.colorScheme.primary,
                      ),
                      label: Text(
                        'Bearbeiten',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
