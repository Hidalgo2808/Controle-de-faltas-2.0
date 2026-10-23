-- ============================================================================
-- Code In Universal Database Engine: Schema DDL Idempotente & Zero-Loss Sync
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabela: colaborador_completos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.colaborador_completos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS motivoFalta TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS motivo_falta TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS substitutoNome TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS substituto_nome TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS equipeId TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS equipe_id TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS equipeNumero TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS equipe_numero TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS posicaoVeiculo TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS posicao_veiculo TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS veiculoPrefixo TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS veiculo_prefixo TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS veiculoPlaca TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS veiculo_placa TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS regional TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS unidade TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS dataAdmissao TEXT;
ALTER TABLE public.colaborador_completos ADD COLUMN IF NOT EXISTS data_admissao TEXT;
CREATE INDEX IF NOT EXISTS idx_colaborador_completos_status ON public.colaborador_completos (status);
CREATE INDEX IF NOT EXISTS idx_colaborador_completos_equipe_id ON public.colaborador_completos (equipe_id);
ALTER TABLE public.colaborador_completos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em colaborador_completos" ON public.colaborador_completos;
CREATE POLICY "Permissao total anon/auth em colaborador_completos" ON public.colaborador_completos FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.colaborador_completos TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: colaboradores_reservas ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.colaboradores_reservas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS equipeId TEXT;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS equipeNumero NUMERIC;
ALTER TABLE public.colaboradores_reservas ADD COLUMN IF NOT EXISTS posicaoVeiculo TEXT;
CREATE INDEX IF NOT EXISTS idx_colaboradores_reservas_status ON public.colaboradores_reservas (status);
ALTER TABLE public.colaboradores_reservas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em colaboradores_reservas" ON public.colaboradores_reservas;
CREATE POLICY "Permissao total anon/auth em colaboradores_reservas" ON public.colaboradores_reservas FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.colaboradores_reservas TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: veiculos_iniciaisss ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.veiculos_iniciaisss (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS prefixo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS placa TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS modelo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS ano NUMERIC;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS regional TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS statusOperacional TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS equipe1Codigo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS equipe2Codigo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS equipeId TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS equipeNumero NUMERIC;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS posicaoVeiculo TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS motivoFalta TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS substitutoId TEXT;
ALTER TABLE public.veiculos_iniciaisss ADD COLUMN IF NOT EXISTS substitutoNome TEXT;
CREATE INDEX IF NOT EXISTS idx_veiculos_iniciaisss_status ON public.veiculos_iniciaisss (status);
ALTER TABLE public.veiculos_iniciaisss ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em veiculos_iniciaisss" ON public.veiculos_iniciaisss;
CREATE POLICY "Permissao total anon/auth em veiculos_iniciaisss" ON public.veiculos_iniciaisss FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.veiculos_iniciaisss TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: colaboradores ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS matricula TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS foto TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS motivoFalta TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS motivo_falta TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS substitutoId TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS substituto_id TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS substitutoNome TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS substituto_nome TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS equipeId TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS equipe_id TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS equipeNumero TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS equipe_numero TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS posicaoVeiculo TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS posicao_veiculo TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS unidade TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS dataAdmissao TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS data_admissao TEXT;
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON public.colaboradores (status);
CREATE INDEX IF NOT EXISTS idx_colaboradores_substituto_id ON public.colaboradores (substituto_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_equipe_id ON public.colaboradores (equipe_id);
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em colaboradores" ON public.colaboradores;
CREATE POLICY "Permissao total anon/auth em colaboradores" ON public.colaboradores FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.colaboradores TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: equipes ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS regional TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS lider TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS veiculoPrefixo TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS veiculo_prefixo TEXT;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS colaboradoresIds JSONB;
ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS colaboradores_ids JSONB;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em equipes" ON public.equipes;
CREATE POLICY "Permissao total anon/auth em equipes" ON public.equipes FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.equipes TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: veiculos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.veiculos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS prefixo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS placa TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS modelo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS ano NUMERIC;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS regional TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS statusOperacional TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS status_operacional TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS equipe1Codigo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS equipe1_codigo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS equipe2Codigo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS equipe2_codigo TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS assentos JSONB;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS motorista TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS frenteDir TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS frente_dir TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS trasEsq TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS tras_esq TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS trasDir TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS tras_dir TEXT;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em veiculos" ON public.veiculos;
CREATE POLICY "Permissao total anon/auth em veiculos" ON public.veiculos FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.veiculos TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Tabela: metricas_geraisss ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.metricas_geraisss (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS totalVeiculos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS total_veiculos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS veiculosAtivos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS veiculos_ativos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS totalEquipes NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS total_equipes NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS equipesCompletas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS equipes_completas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS equipesIncompletas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS equipes_incompletas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS totalColaboradores NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS total_colaboradores NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradoresPresentes NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradores_presentes NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradoresFaltas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradores_faltas NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradoresSubstitutos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS colaboradores_substitutos NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS taxaPresenca NUMERIC;
ALTER TABLE public.metricas_geraisss ADD COLUMN IF NOT EXISTS taxa_presenca NUMERIC;
ALTER TABLE public.metricas_geraisss ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissao total anon/auth em metricas_geraisss" ON public.metricas_geraisss;
CREATE POLICY "Permissao total anon/auth em metricas_geraisss" ON public.metricas_geraisss FOR ALL TO public USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.metricas_geraisss TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- ── Storage Buckets Universais ───────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('images', 'images', true),
  ('avatars', 'avatars', true),
  ('photos', 'photos', true),
  ('documents', 'documents', true),
  ('attachments', 'attachments', true),
  ('public', 'public', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Acesso publico total storage buckets" ON storage.objects;
CREATE POLICY "Acesso publico total storage buckets" ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true);

-- ── Provisionamento Seguro de Usuário Admin para Demonstração / Testes ──
DO $$
DECLARE
  admin_count integer := 0;
  admin_uid uuid := '00000000-0000-4000-8000-000000000001'::uuid;
BEGIN
  SELECT count(*) INTO admin_count FROM auth.users WHERE email = 'admin@codein.dev';
  IF admin_count = 0 THEN
    BEGIN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-4000-8000-000000000000',
        admin_uid,
        'authenticated',
        'authenticated',
        'admin@codein.dev',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Administrador","name":"Administrador","role":"admin"}'::jsonb,
        now(),
        now()
      ) ON CONFLICT (id) DO NOTHING;

      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        admin_uid::text,
        admin_uid,
        format('{"sub":"%s","email":"%s"}', admin_uid::text, 'admin@codein.dev')::jsonb,
        'email',
        admin_uid::text,
        now(),
        now(),
        now()
      ) ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
      INSERT INTO public.usuarios (id, email, name, role)
      VALUES (admin_uid::text, 'admin@codein.dev', 'Administrador', 'admin')
      ON CONFLICT (id) DO NOTHING;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (admin_uid::text, 'admin@codein.dev', 'Administrador', 'admin')
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
