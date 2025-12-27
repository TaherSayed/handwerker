import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/form_template.dart' as model;

class FormFieldWidget extends StatelessWidget {
  final model.FormField field;
  final dynamic value;
  final ValueChanged<dynamic> onChanged;

  const FormFieldWidget({
    super.key,
    required this.field,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    switch (field.type) {
      // Section/Heading
      case 'section':
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                field.label,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Divider(thickness: 2),
            ],
          ),
        );

      // Text inputs
      case 'text':
      case 'fillblank':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'fullname':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            hintText: 'First and last name',
          ),
          initialValue: value?.toString(),
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'email':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.emailAddress,
          validator: field.required
              ? (val) {
                  if (val?.isEmpty ?? true) return 'Required';
                  if (!val!.contains('@')) return 'Invalid email';
                  return null;
                }
              : null,
          onChanged: onChanged,
        );

      case 'phone':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.phone,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'address':
      case 'longtext':
      case 'paragraph':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          maxLines: field.type == 'address' ? 3 : 5,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      // Number inputs
      case 'number':
      case 'spinner':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.number,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: (val) => onChanged(double.tryParse(val) ?? val),
        );

      // Selection fields
      case 'checkbox':
        if (field.options != null && field.options!.isNotEmpty) {
          // Multiple checkboxes
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                field.label,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...field.options!.map((option) {
                final selectedValues = value is List
                    ? List<String>.from(value.map((v) => v.toString()))
                    : <String>[];
                final isSelected = selectedValues.contains(option);
                return CheckboxListTile(
                  title: Text(option),
                  value: isSelected,
                  onChanged: (val) {
                    final currentValues = List<String>.from(selectedValues);
                    if (val == true && !currentValues.contains(option)) {
                      currentValues.add(option);
                    } else if (val == false) {
                      currentValues.remove(option);
                    }
                    onChanged(currentValues);
                  },
                );
              }),
            ],
          );
        } else {
          // Single checkbox
          return CheckboxListTile(
            title: Text(field.label),
            value: value is bool ? value : (value?.toString().toLowerCase() == 'true'),
            onChanged: (val) => onChanged(val ?? false),
          );
        }

      case 'radio':
        if (field.options == null || field.options!.isEmpty) {
          return TextFormField(
            decoration: InputDecoration(
              labelText: field.label,
              border: const OutlineInputBorder(),
              helperText: 'No options configured',
            ),
            enabled: false,
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...field.options!.map((option) {
              return RadioListTile<String>(
                title: Text(option),
                value: option,
                groupValue: value?.toString(),
                onChanged: (val) => onChanged(val),
              );
            }),
          ],
        );

      case 'toggle':
        return SwitchListTile(
          title: Text(field.label),
          value: value ?? false,
          onChanged: onChanged,
        );

      case 'dropdown':
        if (field.options == null || field.options!.isEmpty) {
          return TextFormField(
            decoration: InputDecoration(
              labelText: field.label,
              border: const OutlineInputBorder(),
              helperText: 'No options configured',
            ),
            enabled: false,
          );
        }
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          value: value?.toString(),
          items: field.options!
              .map((option) => DropdownMenuItem(
                    value: option,
                    child: Text(option),
                  ))
              .toList(),
          validator:
              field.required ? (val) => val == null ? 'Required' : null : null,
          onChanged: onChanged,
        );

      // Date/Time fields
      case 'date':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('MMM d, yyyy').format(DateTime.parse(value))
                : 'Select date',
          ),
          trailing: const Icon(Icons.calendar_today),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(2000),
              lastDate: DateTime(2100),
            );
            if (date != null) {
              onChanged(date.toIso8601String());
            }
          },
        );

      case 'time':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('h:mm a').format(DateTime.parse(value))
                : 'Select time',
          ),
          trailing: const Icon(Icons.access_time),
          onTap: () async {
            final time = await showTimePicker(
              context: context,
              initialTime: TimeOfDay.now(),
            );
            if (time != null && context.mounted) {
              final now = DateTime.now();
              final dateTime = DateTime(
                now.year,
                now.month,
                now.day,
                time.hour,
                time.minute,
              );
              onChanged(dateTime.toIso8601String());
            }
          },
        );

      case 'datetime':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('MMM d, yyyy h:mm a').format(DateTime.parse(value))
                : 'Select date & time',
          ),
          trailing: const Icon(Icons.calendar_today),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(2000),
              lastDate: DateTime(2100),
            );
            if (date != null && context.mounted) {
              final time = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.now(),
              );
              if (time != null) {
                final dateTime = DateTime(
                  date.year,
                  date.month,
                  date.day,
                  time.hour,
                  time.minute,
                );
                onChanged(dateTime.toIso8601String());
              }
            }
          },
        );

      // Notes
      case 'notes':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          maxLines: 4,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      // File uploads
      case 'photo':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value.toString(), height: 200, fit: BoxFit.cover)
            else
              Container(
                height: 200,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(child: Text('No photo')),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                // Image picker implementation would go here
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Photo picker not implemented')),
                );
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('Take Photo'),
            ),
          ],
        );

      case 'fileupload':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              height: 100,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: value != null
                    ? Text('File: ${value.toString()}')
                    : const Text('No file selected'),
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('File picker not implemented')),
                );
              },
              icon: const Icon(Icons.upload_file),
              label: const Text('Upload File'),
            ),
          ],
        );

      case 'signature':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value.toString(), height: 100, fit: BoxFit.contain)
            else
              Container(
                height: 100,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(child: Text('No signature')),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                // Signature pad implementation would go here
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Signature pad not implemented')),
                );
              },
              icon: const Icon(Icons.edit),
              label: const Text('Add Signature'),
            ),
          ],
        );

      // Visual elements
      case 'divider':
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Divider(thickness: 2),
        );

      // Survey fields (basic implementation)
      case 'table':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('Table field - not fully implemented'),
              ),
            ),
          ],
        );

      case 'starrating':
      case 'scalerating':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  'Rating field - not fully implemented',
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
            ),
          ],
        );

      // Default fallback
      default:
        return TextFormField(
          decoration: InputDecoration(
            labelText: '${field.label} (${field.type})',
            border: const OutlineInputBorder(),
            helperText: 'Field type "${field.type}" not fully supported',
          ),
          initialValue: value?.toString(),
          onChanged: onChanged,
        );
    }
  }
}
