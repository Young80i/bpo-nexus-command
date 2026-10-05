CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  country text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '',
  freelancer_username text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  total_projects integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 5,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Prospect'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages clients" ON public.clients FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  budget numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Planning',
  start_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL DEFAULT current_date,
  estimated_hours integer NOT NULL DEFAULT 0,
  actual_hours integer NOT NULL DEFAULT 0,
  stack text[] NOT NULL DEFAULT '{}',
  repository text NOT NULL DEFAULT '',
  ai_tool text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  progress integer NOT NULL DEFAULT 0,
  archived boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages projects" ON public.projects FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.app_state (
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO authenticated;
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages state" ON public.app_state FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner reads vault" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner writes vault" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner updates vault" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner deletes vault" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);