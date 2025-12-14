import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Form Field Card Widget - Draggable card displaying form field with inline editing
///
/// Features:
/// - Visual drag indicators
/// - Field type icon
/// - Label and required toggle
/// - Settings gear icon
/// - Delete confirmation
class FormFieldCardWidget extends StatefulWidget {
  final Map<String, dynamic> field;
  final int index;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final Function(Map<String, dynamic>) onUpdate;

  const FormFieldCardWidget({
    super.key,
    required this.field,
    required this.index,
    required this.onEdit,
    required this.onDelete,
    required this.onUpdate,
  });

  @override
  State<FormFieldCardWidget> createState() => _FormFieldCardWidgetState();
}

class _FormFieldCardWidgetState extends State<FormFieldCardWidget> {
  bool _isExpanded = false;
  late TextEditingController _labelController;

  @override
  void initState() {
    super.initState();
    _labelController =
        TextEditingController(text: widget.field['label'] as String);
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  IconData _getFieldIcon(String fieldType) {
    switch (fieldType) {
      case 'text':
        return Icons.text_fields;
      case 'number':
        return Icons.numbers;
      case 'checkbox':
        return Icons.check_box;
      case 'toggle':
        return Icons.toggle_on;
      case 'dropdown':
        return Icons.arrow_drop_down_circle;
      case 'date':
        return Icons.calendar_today;
      case 'time':
        return Icons.access_time;
      case 'notes':
        return Icons.notes;
      default:
        return Icons.help_outline;
    }
  }

  void _showDeleteConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Feld löschen'),
        content: Text('Möchten Sie dieses Feld wirklich löschen?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onDelete();
            },
            child: Text(
              'Löschen',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(3.w),
        border: Border.all(
          color: theme.colorScheme.outline,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Main Card Content
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                if (mounted) {
                  setState(() => _isExpanded = !_isExpanded);
                }
              },
              borderRadius: BorderRadius.circular(3.w),
              child: Padding(
                padding: EdgeInsets.all(4.w),
                child: Row(
                  children: [
                  // Drag Handle
                  CustomIconWidget(
                    iconName: 'drag_indicator',
                    color: theme.colorScheme.onSurfaceVariant,
                    size: 24,
                  ),
                  SizedBox(width: 3.w),
                  // Field Type Icon
                  Container(
                    padding: EdgeInsets.all(2.w),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(2.w),
                    ),
                    child: CustomIconWidget(
                      iconName: _getFieldIcon(widget.field['type'] as String)
                          .toString()
                          .split('.')
                          .last,
                      color: theme.colorScheme.primary,
                      size: 20,
                    ),
                  ),
                  SizedBox(width: 3.w),
                  // Field Label
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.field['label'] as String,
                          style: theme.textTheme.titleMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 0.5.h),
                        Text(
                          widget.field['type'] as String,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 2.w),
                  // Required Toggle - Compact version
                  Tooltip(
                    message: widget.field['required'] as bool ? 'Pflichtfeld' : 'Optional',
                    child: Switch(
                      value: widget.field['required'] as bool,
                      onChanged: (value) {
                        final updatedField =
                            Map<String, dynamic>.from(widget.field);
                        updatedField['required'] = value;
                        widget.onUpdate(updatedField);
                      },
                    ),
                  ),
                  SizedBox(width: 1.w),
                  // Settings Icon
                  IconButton(
                    icon: CustomIconWidget(
                      iconName: 'settings',
                      color: theme.colorScheme.onSurfaceVariant,
                      size: 20,
                    ),
                    iconSize: 20,
                    padding: EdgeInsets.all(2.w),
                    constraints: BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    onPressed: widget.onEdit,
                  ),
                  // Delete Icon
                  IconButton(
                    icon: CustomIconWidget(
                      iconName: 'delete',
                      color: theme.colorScheme.error,
                      size: 20,
                    ),
                    iconSize: 20,
                    padding: EdgeInsets.all(2.w),
                    constraints: BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    onPressed: _showDeleteConfirmation,
                  ),
                ],
                ),
              ),
            ),
          ),
          // Expanded Inline Editing
          if (_isExpanded)
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(3.w),
                  bottomRight: Radius.circular(3.w),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Label Editor
                  TextField(
                    controller: _labelController,
                    decoration: InputDecoration(
                      labelText: 'Field Label',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(2.w),
                      ),
                    ),
                    onChanged: (value) {
                      final updatedField =
                          Map<String, dynamic>.from(widget.field);
                      updatedField['label'] = value;
                      widget.onUpdate(updatedField);
                    },
                  ),
                  SizedBox(height: 2.h),
                  // Help Text
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Help Text (Optional)',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(2.w),
                      ),
                    ),
                    maxLines: 2,
                    onChanged: (value) {
                      final updatedField =
                          Map<String, dynamic>.from(widget.field);
                      updatedField['helpText'] = value;
                      widget.onUpdate(updatedField);
                    },
                  ),
                  // Dropdown Options Editor
                  if (widget.field['type'] == 'dropdown') ...[
                    SizedBox(height: 2.h),
                    Text(
                      'Dropdown Options',
                      style: theme.textTheme.titleSmall,
                    ),
                    SizedBox(height: 1.h),
                    ...((widget.field['options'] as List?) ?? [])
                        .asMap()
                        .entries
                        .map((entry) {
                      final index = entry.key;
                      final option = entry.value as String;
                      return Padding(
                        padding: EdgeInsets.only(bottom: 1.h),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                decoration: InputDecoration(
                                  labelText: 'Option ${index + 1}',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(2.w),
                                  ),
                                ),
                                controller: TextEditingController(text: option),
                                onChanged: (value) {
                                  final updatedField =
                                      Map<String, dynamic>.from(widget.field);
                                  final options = List<String>.from(
                                      updatedField['options'] as List);
                                  options[index] = value;
                                  updatedField['options'] = options;
                                  widget.onUpdate(updatedField);
                                },
                              ),
                            ),
                            IconButton(
                              icon: CustomIconWidget(
                                iconName: 'delete',
                                color: theme.colorScheme.error,
                                size: 20,
                              ),
                              onPressed: () {
                                final updatedField =
                                    Map<String, dynamic>.from(widget.field);
                                final options = List<String>.from(
                                    updatedField['options'] as List);
                                options.removeAt(index);
                                updatedField['options'] = options;
                                widget.onUpdate(updatedField);
                              },
                            ),
                          ],
                        ),
                      );
                    }),
                    TextButton.icon(
                      onPressed: () {
                        final updatedField =
                            Map<String, dynamic>.from(widget.field);
                        final options =
                            List<String>.from(updatedField['options'] as List);
                        options.add('New Option');
                        updatedField['options'] = options;
                        widget.onUpdate(updatedField);
                      },
                      icon: CustomIconWidget(
                        iconName: 'add',
                        color: theme.colorScheme.primary,
                        size: 20,
                      ),
                      label: Text('Option hinzufügen'),
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}
