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

      case 'section':
      case 'page':
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: field.type == 'page'
                ? Colors.indigo.withOpacity(0.05)
                : Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
                color: field.type == 'page'
                    ? Colors.indigo[100]!
                    : Colors.grey[300]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                field.label.toUpperCase(),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: field.type == 'page' ? 16 : 14,
                  color: field.type == 'page'
                      ? Colors.indigo[900]
                      : Colors.grey[800],
                ),
              ),
              if (field.help_text != null) ...[
                const SizedBox(height: 4),
                Text(
                  field.help_text!,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ],
          ),
        );

      case 'divider':
        return const Divider(height: 32, thickness: 1);

      case 'starrating':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < (value ?? 0) ? Icons.star : Icons.star_border,
                    color: Colors.amber,
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
            Text(field.label,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Slider(
              value: (value ?? 0).toDouble(),
              min: 0,
              max: 10,
              divisions: 10,
              label: value?.toString(),
              onChanged: (val) => onChanged(val.toInt()),
            ),
          ],
        );

      case 'spinner':
        return Row(
          children: [
            Expanded(
                child: Text(field.label,
                    style: const TextStyle(fontWeight: FontWeight.bold))),
            IconButton(
              icon: const Icon(Icons.remove_circle_outline),
              onPressed: () => onChanged((value ?? 0) - 1),
            ),
            Text((value ?? 0).toString(),
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              onPressed: () => onChanged((value ?? 0) + 1),
            ),
          ],
        );

      default:
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            helperText: field.help_text,
          ),
          initialValue: value?.toString(),
          onChanged: onChanged,
        );
    }
  }
}
