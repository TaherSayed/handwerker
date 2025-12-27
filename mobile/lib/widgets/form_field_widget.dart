import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
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

      case 'photo':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (value != null)
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: value.toString().startsWith('http')
                      ? Image.network(value, fit: BoxFit.cover)
                      : Image.file(File(value), fit: BoxFit.cover),
                ),
              )
            else
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.photo, size: 48, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('No photo selected',
                          style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final picker = ImagePicker();
                      final XFile? image = await picker.pickImage(
                        source: ImageSource.camera,
                        imageQuality: 80,
                      );
                      if (image != null) {
                        onChanged(image.path);
                      }
                    },
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final picker = ImagePicker();
                      final XFile? image = await picker.pickImage(
                        source: ImageSource.gallery,
                        imageQuality: 80,
                      );
                      if (image != null) {
                        onChanged(image.path);
                      }
                    },
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                  ),
                ),
              ],
            ),
          ],
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
