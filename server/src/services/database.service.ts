import { supabase } from './supabase.service.js';

export class DatabaseService {
  // Contacts
  async getContacts(userId: string, searchQuery?: string) {
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createContact(userId: string, contact: any) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(contactId: string, updates: any) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(contactId: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  // Form Templates
  async getFormTemplates(userId: string) {
    const { data, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createFormTemplate(userId: string, template: any) {
    const { data, error } = await supabase
      .from('form_templates')
      .insert({ ...template, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFormTemplate(templateId: string, updates: any, userId: string) {
    const { data, error } = await supabase
      .from('form_templates')
      .update(updates)
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFormTemplate(templateId: string, userId: string) {
    const { error } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Visits
  async getVisits(userId: string, limit?: number) {
    let query = supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false});

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getVisitById(visitId: string, userId: string) {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', visitId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async createVisit(userId: string, visit: any) {
    const { data, error } = await supabase
      .from('visits')
      .insert({ ...visit, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateVisit(visitId: string, updates: any, userId: string) {
    const { data, error } = await supabase
      .from('visits')
      .update(updates)
      .eq('id', visitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteVisit(visitId: string) {
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId);

    if (error) throw error;
  }

  // User Profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ ...updates, user_id: userId }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const databaseService = new DatabaseService();

