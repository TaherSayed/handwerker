import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_icon_widget.dart';

/// Dynamic form field widget that renders different input types
///
/// Supports: text, number, checkbox, toggle, dropdown, date, notes
class FormFieldWidget extends StatefulWidget {
  final Map<String, dynamic> field;
  final dynamic value;
  final bool hasError;
  final ValueChanged<dynamic> onChanged;

  const FormFieldWidget({
    super.key,
    required this.field,
    required this.value,
    required this.hasError,
    required this.onChanged,
  });

  @override
  State<FormFieldWidget> createState() => _FormFieldWidgetState();
}

class _FormFieldWidgetState extends State<FormFieldWidget> {
  late TextEditingController _textController;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController(
      text: widget.value?.toString() ?? '',
    );
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(FormFieldWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value &&
        widget.value?.toString() != _textController.text) {
      _textController.text = widget.value?.toString() ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fieldType = widget.field['type'] as String;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Field label
        Row(
          children: [
            Expanded(
              child: Text(
                widget.field['label'] as String,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: widget.hasError
                      ? theme.colorScheme.error
                      : theme.colorScheme.onSurface,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.h),

        // Field input based on type
        _buildFieldInput(context, fieldType),

        // Error message
        if (widget.hasError)
          Padding(
            padding: EdgeInsets.only(top: 0.5.h),
            child: Text(
              'This field is required',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildFieldInput(BuildContext context, String fieldType) {
    switch (fieldType) {
      case 'text':
        return _buildTextInput(context);
      case 'number':
        return _buildNumberInput(context);
      case 'checkbox':
        return _buildCheckbox(context);
      case 'toggle':
        return _buildToggle(context);
      case 'dropdown':
        return _buildDropdown(context);
      case 'date':
        return _buildDatePicker(context);
      case 'notes':
        return _buildNotesInput(context);
      default:
        return _buildTextInput(context);
    }
  }

  Widget _buildTextInput(BuildContext context) {
    final theme = Theme.of(context);

    return TextField(
      controller: _textController,
      focusNode: _focusNode,
      decoration: InputDecoration(
        hintText: widget.field['placeholder'] as String?,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.primary,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: theme.colorScheme.surface,
        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      ),
      style: theme.textTheme.bodyMedium,
      onChanged: widget.onChanged,
    );
  }

  Widget _buildNumberInput(BuildContext context) {
    final theme = Theme.of(context);

    return TextField(
      controller: _textController,
      focusNode: _focusNode,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
      ],
      decoration: InputDecoration(
        hintText: widget.field['placeholder'] as String?,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.primary,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: theme.colorScheme.surface,
        contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      ),
      style: theme.textTheme.bodyMedium,
      onChanged: widget.onChanged,
    );
  }

  Widget _buildCheckbox(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: () => widget.onChanged(!(widget.value as bool? ?? false)),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 6.h,
              height: 6.h,
              decoration: BoxDecoration(
                color: (widget.value as bool? ?? false)
                    ? theme.colorScheme.primary
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: (widget.value as bool? ?? false)
                      ? theme.colorScheme.primary
                      : theme.colorScheme.outline,
                  width: 2,
                ),
              ),
              child: (widget.value as bool? ?? false)
                  ? Center(
                      child: CustomIconWidget(
                        iconName: 'check',
                        color: theme.colorScheme.onPrimary,
                        size: 5.w,
                      ),
                    )
                  : null,
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Text(
                (widget.value as bool? ?? false) ? 'Yes' : 'No',
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggle(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: widget.hasError
              ? theme.colorScheme.error
              : theme.colorScheme.outline.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              (widget.value as bool? ?? false) ? 'Enabled' : 'Disabled',
              style: theme.textTheme.bodyMedium,
            ),
          ),
          Switch(
            value: widget.value as bool? ?? false,
            onChanged: widget.onChanged,
            activeThumbColor: theme.colorScheme.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown(BuildContext context) {
    final theme = Theme.of(context);
    final options = widget.field['options'] as List<dynamic>;

    return InkWell(
      onTap: () => _showDropdownPicker(context, options),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                widget.value?.toString().isEmpty ?? true
                    ? 'Select an option'
                    : widget.value.toString(),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: widget.value?.toString().isEmpty ?? true
                      ? theme.colorScheme.onSurfaceVariant
                      : theme.colorScheme.onSurface,
                ),
              ),
            ),
            CustomIconWidget(
              iconName: 'arrow_drop_down',
              color: theme.colorScheme.onSurfaceVariant,
              size: 6.w,
            ),
          ],
        ),
      ),
    );
  }

