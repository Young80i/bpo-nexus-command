// Adapters to convert between Supabase types and application types
import type { Client as SupabaseClient, Project as SupabaseProject } from './types';
import type { Client as AppClient, Project as AppProject } from '@/data/demo';

// Convert Supabase Client to App Client
export function supabaseClientToAppClient(supabaseClient: SupabaseClient): AppClient {
  return {
    id: supabaseClient.id,
    name: supabaseClient.name,
    country: supabaseClient.country,
    countryCode: supabaseClient.country_code,
    freelancerUsername: supabaseClient.freelancer_username,
    email: supabaseClient.email,
    phone: supabaseClient.phone,
    company: supabaseClient.company,
    totalProjects: supabaseClient.total_projects,
    totalRevenue: supabaseClient.total_revenue,
    rating: supabaseClient.rating,
    notes: supabaseClient.notes,
    attachments: [], // This field doesn't exist in Supabase schema
    since: new Date(supabaseClient.created_at).toISOString().split('T')[0],
    status: supabaseClient.status as AppClient['status']
  };
}

// Convert App Client to Supabase Client
export function appClientToSupabaseClient(appClient: AppClient): Omit<SupabaseClient, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: appClient.name,
    country: appClient.country,
    country_code: appClient.countryCode,
    freelancer_username: appClient.freelancerUsername,
    email: appClient.email,
    phone: appClient.phone,
    company: appClient.company,
    total_projects: appClient.totalProjects,
    total_revenue: appClient.totalRevenue,
    rating: appClient.rating,
    notes: appClient.notes,
    status: appClient.status
  };
}

// Convert Supabase Project to App Project
export function supabaseProjectToAppProject(supabaseProject: SupabaseProject): AppProject {
  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    clientId: supabaseProject.client_id,
    description: supabaseProject.description,
    budget: supabaseProject.budget,
    currency: supabaseProject.currency as AppProject['currency'],
    priority: supabaseProject.priority as AppProject['priority'],
    status: supabaseProject.status as AppProject['status'],
    startDate: supabaseProject.start_date,
    dueDate: supabaseProject.due_date,
    estimatedHours: supabaseProject.estimated_hours,
    actualHours: supabaseProject.actual_hours,
    stack: supabaseProject.stack,
    repository: supabaseProject.repository,
    aiTool: supabaseProject.ai_tool,
    notes: supabaseProject.notes,
    progress: supabaseProject.progress,
    archived: supabaseProject.archived
  };
}

// Convert App Project to Supabase Project
export function appProjectToSupabaseProject(appProject: AppProject): Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: appProject.name,
    client_id: appProject.clientId,
    description: appProject.description,
    budget: appProject.budget,
    currency: appProject.currency,
    priority: appProject.priority,
    status: appProject.status,
    start_date: appProject.startDate,
    due_date: appProject.dueDate,
    estimated_hours: appProject.estimatedHours,
    actual_hours: appProject.actualHours,
    stack: appProject.stack,
    repository: appProject.repository,
    ai_tool: appProject.aiTool,
    notes: appProject.notes,
    progress: appProject.progress,
    archived: appProject.archived
  };
}