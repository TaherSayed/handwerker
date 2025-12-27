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
      // === SECTION HEADER ===
      case 'section':
        return Container(
          padding: const EdgeInsets.only(top: 16, bottom: 8),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Colors.grey, width: 2)),
          ),
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
              if (field.defaultValue != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    field.defaultValue.toString(),
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ),
            ],
          ),
        );

      // === TEXT FIELDS ===
      case 'text':
      case 'fullname':
      case 'fillblank':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            hintText: field.type == 'fullname' ? 'Vor- und Nachname' : null,
          ),
          initialValue: value?.toString(),
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: onChanged,
        );

      case 'email':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.email),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.emailAddress,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: onChanged,
        );

      case 'phone':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.phone),
          ),
          initialValue: value?.toString(),
          keyboardType: TextInputType.phone,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: onChanged,
        );

      case 'address':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.location_on),
          ),
          initialValue: value?.toString(),
          maxLines: 2,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: onChanged,
        );

      case 'longtext':
      case 'paragraph':
      case 'notes':
        return TextFormField(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
            alignLabelWithHint: true,
          ),
          initialValue: value?.toString(),
          maxLines: field.type == 'paragraph' ? 6 : 4,
          validator: field.required
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: onChanged,
        );

      // === NUMBER FIELDS ===
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
              ? (val) => val?.isEmpty ?? true ? 'Pflichtfeld' : null
              : null,
          onChanged: (val) => onChanged(double.tryParse(val) ?? val),
        );

      // === CHECKBOX / TOGGLE ===
      case 'checkbox':
        // If options exist, show multiple checkboxes
        if (field.options != null && field.options!.isNotEmpty) {
          final selectedValues = (value is List) ? List<String>.from(value) : <String>[];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
              if (field.required)
                const Text('*', style: TextStyle(color: Colors.red)),
              const SizedBox(height: 8),
              ...field.options!.map((option) {
                return CheckboxListTile(
                  title: Text(option),
                  value: selectedValues.contains(option),
                  onChanged: (checked) {
                    final newValues = List<String>.from(selectedValues);
                    if (checked == true) {
                      newValues.add(option);
                    } else {
                      newValues.remove(option);
                    }
                    onChanged(newValues);
                  },
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                );
              }),
            ],
          );
        }
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

      // === RADIO BUTTONS (Single Choice) ===
      case 'radio':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            ...?field.options?.map((option) {
              return RadioListTile<String>(
                title: Text(option),
                value: option,
                groupValue: value?.toString(),
                onChanged: (val) => onChanged(val),
                contentPadding: EdgeInsets.zero,
              );
            }),
          ],
        );

      // === DROPDOWN ===
      case 'dropdown':
        return DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: field.label,
            border: const OutlineInputBorder(),
          ),
          value: value,
          items: field.options
              ?.map((option) => DropdownMenuItem(
                    value: option,
                    child: Text(option),
                  ))
              .toList(),
          validator:
              field.required ? (val) => val == null ? 'Pflichtfeld' : null : null,
          onChanged: onChanged,
        );

      // === DATE / TIME FIELDS ===
      case 'date':
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('dd.MM.yyyy').format(DateTime.parse(value))
                : 'Datum auswählen',
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
          contentPadding: EdgeInsets.zero,
          title: Text(field.label),
          subtitle: Text(
            value != null ? value.toString() : 'Uhrzeit auswählen',
          ),
          trailing: const Icon(Icons.access_time),
          onTap: () async {
            final time = await showTimePicker(
              context: context,
              initialTime: TimeOfDay.now(),
            );
            if (time != null) {
              onChanged('${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}');
            }
          },
        );

      case 'datetime':
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(field.label),
          subtitle: Text(
            value != null
                ? DateFormat('dd.MM.yyyy HH:mm').format(DateTime.parse(value))
                : 'Datum & Uhrzeit auswählen',
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

      // === PHOTO / FILE UPLOAD ===
      case 'photo':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            if (value != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(value, height: 200, fit: BoxFit.cover),
              )
            else
              Container(
                height: 120,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[50],
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.image, size: 40, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('Kein Bild', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Kamera wird geöffnet...')),
                );
              },
              icon: const Icon(Icons.camera_alt),
              label: const Text('Foto aufnehmen'),
            ),
          ],
        );

      case 'fileupload':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              height: 120,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[50],
              ),
              child: Center(
                child: value != null
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green),
                          const SizedBox(width: 8),
                          Text('Datei hochgeladen', style: TextStyle(color: Colors.grey[700])),
                        ],
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.upload_file, size: 40, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('Datei hochladen', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Datei-Auswahl wird geöffnet...')),
                );
              },
              icon: const Icon(Icons.attach_file),
              label: const Text('Datei auswählen'),
            ),
          ],
        );

      // === SIGNATURE ===
      case 'signature':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            if (value != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(value, height: 100, fit: BoxFit.contain),
              )
            else
              Container(
                height: 120,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[50],
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.draw, size: 40, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('Unterschrift hier', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Unterschrift-Pad wird geöffnet...')),
                );
              },
              icon: const Icon(Icons.edit),
              label: const Text('Unterschreiben'),
            ),
          ],
        );

      // === SURVEY ELEMENTS ===
      case 'starrating':
        final rating = (value is int) ? value : 0;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 32,
                  ),
                  onPressed: () => onChanged(index + 1),
                );
              }),
            ),
          ],
        );

      case 'scalerating':
        final scaleValue = (value is int) ? value : 5;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Text('1'),
                Expanded(
                  child: Slider(
                    value: scaleValue.toDouble(),
                    min: 1,
                    max: 10,
                    divisions: 9,
                    label: scaleValue.toString(),
                    onChanged: (val) => onChanged(val.round()),
                  ),
                ),
                const Text('10'),
              ],
            ),
          ],
        );

      case 'table':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(field.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (field.required)
                  const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    color: Colors.grey[100],
                    child: const Row(
                      children: [
                        Expanded(child: Text('Spalte 1', style: TextStyle(fontWeight: FontWeight.bold))),
                        Expanded(child: Text('Spalte 2', style: TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            decoration: const InputDecoration(
                              hintText: 'Eingabe...',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            decoration: const InputDecoration(
                              hintText: 'Eingabe...',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );

      // === PAGE ELEMENTS ===
      case 'divider':
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Divider(thickness: 2),
        );

      // === DEFAULT FALLBACK ===
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
