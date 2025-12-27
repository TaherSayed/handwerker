import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
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
        return _PhotoUploadField(
          field: field,
          value: value,
          onChanged: onChanged,
        );

      case 'signature':
        return _SignatureField(
          field: field,
          value: value,
          onChanged: onChanged,
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

// Photo/File Upload Field Widget
class _PhotoUploadField extends StatefulWidget {
  final model.FormField field;
  final dynamic value;
  final ValueChanged<dynamic> onChanged;

  const _PhotoUploadField({
    required this.field,
    required this.value,
    required this.onChanged,
  });

  @override
  State<_PhotoUploadField> createState() => _PhotoUploadFieldState();
}

class _PhotoUploadFieldState extends State<_PhotoUploadField> {
  final ImagePicker _picker = ImagePicker();
  bool _isLoading = false;

  Future<void> _pickImage(ImageSource source) async {
    try {
      setState(() => _isLoading = true);
      
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image != null) {
        // Convert to base64 for storage
        final bytes = await image.readAsBytes();
        final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        widget.onChanged(base64Image);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.field.label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        if (widget.field.help_text != null &&
            widget.field.help_text!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              widget.field.help_text!,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ),
        const SizedBox(height: 8),
        if (widget.value != null && widget.value.toString().isNotEmpty)
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: widget.value.toString().startsWith('data:image')
                    ? Image.memory(
                        base64Decode(
                            widget.value.toString().split(',')[1]),
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      )
                    : Image.network(
                        widget.value.toString(),
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: IconButton(
                  icon: const Icon(Icons.delete, color: Colors.white),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.red,
                  ),
                  onPressed: () => widget.onChanged(null),
                ),
              ),
            ],
          )
        else
          Container(
            height: 150,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                widget.field.type == 'photo' ? 'No photo' : 'No file',
                style: const TextStyle(color: Colors.grey),
              ),
            ),
          ),
        const SizedBox(height: 8),
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _showImageSourceDialog,
          icon: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Icon(widget.field.type == 'photo'
                  ? Icons.camera_alt
                  : Icons.upload_file),
          label: Text(_isLoading
              ? 'Loading...'
              : (widget.field.type == 'photo' ? 'Take Photo' : 'Upload File')),
        ),
      ],
    );
  }
}

// Signature Field Widget
class _SignatureField extends StatefulWidget {
  final model.FormField field;
  final dynamic value;
  final ValueChanged<dynamic> onChanged;

  const _SignatureField({
    required this.field,
    required this.value,
    required this.onChanged,
  });

  @override
  State<_SignatureField> createState() => _SignatureFieldState();
}

class _SignatureFieldState extends State<_SignatureField> {
  List<Offset?> _points = [];
  bool _isSigned = false;

  void _clear() {
    setState(() {
      _points = [];
      _isSigned = false;
    });
    widget.onChanged(null);
  }

  Future<void> _saveSignature() async {
    if (_points.isEmpty) return;

    // Create a simple base64 representation
    // In a real app, you'd convert the canvas to an image
    final signatureData = 'signature_${DateTime.now().millisecondsSinceEpoch}';
    widget.onChanged(signatureData);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signature saved')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.field.label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        if (widget.field.help_text != null &&
            widget.field.help_text!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              widget.field.help_text!,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ),
        const SizedBox(height: 8),
        Container(
          height: 150,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey),
            borderRadius: BorderRadius.circular(8),
            color: Colors.white,
          ),
          child: GestureDetector(
            onPanStart: (details) {
              setState(() {
                _isSigned = true;
                _points.add(details.localPosition);
              });
            },
            onPanUpdate: (details) {
              setState(() {
                _points.add(details.localPosition);
              });
            },
            onPanEnd: (details) {
              setState(() {
                _points.add(null);
              });
              _saveSignature();
            },
            child: CustomPaint(
              painter: _SignaturePainter(_points),
              child: Container(),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _clear,
                icon: const Icon(Icons.clear),
                label: const Text('Clear'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _isSigned ? _saveSignature : null,
                icon: const Icon(Icons.check),
                label: const Text('Save'),
              ),
            ),
          ],
        ),
        if (widget.value != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Signature saved',
                  style: TextStyle(
                    color: Colors.green[700],
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  _SignaturePainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_SignaturePainter oldDelegate) => true;
}
