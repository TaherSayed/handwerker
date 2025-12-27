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
      id: json['id'],
      name: json['name'],
      description: json['description'],
      category: json['category'],
      tags: List<String>.from(json['tags'] ?? []),
      fields: (json['fields'] as List)
          .map((f) => FormField.fromJson(f))
          .toList(),
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
      id: json['id'] ?? '',
      type: json['type'] ?? 'text', // Default to 'text' if type is missing
      label: json['label'] ?? '',
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

