// @ts-nocheck
const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>);

const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://xlyculjbvcqosqiqooqz.supabase.co';
const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWN1bGpidmNxb3NxaXFvb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjk5NDAsImV4cCI6MjEwNzkwNTk0MH0.SIyD-md4tFd80fdEg4AQaWjHwNwB--eCGZklaesxpNE';

// Cliente Supabase resiliente baseado na REST API oficial do PostgREST / GoTrue
// Garante execução imediata sem depender do estado da pasta node_modules
class SupabaseQueryBuilder {
  private table: string;
  private url: string;
  private key: string;
  private headers: Record<string, string>;
  private queryParams: URLSearchParams;
  private method: string = 'GET';
  private bodyData: any = null;

  constructor(table: string, url: string, key: string) {
    this.table = table;
    this.url = `${url.replace(/\/$/, '')}/rest/v1/${table}`;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    this.queryParams = new URLSearchParams();
  }

  select(columns: string = '*') {
    this.method = 'GET';
    this.queryParams.set('select', columns);
    return this;
  }

  insert(values: any) {
    this.method = 'POST';
    this.bodyData = values;
    return this;
  }

  update(values: any) {
    this.method = 'PATCH';
    this.bodyData = values;
    return this;
  }

  upsert(values: any) {
    this.method = 'POST';
    this.headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
    this.bodyData = values;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  eq(column: string, value: any) {
    this.queryParams.append(column, `eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.queryParams.append(column, `neq.${value}`);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const dir = options.ascending ? 'asc' : 'desc';
    this.queryParams.set('order', `${column}.${dir}`);
    return this;
  }

  limit(count: number) {
    this.queryParams.set('limit', String(count));
    return this;
  }

  async single() {
    this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    const result = await this.execute();
    return result;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const result = await this.execute();
    if (result.error && onrejected) {
      return onrejected(result.error);
    }
    return onfulfilled ? onfulfilled(result) : result;
  }

  private async execute() {
    try {
      const qStr = this.queryParams.toString();
      const requestUrl = qStr ? `${this.url}?${qStr}` : this.url;
      const options: RequestInit = {
        method: this.method,
        headers: this.headers,
      };

      if (this.bodyData && (this.method === 'POST' || this.method === 'PATCH' || this.method === 'PUT')) {
        options.body = JSON.stringify(this.bodyData);
      }

      const response = await fetch(requestUrl, options);
      if (!response.ok) {
        let errMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          errMessage = errJson.message || errJson.error || errMessage;
        } catch (_) {}
        return { data: null, error: new Error(errMessage) };
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

export const supabase = {
  from(table: string) {
    return new SupabaseQueryBuilder(table, supabaseUrl, supabaseAnonKey);
  },
  auth: {
    async getSession() {
      try {
        const stored = localStorage.getItem('sb-token');
        const session = stored ? JSON.parse(stored) : null;
        return { data: { session }, error: null };
      } catch (e) {
        return { data: { session: null }, error: null };
      }
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: new Error(data.error_description || data.msg || 'Erro na autenticação') };
        localStorage.setItem('sb-token', JSON.stringify(data));
        return { data: { user: data.user, session: data }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    async signOut() {
      localStorage.removeItem('sb-token');
      return { error: null };
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },
};