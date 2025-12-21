import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

/// Contact card widget with swipe actions and selection indicator
///
/// Features:
/// - Profile image or initials display
/// - Contact name, company, and phone
/// - Selection indicator (checkmark circle)
/// - Swipe action for favoriting
/// - Long-press for preview
/// - Touch target optimized for work gloves
class ContactCardWidget extends StatelessWidget {
  const ContactCardWidget({
    super.key,
    required this.contact,
    required this.isSelected,
    required this.onTap,
    required this.onLongPress,
  });

  final Map<String, dynamic> contact;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
        onTap: onTap,
        onLongPress: onLongPress,
        child: Container(
          margin: EdgeInsets.only(bottom: 2.h),
          padding: EdgeInsets.all(3.w),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.primary.withValues(alpha: 0.1)
                : theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.outline.withValues(alpha: 0.2),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              // Avatar or initials
              if (contact['avatar'] != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CustomImageWidget(
                    imageUrl: contact['avatar'] as String,
                    width: 12.w,
                    height: 12.w,
                    fit: BoxFit.cover,
                    semanticLabel: contact['semanticLabel'] as String,
                  ),
                )
              else
                Container(
                  width: 12.w,
                  height: 12.w,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    contact['initials'] as String,
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

              SizedBox(width: 3.w),

              // Contact details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            contact['name'] as String,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
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
                    SizedBox(height: 0.5.h),
                    Row(
                      children: [
                        CustomIconWidget(
                          iconName: 'phone',
                          size: 14,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        SizedBox(width: 1.w),
                        Expanded(
                          child: Text(
                            contact['phone'] as String,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Selection indicator
              Container(
                width: 6.w,
                height: 6.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected
                      ? theme.colorScheme.primary
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.outline,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? Icon(
                        Icons.check,
                        size: 16,
                        color: theme.colorScheme.onPrimary,
                      )
                    : null,
              ),
            ],
          ),
        ),
      );
  }
}
