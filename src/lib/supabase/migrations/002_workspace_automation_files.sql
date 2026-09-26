"-- Migration for workspace, automation, and files entities
-- Supabase schema for BPO Nexus Sprint 2

-- Create conversations table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  subject text not null,
  channel text not null, -- 'Freelancer Chat' | 'Email' | 'Internal'
  starred boolean default false,
  ai_summary text,
  ai_reply text
);

-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  conversation_id uuid references public.conversations(id) on delete cascade,
  kind text not null, -- 'client' | 'team' | 'note'
  author text not null,
  initials text not null,
  body text not null,
  time text,
  attachments jsonb default '[]',
  unread boolean default false,
  status text default 'Sent', -- 'Sent' | 'Delivered' | 'Read' | 'Draft'
  created_at timestamp with time zone
);

-- Create milestones table
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text not null,
  budget numeric not null,
  deadline date not null,
  stage text not null, -- 'Planning' | 'In Progress' | 'Testing' | 'Waiting Approval' | 'Completed' | 'Cancelled'
  progress integer default 0,
  deliverables jsonb default '[]',
  files jsonb default '[]',
  completion_date date,
  approval text default 'Not Submitted', -- 'Not Submitted' | 'Pending' | 'Approved' | 'Changes Requested' | 'Rejected'
);

-- Create prompts table
create table if not exists public.prompts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  tool text not null, -- 'Claude' | 'Lovable' | 'Base44'
  group text not null,
  tags text[] default '{}',
  body text not null,
  code_notes text,
  versions jsonb default '[]',
  updated date,
  status text default 'Draft', -- 'Draft' | 'Active' | 'Archived'
  created_date date
);

-- Create dev_tracks table (for workspace progression tracking)
create table if not exists public.dev_tracks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  project_id uuid references public.projects(id) on delete cascade,
  stage text not null, -- 'Planning' | 'UI Design' | 'Frontend' | 'Backend' | 'Authentication' | 'Database' | 'API' | 'Testing' | 'Deployment' | 'Client Revision'
  progress integer default 0,
  owner text not null,
  note text
);

-- Create automations table
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  key text not null unique, -- Unique identifier for the automation
  name text not null,
  description text,
  enabled boolean default true,
  config jsonb default '{}' -- Flexible configuration for different automation types
);

-- Create files table (enhancing the existing repositories table or creating new one if needed)
-- Actually, we'll enhance the existing repositories table to handle file metadata
-- But let's create a dedicated files table for vault files
create table if not exists public.vault_files (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  name text not null,
  kind text not null, -- 'Image' | 'Video' | 'Audio' | 'Document' | 'PDF' | 'Spreadsheet' | 'Presentation' | 'ZIP' | 'Source Code' | 'Game Asset' | 'Data' | 'Other'
  size text not null,
  uploaded date not null,
  uploaded_by text not null,
  project_id uuid references public.projects(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  description text,
  preview text,
  data_url text,
  mime_type text
);

-- Create indexes for better performance
create index if not exists idx_conversations_project_id on public.conversations(project_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_milestones_project_id on public.milestones(project_id);
create index if not exists idx_prompts_project_id on public.prompts(project_id);
create index if not exists idx_dev_tracks_project_id on public.dev_tracks(project_id);
create index if not exists idx_vault_files_project_id on public.vault_files(project_id);
create index if not exists idx_vault_files_milestone_id on public.vault_files(milestone_id);

-- Enable RLS (Row Level Security) for all tables
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.milestones enable row level security;
alter table public.prompts enable row level security;
alter table public.dev_tracks enable row level security;
alter table public.automations enable row level security;
alter table public.vault_files enable row level security;

-- Create policies for public access (adjust as needed for your security requirements)
create policy "Enable read access for all users" on public.conversations for select using (true);
create policy "Enable insert access for all users" on public.conversations for insert with check (true);
create policy "Enable update access for all users" on public.conversations for update using (true);
create policy "Enable delete access for all users" on public.conversations for delete using (true);

create policy "Enable read access for all users" on public.messages for select using (true);
create policy "Enable insert access for all users" on public.messages for insert with check (true);
create policy "Enable update access for all users" on public.messages for update using (true);
create policy "Enable delete access for all users" on public.messages for delete using (true);

create policy "Enable read access for all users" on public.milestones for select using (true);
create policy "Enable insert access for all users" on public.milestones for insert with check (true);
create policy "Enable update access for all users" on public.milestones for update using (true);
create policy "Enable delete access for all users" on public.milestones for delete using (true);

create policy "Enable read access for all users" on public.prompts for select using (true);
create policy "Enable insert access for all users" on public.prompts for insert with check (true);
create policy "Enable update access for all users" on public.prompts for update using (true);
create policy "Enable delete access for all users" on public.prompts for delete using (true);

create policy "Enable read access for all users" on public.dev_tracks for select using (true);
create policy "Enable insert access for all users" on public.dev_tracks for insert with check (true);
create policy "Enable update access for all users" on public.dev_tracks for update using (true);
create policy "Enable delete access for all users" on public.dev_tracks for delete using (true);

create policy "Enable read access for all users" on public.automations for select using (true);
create policy "Enable insert access for all users" on public.automations for insert with check (true);
create policy "Enable update access for all users" on public.automations for update using (true);
create policy "Enable delete access for all users" on public.automations for delete using (true);

create policy "Enable read access for all users" on public.vault_files for select using (true);
create policy "Enable insert access for all users" on public.vault_files for insert with check (true);
create policy "Enable update access for all users" on public.vault_files for update using (true);
create policy "Enable delete access for all users" on public.vault_files for delete using (true);

-- Add triggers to automatically update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_conversations_updated_at before update on public.conversations
    for each row execute procedure update_updated_at_column();

create trigger update_messages_updated_at before update on public.messages
    for each row execute procedure update_updated_at_column();

create trigger update_milestones_updated_at before update on public.milestones
    for each row execute procedure update_updated_at_column();

create trigger update_prompts_updated_at before update on public.prompts
    for each row execute procedure update_updated_at_column();

create trigger update_dev_tracks_updated_at before update on public.dev_tracks
    for each row execute procedure update_updated_at_column();

create trigger update_automations_updated_at before update on public.automations
    for each row execute procedure update_updated_at_column();

create trigger update_vault_files_updated_at before update on public.vault_files
    for each row execute procedure update_updated_at_column();