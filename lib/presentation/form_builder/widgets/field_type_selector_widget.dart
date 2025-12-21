import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Field Type Selector Widget - Horizontal scrollable selector for field types
///
/// Features:
/// - Intuitive icons for each field type
/// - Horizontal scroll for easy access
/// - Visual selection indicator
class FieldTypeSelectorWidget extends StatelessWidget {
  final String? selectedType;
  final Function(String) onTypeSelected;

  const FieldTypeSelectorWidget({
    super.key,
    this.selectedType,
    required this.onTypeSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final fieldTypes = [
      {'type': 'text', 'icon': 'text_fields', 'label': 'Text'},
      {'type': 'number', 'icon': 'numbers', 'label': 'Number'},
      {'type': 'checkbox', 'icon': 'check_box', 'label': 'Checkbox'},
      {'type': 'toggle', 'icon': 'toggle_on', 'label': 'Toggle'},
      {
        'type': 'dropdown',
        'icon': 'arrow_drop_down_circle',
        'label': 'Dropdown'
      },
      {'type': 'date', 'icon': 'calendar_today', 'label': 'Date'},
      {'type': 'time', 'icon': 'access_time', 'label': 'Time'},
      {'type': 'notes', 'icon': 'notes', 'label': 'Notes'},
      {'type': 'signature', 'icon': 'edit', 'label': 'Signature'},
    ];

    return SizedBox(
      height: 12.h,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: fieldTypes.length,
        itemBuilder: (context, index) {
          final fieldType = fieldTypes[index];
          final isSelected = selectedType == fieldType['type'];

          return GestureDetector(
            onTap: () => onTypeSelected(fieldType['type'] as String),
            behavior: HitTestBehavior.opaque,
            child: Container(
              width: 20.w,
              margin: EdgeInsets.only(right: 2.w),
              decoration: BoxDecoration(
                color: isSelected
                    ? theme.colorScheme.primaryContainer
                    : theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(3.w),
                border: Border.all(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : theme.colorScheme.outline,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CustomIconWidget(
                    iconName: fieldType['icon'] as String,
                    color: isSelected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurfaceVariant,
                    size: 28,
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    fieldType['label'] as String,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurfaceVariant,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
