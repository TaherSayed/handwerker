// Comprehensive Test Template - Tests ALL Field Types
// Use this to verify all elements display correctly on mobile

export const comprehensiveTestTemplate = {
  name: 'Comprehensive Field Test',
  description: 'Test template with ALL field types - Web and Mobile compatibility test',
  category: 'Test',
  tags: ['test', 'all-fields', 'mobile-test'],
  fields: [
    // Section 1: Basic Text Fields
    {
      id: 'section_basic',
      type: 'section',
      label: 'BASIC TEXT FIELDS',
      sublabel: 'Testing all text input types',
      help_text: 'This section tests basic text input fields',
      required: false,
    },
    {
      id: 'fullname',
      type: 'fullname',
      label: 'Full Name',
      sublabel: 'Enter your complete name',
      placeholder: 'John Doe',
      help_text: 'First and last name',
      required: true,
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      help_text: 'We will send confirmation to this email',
      required: true,
    },
    {
      id: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+49 123 456789',
      help_text: 'Include country code',
      required: true,
    },
    {
      id: 'address',
      type: 'address',
      label: 'Address',
      placeholder: 'Street, City, ZIP',
      help_text: 'Your complete address',
      required: false,
    },
    {
      id: 'text_short',
      type: 'text',
      label: 'Short Text',
      placeholder: 'Short answer...',
      help_text: 'Brief description',
      required: false,
    },
    {
      id: 'longtext',
      type: 'longtext',
      label: 'Long Text',
      placeholder: 'Longer description...',
      help_text: 'Detailed information',
      required: false,
    },
    {
      id: 'paragraph',
      type: 'paragraph',
      label: 'Paragraph',
      placeholder: 'Write a paragraph...',
      help_text: 'Multiple lines of text',
      required: false,
    },
    {
      id: 'notes',
      type: 'notes',
      label: 'Notes',
      placeholder: 'Additional notes...',
      help_text: 'Any additional information',
      required: false,
    },
    {
      id: 'fillblank',
      type: 'fillblank',
      label: 'Fill in the Blank',
      placeholder: 'Your answer...',
      help_text: 'Complete the sentence',
      required: false,
    },

    // Divider
    {
      id: 'divider_1',
      type: 'divider',
      label: '',
      help_text: '',
      required: false,
    },

    // Section 2: Number Fields
    {
      id: 'section_numbers',
      type: 'section',
      label: 'NUMBER FIELDS',
      sublabel: 'Testing number input types',
      help_text: 'This section tests numeric inputs',
      required: false,
    },
    {
      id: 'number',
      type: 'number',
      label: 'Number',
      placeholder: '0',
      help_text: 'Enter a number',
      required: false,
    },
    {
      id: 'spinner',
      type: 'spinner',
      label: 'Number Spinner',
      placeholder: '0',
      help_text: 'Number with spinner control',
      required: false,
    },

    // Divider
    {
      id: 'divider_2',
      type: 'divider',
      label: '',
      help_text: '',
      required: false,
    },

    // Section 3: Selection Fields
    {
      id: 'section_selection',
      type: 'section',
      label: 'SELECTION FIELDS',
      sublabel: 'Testing selection and choice inputs',
      help_text: 'This section tests various selection types',
      required: false,
    },
    {
      id: 'dropdown',
      type: 'dropdown',
      label: 'Dropdown',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      help_text: 'Select one option from the list',
      required: true,
    },
    {
      id: 'radio',
      type: 'radio',
      label: 'Radio Buttons',
      options: ['Yes', 'No', 'Maybe'],
      help_text: 'Select one option',
      required: true,
    },
    {
      id: 'checkbox',
      type: 'checkbox',
      label: 'Checkbox',
      help_text: 'Check if you agree',
      required: false,
    },
    {
      id: 'toggle',
      type: 'toggle',
      label: 'Toggle Switch',
      help_text: 'Enable or disable',
      required: false,
    },

    // Divider
    {
      id: 'divider_3',
      type: 'divider',
      label: '',
      help_text: '',
      required: false,
    },

    // Section 4: Date and Time Fields
    {
      id: 'section_datetime',
      type: 'section',
      label: 'DATE & TIME FIELDS',
      sublabel: 'Testing date and time pickers',
      help_text: 'This section tests date/time inputs',
      required: false,
    },
    {
      id: 'date',
      type: 'date',
      label: 'Date',
      help_text: 'Select a date',
      required: false,
    },
    {
      id: 'time',
      type: 'time',
      label: 'Time',
      help_text: 'Select a time',
      required: false,
    },
    {
      id: 'datetime',
      type: 'datetime',
      label: 'Date & Time',
      help_text: 'Select date and time',
      required: false,
    },

    // Divider
    {
      id: 'divider_4',
      type: 'divider',
      label: '',
      help_text: '',
      required: false,
    },

    // Section 5: Media Fields
    {
      id: 'section_media',
      type: 'section',
      label: 'MEDIA FIELDS',
      sublabel: 'Testing photo, file, and signature',
      help_text: 'This section tests media upload fields',
      required: false,
    },
    {
      id: 'photo',
      type: 'photo',
      label: 'Photo Upload',
      help_text: 'Take or upload a photo',
      required: false,
    },
    {
      id: 'fileupload',
      type: 'fileupload',
      label: 'File Upload',
      help_text: 'Upload any file',
      required: false,
    },
    {
      id: 'signature',
      type: 'signature',
      label: 'Signature',
      help_text: 'Sign here',
      required: true,
    },

    // Divider
    {
      id: 'divider_5',
      type: 'divider',
      label: '',
      help_text: '',
      required: false,
    },

    // Section 6: Survey Fields
    {
      id: 'section_survey',
      type: 'section',
      label: 'SURVEY FIELDS',
      sublabel: 'Testing rating and survey inputs',
      help_text: 'This section tests survey-style fields',
      required: false,
    },
    {
      id: 'starrating',
      type: 'starrating',
      label: 'Star Rating',
      help_text: 'Rate from 1 to 5 stars',
      required: false,
    },
    {
      id: 'scalerating',
      type: 'scalerating',
      label: 'Scale Rating',
      help_text: 'Rate from 1 to 10',
      required: false,
    },
    {
      id: 'table',
      type: 'table',
      label: 'Table Input',
      help_text: 'Table data entry (simplified on mobile)',
      required: false,
    },
  ],
};

