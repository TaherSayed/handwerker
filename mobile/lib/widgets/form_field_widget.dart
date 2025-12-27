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

  String _formatIfParsableDate(String? raw, String pattern) {
    if (raw == null || raw.trim().isEmpty) return '';
    try {
      return DateFormat(pattern).format(DateTime.parse(raw));
    } catch (_) {
      // Some templates may store date/time in a non-ISO format. Show raw value instead.
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    switch (field.type) {
      case 'section':
        return Padding(
          padding: const EdgeInsets.only(top: 8, bottom: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                field.label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Divider(height: 1),
            ],
          ),
        );

      case 'text':
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
            labelText: field.label.isNotEmpty ? field.label : 'Full name',
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          textCapitalization: TextCapitalization.words,
          onChanged: onChanged,
        );

      case 'email':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label.isNotEmpty ? field.label : 'Email',
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.emailAddress,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'phone':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label.isNotEmpty ? field.label : 'Phone',
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
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label.isNotEmpty ? field.label : 'Address',
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          maxLines: 2,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'number':
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

      case 'spinner':
        // Web builder uses "spinner" as a numeric input
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

      case 'checkbox':
        return CheckboxListTile(
          title: Text(field.label),
          value: value ?? false,
          onChanged: (val) => onChanged(val ?? false),
        );

      case 'toggle':
        return SwitchListTile(
          title: Text(field.label),
          value: value ?? false,
          onChanged: onChanged,
        );

      case 'dropdown':
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value,
          items: field.options
              ?.map((option) => DropdownMenuItem(
                    value: option,
                    child: Text(option),
                  ))
              .toList(),
          validator:
              field.required ? (val) => val == null ? 'Required' : null : null,
          onChanged: onChanged,
        );

      case 'radio':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...(field.options ?? const <String>[])
                .map(
                  (opt) => RadioListTile<String>(
                    title: Text(opt),
                    value: opt,
                    groupValue: value?.toString(),
                    onChanged: onChanged,
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                )
                .toList(),
          ],
        );

      case 'date':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null ? _formatIfParsableDate(value.toString(), 'MMM d, yyyy') : 'Select date',
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

      case 'datetime':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? _formatIfParsableDate(value.toString(), 'MMM d, yyyy h:mm a')
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

      case 'time':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(value?.toString().isNotEmpty == true ? value.toString() : 'Select time'),
          trailing: const Icon(Icons.access_time),
          onTap: () async {
            final picked = await showTimePicker(
              context: context,
              initialTime: TimeOfDay.now(),
            );
            if (picked != null) {
              final hh = picked.hour.toString().padLeft(2, '0');
              final mm = picked.minute.toString().padLeft(2, '0');
              onChanged('$hh:$mm');
            }
          },
        );

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

      case 'longtext':
      case 'paragraph':
      case 'fillblank':
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

      case 'photo':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value, height: 200, fit: BoxFit.cover)
            else
              const Text('No photo'),
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
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (value != null && value.toString().isNotEmpty)
              Text('Selected: ${value.toString()}')
            else
              const Text('No file'),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                // File picker implementation would go here
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('File upload not implemented')),
                );
              },
              icon: const Icon(Icons.upload_file),
              label: const Text('Upload File'),
            ),
          ],
        );

      case 'divider':
        return const Divider(height: 24);

      case 'table':
      case 'starrating':
      case 'scalerating':
        // Not yet implemented in mobile app. Render as a read-only placeholder
        // so the user sees the element exists.
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.black12),
            borderRadius: BorderRadius.circular(8),
            color: Colors.black.withValues(alpha: 0.02),
          ),
          child: Text('${field.label} (not supported on mobile yet)'),
        );

      case 'signature':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value, height: 100, fit: BoxFit.contain)
            else
              const Text('No signature'),
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

      default:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          initialValue: value?.toString(),
          onChanged: onChanged,
        );
    }
  }
}
