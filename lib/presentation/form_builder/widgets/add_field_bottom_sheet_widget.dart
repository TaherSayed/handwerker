import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Add Field Bottom Sheet Widget - Grid of field types for adding new fields
///
/// Features:
/// - Grid layout with intuitive icons
/// - Field type descriptions
/// - Smooth animations
class AddFieldBottomSheetWidget extends StatelessWidget {
  final Function(String) onFieldTypeSelected;

  const AddFieldBottomSheetWidget({
    super.key,
    required this.onFieldTypeSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final fieldTypes = [
      {
        'type': 'text',
        'icon': 'text_fields',
        'label': 'Textfeld',
        'description': 'Einzeiliger Texteingabe'
      },
      {
        'type': 'number',
        'icon': 'numbers',
        'label': 'Zahlenfeld',
        'description': 'Nur numerische Eingabe'
      },
      {
        'type': 'checkbox',
        'icon': 'check_box',
        'label': 'Kontrollkästchen',
        'description': 'Mehrfachauswahl'
      },
      {
        'type': 'toggle',
        'icon': 'toggle_on',
        'label': 'Umschalter',
        'description': 'Ein/Aus-Schalter'
      },
      {
        'type': 'dropdown',
        'icon': 'arrow_drop_down_circle',
        'label': 'Dropdown',
        'description': 'Aus Optionen wählen'
      },
      {
        'type': 'date',
        'icon': 'calendar_today',
        'label': 'Datumsauswahl',
        'description': 'Datum auswählen'
      },
      {
        'type': 'time',
        'icon': 'access_time',
        'label': 'Zeitauswahl',
        'description': 'Zeit auswählen'
      },
      {
        'type': 'notes',
        'icon': 'notes',
        'label': 'Notizen',
        'description': 'Mehrzeiliger Textbereich'
      },
      {
        'type': 'signature',
        'icon': 'edit',
        'label': 'Unterschrift',
        'description': 'Digitale Unterschrift'
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(6.w)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle Bar
          Container(
            margin: EdgeInsets.symmetric(vertical: 2.h),
            width: 12.w,
            height: 0.5.h,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(1.w),
            ),
          ),
          // Title
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 4.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Feld hinzufügen',
                  style: theme.textTheme.titleLarge,
                ),
                IconButton(
                  icon: CustomIconWidget(
                    iconName: 'close',
                    color: theme.colorScheme.onSurfaceVariant,
                    size: 24,
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          SizedBox(height: 2.h),
          // Field Types Grid
          Flexible(
            child: GridView.builder(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              shrinkWrap: true,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 3.w,
                mainAxisSpacing: 2.h,
                childAspectRatio: 1.2,
              ),
              itemCount: fieldTypes.length,
              itemBuilder: (context, index) {
                final fieldType = fieldTypes[index];
                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => onFieldTypeSelected(fieldType['type'] as String),
                    borderRadius: BorderRadius.circular(3.w),
                    child: Container(
                      padding: EdgeInsets.all(4.w),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(3.w),
                        border: Border.all(
                          color: theme.colorScheme.outline,
                          width: 1,
                        ),
                      ),
                      child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomIconWidget(
                          iconName: fieldType['icon'] as String,
                          color: theme.colorScheme.primary,
                          size: 32,
                        ),
                        SizedBox(height: 1.h),
                        Text(
                          fieldType['label'] as String,
                          style: theme.textTheme.titleSmall,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 0.5.h),
                        Text(
                          fieldType['description'] as String,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          SizedBox(height: 2.h),
        ],
      ),
    );
  }
}