// Quick Test Template - Only essential fields
export const quickTestTemplate = {
  name: 'Quick Mobile Test',
  description: 'Quick test with most common field types',
  category: 'Test',
  tags: ['test', 'quick', 'mobile'],
  fields: [
    {
      id: 'section_1',
      type: 'section',
      label: 'CUSTOMER INFORMATION',
      required: false,
    },
    {
      id: 'fullname',
      type: 'fullname',
      label: 'Full Name',
      placeholder: 'John Doe',
      required: true,
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'john@example.com',
      required: true,
    },
    {
      id: 'phone',
      type: 'phone',
      label: 'Phone',
      placeholder: '+49 123 456789',
      required: true,
    },
    {
      id: 'divider_1',
      type: 'divider',
      label: '',
      required: false,
    },
    {
      id: 'section_2',
      type: 'section',
      label: 'SURVEY',
      required: false,
    },
    {
      id: 'satisfaction',
      type: 'starrating',
      label: 'How satisfied are you?',
      help_text: 'Rate your experience',
      required: true,
    },
    {
      id: 'recommend',
      type: 'radio',
      label: 'Would you recommend us?',
      options: ['Yes', 'No', 'Maybe'],
      required: true,
    },
    {
      id: 'comments',
      type: 'notes',
      label: 'Additional Comments',
      placeholder: 'Tell us more...',
      required: false,
    },
    {
      id: 'signature',
      type: 'signature',
      label: 'Signature',
      required: true,
    },
  ],
};
