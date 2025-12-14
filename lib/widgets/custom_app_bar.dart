import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// App bar style variants for different contexts
enum CustomAppBarStyle {
  /// Standard app bar with back button
  standard,

  /// App bar with close button (for modal screens)
  modal,

  /// App bar without leading button
  noLeading,

  /// Transparent app bar for overlays
  transparent,
}

/// Custom app bar optimized for field service applications
///
/// Features:
/// - Clean professional design with minimal elevation
/// - 48dp touch targets for reliable interaction
/// - Contextual actions and overflow menu
/// - Offline status indicator support
/// - Platform-specific back button behavior
///
/// Usage:
/// ```dart
/// Scaffold(
///   appBar: CustomAppBar(
///     title: 'Customer Details',
///     actions: [
///       CustomAppBarAction(
///         icon: Icons.call,
///         onPressed: () => _callCustomer(),
///         tooltip: 'Call Customer',
///       ),
///     ],
///   ),
/// )
/// ```
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  /// Creates a custom app bar
  ///
  /// [title] - Required title text or widget
  /// [style] - Visual style variant (default: standard)
  /// [actions] - Optional action buttons (max 3 recommended)
  /// [leading] - Optional custom leading widget
  /// [onLeadingPressed] - Callback for leading button (defaults to Navigator.pop)
  /// [backgroundColor] - Optional background color override
  /// [foregroundColor] - Optional text/icon color override
  /// [elevation] - Optional elevation override (default: 0)
  /// [centerTitle] - Whether to center the title (default: false)
  /// [showOfflineIndicator] - Show offline status badge
  /// [bottom] - Optional bottom widget (e.g., TabBar)
  const CustomAppBar({
    super.key,
    required this.title,
    this.style = CustomAppBarStyle.standard,
    this.actions,
    this.leading,
    this.onLeadingPressed,
    this.backgroundColor,
    this.foregroundColor,
    this.elevation,
    this.centerTitle = false,
    this.showOfflineIndicator = false,
    this.bottom,
  });

  final dynamic title; // String or Widget
  final CustomAppBarStyle style;
  final List<CustomAppBarAction>? actions;
  final Widget? leading;
  final VoidCallback? onLeadingPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? elevation;
  final bool centerTitle;
  final bool showOfflineIndicator;
  final PreferredSizeWidget? bottom;

  @override
  Size get preferredSize => Size.fromHeight(
        kToolbarHeight + (bottom?.preferredSize.height ?? 0),
      );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final appBarTheme = theme.appBarTheme;

    final effectiveBackgroundColor = style == CustomAppBarStyle.transparent
        ? Colors.transparent
        : (backgroundColor ??
            appBarTheme.backgroundColor ??
            theme.colorScheme.surface);

    final effectiveForegroundColor = foregroundColor ??
        appBarTheme.foregroundColor ??
        theme.colorScheme.onSurface;

    return AppBar(
      backgroundColor: effectiveBackgroundColor,
      foregroundColor: effectiveForegroundColor,
      elevation: elevation ?? (style == CustomAppBarStyle.transparent ? 0 : 0),
      centerTitle: centerTitle,
      systemOverlayStyle: _getSystemOverlayStyle(context),
      leading: _buildLeading(context),
      title: _buildTitle(context),
      actions: _buildActions(context),
      bottom: bottom,
    );
  }

  SystemUiOverlayStyle _getSystemOverlayStyle(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
    );
  }

  Widget? _buildLeading(BuildContext context) {
    if (style == CustomAppBarStyle.noLeading) {
      return null;
    }

    if (leading != null) {
      return leading;
    }

    final canPop = Navigator.of(context).canPop();
    if (!canPop) {
      return null;
    }

    final icon =
        style == CustomAppBarStyle.modal ? Icons.close : Icons.arrow_back;

    return IconButton(
      icon: Icon(icon, size: 24),
      onPressed: onLeadingPressed ?? () => Navigator.of(context).pop(),
      tooltip: style == CustomAppBarStyle.modal ? 'Close' : 'Back',
      iconSize: 24,
      padding: const EdgeInsets.all(12),
      constraints: const BoxConstraints(
        minWidth: 48,
        minHeight: 48,
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    final theme = Theme.of(context);

    Widget titleWidget;
    if (title is String) {
      titleWidget = Text(
        title as String,
        style: theme.appBarTheme.titleTextStyle,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      );
    } else {
      titleWidget = title as Widget;
    }

    if (showOfflineIndicator) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(child: titleWidget),
          const SizedBox(width: 8),
          _buildOfflineIndicator(context),
        ],
      );
    }

    return titleWidget;
  }

  Widget _buildOfflineIndicator(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: theme.colorScheme.error.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.cloud_off,
            size: 14,
            color: theme.colorScheme.error,
          ),
          const SizedBox(width: 4),
          Text(
            'Offline',
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.error,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  List<Widget>? _buildActions(BuildContext context) {
    if (actions == null || actions!.isEmpty) {
      return null;
    }

    return actions!.map((action) => action.build(context)).toList();
  }
}

/// Action button configuration for app bar
class CustomAppBarAction {
  /// Creates an app bar action button
  ///
  /// [icon] - Required icon to display
  /// [onPressed] - Required callback when pressed
  /// [tooltip] - Optional tooltip text
  /// [color] - Optional icon color override
  const CustomAppBarAction({
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.color,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final Color? color;

  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: 24),
      onPressed: onPressed,
      tooltip: tooltip,
      color: color,
      iconSize: 24,
      padding: const EdgeInsets.all(12),
      constraints: const BoxConstraints(
        minWidth: 48,
        minHeight: 48,
      ),
    );
  }
}
