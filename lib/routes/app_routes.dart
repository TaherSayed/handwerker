import 'package:flutter/material.dart';
import '../presentation/google_sign_in_screen/google_sign_in_screen.dart';
import '../presentation/pdf_preview/pdf_preview.dart';
import '../presentation/splash_screen/splash_screen.dart';
import '../presentation/contact_selection/contact_selection.dart';
import '../presentation/form_template_selection/form_template_selection.dart';
import '../presentation/contacts_management/contacts_management.dart';
import '../presentation/user_profile/user_profile.dart';
import '../presentation/dashboard/dashboard.dart';
import '../presentation/visit_form_filling/visit_form_filling.dart';
import '../presentation/form_builder/form_builder.dart';

class AppRoutes {
  // App route constants
  static const String initial = '/';
  static const String googleSignIn = '/google-sign-in-screen';
  static const String pdfPreview = '/pdf-preview';
  static const String splash = '/splash-screen';
  static const String contactSelection = '/contact-selection';
  static const String formTemplateSelection = '/form-template-selection';
  static const String contactsManagement = '/contacts-management';
  static const String userProfile = '/user-profile';
  static const String dashboard = '/dashboard';
  static const String formBuilder = '/form-builder';
  static const String visitFormFilling = '/visit-form-filling';

  static Map<String, WidgetBuilder> routes = {
    initial: (context) => const SplashScreen(),
    googleSignIn: (context) => const GoogleSignInScreen(),
    pdfPreview: (context) => const PdfPreview(),
    splash: (context) => const SplashScreen(),
    contactSelection: (context) => const ContactSelection(),
    formTemplateSelection: (context) => const FormTemplateSelection(),
    contactsManagement: (context) => const ContactsManagement(),
    userProfile: (context) => const UserProfile(),
    dashboard: (context) => const Dashboard(),
    visitFormFilling: (context) => const VisitFormFilling(),
    formBuilder: (context) => const FormBuilder(),
  };
}
