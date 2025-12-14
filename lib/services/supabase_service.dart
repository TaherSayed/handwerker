import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class SupabaseService {
  static SupabaseService? _instance;
  static SupabaseService get instance => _instance ??= SupabaseService._();

  SupabaseService._();

  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  // Initialize Supabase - call this in main()
  static Future<void> initialize() async {
    // Allow initialization to proceed even without credentials for development
    // but log warnings
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      debugPrint('⚠️ WARNING: Supabase credentials not configured!');
      debugPrint('');
      debugPrint('🔧 To configure Supabase authentication:');
      debugPrint('');
      debugPrint('1. Get your credentials from Supabase Dashboard:');
      debugPrint('   https://app.supabase.com/project/_/settings/api');
      debugPrint('');
      debugPrint('2. Run the app with environment variables:');
      debugPrint(
          '   flutter run --dart-define=SUPABASE_URL=your_supabase_url \\');
      debugPrint('              --dart-define=SUPABASE_ANON_KEY=your_anon_key');
      debugPrint('');
      debugPrint('3. For production build:');
      debugPrint('   flutter build apk --dart-define=SUPABASE_URL=your_url \\');
      debugPrint(
          '                     --dart-define=SUPABASE_ANON_KEY=your_key');
      debugPrint('');

      // Don't throw exception - allow app to run but authentication won't work
      return;
    }

    try {
      debugPrint('🚀 Initializing Supabase...');
      debugPrint('URL: $supabaseUrl');

      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );

      debugPrint('✅ Supabase initialized successfully');

      // Test connection
      final client = Supabase.instance.client;
      debugPrint('✅ Supabase client ready');
      debugPrint(
          'Auth state: ${client.auth.currentSession != null ? "Authenticated" : "Not authenticated"}');
    } catch (e) {
      debugPrint('❌ Supabase initialization error: $e');
      debugPrint('Please verify your SUPABASE_URL and SUPABASE_ANON_KEY');
    }
  }

  // Get Supabase client
  SupabaseClient get client {
    if (!isConfigured) {
      throw Exception(
        'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
      );
    }
    return Supabase.instance.client;
  }

  // Check if Supabase is configured
  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
