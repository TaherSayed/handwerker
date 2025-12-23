import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/submissions_provider.dart';
import '../../providers/templates_provider.dart';
import '../form/form_filling_screen.dart';

class DraftsListScreen extends StatelessWidget {
  const DraftsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Drafts'),
      ),
      body: Consumer<SubmissionsProvider>(
        builder: (context, provider, _) {
          if (provider.drafts.isEmpty) {
            return const Center(
              child: Text('No drafts'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.drafts.length,
            itemBuilder: (context, index) {
              final draft = provider.drafts[index];
              final template = context
                  .read<TemplatesProvider>()
                  .getTemplateById(draft.templateId);

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(
                    draft.customerName ?? 'Unnamed',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(template?.name ?? 'Unknown Template'),
                      Text(
                        DateFormat('MMM d, yyyy').format(draft.createdAt),
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    if (template != null) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => FormFillingScreen(
                            template: template,
                            draft: draft,
                          ),
                        ),
                      );
                    }
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

