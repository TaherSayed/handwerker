import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sizer/sizer.dart';
import 'package:universal_html/html.dart' as html;

import '../../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_icon_widget.dart';
import './widgets/pdf_action_toolbar_widget.dart';
import './widgets/pdf_document_viewer_widget.dart';
import './widgets/pdf_page_indicator_widget.dart';

/// PDF Preview Screen - Displays generated visit reports before sharing
///
/// Features:
/// - Native PDF viewing with zoom and scroll
/// - Platform-specific sharing (email, WhatsApp, file export)
/// - Edit and regenerate capabilities
/// - Offline PDF caching
/// - Professional document layout
class PdfPreview extends StatefulWidget {
  const PdfPreview({super.key});

  @override
  State<PdfPreview> createState() => _PdfPreviewState();
}

class _PdfPreviewState extends State<PdfPreview> {
  bool _isLoading = true;
  bool _isOffline = false;
  String? _errorMessage;
  String? _pdfPath;
  int _currentPage = 1;
  int _totalPages = 1;

  // Mock visit data - would come from navigation arguments in production
  final Map<String, dynamic> _visitData = {
    "visitId": "VST-2025-001",
    "visitDate": "December 13, 2025",
    "companyName": "ProService Solutions",
    "companyLogo":
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
    "customer": {
      "name": "Michael Rodriguez",
      "email": "michael.rodriguez@email.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Oak Street, Springfield, IL 62701"
    },
    "formData": [
      {"label": "Service Type", "value": "HVAC Maintenance"},
      {"label": "Equipment Model", "value": "Carrier 58MVC080"},
      {"label": "Hours Worked", "value": "2.5 hours"},
      {"label": "Parts Replaced", "value": "Air filter, Thermostat battery"},
      {"label": "System Status", "value": "Operational - Good condition"},
      {"label": "Next Service Due", "value": "June 2026"},
      {
        "label": "Technician Notes",
        "value":
            "System running efficiently. Recommended annual maintenance schedule."
      }
    ],
    "hasSignature": true
  };

  @override
  void initState() {
    super.initState();
    _generatePdf();
  }

  Future<void> _generatePdf() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Simulate PDF generation delay
      await Future.delayed(const Duration(seconds: 2));

