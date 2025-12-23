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
    status: 'draft' | 'submitted';
    created_at: string;
    updated_at: string;
    is_synced: boolean;
}

export class OnSiteDB extends Dexie {
    contacts!: Table<LocalContact>;
    templates!: Table<LocalTemplate>;
    submissions!: Table<LocalSubmission>;

    constructor() {
        super('OnSiteDB');
        this.version(1).stores({
            contacts: 'id, name, email',
            templates: 'id, name, category',
            submissions: '++id, uuid, template_id, status, is_synced',
        });
    }
}

export const db = new OnSiteDB();
