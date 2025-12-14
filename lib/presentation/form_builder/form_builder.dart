import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../widgets/custom_app_bar.dart';
import '../../services/database_service.dart';
import '../../services/supabase_service.dart';
import './widgets/field_settings_panel_widget.dart';
import './widgets/form_field_card_widget.dart';
import './widgets/add_field_bottom_sheet_widget.dart';

/// Formular-Builder-Bildschirm für die Erstellung und Verwaltung von Formularvorlagen
///
/// Funktionen:
/// - Drag-and-Drop-Feldsortierung
/// - Mehrere Feldtypen (Text, Nummer, Kontrollkästchen, etc.)
/// - Feldvalidierung und Einstellungen
/// - Vorlagenspeicherung und -aktualisierung
/// - Echtzeit-Vorschau
class FormBuilder extends StatefulWidget {
  const FormBuilder({super.key});

  @override
  State<FormBuilder> createState() => _FormBuilderState();
}

class _FormBuilderState extends State<FormBuilder> {
  final TextEditingController _templateNameController = TextEditingController();
  final List<Map<String, dynamic>> _formFields = [];
  int? _selectedFieldIndex;
  bool _isSaving = false;

  @override
  void dispose() {
    _templateNameController.dispose();
    super.dispose();
  }

  /// Feld zur Formularliste hinzufügen
  void _addField(String fieldType) {
    setState(() {
      _formFields.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'type': fieldType,
        'label': _getDefaultLabel(fieldType),
        'required': false,
        'placeholder': '',
        'options': fieldType == 'dropdown' || fieldType == 'checkbox'
            ? ['Option 1', 'Option 2']
            : [],
        'validation': {},
      });
      _selectedFieldIndex = _formFields.length - 1;
    });
    Navigator.pop(context);
  }

  /// Standardbeschriftung für Feldtyp abrufen
  String _getDefaultLabel(String fieldType) {
    switch (fieldType) {
      case 'text':
        return 'Textfeld';
      case 'number':
        return 'Zahlenfeld';
      case 'checkbox':
        return 'Kontrollkästchen';
      case 'toggle':
        return 'Umschalter';
      case 'dropdown':
        return 'Dropdown';
      case 'date':
        return 'Datum';
      case 'time':
        return 'Zeit';
      case 'notes':
        return 'Notizen';
      default:
        return 'Neues Feld';
    }
  }

  /// Feldposition aktualisieren
  void _reorderFields(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }
      final field = _formFields.removeAt(oldIndex);
      _formFields.insert(newIndex, field);

      if (_selectedFieldIndex == oldIndex) {
        _selectedFieldIndex = newIndex;
      } else if (_selectedFieldIndex != null) {
        if (oldIndex < _selectedFieldIndex! &&
            newIndex >= _selectedFieldIndex!) {
          _selectedFieldIndex = _selectedFieldIndex! - 1;
        } else if (oldIndex > _selectedFieldIndex! &&
            newIndex <= _selectedFieldIndex!) {
          _selectedFieldIndex = _selectedFieldIndex! + 1;
        }
      }
    });
  }

  /// Feld löschen
  void _deleteField(int index) {
    setState(() {
      _formFields.removeAt(index);
      if (_selectedFieldIndex == index) {
        _selectedFieldIndex = null;
      } else if (_selectedFieldIndex != null && _selectedFieldIndex! > index) {
        _selectedFieldIndex = _selectedFieldIndex! - 1;
      }
    });
  }

  /// Formularvorlage speichern
  Future<void> _saveTemplate() async {
    if (_templateNameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bitte geben Sie einen Vorlagennamen ein'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_formFields.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bitte fügen Sie mindestens ein Feld hinzu'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Check Supabase configuration
    if (!SupabaseService.isConfigured) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Supabase ist nicht konfiguriert. Bitte starten Sie die App mit --dart-define-from-file=env.json'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 5),
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final dbService = DatabaseService.instance;
      
      // Prepare fields data - ensure all required fields are present
      final fieldsData = _formFields.map((field) {
        return {
          'id': field['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
          'type': field['type'] ?? 'text',
          'label': field['label'] ?? 'Unbenanntes Feld',
          'required': field['required'] ?? false,
          'placeholder': field['placeholder'] ?? '',
          'helpText': field['helpText'],
          'options': field['options'] ?? [],
          'validation': field['validation'] ?? {},
        };
      }).toList();

      // Save to Supabase
      await dbService.createFormTemplate(
        _templateNameController.text.trim(),
        null, // description - can be added later
        fieldsData,
      );

      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vorlage erfolgreich gespeichert'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      debugPrint('Fehler beim Speichern der Vorlage: $e');
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Fehler beim Speichern: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  /// Add-Field-Bottom-Sheet anzeigen
  void _showAddFieldSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AddFieldBottomSheetWidget(
        onFieldTypeSelected: _addField,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Formular erstellen',
        actions: [
          CustomAppBarAction(
            icon: Icons.save,
            onPressed: _isSaving ? () {} : () => _saveTemplate(),
            tooltip: 'Vorlage speichern',
          ),
        ],
      ),
      body: Row(
        children: [
          // Linkes Panel: Feldliste
          Expanded(
            flex: 3,
            child: Column(
              children: [
                // Vorlagenname-Eingabe
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    border: Border(
                      bottom: BorderSide(
                        color: theme.colorScheme.outline.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                  ),
                  child: TextField(
                    controller: _templateNameController,
                    decoration: InputDecoration(
                      labelText: 'Vorlagenname',
                      hintText: 'z.B. Elektrische Inspektion',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      prefixIcon: Icon(Icons.description),
                    ),
                  ),
                ),

                // Feldliste
                Expanded(
                  child: _formFields.isEmpty
                      ? _buildEmptyState(theme)
                      : LayoutBuilder(
                          builder: (context, constraints) {
                            return ReorderableListView.builder(
                              padding: EdgeInsets.all(4.w),
                              itemCount: _formFields.length,
                              onReorder: _reorderFields,
                              itemBuilder: (context, index) {
                                final field = _formFields[index];
                                return FormFieldCardWidget(
                                  key: ValueKey(field['id']),
                                  field: field,
                                  index: index,
                                  onEdit: () {
                                    if (mounted) {
                                      setState(() {
                                        _selectedFieldIndex = index;
                                      });
                                    }
                                  },
                                  onDelete: () => _deleteField(index),
                                  onUpdate: (updatedField) {
                                    if (mounted) {
                                      setState(() {
                                        _formFields[index] = updatedField;
                                      });
                                    }
                                  },
                                );
                              },
                            );
                          },
                        ),
                ),

                // Feld-hinzufügen-Button
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    border: Border(
                      top: BorderSide(
                        color: theme.colorScheme.outline.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _showAddFieldSheet,
                      icon: Icon(Icons.add),
                      label: const Text('Feld hinzufügen'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: Size(0, 6.h),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Rechtes Panel: Feldeinstellungen
          if (_selectedFieldIndex != null)
            SizedBox(
              width: 35.w,
              child: Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  border: Border(
                    left: BorderSide(
                      color: theme.colorScheme.outline.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                ),
                child: FieldSettingsPanelWidget(
                  field: _formFields[_selectedFieldIndex!],
                  onSave: (updatedField) {
                    if (mounted) {
                      setState(() {
                        _formFields[_selectedFieldIndex!] = updatedField;
                      });
                    }
                  },
                  onClose: () {
                    if (mounted) {
                      setState(() {
                        _selectedFieldIndex = null;
                      });
                    }
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(8.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.description_outlined,
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
            ),
            SizedBox(height: 3.h),
            Text(
              'Keine Felder vorhanden',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Fügen Sie Felder hinzu, um Ihre Formularvorlage zu erstellen',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            ElevatedButton.icon(
              onPressed: _showAddFieldSheet,
              icon: Icon(Icons.add),
              label: const Text('Erstes Feld hinzufügen'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
