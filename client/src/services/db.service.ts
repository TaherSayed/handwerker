import Dexie, { Table } from 'dexie';

export interface LocalContact {
    id: string; // Google ID or UUID
    google_contact_id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    synced_at: number;
}

export interface LocalTemplate {
    id: string;
    workspace_id: string;
    user_id: string;
    name: string;
    description?: string;
    category?: string;
    tags: string[];
    fields: any[];
    is_archived: boolean;
    updated_at: string;
    synced_at: number;
}

export interface LocalSubmission {
    id?: number; // Auto-incrementing local ID
    uuid?: string; // Server UUID if synced
    template_id: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    field_values: any;
    signature_url?: string;
    pdf_url?: string; // Local PDF file ID
    status: 'draft' | 'submitted';
    created_at: string;
    updated_at: string;
    is_synced: boolean;
}

export interface LocalFile {
    id: string;
    blob: Blob;
    submissionId?: string;
    type: 'pdf' | 'image' | 'signature';
    fileName: string;
    size: number;
    mimeType: string;
    created_at: string;
}

export interface SecureStorageItem {
    id: string;
    data: string; // Encrypted data
    type: 'submission' | 'key' | 'other';
    created_at: string;
}

export class OnSiteDB extends Dexie {
    contacts!: Table<LocalContact>;
    templates!: Table<LocalTemplate>;
    submissions!: Table<LocalSubmission>;
    files!: Table<LocalFile>;
    storage!: Table<SecureStorageItem>;

    constructor() {
        super('OnSiteDB');
        this.version(1).stores({
            contacts: 'id, name, email',
            templates: 'id, name, category',
            submissions: '++id, uuid, template_id, status, is_synced',
        });
        
        // Version 2: Add file storage and secure storage
        this.version(2).stores({
            contacts: 'id, name, email',
            templates: 'id, name, category',
            submissions: '++id, uuid, template_id, status, is_synced, pdf_url',
            files: 'id, submissionId, type, created_at',
            storage: 'id, type, created_at',
        }).upgrade(tx => {
            // Migration: Add pdf_url to existing submissions
            return tx.table('submissions').toCollection().modify(submission => {
                if (!submission.pdf_url) {
                    submission.pdf_url = undefined;
                }
            });
        });
    }
}

export const db = new OnSiteDB();
