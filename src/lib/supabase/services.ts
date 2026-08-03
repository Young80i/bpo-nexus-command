import { 
  clientRepository, 
  projectRepository, 
  engineeringDecisionRepository, 
  lovablePromptRepository, 
  continuePromptRepository, 
  approvalRepository, 
  deploymentRepository, 
  githubActivityRepository, 
  engineeringMemoryRepository, 
  projectStatusRepository 
} from './repositories'

// Service layer to coordinate data access
export const supabaseServices = {
  clients: {
    getAll: clientRepository.getAll,
    getById: clientRepository.getById,
    create: clientRepository.create,
    update: clientRepository.update,
    delete: clientRepository.delete
  },

  projects: {
    getAll: projectRepository.getAll,
    getById: projectRepository.getById,
    getByClientId: projectRepository.getByClientId,
    create: projectRepository.create,
    update: projectRepository.update,
    delete: projectRepository.delete
  },

  engineeringDecisions: {
    getAll: engineeringDecisionRepository.getAll,
    getByProjectId: engineeringDecisionRepository.getByProjectId,
    create: engineeringDecisionRepository.create
  },

  prompts: {
    lovable: {
      getAll: lovablePromptRepository.getAll,
      getByProjectId: lovablePromptRepository.getByProjectId,
      create: lovablePromptRepository.create,
      update: lovablePromptRepository.update
    },
    continue: {
      getAll: continuePromptRepository.getAll,
      getByProjectId: continuePromptRepository.getByProjectId,
      create: continuePromptRepository.create,
      update: continuePromptRepository.update
    }
  },

  approvals: {
    getAll: approvalRepository.getAll,
    getByProjectId: approvalRepository.getByProjectId,
    getPending: approvalRepository.getPending,
    create: approvalRepository.create,
    update: approvalRepository.update
  },

  deployments: {
    getAll: deploymentRepository.getAll,
    getByProjectId: deploymentRepository.getByProjectId,
    create: deploymentRepository.create
  },

  github: {
    getAll: githubActivityRepository.getAll,
    getByProjectId: githubActivityRepository.getByProjectId,
    create: githubActivityRepository.create
  },

  engineeringMemory: {
    getAll: engineeringMemoryRepository.getAll,
    getByProjectId: engineeringMemoryRepository.getByProjectId,
    create: engineeringMemoryRepository.create
  },

  projectStatus: {
    getAll: projectStatusRepository.getAll,
    getByProjectId: projectStatusRepository.getByProjectId,
    create: projectStatusRepository.create,
    update: projectStatusRepository.update
  }
}