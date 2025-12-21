import 'package:flutter/material.dart';
import '../presentation/google_sign_in_screen/google_sign_in_screen.dart';
import '../presentation/pdf_preview/pdf_preview.dart';
import '../presentation/splash_screen/splash_screen.dart';
import '../presentation/contact_selection/contact_selection.dart';
import '../presentation/form_template_selection/form_template_selection.dart';
import '../presentation/visit_form_filling/visit_form_filling.dart';
import '../presentation/form_builder/form_builder.dart';
import '../presentation/contacts_management/contacts_management.dart';
import '../presentation/user_profile/user_profile.dart';

class AppRoutes {
  // Core visit flow routes only
  static const String initial = '/';
  static const String googleSignIn = '/google-sign-in-screen';
  static const String contactSelection = '/contact-selection';
  static const String formTemplateSelection = '/form-template-selection';
  static const String visitFormFilling = '/visit-form-filling';
  static const String pdfPreview = '/pdf-preview';
  static const String formBuilder = '/form-builder';
  static const String contactsManagement = '/contacts-management';
  static const String userProfile = '/user-profile';

  static Map<String, WidgetBuilder> routes = {
    initial: (context) => const SplashScreen(),
    googleSignIn: (context) => const GoogleSignInScreen(),
    contactSelection: (context) => const ContactSelection(),
    formTemplateSelection: (context) => const FormTemplateSelection(),
    visitFormFilling: (context) => const VisitFormFilling(),
    pdfPreview: (context) => const PdfPreview(),
    formBuilder: (context) => const FormBuilder(),
    contactsManagement: (context) => const ContactsManagement(),
    userProfile: (context) => const UserProfile(),
  };
}
