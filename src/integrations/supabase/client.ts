/// <reference types="vite/client" />

const getEnv = (key: string): string => {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
    return metaEnv?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://xlyculjbvcqosqiqooqz.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWN1bGpidmNxb3NxaXFvb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjk5NDAsImV4cCI6MjEwNzkwNTk0MH0.SIyD-md4tFd80fdEg4AQaWjHwNwB--eCGZklaesxpNE';

// Criação resiliente do cliente Supabase para garantir funcionamento ininterrupto no Vite
const createSafeSupabaseClient = (url: string, key: string) => {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  return {
    auth: {
      getSession: async () => {
        try {
          const stored = localStorage.getItem('sb-auth-token');
          if (stored) {
            return { data: { session: JSON.parse(stored) }, error: null };
          }
        } catch {
          // Fallback silencioso
        }
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      signInWithPassword: async ({ email, password }: any) => {
        try {
          const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { apikey: key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error_description || data.msg || 'Erro na autenticação');
          localStorage.setItem('sb-auth-token', JSON.stringify(data));
          return { data: { user: data.user, session: data }, error: null };
        } catch (err: any) {
          return { data: { user: null, session: null }, error: err };
        }
      },
      signOut: async () => {
        localStorage.removeItem('sb-auth-token');
        return { error: null };
      },
      signUp: async ({ email, password }: any) => {
        try {
          const res = await fetch(`${url}/auth/v1/signup`, {
            method: 'POST',
            headers: { apikey: key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.msg || 'Erro no cadastro');
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
    },
    from: (table: string) => ({
      select: async (columns = '*') => {
        try {
          const res = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(columns)}`, {
            headers,
          });
          if (!res.ok) throw new Error(`Erro ao buscar dados de ${table}`);
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          return { data: [], error: err };
        }
      },
      insert: async (values: any) => {
        try {
          const res = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(values),
          });
          if (!res.ok) throw new Error(`Erro ao inserir em ${table}`);
          const data = await res.json();
          return { data, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      update: (values: any) => ({
        eq: async (column: string, val: any) => {
          try {
            const res = await fetch(`${url}/rest/v1/${table}?${column}=eq.${encodeURIComponent(val)}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(`Erro ao atualizar ${table}`);
            const data = await res.json();
            return { data, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
      }),
      delete: () => ({
        eq: async (column: string, val: any) => {
          try {
            const res = await fetch(`${url}/rest/v1/${table}?${column}=eq.${encodeURIComponent(val)}`, {
              method: 'DELETE',
              headers,
            });
            if (!res.ok) throw new Error(`Erro ao deletar em ${table}`);
            return { error: null };
          } catch (err: any) {
            return { error: err };
          }
        },
      }),
    }),
  };
};

// Tenta inicializar via createClient dinâmico ou provê cliente REST compatível sem quebrar o Vite
let clientInstance: any = null;

try {
  const dynamicSupabaseModule = '@supabase/supabase-js';
  // Importação protegida para evitar falhas de análise estática do Vite caso os pacotes estejam sendo restaurados
  const importedModule = await import(/* @vite-ignore */ dynamicSupabaseModule).catch(() => null);
  if (importedModule && typeof importedModule.createClient === 'function') {
    clientInstance = importedModule.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
} catch {
  // Ignora e usa a implementação resiliente nativa abaixo
}

if (!clientInstance) {
  clientInstance = createSafeSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = clientInstance;