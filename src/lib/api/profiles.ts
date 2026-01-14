import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Resume } from '../types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SeekerProfileRow = Database['public']['Tables']['seeker_profiles']['Row'];
type SeekerDocumentRow = Database['public']['Tables']['seeker_documents']['Row'];
type OrganizationRow = Database['public']['Tables']['organizations']['Row'];

// Helper to map database document to frontend Resume type
function mapDocumentToResume(doc: SeekerDocumentRow): Resume {
  const categoryMap: Record<string, Resume['category']> = {
    resume: 'Resume',
    certificate: 'Certificate',
    transcript: 'Certificate',
    recommendation: 'Other',
    license: 'Certificate',
    other: 'Other',
  };

  return {
    id: doc.id,
    name: doc.title,
    uploadedAt: doc.created_at,
    category: categoryMap[doc.doc_type] || 'Other',
    isDefault: doc.is_default,
  };
}

export async function uploadResumeFile(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return filePath;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function getSeekerProfile(userId: string): Promise<SeekerProfileRow | null> {
  const { data, error } = await supabase
    .from('seeker_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching seeker profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<ProfileRow>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function updateSeekerProfile(userId: string, updates: Partial<SeekerProfileRow>): Promise<void> {
  const { error } = await supabase
    .from('seeker_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating seeker profile:', error);
    throw error;
  }
}

export async function getUserDocuments(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from('seeker_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return (data || [])
    .map(mapDocumentToResume)
    .filter(doc => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.id));
}

export async function createDocument(documentData: {
  user_id: string;
  title: string;
  storage_path: string;
  doc_type: Database['public']['Enums']['doc_type'];
  is_default?: boolean;
}): Promise<Resume> {
  const { data, error } = await supabase
    .from('seeker_documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    throw error;
  }

  return mapDocumentToResume(data);
}

export async function getUserOrganization(userId: string): Promise<OrganizationRow | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}
