// Database schema types for Supabase integration
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          country: string
          country_code: string
          freelancer_username: string
          email: string
          phone: string
          company: string
          total_projects: number
          total_revenue: number
          rating: number
          notes: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          country: string
          country_code: string
          freelancer_username: string
          email: string
          phone: string
          company: string
          total_projects?: number
          total_revenue?: number
          rating?: number
          notes?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          country?: string
          country_code?: string
          freelancer_username?: string
          email?: string
          phone?: string
          company?: string
          total_projects?: number
          total_revenue?: number
          rating?: number
          notes?: string
          status?: string
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          client_id: string
          description: string
          budget: number
          currency: string
          priority: string
          status: string
          start_date: string
          due_date: string
          estimated_hours: number
          actual_hours: number
          stack: string[]
          repository: string
          ai_tool: string
          notes: string
          progress: number
          archived: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          client_id: string
          description: string
          budget: number
          currency: string
          priority: string
          status: string
          start_date: string
          due_date: string
          estimated_hours: number
          actual_hours: number
          stack: string[]
          repository: string
          ai_tool: string
          notes: string
          progress: number
          archived?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          client_id?: string
          description?: string
          budget?: number
          currency?: string
          priority?: string
          status?: string
          start_date?: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          stack?: string[]
          repository?: string
          ai_tool?: string
          notes?: string
          progress?: number
          archived?: boolean
        }
      }
      repositories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          url: string
          description: string
          primary_language: string
          last_commit_date: string | null
          stars: number
          forks: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          url: string
          description?: string
          primary_language?: string
          last_commit_date?: string | null
          stars?: number
          forks?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          url?: string
          description?: string
          primary_language?: string
          last_commit_date?: string | null
          stars?: number
          forks?: number
        }
      }
      engineering_decisions: {
        Row: {
          id: string
          created_at: string
          project_id: string
          stage: string
          decision: string
          reason: string
          repository_evidence: string
          approval: boolean
          confidence: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          stage: string
          decision: string
          reason: string
          repository_evidence: string
          approval: boolean
          confidence: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          stage?: string
          decision?: string
          reason?: string
          repository_evidence?: string
          approval?: boolean
          confidence?: number
        }
      }
      lovable_prompts: {
        Row: {
          id: string
          created_at: string
          project_id: string
          prompt_content: string
          generated_at: string | null
          executed_at: string | null
          result: string | null
          success: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          prompt_content: string
          generated_at?: string | null
          executed_at?: string | null
          result?: string | null
          success?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          prompt_content?: string
          generated_at?: string | null
          executed_at?: string | null
          result?: string | null
          success?: boolean
        }
      }
      continue_prompts: {
        Row: {
          id: string
          created_at: string
          project_id: string
          prompt_content: string
          generated_at: string | null
          executed_at: string | null
          result: string | null
          success: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          prompt_content: string
          generated_at?: string | null
          executed_at?: string | null
          result?: string | null
          success?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          prompt_content?: string
          generated_at?: string | null
          executed_at?: string | null
          result?: string | null
          success?: boolean
        }
      }
      sprint_history: {
        Row: {
          id: string
          created_at: string
          sprint_name: string
          start_date: string
          end_date: string
          progress: number
          completed_tasks: number
          total_tasks: number
        }
        Insert: {
          id?: string
          created_at?: string
          sprint_name: string
          start_date: string
          end_date: string
          progress: number
          completed_tasks: number
          total_tasks: number
        }
        Update: {
          id?: string
          created_at?: string
          sprint_name?: string
          start_date?: string
          end_date?: string
          progress?: number
          completed_tasks?: number
          total_tasks?: number
        }
      }
      approvals: {
        Row: {
          id: string
          created_at: string
          project_id: string
          stage: string
          requested_by: string
          requested_at: string
          approved_by: string | null
          approved_at: string | null
          rejected_at: string | null
          status: string
          priority: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          stage: string
          requested_by: string
          requested_at: string
          approved_by?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          status?: string
          priority?: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          stage?: string
          requested_by?: string
          requested_at?: string
          approved_by?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          status?: string
          priority?: string
        }
      }
      executive_metrics: {
        Row: {
          id: string
          created_at: string
          metric_name: string
          value: number
          category: string
          recorded_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          metric_name: string
          value: number
          category: string
          recorded_at: string
        }
        Update: {
          id?: string
          created_at?: string
          metric_name?: string
          value?: number
          category?: string
          recorded_at?: string
        }
      }
      deployments: {
        Row: {
          id: string
          created_at: string
          project_id: string
          environment: string
          status: string
          deployed_at: string
          deployed_by: string
          version: string
          success: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          environment: string
          status: string
          deployed_at: string
          deployed_by: string
          version: string
          success: boolean
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          environment?: string
          status?: string
          deployed_at?: string
          deployed_by?: string
          version?: string
          success?: boolean
        }
      }
      github_activity: {
        Row: {
          id: string
          created_at: string
          project_id: string
          activity_type: string
          activity_date: string
          commits: number
          pull_requests: number
          issues: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          activity_type: string
          activity_date: string
          commits?: number
          pull_requests?: number
          issues?: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          activity_type?: string
          activity_date?: string
          commits?: number
          pull_requests?: number
          issues?: number
        }
      }
      engineering_memory: {
        Row: {
          id: string
          created_at: string
          project_id: string
          stage: string
          decision: string
          reason: string
          repository_evidence: string
          approval: boolean
          confidence: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          stage: string
          decision: string
          reason: string
          repository_evidence: string
          approval: boolean
          confidence: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          stage?: string
          decision?: string
          reason?: string
          repository_evidence?: string
          approval?: boolean
          confidence?: number
        }
      }
      project_status: {
        Row: {
          id: string
          created_at: string
          project_id: string
          status: string
          progress: number
          health: string
          last_updated: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          status: string
          progress: number
          health: string
          last_updated: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          status?: string
          progress?: number
          health?: string
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export individual table types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Repository = Database['public']['Tables']['repositories']['Row']
export type EngineeringDecision = Database['public']['Tables']['engineering_decisions']['Row']
export type LovablePrompt = Database['public']['Tables']['lovable_prompts']['Row']
export type ContinuePrompt = Database['public']['Tables']['continue_prompts']['Row']
export type SprintHistory = Database['public']['Tables']['sprint_history']['Row']
export type Approval = Database['public']['Tables']['approvals']['Row']
export type ExecutiveMetric = Database['public']['Tables']['executive_metrics']['Row']
export type Deployment = Database['public']['Tables']['deployments']['Row']
export type GithubActivity = Database['public']['Tables']['github_activity']['Row']
export type EngineeringMemory = Database['public']['Tables']['engineering_memory']['Row']
export type ProjectStatus = Database['public']['Tables']['project_status']['Row']

// Export insert and update types
export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertClient = Database['public']['Tables']['clients']['Insert']
export type InsertProject = Database['public']['Tables']['projects']['Insert']
export type InsertRepository = Database['public']['Tables']['repositories']['Insert']
export type InsertEngineeringDecision = Database['public']['Tables']['engineering_decisions']['Insert']
export type InsertLovablePrompt = Database['public']['Tables']['lovable_prompts']['Insert']
export type InsertContinuePrompt = Database['public']['Tables']['continue_prompts']['Insert']
export type InsertSprintHistory = Database['public']['Tables']['sprint_history']['Insert']
export type InsertApproval = Database['public']['Tables']['approvals']['Insert']
export type InsertExecutiveMetric = Database['public']['Tables']['executive_metrics']['Insert']
export type InsertDeployment = Database['public']['Tables']['deployments']['Insert']
export type InsertGithubActivity = Database['public']['Tables']['github_activity']['Insert']
export type InsertEngineeringMemory = Database['public']['Tables']['engineering_memory']['Insert']
export type InsertProjectStatus = Database['public']['Tables']['project_status']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateClient = Database['public']['Tables']['clients']['Update']
export type UpdateProject = Database['public']['Tables']['projects']['Update']
export type UpdateRepository = Database['public']['Tables']['repositories']['Update']
export type UpdateEngineeringDecision = Database['public']['Tables']['engineering_decisions']['Update']
export type UpdateLovablePrompt = Database['public']['Tables']['lovable_prompts']['Update']
export type UpdateContinuePrompt = Database['public']['Tables']['continue_prompts']['Update']
export type UpdateSprintHistory = Database['public']['Tables']['sprint_history']['Update']
export type UpdateApproval = Database['public']['Tables']['approvals']['Update']
export type UpdateExecutiveMetric = Database['public']['Tables']['executive_metrics']['Update']
export type UpdateDeployment = Database['public']['Tables']['deployments']['Update']
export type UpdateGithubActivity = Database['public']['Tables']['github_activity']['Update']
export type UpdateEngineeringMemory = Database['public']['Tables']['engineering_memory']['Update']
export type UpdateProjectStatus = Database['public']['Tables']['project_status']['Update']