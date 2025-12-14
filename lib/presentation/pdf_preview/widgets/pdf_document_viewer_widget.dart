import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../../core/app_export.dart';
import '../../../widgets/custom_image_widget.dart';

/// PDF Document Viewer Widget - Displays PDF with zoom and scroll
///
/// Features:
/// - Platform-specific PDF rendering
/// - Pinch-to-zoom functionality
/// - Scroll navigation
/// - Professional document layout preview
class PdfDocumentViewerWidget extends StatefulWidget {
  final String pdfPath;
  final Map<String, dynamic> visitData;
  final Function(int page, int total)? onPageChanged;

  const PdfDocumentViewerWidget({
    super.key,
    required this.pdfPath,
    required this.visitData,
    this.onPageChanged,
  });

  @override
  State<PdfDocumentViewerWidget> createState() =>
      _PdfDocumentViewerWidgetState();
}

class _PdfDocumentViewerWidgetState extends State<PdfDocumentViewerWidget> {
  final TransformationController _transformationController =
      TransformationController();

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.05),
      child: InteractiveViewer(
        transformationController: _transformationController,
        minScale: 0.5,
        maxScale: 4.0,
        child: Center(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 90.w,
            ),
            child: _buildPdfPreview(),
          ),
        ),
      ),
    );
  }

  Widget _buildPdfPreview() {
    final theme = Theme.of(context);

    // Mock PDF preview - In production, use flutter_pdfview or pdf package
    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 2.h),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            _buildPdfPage1(),
            SizedBox(height: 2.h),
            _buildPdfPage2(),
          ],
        ),
      ),
    );
  }

  Widget _buildPdfPage1() {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(6.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with logo
          Row(
            children: [
              Container(
                width: 15.w,
                height: 15.w,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: theme.colorScheme.outline.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: CustomImageWidget(
                  imageUrl: widget.visitData["companyLogo"] as String,
                  width: 15.w,
                  height: 15.w,
                  fit: BoxFit.cover,
                  semanticLabel:
                      "Company logo for ${widget.visitData["companyName"]}",
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.visitData["companyName"] as String,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      'Visit Report',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),

          // Visit details
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                _buildDetailRow(
                    'Visit ID', widget.visitData["visitId"] as String),
                SizedBox(height: 1.h),
                _buildDetailRow(
                    'Date', widget.visitData["visitDate"] as String),
              ],
            ),
          ),
          SizedBox(height: 3.h),

          // Customer information
          Text(
            'Customer Information',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 1.5.h),
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              border: Border.all(
                color: theme.colorScheme.outline.withValues(alpha: 0.2),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                _buildDetailRow('Name',
                    (widget.visitData["customer"] as Map)["name"] as String),
                SizedBox(height: 1.h),
                _buildDetailRow('Email',
                    (widget.visitData["customer"] as Map)["email"] as String),
                SizedBox(height: 1.h),
                _buildDetailRow('Phone',
                    (widget.visitData["customer"] as Map)["phone"] as String),
                SizedBox(height: 1.h),
                _buildDetailRow('Address',
                    (widget.visitData["customer"] as Map)["address"] as String),
              ],
            ),
          ),
          SizedBox(height: 3.h),

          // Form data
          Text(
            'Visit Details',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 1.5.h),
          ...(widget.visitData["formData"] as List)
              .take(4)
              .map((field) => Padding(
                    padding: EdgeInsets.only(bottom: 1.5.h),
                    child: _buildFormField(
                      (field as Map<String, dynamic>)["label"] as String,
                      field["value"] as String,
                    ),
                  )),
        ],
      ),
    );
  }

  Widget _buildPdfPage2() {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(6.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Remaining form data
          ...(widget.visitData["formData"] as List)
              .skip(4)
              .map((field) => Padding(
                    padding: EdgeInsets.only(bottom: 1.5.h),
                    child: _buildFormField(
                      (field as Map<String, dynamic>)["label"] as String,
                      field["value"] as String,
                    ),
                  )),
          SizedBox(height: 3.h),

          // Signature section
          if (widget.visitData["hasSignature"] == true) ...[
            Text(
              'Customer Signature',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 1.5.h),
            Container(
              width: double.infinity,
              height: 20.h,
              decoration: BoxDecoration(
                border: Border.all(
                  color: theme.colorScheme.outline.withValues(alpha: 0.2),
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  'Signature',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant
                        .withValues(alpha: 0.3),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Signed on ${widget.visitData["visitDate"]}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          SizedBox(height: 4.h),

          // Footer
          Divider(color: theme.colorScheme.outline.withValues(alpha: 0.2)),
          SizedBox(height: 2.h),
          Center(
            child: Text(
              'Generated by ${widget.visitData["companyName"]} - Page 2 of 2',
              style: theme.textTheme.bodySmall?.copyWith(
                color:
                    theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 25.w,
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFormField(String label, String value) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.2),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 0.5.h),
          Text(
            value,
            style: theme.textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
