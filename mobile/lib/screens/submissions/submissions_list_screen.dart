import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/submissions_provider.dart';

class SubmissionsListScreen extends StatelessWidget {
  const SubmissionsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Submissions'),
      ),
      body: Consumer<SubmissionsProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.submissions.isEmpty) {
            return const Center(
              child: Text('No submissions yet'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.submissions.length,
            itemBuilder: (context, index) {
              final submission = provider.submissions[index];

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  title: Text(
                    submission.customerName ?? 'Unnamed',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(DateFormat('MMM d, yyyy').format(submission.createdAt)),
                    ],
                  ),
                  trailing: Chip(
                    label: Text(
                      submission.status,
                      style: const TextStyle(fontSize: 12),
                    ),
                    backgroundColor: submission.status == 'submitted'
                        ? Colors.green[100]
                        : Colors.grey[200],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

