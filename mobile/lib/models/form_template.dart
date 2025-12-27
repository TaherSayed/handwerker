class FormTemplate {
  final String id;
  final String name;
  final String? description;
  final String? category;
  final List<String> tags;
  final List<FormField> fields;
  final bool isArchived;
  final DateTime createdAt;

  FormTemplate({
    required this.id,
    required this.name,
    this.description,
    this.category,
    this.tags = const [],
    required this.fields,
    this.isArchived = false,
    required this.createdAt,
  });

  factory FormTemplate.fromJson(Map<String, dynamic> json) {
    return FormTemplate(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: json['description']?.toString(),
      category: json['category']?.toString(),
      tags: List<String>.from(json['tags'] ?? []),
      fields: (json['fields'] is List ? (json['fields'] as List) : const [])
          .whereType<Map<String, dynamic>>()
          .map((f) => FormField.fromJson(f))
          .toList(growable: false),
      isArchived: json['is_archived'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class FormField {
  final String id;
  final String type;
  final String label;
  final bool required;
  final List<String>? options;
  final dynamic defaultValue;

  static String _normalizeType(dynamic raw) {
    final t = (raw ?? '').toString().trim().toLowerCase();
    return t.isEmpty ? 'text' : t;
  }

  FormField({
    required this.id,
    required this.type,
    required this.label,
    this.required = false,
    this.options,
    this.defaultValue,
  });

  factory FormField.fromJson(Map<String, dynamic> json) {
    return FormField(
      id: (json['id'] ?? '').toString(),
      type: _normalizeType(json['type']),
      label: (json['label'] ?? '').toString(),
      required: json['required'] ?? false,
      options: json['options'] != null
          ? List<String>.from(json['options'])
          : null,
      defaultValue: json['default_value'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'label': label,
      'required': required,
      'options': options,
      'default_value': defaultValue,
    };
  }
}

