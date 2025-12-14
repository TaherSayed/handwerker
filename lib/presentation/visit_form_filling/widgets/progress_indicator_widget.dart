import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

/// Progress indicator showing form completion percentage
class ProgressIndicatorWidget extends StatelessWidget {
  final double progress;
  final int completedFields;

  const ProgressIndicatorWidget({
    super.key,
    required this.progress,
    required this.completedFields,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Form Progress',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '$completedFields% Complete',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        SizedBox(height: 1.h),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 1.h,
            backgroundColor: theme.colorScheme.outline.withValues(alpha: 0.2),
            valueColor: AlwaysStoppedAnimation<Color>(
              completedFields >= 100
                  ? theme.colorScheme.tertiary
                  : theme.colorScheme.primary,
            ),
          ),
        ),
      ],
    );
  }
}
