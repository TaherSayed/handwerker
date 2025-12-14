import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Empty state widget for no contacts scenario
///
/// Features:
/// - Guidance message
/// - Import contacts action
/// - Permission handling instructions
class EmptyStateWidget extends StatelessWidget {
  const EmptyStateWidget({
    super.key,
    required this.onImportContacts,
  });

  final VoidCallback onImportContacts;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'contacts',
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
            ),
            SizedBox(height: 3.h),
            Text(
              'No Contacts Found',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 2.h),
            Text(
              'Import contacts from Google to get started with customer visits',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            ElevatedButton.icon(
              onPressed: onImportContacts,
              icon: CustomIconWidget(
                iconName: 'cloud_download',
                size: 20,
                color: theme.colorScheme.onPrimary,
              ),
              label: const Text('Kontakte importieren'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(60.w, 6.h),
              ),
            ),
            SizedBox(height: 2.h),
            TextButton(
              onPressed: () {
                // Navigate to manual contact addition
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Manuelle Kontakthinzufügung demnächst verfügbar'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
              child: const Text('Kontakt manuell hinzufügen'),
            ),
          ],
        ),
      ),
    );
  }
}
