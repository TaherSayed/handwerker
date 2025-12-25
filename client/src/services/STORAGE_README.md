# Secure Local Storage System

## Overview
The secure local storage system provides encrypted storage for sensitive data and file management using IndexedDB and Web Crypto API.

## Features

### 1. Encrypted Storage
- Uses AES-GCM encryption (256-bit) for sensitive data
- Encryption keys are stored securely in IndexedDB
- Automatic key generation and management

### 2. File Storage
- Stores PDFs, images, and signatures as blobs in IndexedDB
- Organized by submission ID
- Automatic cleanup of old files (90+ days)

### 3. Data Organization
- **Submissions**: Stored with encryption for sensitive fields
- **Files**: PDFs and images stored as blobs with metadata
- **Templates**: Cached locally for offline access
- **Contacts**: Local cache of Google Contacts

## Usage

### Storing Files
```typescript
import { secureStorage } from './secure-storage.service';

// Store a PDF
await secureStorage.saveFile('pdf_123', pdfBlob, {
  submissionId: 'submission-123',
  type: 'pdf',
  fileName: 'report.pdf'
});

// Get file URL
const url = await secureStorage.getFileUrl('pdf_123');
```

### Storing Sensitive Data
```typescript
// Store encrypted submission data
await secureStorage.saveSecureSubmission('submission-123', {
  customer_email: 'customer@example.com',
  field_values: { /* sensitive data */ }
});

// Retrieve encrypted data
const data = await secureStorage.getSecureSubmission('submission-123');
```

### Storage Statistics
```typescript
const stats = await secureStorage.getStorageStats();
console.log(`Files: ${stats.filesCount}, Size: ${stats.filesSize} bytes`);
```

## Security

- **Encryption**: All sensitive data is encrypted using Web Crypto API
- **Key Management**: Encryption keys are generated per-installation
- **Isolation**: Data is stored in IndexedDB, isolated from other websites
- **No External Access**: Files are stored locally, not accessible via file system

## File Organization

Files are organized in IndexedDB with the following structure:
- `files` table: Stores PDFs, images, signatures as blobs
- `storage` table: Stores encrypted sensitive data
- `submissions` table: References to local files via `pdf_url` field

## Cleanup

Old files (90+ days) are automatically cleaned up:
```typescript
const deletedCount = await secureStorage.cleanupOldFiles();
```

## Browser Support

- Requires IndexedDB support (all modern browsers)
- Requires Web Crypto API (all modern browsers)
- Works offline once data is cached

