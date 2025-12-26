import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'providers/auth_provider.dart';
import 'providers/templates_provider.dart';
import 'providers/submissions_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/google_signin_screen.dart';
import 'screens/home/home_screen.dart';
import 'config/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await Supabase.initialize(
    url: const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://ckargfikgicnflsqbbld.supabase.co',
    ),
    anonKey: const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU',
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TemplatesProvider()),
        ChangeNotifierProvider(create: (_) => SubmissionsProvider()),
      ],
      child: MaterialApp(
        title: 'OnSite Forms',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const AppNavigator(),
      ),
    );
  }
}

class AppNavigator extends StatefulWidget {
  const AppNavigator({super.key});

  @override
  State<AppNavigator> createState() => _AppNavigatorState();
}

class _AppNavigatorState extends State<AppNavigator> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.initialize();
    setState(() => _initialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return const SplashScreen();
    }

    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (auth.isLoading) {
          return const SplashScreen();
        }

        if (auth.user == null) {
          return const GoogleSignInScreen();
        }

        return const HomeScreen();
      },
    );
  }
}

