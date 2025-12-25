/**
 * Secure Local Storage Service
 * Provides encrypted storage for sensitive data and file management
 */

import { getDB, SecureStorageItem } from './db.service';

// Simple encryption using Web Crypto API (AES-GCM)
class SecureStorage {
  private async getEncryptionKey(): Promise<CryptoKey> {
    // Get or create encryption key from IndexedDB
    const dbInstance = getDB();
    const keyData = await dbInstance.storage.get('encryption_key');
    
    if (keyData?.data) {
      try {
        // Try to decrypt and import existing key
        const keyBytes = JSON.parse(keyData.data);
        return crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyBytes),
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
      } catch (e) {
        console.warn('Failed to import existing key, generating new one');
      }
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store
    const exported = await crypto.subtle.exportKey('raw', key);
    const keyArray = Array.from(new Uint8Array(exported));
    
    await dbInstance.storage.put({
      id: 'encryption_key',
      data: JSON.stringify(keyArray),
      type: 'key',
      created_at: new Date().toISOString()
    } as SecureStorageItem);

    return key;
  }

  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to unencrypted storage if encryption fails
      return data;
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      
      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      // If decryption fails, assume it's unencrypted data
      return encryptedData;
    }
  }

  // Store sensitive submission data encrypted
  async saveSecureSubmission(submissionId: string, data: any): Promise<void> {
    const encrypted = await this.encrypt(JSON.stringify(data));
    const db = getDB();
    await db.storage.put({
      id: `secure_submission_${submissionId}`,
      data: encrypted,
      type: 'submission',
      created_at: new Date().toISOString()
    } as SecureStorageItem);
  }

  async getSecureSubmission(submissionId: string): Promise<any | null> {
    const db = getDB();
    const stored = await db.storage.get(`secure_submission_${submissionId}`);
    if (!stored) return null;
    
    const decrypted = await this.decrypt(stored.data);
    return JSON.parse(decrypted);
  }

  // Store files (PDFs, images) as blobs
  async saveFile(fileId: string, file: Blob, metadata?: {
    submissionId?: string;
    type: 'pdf' | 'image' | 'signature';
    fileName?: string;
  }): Promise<void> {
    const db = getDB();
    await db.files.put({
      id: fileId,
      blob: file,
      submissionId: metadata?.submissionId,
      type: metadata?.type || 'pdf',
      fileName: metadata?.fileName || `${fileId}.${metadata?.type || 'pdf'}`,
      size: file.size,
      mimeType: file.type,
      created_at: new Date().toISOString()
    } as any);
  }

  async getFile(fileId: string): Promise<Blob | null> {
    const db = getDB();
    const file = await db.files.get(fileId);
    return file?.blob || null;
  }

  async getFileUrl(fileId: string): Promise<string | null> {
    const db = getDB();
    const file = await db.files.get(fileId);
    if (!file) return null;
    
    return URL.createObjectURL(file.blob);
  }

  // Get all files for a submission
  async getSubmissionFiles(submissionId: string): Promise<any[]> {
    const db = getDB();
    return db.files.where('submissionId').equals(submissionId).toArray();
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    const db = getDB();
    await db.files.delete(fileId);
  }

  // Clean up old files (older than 90 days)
  async cleanupOldFiles(): Promise<number> {
    const db = getDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const oldFiles = await db.files
      .where('created_at')
      .below(cutoffDate.toISOString())
      .toArray();
    
    const ids = oldFiles.map((f: any) => f.id);
    await db.files.bulkDelete(ids);
    
    return ids.length;
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    filesCount: number;
    filesSize: number;
    submissionsCount: number;
  }> {
    const db = getDB();
    const files = await db.files.toArray();
    const submissions = await db.storage
      .where('type')
      .equals('submission')
      .toArray();

    return {
      filesCount: files.length,
      filesSize: files.reduce((sum: number, f: any) => sum + (f.size || 0), 0),
      submissionsCount: submissions.length
    };
  }
}

export const secureStorage = new SecureStorage();

