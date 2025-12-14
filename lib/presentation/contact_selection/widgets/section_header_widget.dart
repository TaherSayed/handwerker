import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

/// Alphabetical section header for contact list
///
/// Features:
/// - Large letter display
/// - Sticky header behavior
/// - Jump-scroll support
class SectionHeaderWidget extends StatelessWidget {
  const SectionHeaderWidget({
    super.key,
    required this.letter,
  });

  final String letter;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.symmetric(vertical: 1.h),
      margin: EdgeInsets.only(bottom: 1.h),
      child: Text(
        letter,
        style: theme.textTheme.titleLarge?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
