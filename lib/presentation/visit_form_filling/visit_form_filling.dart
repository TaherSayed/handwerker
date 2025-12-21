import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_icon_widget.dart';
import './widgets/form_field_widget.dart';
import './widgets/photo_attachment_widget.dart';
import './widgets/progress_indicator_widget.dart';
import './widgets/signature_capture_widget.dart';

/// Visit Form Filling Screen - Offline form completion during customer visits
///
/// Features:
/// - Auto-save every 30 seconds and after field completion
/// - Step-back navigation without data loss
/// - Offline-first architecture
/// - Dynamic form field rendering
/// - Signature and photo capture
/// - Progress tracking
class VisitFormFilling extends StatefulWidget {
  const VisitFormFilling({super.key});

  @override
  State<VisitFormFilling> createState() => _VisitFormFillingState();
}

class _VisitFormFillingState extends State<VisitFormFilling>
    with TickerProviderStateMixin {
  // Form state management
  final Map<String, dynamic> _formData = {};
  final ScrollController _scrollController = ScrollController();
  final FocusNode _currentFocusNode = FocusNode();

  // Auto-save state
  bool _isSaving = false;
  DateTime _lastSaveTime = DateTime.now();
  String _saveStatus = 'All changes saved';

  // Form configuration
  late List<Map<String, dynamic>> _formFields;
  late String _customerName;
  late String _formTemplateName;
  int _completedFields = 0;

  // Signature and photo state
  bool _showSignatureCapture = false;
  List<String> _attachedPhotos = [];

  @override
  void initState() {
    super.initState();
    _initializeForm();
    _startAutoSave();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _currentFocusNode.dispose();
    super.dispose();
  }

  void _initializeForm() {
    // Mock customer and form data - would come from navigation arguments
    _customerName = 'John Anderson';
    _formTemplateName = 'Site Inspection Report';

    // Mock form fields configuration
    _formFields = [
      {
        'id': 'inspection_date',
        'type': 'date',
        'label': 'Inspection Date',
        'value': DateTime.now(),
      },
      {
        'id': 'site_location',
        'type': 'text',
        'label': 'Site Location',
        'value': '',
        'placeholder': 'Enter site address',
      },
      {
        'id': 'inspection_type',
        'type': 'dropdown',
        'label': 'Inspection Type',
        'value': '',
        'options': [
          'Initial Assessment',
          'Follow-up',
          'Final Inspection',
          'Emergency'
        ],
      },
      {
        'id': 'site_accessible',
        'type': 'toggle',
        'label': 'Site Accessible',
        'value': true,
      },
      {
        'id': 'safety_equipment',
        'type': 'checkbox',
        'label': 'Safety Equipment Required',
        'value': false,
      },
      {
        'id': 'temperature',
        'type': 'number',
        'label': 'Temperature (°F)',
        'value': '',
        'placeholder': 'Enter temperature',
      },
      {
        'id': 'weather_conditions',
        'type': 'dropdown',
        'label': 'Weather Conditions',
        'value': '',
        'options': ['Clear', 'Cloudy', 'Rainy', 'Snowy', 'Windy'],
      },
      {
        'id': 'inspection_notes',
        'type': 'notes',
        'label': 'Inspection Notes',
        'value': '',
        'placeholder': 'Enter detailed inspection notes...',
        'maxLength': 500,
      },
      {
        'id': 'issues_found',
        'type': 'checkbox',
        'label': 'Issues Found',
        'value': false,
      },
      {
        'id': 'issue_description',
        'type': 'notes',
        'label': 'Issue Description',
        'value': '',
        'placeholder': 'Describe any issues found...',
        'maxLength': 300,
      },
      {
        'id': 'follow_up_required',
        'type': 'toggle',
        'label': 'Follow-up Required',
        'value': false,
      },
      {
        'id': 'estimated_completion',
        'type': 'date',
        'label': 'Estimated Completion Date',
        'value': null,
      },
    ];

    _calculateProgress();
  }

  void _startAutoSave() {
    // Auto-save every 30 seconds
    Future.delayed(const Duration(seconds: 30), () {
      if (mounted) {
        _autoSaveForm();
        _startAutoSave();
      }
    });
  }

  Future<void> _autoSaveForm() async {
    if (_isSaving) return;

    setState(() {
      _isSaving = true;
      _saveStatus = 'Saving...';
    });

    // Simulate save operation - would save to local database
    await Future.delayed(const Duration(milliseconds: 500));

    if (mounted) {
      setState(() {
        _isSaving = false;
        _lastSaveTime = DateTime.now();
        _saveStatus = 'All changes saved';
      });
    }
  }

  void _calculateProgress() {
    int completed = 0;
    int total = _formFields.length;

    for (var field in _formFields) {
      final value = _formData[field['id']] ?? field['value'];
      if (value != null && value.toString().trim().isNotEmpty) {
        completed++;
      }
    }

    setState(() {
      _completedFields = total > 0 ? ((completed / total) * 100).round() : 0;
    });
  }

  void _onFieldChanged(String fieldId, dynamic value) {
    setState(() {
      _formData[fieldId] = value;
    });

    _calculateProgress();
    _autoSaveForm();
  }

  void _completeVisit() {

    // Navigate to PDF preview
    Navigator.pushNamed(
      context,
      '/pdf-preview',
      arguments: {
        'customerName': _customerName,
        'formTemplate': _formTemplateName,
        'formData': _formData,
        'signature': _formData['signature'],
        'photos': _attachedPhotos,
      },
    );
  }

  void _showSignatureDialog() {
    setState(() {
      _showSignatureCapture = true;
    });
  }

  void _onSignatureSaved(String signatureData) {
    setState(() {
      _formData['signature'] = signatureData;
      _showSignatureCapture = false;
    });
    _autoSaveForm();
  }

  void _addPhoto(String photoPath) {
    setState(() {
      _attachedPhotos.add(photoPath);
    });
    _autoSaveForm();
  }

  void _removePhoto(int index) {
    setState(() {
      _attachedPhotos.removeAt(index);
    });
    _autoSaveForm();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: _formTemplateName,
        style: CustomAppBarStyle.standard,
        actions: [
          CustomAppBarAction(
            icon: Icons.info_outline,
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text('Form Information',
                      style: theme.textTheme.titleLarge),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Customer: $_customerName',
                          style: theme.textTheme.bodyMedium),
                      const SizedBox(height: 8),
                      Text('Template: $_formTemplateName',
                          style: theme.textTheme.bodyMedium),
                      const SizedBox(height: 8),
                      Text(
                          'Last saved: ${_lastSaveTime.hour}:${_lastSaveTime.minute.toString().padLeft(2, '0')}',
                          style: theme.textTheme.bodySmall),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              );
            },
            tooltip: 'Form Information',
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Customer header and progress
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  border: Border(
                    bottom: BorderSide(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 12.w,
                          height: 12.w,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary
                                .withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: CustomIconWidget(
                              iconName: 'person',
                              color: theme.colorScheme.primary,
                              size: 6.w,
                            ),
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _customerName,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: 0.5.h),
                              Row(
                                children: [
                                  CustomIconWidget(
                                    iconName:
                                        _isSaving ? 'sync' : 'check_circle',
                                    color: _isSaving
                                        ? theme.colorScheme.primary
                                        : theme.colorScheme.tertiary,
                                    size: 3.5.w,
                                  ),
                                  SizedBox(width: 1.w),
                                  Text(
                                    _saveStatus,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 2.h),
                    ProgressIndicatorWidget(
                      progress: _completedFields / 100,
                      completedFields: _completedFields,
                    ),
                  ],
                ),
              ),

              // Form fields
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                  itemCount:
                      _formFields.length + 2, // +2 for signature and photos
                  itemBuilder: (context, index) {
                    if (index < _formFields.length) {
                      final field = _formFields[index];
                      return Padding(
                        padding: EdgeInsets.only(bottom: 2.h),
                        child: FormFieldWidget(
                          field: field,
                          value: _formData[field['id']] ?? field['value'],
                          hasError: false,
                          onChanged: (value) =>
                              _onFieldChanged(field['id'], value),
                        ),
                      );
                    } else if (index == _formFields.length) {
                      // Signature field
                      return Padding(
                        padding: EdgeInsets.only(bottom: 2.h),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Signature',
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                SizedBox(width: 1.w),
                                Text(
                                  '(Optional)',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 1.h),
                            if (_formData['signature'] != null)
                              Container(
                                width: double.infinity,
                                height: 20.h,
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.surface,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: theme.colorScheme.outline
                                        .withValues(alpha: 0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    Center(
                                      child: CustomIconWidget(
                                        iconName: 'draw',
                                        color: theme.colorScheme.primary,
                                        size: 12.w,
                                      ),
                                    ),
                                    Positioned(
                                      top: 1.h,
                                      right: 2.w,
                                      child: IconButton(
                                        icon: CustomIconWidget(
                                          iconName: 'close',
                                          color: theme.colorScheme.error,
                                          size: 5.w,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _formData.remove('signature');
                                          });
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else
                              InkWell(
                                onTap: _showSignatureDialog,
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  width: double.infinity,
                                  height: 20.h,
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.surface,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: theme.colorScheme.outline
                                          .withValues(alpha: 0.3),
                                      width: 1,
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      CustomIconWidget(
                                        iconName: 'draw',
                                        color: theme.colorScheme.primary,
                                        size: 8.w,
                                      ),
                                      SizedBox(height: 1.h),
                                      Text(
                                        'Tap to add signature',
                                        style: theme.textTheme.bodyMedium
                                            ?.copyWith(
                                          color: theme.colorScheme.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    } else {
                      // Photo attachments
                      return Padding(
                        padding: EdgeInsets.only(bottom: 2.h),
                        child: PhotoAttachmentWidget(
                          photos: _attachedPhotos,
                          onAddPhoto: _addPhoto,
                          onRemovePhoto: _removePhoto,
                        ),
                      );
                    }
                  },
                ),
              ),

              // Complete visit button
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  border: Border(
                    top: BorderSide(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: theme.colorScheme.shadow,
                      blurRadius: 8,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: ElevatedButton(
                    onPressed: _completedFields >= 100 ? _completeVisit : null,
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 6.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Complete Visit',
                          style: theme.textTheme.titleSmall?.copyWith(
                            color: _completedFields >= 100
                                ? theme.colorScheme.onPrimary
                                : theme.colorScheme.onSurface
                                    .withValues(alpha: 0.38),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(width: 2.w),
                        CustomIconWidget(
                          iconName: 'arrow_forward',
                          color: _completedFields >= 100
                              ? theme.colorScheme.onPrimary
                              : theme.colorScheme.onSurface
                                  .withValues(alpha: 0.38),
                          size: 5.w,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Signature capture overlay
          if (_showSignatureCapture)
            SignatureCaptureWidget(
              onSave: _onSignatureSaved,
              onCancel: () {
                setState(() {
                  _showSignatureCapture = false;
                });
              },
            ),
        ],
      ),
    );
  }
}
