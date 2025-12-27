#!/usr/bin/env ts-node
/**
 * Script to seed test templates into the database
 * Run: npx ts-node scripts/seed-test-templates.ts
 */

import { createClient } from '@supabase/supabase-js';
import { comprehensiveTestTemplate, quickTestTemplate } from '../client/src/data/test-template.seed';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestTemplates() {
  console.log('🌱 Seeding test templates...\n');

  try {
    // Check if we need to authenticate
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️  No authenticated user. Templates will be created without user_id.');
      console.log('   For best results, authenticate first or set user_id manually.\n');
    } else {
      console.log(`✅ Authenticated as: ${user.email}\n`);
    }

    // Seed comprehensive test template
    console.log('📝 Creating comprehensive test template...');
    const { data: comprehensive, error: error1 } = await supabase
      .from('form_templates')
      .insert({
        name: comprehensiveTestTemplate.name,
        description: comprehensiveTestTemplate.description,
        category: comprehensiveTestTemplate.category,
        tags: comprehensiveTestTemplate.tags,
        fields: comprehensiveTestTemplate.fields,
        is_archived: false,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error1) {
      console.error('❌ Error creating comprehensive template:', error1.message);
    } else {
      console.log('✅ Comprehensive test template created!');
      console.log(`   ID: ${comprehensive.id}`);
      console.log(`   Fields: ${comprehensive.fields.length}`);
    }

    // Seed quick test template
    console.log('\n📝 Creating quick test template...');
    const { data: quick, error: error2 } = await supabase
      .from('form_templates')
      .insert({
        name: quickTestTemplate.name,
        description: quickTestTemplate.description,
        category: quickTestTemplate.category,
        tags: quickTestTemplate.tags,
        fields: quickTestTemplate.fields,
        is_archived: false,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error2) {
      console.error('❌ Error creating quick template:', error2.message);
    } else {
      console.log('✅ Quick test template created!');
      console.log(`   ID: ${quick.id}`);
      console.log(`   Fields: ${quick.fields.length}`);
    }

    console.log('\n✨ Seeding complete!\n');
    console.log('📱 Next steps:');
    console.log('1. Open the mobile app');
    console.log('2. Navigate to "New Submission"');
    console.log('3. Select one of the test templates');
    console.log('4. Verify all field types display correctly\n');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

seedTestTemplates();
