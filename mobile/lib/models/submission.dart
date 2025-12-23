class Submission {
  final String id;
  final String templateId;
  final String? customerName;
  final String? customerEmail;
  final String? customerPhone;
  final String? customerAddress;
  final String? customerContactId;
  final Map<String, dynamic> fieldValues;
  final String? signatureUrl;
  final String? pdfUrl;
  final String status;
  final bool isOffline;
  final DateTime? submittedAt;
  final DateTime createdAt;

  Submission({
    required this.id,
    required this.templateId,
    this.customerName,
    this.customerEmail,
    this.customerPhone,
    this.customerAddress,
    this.customerContactId,
    required this.fieldValues,
    this.signatureUrl,
    this.pdfUrl,
    this.status = 'draft',
    this.isOffline = false,
    this.submittedAt,
    required this.createdAt,
  });

  factory Submission.fromJson(Map<String, dynamic> json) {
    return Submission(
      id: json['id'],
      templateId: json['template_id'],
      customerName: json['customer_name'],
      customerEmail: json['customer_email'],
      customerPhone: json['customer_phone'],
      customerAddress: json['customer_address'],
      customerContactId: json['customer_contact_id'],
      fieldValues: Map<String, dynamic>.from(json['field_values'] ?? {}),
      signatureUrl: json['signature_url'],
      pdfUrl: json['pdf_url'],
      status: json['status'] ?? 'draft',
      isOffline: json['is_offline'] ?? false,
      submittedAt: json['submitted_at'] != null
          ? DateTime.parse(json['submitted_at'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'template_id': templateId,
      'customer_name': customerName,
      'customer_email': customerEmail,
      'customer_phone': customerPhone,
      'customer_address': customerAddress,
      'customer_contact_id': customerContactId,
      'field_values': fieldValues,
      'signature_url': signatureUrl,
      'pdf_url': pdfUrl,
      'status': status,
      'is_offline': isOffline,
      'submitted_at': submittedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  Submission copyWith({
    String? customerName,
    String? customerEmail,
    String? customerPhone,
    String? customerAddress,
    Map<String, dynamic>? fieldValues,
    String? signatureUrl,
    String? status,
  }) {
    return Submission(
      id: id,
      templateId: templateId,
      customerName: customerName ?? this.customerName,
      customerEmail: customerEmail ?? this.customerEmail,
      customerPhone: customerPhone ?? this.customerPhone,
      customerAddress: customerAddress ?? this.customerAddress,
      customerContactId: customerContactId,
      fieldValues: fieldValues ?? this.fieldValues,
      signatureUrl: signatureUrl ?? this.signatureUrl,
      pdfUrl: pdfUrl,
      status: status ?? this.status,
      isOffline: isOffline,
      submittedAt: submittedAt,
      createdAt: createdAt,
    );
  }
}