  void _showDropdownPicker(BuildContext context, List<dynamic> options) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: EdgeInsets.all(4.w),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select ${widget.field['label']}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    icon: CustomIconWidget(
                      iconName: 'close',
                      color: theme.colorScheme.onSurface,
                      size: 6.w,
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Divider(
                height: 1,
                color: theme.colorScheme.outline.withValues(alpha: 0.2)),
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: options.length,
                itemBuilder: (context, index) {
                  final option = options[index].toString();
                  final isSelected = widget.value == option;

                  return InkWell(
                    onTap: () {
                      widget.onChanged(option);
                      Navigator.pop(context);
                    },
                    child: Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? theme.colorScheme.primary.withValues(alpha: 0.1)
                            : Colors.transparent,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              option,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : theme.colorScheme.onSurface,
                                fontWeight: isSelected
                                    ? FontWeight.w500
                                    : FontWeight.w400,
                              ),
                            ),
                          ),
                          if (isSelected)
                            CustomIconWidget(
                              iconName: 'check',
                              color: theme.colorScheme.primary,
                              size: 5.w,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context) {
    final theme = Theme.of(context);
    final dateValue = widget.value as DateTime?;

    return InkWell(
      onTap: () => _showDatePickerDialog(context),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: widget.hasError
                ? theme.colorScheme.error
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          children: [
            CustomIconWidget(
              iconName: 'calendar_today',
              color: theme.colorScheme.primary,
              size: 5.w,
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Text(
                dateValue != null
                    ? '${dateValue.month}/${dateValue.day}/${dateValue.year}'
                    : 'Select date',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: dateValue != null
                      ? theme.colorScheme.onSurface
                      : theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showDatePickerDialog(BuildContext context) async {
    final theme = Theme.of(context);
    final initialDate = widget.value as DateTime? ?? DateTime.now();

    final selectedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: theme.copyWith(
            colorScheme: theme.colorScheme,
          ),
          child: child!,
        );
      },
    );

    if (selectedDate != null) {
      widget.onChanged(selectedDate);
    }
  }

  Widget _buildNotesInput(BuildContext context) {
    final theme = Theme.of(context);
    final maxLength = widget.field['maxLength'] as int? ?? 500;
    final currentLength = _textController.text.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        TextField(
          controller: _textController,
          focusNode: _focusNode,
          maxLines: 5,
          maxLength: maxLength,
          decoration: InputDecoration(
            hintText: widget.field['placeholder'] as String?,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: widget.hasError
                    ? theme.colorScheme.error
                    : theme.colorScheme.outline,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: widget.hasError
                    ? theme.colorScheme.error
                    : theme.colorScheme.outline.withValues(alpha: 0.3),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: widget.hasError
                    ? theme.colorScheme.error
                    : theme.colorScheme.primary,
                width: 2,
              ),
            ),
            filled: true,
            fillColor: theme.colorScheme.surface,
            contentPadding:
                EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
            counterText: '',
          ),
          style: theme.textTheme.bodyMedium,
          onChanged: (value) {
            setState(() {});
            widget.onChanged(value);
          },
        ),
        Padding(
          padding: EdgeInsets.only(top: 0.5.h),
          child: Text(
            '$currentLength / $maxLength',
            style: theme.textTheme.bodySmall?.copyWith(
              color: currentLength > maxLength * 0.9
                  ? theme.colorScheme.error
                  : theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }
}
