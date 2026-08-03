// Test script to verify CRUD operations for migrated entities
import { supabaseServices } from '../services';

async function testClientCRUD() {
  console.log('Testing Client CRUD operations...');
  
  try {
    // Create a test client
    const newClient = await supabaseServices.clients.create({
      name: 'Test Client',
      country: 'United States',
      country_code: 'US',
      freelancer_username: '@testclient',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      total_projects: 0,
      total_revenue: 0,
      rating: 5.0,
      notes: 'Test client for migration',
      status: 'Prospect'
    });
    
    console.log('Created client:', newClient);
    
    // Read the client
    const client = await supabaseServices.clients.getById(newClient.id);
    console.log('Retrieved client:', client);
    
    // Update the client
    const updatedClient = await supabaseServices.clients.update(newClient.id, {
      total_projects: 1,
      total_revenue: 10000
    });
    
    console.log('Updated client:', updatedClient);
    
    // Get all clients
    const allClients = await supabaseServices.clients.getAll();
    console.log(`Total clients: ${allClients.length}`);
    
    // Delete the test client
    await supabaseServices.clients.delete(newClient.id);
    console.log('Deleted test client');
    
    console.log('Client CRUD operations completed successfully');
  } catch (error) {
    console.error('Client CRUD test failed:', error);
  }
}

async function testProjectCRUD() {
  console.log('Testing Project CRUD operations...');
  
  try {
    // First create a test client to associate with the project
    const client = await supabaseServices.clients.create({
      name: 'Project Test Client',
      country: 'United States',
      country_code: 'US',
      freelancer_username: '@projecttest',
      email: 'projecttest@example.com',
      phone: '+1234567890',
      company: 'Project Test Company',
      total_projects: 0,
      total_revenue: 0,
      rating: 5.0,
      notes: 'Test client for project',
      status: 'Prospect'
    });
    
    // Create a test project
    const newProject = await supabaseServices.projects.create({
      name: 'Test Project',
      client_id: client.id,
      description: 'Test project for migration',
      budget: 50000,
      currency: 'USD',
      priority: 'High',
      status: 'In Progress',
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_hours: 160,
      actual_hours: 0,
      stack: ['React', 'TypeScript'],
      repository: 'github.com/test/test-project',
      ai_tool: 'Lovable',
      notes: 'Test project notes',
      progress: 0,
      archived: false
    });
    
    console.log('Created project:', newProject);
    
    // Read the project
    const project = await supabaseServices.projects.getById(newProject.id);
    console.log('Retrieved project:', project);
    
    // Update the project
    const updatedProject = await supabaseServices.projects.update(newProject.id, {
      progress: 50,
      status: 'Review'
    });
    
    console.log('Updated project:', updatedProject);
    
    // Get all projects
    const allProjects = await supabaseServices.projects.getAll();
    console.log(`Total projects: ${allProjects.length}`);
    
    // Get projects by client
    const clientProjects = await supabaseServices.projects.getByClientId(client.id);
    console.log(`Client projects: ${clientProjects.length}`);
    
    // Delete the test project
    await supabaseServices.projects.delete(newProject.id);
    console.log('Deleted test project');
    
    // Delete the test client
    await supabaseServices.clients.delete(client.id);
    console.log('Deleted test client');
    
    console.log('Project CRUD operations completed successfully');
  } catch (error) {
    console.error('Project CRUD test failed:', error);
  }
}

// Run tests
async function runTests() {
  await testClientCRUD();
  await testProjectCRUD();
}

// Export for manual testing
export { runTests, testClientCRUD, testProjectCRUD };