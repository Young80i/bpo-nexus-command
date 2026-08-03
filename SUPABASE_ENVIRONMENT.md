# Supabase Environment Configuration

## Required Environment Variables

To use the Supabase integration, you need to set the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Obtain These Values

1. Create a Supabase project at https://app.supabase.com/
2. Navigate to Project Settings > API
3. Copy the Project URL and Project API keys
4. Add them to your `.env` file

## Example .env File

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Notes

- Never commit `.env` files to version control
- The anon key is safe to use in client-side code
- The service role key should only be used server-side
- Rotate keys regularly for security