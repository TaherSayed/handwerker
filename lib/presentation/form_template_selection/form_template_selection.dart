import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_icon_widget.dart';
import './widgets/empty_state_widget.dart';
import './widgets/search_bar_widget.dart';
import './widgets/template_card_widget.dart';

/// Form Template Selection Screen
///
/// Allows craftsmen to choose or create inspection forms for customer visits.
/// Features template search, grid/list view toggle, and template management.
class FormTemplateSelection extends StatefulWidget {
  const FormTemplateSelection({super.key});

  @override
  State<FormTemplateSelection> createState() => _FormTemplateSelectionState();
}

class _FormTemplateSelectionState extends State<FormTemplateSelection> {
  // View mode toggle
  bool _isGridView = false;

  // Search functionality
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // Selected template
  String? _selectedTemplateId;

  // Offline mode indicator
  bool _isOffline = false;

  // Mock data for form templates
  final List<Map<String, dynamic>> _templates = [
    {
      "id": "template_1",
      "name": "Basic Inspection",
      "fieldCount": 8,
      "lastModified": DateTime.now().subtract(const Duration(days: 2)),
      "isDefault": true,
      "category": "Inspection",
      "usageCount": 45,
      "thumbnail":
          "https://img.rocket.new/generatedImages/rocket_gen_img_1230db9cf-1764789196166.png",
      "semanticLabel":
          "Clipboard with checklist form on wooden desk with pen and coffee cup",
      "syncStatus": "synced",
    },
    {
      "id": "template_2",
      "name": "Service Report",
      "fieldCount": 12,
      "lastModified": DateTime.now().subtract(const Duration(days: 5)),
      "isDefault": true,
      "category": "Service",
      "usageCount": 32,
      "thumbnail":
          "https://img.rocket.new/generatedImages/rocket_gen_img_1ebb9b552-1765427346972.png",
      "semanticLabel": "Technician writing service notes on tablet in workshop",
      "syncStatus": "synced",
    },
    {
      "id": "template_3",
      "name": "Installation Checklist",
      "fieldCount": 15,
      "lastModified": DateTime.now().subtract(const Duration(days: 7)),
      "isDefault": true,
      "category": "Installation",
      "usageCount": 28,
      "thumbnail":
          "https://img.rocket.new/generatedImages/rocket_gen_img_109d58aad-1764935851930.png",
      "semanticLabel":
          "Worker reviewing installation checklist on construction site",
      "syncStatus": "synced",
    },
    {
      "id": "template_4",
      "name": "HVAC Maintenance",
      "fieldCount": 10,
      "lastModified": DateTime.now().subtract(const Duration(days: 1)),
      "isDefault": false,
      "category": "Maintenance",
      "usageCount": 18,
      "thumbnail":
          "https://img.rocket.new/generatedImages/rocket_gen_img_129a86e62-1765061357386.png",
      "semanticLabel":
          "HVAC technician inspecting air conditioning unit with tools",
      "syncStatus": "pending",
    },
    {
      "id": "template_5",
      "name": "Electrical Safety Check",
      "fieldCount": 14,
      "lastModified": DateTime.now().subtract(const Duration(hours: 12)),
      "isDefault": false,
      "category": "Safety",
      "usageCount": 22,
      "thumbnail":
          "https://img.rocket.new/generatedImages/rocket_gen_img_1b19239b5-1764686240320.png",
      "semanticLabel":
          "Electrician testing circuit breaker panel with multimeter",
      "syncStatus": "synced",
    },
    {
      "id": "template_6",
      "name": "Plumbing Inspection",
      "fieldCount": 9,
      "lastModified": DateTime.now().subtract(const Duration(days: 3)),
      "isDefault": false,
      "category": "Inspection",
      "usageCount": 15,
      "thumbnail":
          "https://images.unsplash.com/photo-1693562511259-158e471e015e",
      "semanticLabel": "Plumber inspecting pipes under sink with flashlight",
      "syncStatus": "synced",
    },
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.toLowerCase();
    });
  }

  List<Map<String, dynamic>> get _filteredTemplates {
    if (_searchQuery.isEmpty) {
      return _templates;
    }
    return _templates.where((template) {
      final name = (template['name'] as String).toLowerCase();
      final category = (template['category'] as String).toLowerCase();
      return name.contains(_searchQuery) || category.contains(_searchQuery);
    }).toList();
  }

  void _onTemplateSelected(String templateId) {
    setState(() {
      _selectedTemplateId = templateId;
    });
  }

  void _onStartVisit() {
    if (_selectedTemplateId != null) {
      Navigator.pushNamed(context, '/visit-form-filling');
    }
  }

  void _onCreateNewTemplate() {
    Navigator.pushNamed(context, '/form-builder');
  }

  void _onEditTemplate(String templateId) {
    Navigator.pushNamed(context, '/form-builder');
  }

  void _onDuplicateTemplate(String templateId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vorlage erfolgreich dupliziert'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _onDeleteTemplate(String templateId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Vorlage löschen'),
        content: const Text('Möchten Sie diese Vorlage wirklich löschen?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _templates.removeWhere((t) => t['id'] == templateId);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Vorlage erfolgreich gelöscht'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Löschen'),
          ),
        ],
      ),
    );
  }

  void _onSetAsDefault(String templateId) {
    setState(() {
      for (var template in _templates) {
        template['isDefault'] = template['id'] == templateId;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vorlage als Standard festgelegt'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _onPreviewTemplate(String templateId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Vorlagenvorschau'),
        content: const Text('Vorschaufunktion wird demnächst verfügbar sein'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Schließen'),
          ),
        ],
      ),
    );
  }

  void _onShareTemplate(String templateId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vorlage erfolgreich geteilt'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _toggleViewMode() {
    setState(() {
      _isGridView = !_isGridView;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filteredTemplates = _filteredTemplates;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: CustomAppBar(
        title: 'Choose Form Template',
        showOfflineIndicator: _isOffline,
        actions: [
          CustomAppBarAction(
            icon: _isGridView ? Icons.view_list : Icons.grid_view,
            onPressed: _toggleViewMode,
            tooltip: _isGridView ? 'List View' : 'Grid View',
          ),
          CustomAppBarAction(
            icon: Icons.add,
            onPressed: _onCreateNewTemplate,
            tooltip: 'Create New Template',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          SearchBarWidget(
            controller: _searchController,
            onChanged: (value) => _onSearchChanged(),
          ),

          // Templates list/grid
          Expanded(
            child: filteredTemplates.isEmpty
                ? EmptyStateWidget(
                    onCreateTemplate: _onCreateNewTemplate,
                  )
                : _isGridView
                    ? _buildGridView(filteredTemplates, theme)
                    : _buildListView(filteredTemplates, theme),
          ),
        ],
      ),

      // Sticky footer with Start Visit button
      bottomNavigationBar: _selectedTemplateId != null
          ? Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
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
                  onPressed: _onStartVisit,
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 6.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(2.w),
                    ),
                  ),
                  child: Text(
                    'Start Visit',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildListView(List<Map<String, dynamic>> templates, ThemeData theme) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      itemCount: templates.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return _buildCreateNewCard(theme);
        }

        final template = templates[index - 1];
        return TemplateCardWidget(
          template: template,
          isSelected: _selectedTemplateId == template['id'],
          isGridView: false,
          onTap: () => _onTemplateSelected(template['id'] as String),
          onEdit: () => _onEditTemplate(template['id'] as String),
          onDuplicate: () => _onDuplicateTemplate(template['id'] as String),
          onDelete: () => _onDeleteTemplate(template['id'] as String),
          onSetAsDefault: () => _onSetAsDefault(template['id'] as String),
          onPreview: () => _onPreviewTemplate(template['id'] as String),
          onShare: () => _onShareTemplate(template['id'] as String),
        );
      },
    );
  }

  Widget _buildGridView(List<Map<String, dynamic>> templates, ThemeData theme) {
    return GridView.builder(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 3.w,
        mainAxisSpacing: 2.h,
        childAspectRatio: 0.85,
      ),
      itemCount: templates.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return _buildCreateNewCard(theme);
        }

        final template = templates[index - 1];
        return TemplateCardWidget(
          template: template,
          isSelected: _selectedTemplateId == template['id'],
          isGridView: true,
          onTap: () => _onTemplateSelected(template['id'] as String),
          onEdit: () => _onEditTemplate(template['id'] as String),
          onDuplicate: () => _onDuplicateTemplate(template['id'] as String),
          onDelete: () => _onDeleteTemplate(template['id'] as String),
          onSetAsDefault: () => _onSetAsDefault(template['id'] as String),
          onPreview: () => _onPreviewTemplate(template['id'] as String),
          onShare: () => _onShareTemplate(template['id'] as String),
        );
      },
    );
  }

  Widget _buildCreateNewCard(ThemeData theme) {
    return GestureDetector(
      onTap: _onCreateNewTemplate,
      child: Container(
        margin: EdgeInsets.only(bottom: 2.h),
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(3.w),
          border: Border.all(
            color: theme.colorScheme.primary.withValues(alpha: 0.3),
            width: 2,
            style: BorderStyle.solid,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(3.w),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: CustomIconWidget(
                iconName: 'add',
                color: theme.colorScheme.primary,
                size: 32,
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              'Create New Template',
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 1.h),
            Text(
              'Build a custom form for your needs',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
