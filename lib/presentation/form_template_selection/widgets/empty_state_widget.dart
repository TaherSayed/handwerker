import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

/// Empty state widget shown when no templates exist
class EmptyStateWidget extends StatelessWidget {
  final VoidCallback onCreateTemplate;

  const EmptyStateWidget({
    super.key,
    required this.onCreateTemplate,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(6.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Illustration
            CustomImageWidget(
              imageUrl:
                  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
              width: 60.w,
              height: 30.h,
              fit: BoxFit.contain,
              semanticLabel:
                  'Leere Zwischenablage-Illustration mit Bleistift auf sauberem Schreibtisch',
            ),
            SizedBox(height: 4.h),

            // Title
            Text(
              'Erstellen Sie Ihre erste Vorlage',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 2.h),

            // Description
            Text(
              'Erstellen Sie individuelle Formulare für Ihre Inspektionsanforderungen. Fügen Sie Felder hinzu, passen Sie Layouts an und speichern Sie Vorlagen für schnellen Zugriff.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),

            // Create button
            ElevatedButton.icon(
              onPressed: onCreateTemplate,
              icon: CustomIconWidget(
                iconName: 'add',
                color: theme.colorScheme.onPrimary,
                size: 20,
              ),
              label: Text(
                'Neue Vorlage erstellen',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.onPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(60.w, 6.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(2.w),
                ),
              ),
            ),
            SizedBox(height: 4.h),

            // Sample templates section
            Text(
              'Oder beginnen Sie mit einer Beispielvorlage:',
              style: theme.textTheme.titleSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            SizedBox(height: 2.h),

            // Sample template options
            _buildSampleTemplateCard(
              theme,
              'Grundinspektion',
              'Allgemeines Inspektionsformular mit 8 wesentlichen Feldern',
              Icons.checklist,
            ),
            SizedBox(height: 2.h),
            _buildSampleTemplateCard(
              theme,
              'Servicebericht',
              'Umfassende Service-Dokumentation mit 12 detaillierten Feldern',
              Icons.build,
            ),
            SizedBox(height: 2.h),
            _buildSampleTemplateCard(
              theme,
              'Installations-Checkliste',
              'Vollständige Installationsprüfung mit 15 Prüfpunkten',
              Icons.construction,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSampleTemplateCard(
    ThemeData theme,
    String title,
    String description,
    IconData icon,
  ) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(3.w),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(2.w),
            ),
            child: CustomIconWidget(
              iconName: icon.toString().split('.').last,
              color: theme.colorScheme.primary,
              size: 24,
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
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
          CustomIconWidget(
            iconName: 'arrow_forward',
            color: theme.colorScheme.primary,
            size: 20,
          ),
        ],
      ),
    );
  }
}
