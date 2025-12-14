import 'package:flutter/material.dart';

/// Navigation item configuration for bottom bar
enum CustomBottomBarItem {
  dashboard(
    route: '/dashboard',
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: 'Übersicht',
  ),
  contacts(
    route: '/contacts-management',
    icon: Icons.contacts_outlined,
    activeIcon: Icons.contacts,
    label: 'Kontakte',
  ),
  forms(
    route: '/form-template-selection',
    icon: Icons.description_outlined,
    activeIcon: Icons.description,
    label: 'Formulare',
  ),
  profile(
    route: '/user-profile',
    icon: Icons.person_outline,
    activeIcon: Icons.person,
    label: 'Profil',
  );

  const CustomBottomBarItem({
    required this.route,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final String route;
  final IconData icon;
  final IconData activeIcon;
  final String label;
}

/// Custom bottom navigation bar optimized for field professionals
///
/// Features:
/// - Bottom-heavy interaction design for one-handed use
/// - 56dp touch targets for work glove compatibility
/// - High contrast icons for outdoor visibility
/// - Material Design 3 elevation and styling
///
/// Usage:
/// ```dart
/// Scaffold(
///   body: _pages[_currentIndex],
///   bottomNavigationBar: CustomBottomBar(
///     currentIndex: _currentIndex,
///     onTap: (index) => setState(() => _currentIndex = index),
///   ),
/// )
/// ```
class CustomBottomBar extends StatelessWidget {
  /// Creates a custom bottom navigation bar
  ///
  /// [currentIndex] - Currently selected tab index (0-3)
  /// [onTap] - Callback when tab is tapped, receives index
  /// [backgroundColor] - Optional background color override
  /// [selectedColor] - Optional selected item color override
  /// [unselectedColor] - Optional unselected item color override
  const CustomBottomBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.backgroundColor,
    this.selectedColor,
    this.unselectedColor,
  }) : assert(currentIndex >= 0 && currentIndex < 4,
            'Index must be between 0 and 3');

  final int currentIndex;
  final ValueChanged<int> onTap;
  final Color? backgroundColor;
  final Color? selectedColor;
  final Color? unselectedColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomNavTheme = theme.bottomNavigationBarTheme;

    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ??
            bottomNavTheme.backgroundColor ??
            theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow,
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64, // Optimized for thumb reach
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              CustomBottomBarItem.values.length,
              (index) => _buildNavItem(
                context,
                CustomBottomBarItem.values[index],
                index,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    CustomBottomBarItem item,
    int index,
  ) {
    final theme = Theme.of(context);
    final bottomNavTheme = theme.bottomNavigationBarTheme;
    final isSelected = currentIndex == index;

    final itemColor = isSelected
        ? (selectedColor ??
            bottomNavTheme.selectedItemColor ??
            theme.colorScheme.primary)
        : (unselectedColor ??
            bottomNavTheme.unselectedItemColor ??
            theme.colorScheme.onSurfaceVariant);

    return Expanded(
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon with 56dp touch target for work gloves
              SizedBox(
                height: 26,
                width: 26,
                child: Icon(
                  isSelected ? item.activeIcon : item.icon,
                  color: itemColor,
                  size: 22,
                ),
              ),
              const SizedBox(height: 3),
              // Label with optimized typography
              Flexible(
                child: Text(
                  item.label,
                  style: (isSelected
                          ? bottomNavTheme.selectedLabelStyle
                          : bottomNavTheme.unselectedLabelStyle) ??
                      theme.textTheme.labelSmall?.copyWith(
                        color: itemColor,
                        fontWeight:
                            isSelected ? FontWeight.w500 : FontWeight.w400,
                        fontSize: 11,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Extension to easily navigate using bottom bar items
extension CustomBottomBarNavigation on BuildContext {
  /// Navigate to a bottom bar route
  void navigateToBottomBarRoute(CustomBottomBarItem item) {
    Navigator.pushNamed(this, item.route);
  }

  /// Get current bottom bar index from route
  int getBottomBarIndexFromRoute(String route) {
    final index = CustomBottomBarItem.values.indexWhere(
      (item) => item.route == route,
    );
    return index >= 0 ? index : 0;
  }
}
