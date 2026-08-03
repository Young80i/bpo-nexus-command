-- Initial Supabase schema for BPO Nexus

-- Create clients table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  country text not null,
  country_code text not null,
  freelancer_username text not null,
  email text not null,
  phone text not null,
  company text not null,
  total_projects integer default 0,
  total_revenue numeric default 0,
  rating numeric default 5.0,
  notes text,
  status text default 'Prospect'
);

-- Create projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  client_id uuid references public.clients(id) on delete cascade,
  description text,
  budget numeric not null,
  currency text not null,
  priority text not null,
  status text not null,
  start_date date not null,
  due_date date not null,
  estimated_hours integer not null,
  actual_hours integer default 0,
  stack text[] default '{}',
  repository text,
  ai_tool text,
  notes text,
  progress integer default 0,
  archived boolean default false
);

-- Create repositories table
create table if not exists public.repositories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  url text not null,
  description text,
  primary_language text,
  last_commit_date timestamp with time zone,
  stars integer default 0,
  forks integer default 0
);

-- Create engineering_decisions table
create table if not exists public.engineering_decisions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  stage text not null,
  decision text not null,
  reason text not null,
  repository_evidence text,
  approval boolean default false,
  confidence integer default 0
);

-- Create lovable_prompts table
create table if not exists public.lovable_prompts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  prompt_content text not null,
  generated_at timestamp with time zone,
  executed_at timestamp with time zone,
  result text,
  success boolean default false
);

-- Create continue_prompts table
create table if not exists public.continue_prompts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  prompt_content text not null,
  generated_at timestamp with time zone,
  executed_at timestamp with time zone,
  result text,
  success boolean default false
);

-- Create sprint_history table
create table if not exists public.sprint_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  sprint_name text not null,
  start_date date not null,
  end_date date not null,
  progress integer default 0,
  completed_tasks integer default 0,
  total_tasks integer default 0
);

-- Create approvals table
create table if not exists public.approvals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  stage text not null,
  requested_by text not null,
  requested_at timestamp with time zone default now() not null,
  approved_by text,
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  status text default 'pending',
  priority text not null
);

-- Create executive_metrics table
create table if not exists public.executive_metrics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  metric_name text not null,
  value numeric not null,
  category text not null,
  recorded_at timestamp with time zone default now() not null
);

-- Create deployments table
create table if not exists public.deployments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  environment text not null,
  status text not null,
  deployed_at timestamp with time zone not null,
  deployed_by text not null,
  version text,
  success boolean default true
);

-- Create github_activity table
create table if not exists public.github_activity (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  activity_type text not null,
  activity_date date not null,
  commits integer default 0,
  pull_requests integer default 0,
  issues integer default 0
);

-- Create engineering_memory table
create table if not exists public.engineering_memory (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  stage text not null,
  decision text not null,
  reason text not null,
  repository_evidence text,
  approval boolean default false,
  confidence integer default 0
);

-- Create project_status table
create table if not exists public.project_status (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  status text not null,
  progress integer default 0,
  health text not null,
  last_updated timestamp with time zone default now() not null
);

-- Create indexes for better performance
create index if not exists idx_clients_email on public.clients(email);
create index if not exists idx_clients_username on public.clients(freelancer_username);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_engineering_decisions_project_id on public.engineering_decisions(project_id);
create index if not exists idx_lovable_prompts_project_id on public.lovable_prompts(project_id);
create index if not exists idx_continue_prompts_project_id on public.continue_prompts(project_id);
create index if not exists idx_approvals_project_id on public.approvals(project_id);
create index if not exists idx_approvals_status on public.approvals(status);
create index if not exists idx_deployments_project_id on public.deployments(project_id);
create index if not exists idx_github_activity_project_id on public.github_activity(project_id);
create index if not exists idx_engineering_memory_project_id on public.engineering_memory(project_id);
create index if not exists idx_project_status_project_id on public.project_status(project_id);

-- Enable RLS (Row Level Security) for all tables
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.repositories enable row level security;
alter table public.engineering_decisions enable row level security;
alter table public.lovable_prompts enable row level security;
alter table public.continue_prompts enable row level security;
alter table public.sprint_history enable row level security;
alter table public.approvals enable row level security;
alter table public.executive_metrics enable row level security;
alter table public.deployments enable row level security;
alter table public.github_activity enable row level security;
alter table public.engineering_memory enable row level security;
alter table public.project_status enable row level security;

-- Create policies for public access (adjust as needed for your security requirements)
create policy "Enable read access for all users" on public.clients for select using (true);
create policy "Enable insert access for all users" on public.clients for insert with check (true);
create policy "Enable update access for all users" on public.clients for update using (true);
create policy "Enable delete access for all users" on public.clients for delete using (true);

create policy "Enable read access for all users" on public.projects for select using (true);
create policy "Enable insert access for all users" on public.projects for insert with check (true);
create policy "Enable update access for all users" on public.projects for update using (true);
create policy "Enable delete access for all users" on public.projects for delete using (true);

-- Add triggers to automatically update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_clients_updated_at before update on public.clients
    for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on public.projects
    for each row execute procedure update_updated_at_column();

create trigger update_repositories_updated_at before update on public.repositories
    for each row execute procedure update_updated_at_column();