      // In production, this would call actual PDF generation service
      // For now, simulate successful generation
      setState(() {
        _pdfPath = kIsWeb
            ? 'web_pdf_preview'
            : '/storage/visit_report_${_visitData["visitId"]}.pdf';
        _totalPages = 2; // Mock page count
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to generate PDF. Please try again.';
        _isLoading = false;
      });
    }
  }

  Future<void> _sharePdf() async {
    if (_pdfPath == null) return;

    try {
      if (kIsWeb) {
        // Web: Trigger download
        final blob =
            html.Blob(['PDF content would be here'], 'application/pdf');
        final url = html.Url.createObjectUrlFromBlob(blob);
        html.AnchorElement(href: url)
          ..setAttribute(
              "download", "visit_report_${_visitData["visitId"]}.pdf")
          ..click();
        html.Url.revokeObjectUrl(url);

        _showSuccessMessage('PDF downloaded successfully');
      } else {
        // Mobile: Use share sheet
        // ignore: deprecated_member_use
        await Share.shareXFiles(
          [XFile(_pdfPath!)],
          subject: 'Visit Report - ${_visitData["visitId"]}',
          text:
              'Please find attached the visit report for ${_visitData["customer"]["name"]}',
        );
      }
    } catch (e) {
      _showErrorMessage('Failed to share PDF. Please try again.');
    }
  }

  Future<void> _shareViaEmail() async {
    if (_pdfPath == null) return;

    try {
      final customerEmail = _visitData["customer"]["email"] as String;
      final subject =
          Uri.encodeComponent('Visit Report - ${_visitData["visitId"]}');
      final body =
          Uri.encodeComponent('Dear ${_visitData["customer"]["name"]},\n\n'
              'Please find attached your visit report.\n\n'
              'Visit Date: ${_visitData["visitDate"]}\n'
              'Visit ID: ${_visitData["visitId"]}\n\n'
              'Best regards,\n${_visitData["companyName"]}');

      if (kIsWeb) {
        html.window.open(
            'mailto:$customerEmail?subject=$subject&body=$body', '_blank');
      } else {
        // ignore: deprecated_member_use
        await Share.shareXFiles(
          [XFile(_pdfPath!)],
          subject: 'Visit Report - ${_visitData["visitId"]}',
          text: 'Visit report for ${_visitData["customer"]["name"]}',
        );
      }

      _showSuccessMessage('Email client opened');
    } catch (e) {
      _showErrorMessage('Failed to open email client');
    }
  }

  Future<void> _shareViaWhatsApp() async {
    if (_pdfPath == null) return;

    try {
      if (kIsWeb) {
        final phone = _visitData["customer"]["phone"]
            .toString()
            .replaceAll(RegExp(r'[^\d]'), '');
        final message =
            Uri.encodeComponent('Visit Report - ${_visitData["visitId"]}');
        html.window.open('https://wa.me/$phone?text=$message', '_blank');
      } else {
        // ignore: deprecated_member_use
        await Share.shareXFiles(
          [XFile(_pdfPath!)],
          subject: 'Visit Report - ${_visitData["visitId"]}',
        );
      }

      _showSuccessMessage('WhatsApp opened');
    } catch (e) {
      _showErrorMessage('Failed to open WhatsApp');
    }
  }

  void _editVisit() {
    Navigator.pop(context);
    Navigator.pushNamed(context, '/visit-form-filling');
  }

  void _showShareOptions() {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 12.w,
                height: 0.5.h,
                decoration: BoxDecoration(
                  color:
                      theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                'Share Report',
                style: theme.textTheme.titleLarge,
              ),
              SizedBox(height: 3.h),
              _buildShareOption(
                icon: 'email',
                label: 'Email',
                onTap: () {
                  Navigator.pop(context);
                  _shareViaEmail();
                },
              ),
              SizedBox(height: 1.h),
              _buildShareOption(
                icon: 'chat',
                label: 'WhatsApp',
                onTap: () {
                  Navigator.pop(context);
                  _shareViaWhatsApp();
                },
              ),
              SizedBox(height: 1.h),
              _buildShareOption(
                icon: 'file_download',
                label: 'Save to Device',
                onTap: () {
                  Navigator.pop(context);
                  _sharePdf();
                },
              ),
              SizedBox(height: 2.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShareOption({
    required String icon,
    required String label,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        decoration: BoxDecoration(
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.3),
            width: 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 12.w,
              height: 12.w,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: CustomIconWidget(
                  iconName: icon,
                  color: theme.colorScheme.primary,
                  size: 24,
                ),
              ),
            ),
            SizedBox(width: 4.w),
            Text(
              label,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            CustomIconWidget(
              iconName: 'chevron_right',
              color: theme.colorScheme.onSurfaceVariant,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _showSuccessMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.tertiary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Visit Report',
        actions: [
          if (_pdfPath != null)
            CustomAppBarAction(
              icon: Icons.share,
              onPressed: _showShareOptions,
              tooltip: 'Share Report',
            ),
          CustomAppBarAction(
            icon: Icons.edit,
            onPressed: _editVisit,
            tooltip: 'Edit Visit',
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoadingState()
          : _errorMessage != null
              ? _buildErrorState()
              : _buildPdfPreview(),
    );
  }

  Widget _buildLoadingState() {
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 15.w,
            height: 15.w,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: theme.colorScheme.primary,
            ),
          ),
          SizedBox(height: 3.h),
          Text(
            'Generating PDF...',
            style: theme.textTheme.titleMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            'Please wait while we create your report',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 20.w,
              height: 20.w,
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: CustomIconWidget(
                  iconName: 'error_outline',
                  color: theme.colorScheme.error,
                  size: 40,
                ),
              ),
            ),
            SizedBox(height: 3.h),
            Text(
              'Generation Failed',
              style: theme.textTheme.titleLarge?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              _errorMessage ?? 'An error occurred',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _generatePdf,
                child: const Text('Erneut versuchen'),
              ),
            ),
            SizedBox(height: 2.h),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Zurück'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPdfPreview() {
    return Column(
      children: [
        if (_isOffline) _buildOfflineIndicator(),
        Expanded(
          child: PdfDocumentViewerWidget(
            pdfPath: _pdfPath!,
            visitData: _visitData,
            onPageChanged: (page, total) {
              setState(() {
                _currentPage = page;
                _totalPages = total;
              });
            },
          ),
        ),
        PdfPageIndicatorWidget(
          currentPage: _currentPage,
          totalPages: _totalPages,
        ),
        PdfActionToolbarWidget(
          onShare: _showShareOptions,
          onEdit: _editVisit,
          onRegenerate: _generatePdf,
        ),
      ],
    );
  }

  Widget _buildOfflineIndicator() {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      color: theme.colorScheme.error.withValues(alpha: 0.1),
      child: Row(
        children: [
          CustomIconWidget(
            iconName: 'cloud_off',
            color: theme.colorScheme.error,
            size: 16,
          ),
          SizedBox(width: 2.w),
          Expanded(
            child: Text(
              'Viewing cached PDF - Changes will sync when online',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
