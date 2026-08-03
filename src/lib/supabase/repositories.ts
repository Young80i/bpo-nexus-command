import { supabase } from './client'
import type { 
  Client, 
  Project, 
  EngineeringDecision, 
  LovablePrompt, 
  ContinuePrompt, 
  Approval, 
  Deployment, 
  GithubActivity, 
  EngineeringMemory, 
  ProjectStatus 
} from './types'

// Client repository
export const clientRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Project repository
export const projectRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  getByClientId: async (clientId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Engineering decisions repository
export const engineeringDecisionRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('engineering_decisions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('engineering_decisions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (decision: Omit<EngineeringDecision, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('engineering_decisions')
      .insert(decision)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Prompt repositories
export const lovablePromptRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('lovable_prompts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('lovable_prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (prompt: Omit<LovablePrompt, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('lovable_prompts')
      .insert(prompt)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, prompt: Partial<Omit<LovablePrompt, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('lovable_prompts')
      .update(prompt)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const continuePromptRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('continue_prompts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('continue_prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (prompt: Omit<ContinuePrompt, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('continue_prompts')
      .insert(prompt)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, prompt: Partial<Omit<ContinuePrompt, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('continue_prompts')
      .update(prompt)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Approval repository
export const approvalRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getPending: async () => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (approval: Omit<Approval, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('approvals')
      .insert(approval)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, approval: Partial<Omit<Approval, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('approvals')
      .update(approval)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Deployment repository
export const deploymentRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (deployment: Omit<Deployment, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('deployments')
      .insert(deployment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// GitHub activity repository
export const githubActivityRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('github_activity')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('github_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (activity: Omit<GithubActivity, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('github_activity')
      .insert(activity)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Engineering memory repository
export const engineeringMemoryRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('engineering_memory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('engineering_memory')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (memory: Omit<EngineeringMemory, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('engineering_memory')
      .insert(memory)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Project status repository
export const projectStatusRepository = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('project_status')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_status')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  create: async (status: Omit<ProjectStatus, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('project_status')
      .insert(status)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, status: Partial<Omit<ProjectStatus, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('project_status')
      .update(status)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}