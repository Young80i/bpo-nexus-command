import { useState, useEffect, useCallback } from 'react';
import { supabaseServices } from '../services';
import type { Project as SupabaseProject } from '../types';
import { supabaseProjectToAppProject, appProjectToSupabaseProject } from '../adapters';
import type { Project as AppProject } from '@/data/demo';

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load projects directly from Supabase (No fake seed fallback)
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supabaseServices.projects.getAll();
      // Convert Supabase projects to app projects
      const appProjects = data.map(supabaseProjectToAppProject);
      setProjects(appProjects);
    } catch (err) {
      console.error('Failed to load projects from Supabase:', err);
      setError(err instanceof Error ? err : new Error('Failed to load projects'));
      // Return empty array on error so failures are visible and clean
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize projects on mount
  useEffect(() => {
    loadProjects().catch(setError);
  }, [loadProjects]);

  // Create a new project
  const createProject = useCallback(async (projectData: Omit<AppProject, 'id'>) => {
    try {
      // Convert app project to Supabase project
      const supabaseProjectData = appProjectToSupabaseProject(projectData as AppProject);
      
      const newProject = await supabaseServices.projects.create(supabaseProjectData);
      // Convert back to app project
      const appProject = supabaseProjectToAppProject(newProject);
      setProjects(prev => [appProject, ...prev]);
      return appProject;
    } catch (err) {
      console.error('CREATE PROJECT FAILED:', err);
      setError(err instanceof Error ? err : new Error('Failed to create project'));
      throw err;
    }
  }, []);

  // Update an existing project
  const updateProject = useCallback(async (id: string, updates: Partial<Omit<AppProject, 'id'>>) => {
    try {
      // Convert updates to Supabase format
      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.clientId !== undefined) supabaseUpdates.client_id = updates.clientId;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.budget !== undefined) supabaseUpdates.budget = updates.budget;
      if (updates.currency !== undefined) supabaseUpdates.currency = updates.currency;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.startDate !== undefined) supabaseUpdates.start_date = updates.startDate;
      if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate;
      if (updates.estimatedHours !== undefined) supabaseUpdates.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) supabaseUpdates.actual_hours = updates.actualHours;
      if (updates.stack !== undefined) supabaseUpdates.stack = updates.stack;
      if (updates.repository !== undefined) supabaseUpdates.repository = updates.repository;
      if (updates.aiTool !== undefined) supabaseUpdates.ai_tool = updates.aiTool;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.progress !== undefined) supabaseUpdates.progress = updates.progress;
      if (updates.archived !== undefined) supabaseUpdates.archived = updates.archived;
      
      const updatedProject = await supabaseServices.projects.update(id, supabaseUpdates);
      // Convert back to app project
      const appProject = supabaseProjectToAppProject(updatedProject);
      setProjects(prev => prev.map(project => project.id === id ? { ...project, ...appProject } : project));
      return appProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
      throw err;
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    try {
      await supabaseServices.projects.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      throw err;
    }
  }, []);

  // Archive/unarchive a project
  const archiveProject = useCallback(async (id: string) => {
    try {
      const project = projects.find(p => p.id === id);
      if (!project) return;
      
      const updatedProject = await updateProject(id, {
        archived: !project.archived,
        status: project.archived ? 'In Progress' : 'Archived'
      } as Partial<Omit<AppProject, 'id'>>);
      
      setProjects(prev => 
        prev.map(p => 
          p.id === id 
            ? { 
                ...p, 
                archived: !p.archived, 
                status: p.archived ? 'In Progress' : 'Archived' 
              } 
            : p
        )
      );
      
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to archive project'));
      throw err;
    }
  }, [projects, updateProject]);

  // Duplicate a project
  const duplicateProject = useCallback(async (id: string) => {
    try {
      const source = projects.find(p => p.id === id);
      if (!source) return;
      
      const projectData: Omit<AppProject, 'id'> = {
        name: `${source.name} (Copy)`,
        clientId: source.clientId,
        description: source.description,
        budget: source.budget,
        currency: source.currency,
        priority: source.priority,
        status: source.status,
        startDate: source.startDate,
        dueDate: source.dueDate,
        estimatedHours: source.estimatedHours,
        actualHours: source.actualHours,
        stack: source.stack,
        repository: source.repository,
        aiTool: source.aiTool,
        notes: source.notes,
        progress: source.progress,
        archived: source.archived
      };
      
      const newProject = await createProject(projectData);
      const index = projects.findIndex(p => p.id === id);
      
      if (index !== -1) {
        setProjects(prev => [
          ...prev.slice(0, index + 1),
          newProject,
          ...prev.slice(index + 1)
        ]);
      } else {
        setProjects(prev => [newProject, ...prev]);
      }
      
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to duplicate project'));
      throw err;
    }
  }, [projects, createProject]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    duplicateProject,
    refresh: loadProjects
  };
}