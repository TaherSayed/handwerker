import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

/// Contact card widget with swipe actions and sync status
class ContactCardWidget extends StatelessWidget {
  final Map<String, dynamic> contact;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onFavoriteToggle;

  const ContactCardWidget({
    super.key,
    required this.contact,
    required this.onTap,
    required this.onLongPress,
    required this.onFavoriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isFavorite = contact['isFavorite'] as bool;
    final isSynced = contact['isSynced'] as bool;

    return Slidable(
      key: ValueKey(contact['id']),
      endActionPane: ActionPane(
        motion: const ScrollMotion(),
        children: [
          SlidableAction(
            onPressed: (_) {
              // Call action
            },
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: theme.colorScheme.onPrimary,
            icon: Icons.call,
            label: 'Call',
          ),
          SlidableAction(
            onPressed: (_) {
              // Message action
            },
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            icon: Icons.message,
            label: 'Message',
          ),
          SlidableAction(
            onPressed: (_) {
              // Email action
            },
            backgroundColor: Colors.orange,
            foregroundColor: Colors.white,
            icon: Icons.email,
            label: 'Email',
          ),
          SlidableAction(
            onPressed: (_) {
              // Start visit action
            },
            backgroundColor: theme.colorScheme.tertiary,
            foregroundColor: Colors.white,
            icon: Icons.assignment,
            label: 'Visit',
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        onLongPress: onLongPress,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: theme.colorScheme.outline.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
          ),
          child: Row(
            children: [
              // Avatar
              Stack(
                children: [
                  CircleAvatar(
                    radius: 28,
                    child: ClipOval(
                      child: CustomImageWidget(
                        imageUrl: contact['avatar'] as String,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        semanticLabel: contact['semanticLabel'] as String,
                      ),
                    ),
                  ),
                  if (!isSynced)
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: EdgeInsets.all(1.w),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.error,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: theme.colorScheme.surface,
                            width: 2,
                          ),
                        ),
                        child: CustomIconWidget(
                          iconName: 'sync_problem',
                          size: 12,
                          color: theme.colorScheme.onError,
                        ),
                      ),
                    ),
                ],
              ),
              SizedBox(width: 3.w),

              // Contact info
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
                        if (isFavorite)
                          CustomIconWidget(
                            iconName: 'star',
                            size: 18,
                            color: Colors.amber,
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

              // Favorite toggle
              IconButton(
                onPressed: onFavoriteToggle,
                icon: CustomIconWidget(
                  iconName: isFavorite ? 'star' : 'star_border',
                  size: 24,
                  color: isFavorite
                      ? Colors.amber
                      : theme.colorScheme.onSurfaceVariant,
                ),
                constraints: BoxConstraints(
                  minWidth: 48,
                  minHeight: 48,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
