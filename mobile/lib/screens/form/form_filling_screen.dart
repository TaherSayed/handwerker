import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../../models/form_template.dart';
import '../../models/submission.dart';
import '../../providers/submissions_provider.dart';
import '../../widgets/form_field_widget.dart';

class FormFillingScreen extends StatefulWidget {
  final FormTemplate template;
  final Submission? draft;

  const FormFillingScreen({
    super.key,
    required this.template,
    this.draft,
  });

  @override
  State<FormFillingScreen> createState() => _FormFillingScreenState();
}

class _FormFillingScreenState extends State<FormFillingScreen> {
  late Submission _submission;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _submission = widget.draft ??
        Submission(
          id: const Uuid().v4(),
          templateId: widget.template.id,
          fieldValues: {},
          createdAt: DateTime.now(),
        );
  }

  Future<void> _saveDraft() async {
    try {
      await context.read<SubmissionsProvider>().saveDraft(_submission);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Draft saved')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save draft: $e')),
        );
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill required fields')),
      );
      return;
    }

    try {
      final submittedSubmission = _submission.copyWith(
        status: 'submitted',
      );
      await context.read<SubmissionsProvider>().submitSubmission(submittedSubmission);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Submitted successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.template.name),
        actions: [
          TextButton(
            onPressed: _saveDraft,
            child: const Text('Save Draft'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Customer Info
            const Text(
              'Customer Information',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Customer Name'),
              initialValue: _submission.customerName,
              onChanged: (value) {
                setState(() {
                  _submission = _submission.copyWith(customerName: value);
                });
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Email'),
              initialValue: _submission.customerEmail,
              keyboardType: TextInputType.emailAddress,
              onChanged: (value) {
                setState(() {
                  _submission = _submission.copyWith(customerEmail: value);
                });
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Phone'),
              initialValue: _submission.customerPhone,
              keyboardType: TextInputType.phone,
              onChanged: (value) {
                setState(() {
                  _submission = _submission.copyWith(customerPhone: value);
                });
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Address'),
              initialValue: _submission.customerAddress,
              maxLines: 2,
              onChanged: (value) {
                setState(() {
                  _submission = _submission.copyWith(customerAddress: value);
                });
              },
            ),
            const SizedBox(height: 24),

            // Form Fields
            if (widget.template.fields.isNotEmpty) ...[
              const Text(
                'Form Fields',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
            ],
            ...widget.template.fields.map((field) {
              // Sections and dividers don't need values stored
              final isVisualElement = field.type == 'section' || field.type == 'divider';
              
              return Padding(
                padding: EdgeInsets.only(
                  bottom: isVisualElement ? 8 : 16,
                ),
                child: FormFieldWidget(
                  field: field,
                  value: isVisualElement ? null : _submission.fieldValues[field.id],
                  onChanged: isVisualElement
                      ? (_) {} // No-op for visual elements
                      : (value) {
                          setState(() {
                            final newValues = Map<String, dynamic>.from(_submission.fieldValues);
                            newValues[field.id] = value;
                            _submission = _submission.copyWith(fieldValues: newValues);
                          });
                        },
                ),
              );
            }).toList(),

            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              child: const Text('Submit Form'),
            ),
          ],
        ),
      ),
    );
  }
}

