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
      // Section Headers
      case 'section':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.only(bottom: 8),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.grey, width: 2)),
              ),
              child: Text(
                field.label,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
          ],
        );

      // Divider
      case 'divider':
        return const Column(
          children: [
            SizedBox(height: 16),
            Divider(thickness: 2),
            SizedBox(height: 16),
          ],
        );

      // Text Fields
      case 'text':
      case 'fillblank':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            hintText: field.placeholder ?? '',
            border: const OutlineInputBorder(),
            helperText: field.help_text,
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
            hintText: field.placeholder ?? 'Enter full name',
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.person),
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          textCapitalization: TextCapitalization.words,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'email':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            hintText: field.placeholder ?? 'Enter email address',
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.email),
            helperText: field.help_text,
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
            hintText: field.placeholder ?? 'Enter phone number',
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.phone),
            helperText: field.help_text,
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
            hintText: field.placeholder ?? '',
            border: const OutlineInputBorder(),
            alignLabelWithHint: true,
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          maxLines: 3,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      case 'notes':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            hintText: field.placeholder ?? 'Enter notes',
            border: const OutlineInputBorder(),
            alignLabelWithHint: true,
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          maxLines: 4,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );

      // Number Fields
      case 'number':
      case 'spinner':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            hintText: field.placeholder ?? '',
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.numbers),
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.number,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: (val) => onChanged(double.tryParse(val) ?? val),
        );

      // Toggle/Boolean Fields
      case 'checkbox':
        return CheckboxListTile(
          title: Text(field.label),
          subtitle: field.help_text != null && field.help_text!.isNotEmpty
              ? Text(field.help_text!)
              : null,
          value: value ?? false,
          onChanged: (val) => onChanged(val ?? false),
          controlAffinity: ListTileControlAffinity.leading,
        );

      case 'toggle':
        return SwitchListTile(
          title: Text(field.label),
          subtitle: field.help_text != null && field.help_text!.isNotEmpty
              ? Text(field.help_text!)
              : null,
          value: value ?? false,
          onChanged: onChanged,
        );

      // Selection Fields
      case 'dropdown':
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            helperText: field.help_text,
          ),
          value: value,
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
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 8),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            ...?field.options?.map((option) => RadioListTile<String>(
                  title: Text(option),
                  value: option,
                  groupValue: value,
                  onChanged: (val) => onChanged(val),
                  dense: true,
                )),
          ],
        );

      // Date/Time Fields
      case 'date':
        return ListTile(
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('MMM d, yyyy').format(DateTime.parse(value))
                : field.placeholder ?? 'Select date',
          ),
          trailing: const Icon(Icons.calendar_today),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Colors.grey),
          ),
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
                : field.placeholder ?? 'Select time',
          ),
          trailing: const Icon(Icons.access_time),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Colors.grey),
          ),
          onTap: () async {
            final time = await showTimePicker(
              context: context,
              initialTime: TimeOfDay.now(),
            );
            if (time != null) {
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
                : field.placeholder ?? 'Select date & time',
          ),
          trailing: const Icon(Icons.calendar_today),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: Colors.grey),
          ),
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

      // Media Fields
      case 'photo':
      case 'fileupload':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value, height: 200, fit: BoxFit.cover)
            else
              Container(
                height: 150,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    field.type == 'photo' ? 'No photo' : 'No file',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                // Image/File picker implementation would go here
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                        '${field.type == 'photo' ? 'Photo' : 'File'} picker not implemented'),
                  ),
                );
              },
              icon: Icon(field.type == 'photo'
                  ? Icons.camera_alt
                  : Icons.upload_file),
              label: Text(field.type == 'photo' ? 'Take Photo' : 'Upload File'),
            ),
          ],
        );

      case 'signature':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            const SizedBox(height: 8),
            if (value != null)
              Image.network(value, height: 100, fit: BoxFit.contain)
            else
              Container(
                height: 100,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text(
                    'No signature',
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
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

      // Survey/Rating Fields
      case 'starrating':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < (value ?? 0) ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 40,
                  ),
                  onPressed: () => onChanged(index + 1),
                );
              }),
            ),
          ],
        );

      case 'scalerating':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            const SizedBox(height: 8),
            Slider(
              value: (value ?? 5.0).toDouble(),
              min: 1,
              max: 10,
              divisions: 9,
              label: (value ?? 5).toString(),
              onChanged: (val) => onChanged(val.round()),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('1', style: TextStyle(fontSize: 12)),
                Text('10', style: TextStyle(fontSize: 12)),
              ],
            ),
          ],
        );

      // Table (simplified as a text input for now)
      case 'table':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              field.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (field.help_text != null && field.help_text!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  field.help_text!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Table input not fully supported on mobile',
                style: TextStyle(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                  color: Colors.grey,
                ),
              ),
            ),
          ],
        );

      // Default fallback
      default:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            hintText: field.placeholder ?? '',
            border: const OutlineInputBorder(),
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Required' : null
              : null,
          onChanged: onChanged,
        );
    }
  }
}
