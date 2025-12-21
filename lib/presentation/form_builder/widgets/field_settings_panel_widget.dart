import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Field Settings Panel Widget - Detailed settings for form fields
///
/// Features:
/// - Type-specific configuration options
/// - Validation rules
/// - Default values
/// - Help text
class FieldSettingsPanelWidget extends StatefulWidget {
  final Map<String, dynamic> field;
  final Function(Map<String, dynamic>) onSave;
  final VoidCallback? onClose;

  const FieldSettingsPanelWidget({
    super.key,
    required this.field,
    required this.onSave,
    this.onClose,
  });

  @override
  State<FieldSettingsPanelWidget> createState() =>
      _FieldSettingsPanelWidgetState();
}

class _FieldSettingsPanelWidgetState extends State<FieldSettingsPanelWidget> {
  late Map<String, dynamic> _editedField;
  late TextEditingController _labelController;

  @override
  void initState() {
    super.initState();
    _editedField = Map<String, dynamic>.from(widget.field);
    _labelController =
        TextEditingController(text: _editedField['label'] as String);
  }

  @override
  void dispose() {
    _labelController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
      ),
      child: Column(
        children: [
          // Title
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 4.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Feldeinstellungen',
                    style: theme.textTheme.titleLarge,
                  ),
                ),
                if (widget.onClose != null)
                  IconButton(
                    icon: CustomIconWidget(
                      iconName: 'close',
                      color: theme.colorScheme.onSurfaceVariant,
                      size: 24,
                    ),
                    onPressed: widget.onClose,
                  ),
              ],
            ),
          ),
          Divider(color: theme.colorScheme.outline),
          // Settings Content
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(4.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Label
                  TextField(
                    controller: _labelController,
                    decoration: InputDecoration(
                      labelText: 'Field Label',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(2.w),
                      ),
                    ),
                    onChanged: (value) {
                      _editedField['label'] = value;
                    },
                  ),
                  SizedBox(height: 2.h),
                  // Type-specific settings
                  if (_editedField['type'] == 'dropdown')
                    ..._buildDropdownSettings(theme),
                ],
              ),
            ),
          ),
          // Save Button
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(
                top: BorderSide(
                  color: theme.colorScheme.outline,
                  width: 1,
                ),
              ),
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => widget.onSave(_editedField),
                child: Text('Einstellungen speichern'),
              ),
            ),
          ),
        ],
      ),
    );
  }


  List<Widget> _buildDropdownSettings(ThemeData theme) {
    return [
      Text(
        'Dropdown Options',
        style: theme.textTheme.titleMedium,
      ),
      SizedBox(height: 1.h),
      Text(
        'Manage options in the field card',
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    ];
  }
}
