# 🗺️ Mapa de Arquitetura e Estrutura — Controle de Faltas

> **Sincronizado automaticamente pelo Code In Engine** em `2026-10-09 17:45:03`
> Este documento é a referência viva e em tempo real da arquitetura, componentes e entidades de negócio do projeto.

---

## 1. Visão Geral do Domínio e Identidade
- **Nome do Projeto**: `Controle de Faltas`
- **Descrição**: Aplicação SPA modular desenvolvida sob medida com Vite, React, TypeScript e Tailwind CSS.
- **Stack Tecnológica**: React 18 + TypeScript + Vite + Tailwind CSS
- **Design Tokens**: Configurados em `src/index.css` e `tailwind.config.js`
- **Utilitários**: `src/lib/utils.ts` (função `cn`)

---

## 2. Fontes de Dados e Entidades de Domínio
- **`src/data/mockData.ts`**: Módulo de dados e mock do domínio

---

## 3. Árvore de Renderização (Hierarquia de Componentes)
- `src/main.tsx` — Host de montagem React DOM da SPA (#root)
  └── `src/App.tsx` — Componente raiz da aplicação (orquestra layout, estado global e todas as seções)
        ├── `src/components/CollaboratorsManagement.tsx` — Componente React modular (CollaboratorsManagement)
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/ExportReports.tsx` — Componente React modular (ExportReports)
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/MetricsHeader.tsx` — Cabeçalho e barra de navegação global com links e ações
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/Navbar.tsx` — Cabeçalho e barra de navegação global com links e ações
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/NewTeamModal.tsx` — Modal/Dialog interativo (NewTeamModal)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/TeamsManagement.tsx` — Componente React modular (TeamsManagement)
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/VehicleCardGrid.tsx` — Grid/Catálogo interativo de produtos com filtros e cards
        │     └── `src/components/AttendanceModal.tsx` — Modal/Dialog interativo (AttendanceModal)
        │     └── `src/components/VehicleTopView.tsx` — Componente React modular (VehicleTopView)
        │     └── `src/components/utils.ts` — Componente React modular (utils)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/mockData.ts` — Componente React modular (mockData)
        │     └── `src/components/index.ts` — Componente React modular (index)
        ├── `src/components/index.ts` — Componente React modular (index)

---

## 4. Catálogo de Componentes e Responsabilidades

### 📦 Componentes da Aplicação (Seções e Features):
- **`src/components/AttendanceModal.tsx`** (AttendanceModal): Modal/Dialog interativo (AttendanceModal)
  - *Importado por*: `src/components/VehicleCardGrid.tsx`
  - *Sub-componentes*: `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/types/index.ts`, `src/data/mockData.ts`, `src/lib/utils.ts`

- **`src/components/CollaboratorsManagement.tsx`** (CollaboratorsManagement): Componente React modular (CollaboratorsManagement)
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/types/index.ts`

- **`src/components/ComponentShowcase.tsx`** (ComponentShowcase): Componente React modular (ComponentShowcase)
  - *Importado por*: ⚠️ **Órfão (Ainda não importado)**
  - *Sub-componentes*: `src/components/VehicleTopView.tsx`, `src/data/mockData.ts`, `src/types/index.ts`

- **`src/components/ExportReports.tsx`** (ExportReports): Componente React modular (ExportReports)
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/components/ui/card.tsx`, `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/types/index.ts`, `src/lib/utils.ts`

- **`src/components/MetricsHeader.tsx`** (MetricsHeader): Cabeçalho e barra de navegação global com links e ações
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/types/index.ts`, `src/components/ui/button.tsx`, `src/lib/utils.ts`

- **`src/components/Navbar.tsx`** (Navbar): Cabeçalho e barra de navegação global com links e ações
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/types/index.ts`, `src/components/ui/badge.tsx`, `src/lib/utils.ts`

- **`src/components/NewTeamModal.tsx`** (NewTeamModal): Modal/Dialog interativo (NewTeamModal)
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/types/index.ts`

- **`src/components/TeamsManagement.tsx`** (TeamsManagement): Componente React modular (TeamsManagement)
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/types/index.ts`, `src/lib/utils.ts`

- **`src/components/VehicleCardGrid.tsx`** (VehicleCardGrid): Grid/Catálogo interativo de produtos com filtros e cards
  - *Importado por*: `src/App.tsx`
  - *Sub-componentes*: `src/types/index.ts`, `src/components/VehicleTopView.tsx`, `src/components/AttendanceModal.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/ui/button.tsx`, `src/lib/utils.ts`

- **`src/components/VehicleTopView.tsx`** (VehicleTopView): Componente React modular (VehicleTopView)
  - *Importado por*: `src/components/ComponentShowcase.tsx`, `src/components/VehicleCardGrid.tsx`
  - *Sub-componentes*: `src/types/index.ts`, `src/lib/utils.ts`

### 🎨 Componentes Base de UI (`src/components/ui/`):
- `src/components/ui/badge.tsx`: Componente base de UI reutilizável (badge)
- `src/components/ui/button.tsx`: Componente base de UI reutilizável (button)
- `src/components/ui/card.tsx`: Componente base de UI reutilizável (card)
- `src/components/ui/input.tsx`: Componente base de UI reutilizável (input)

---

## 5. Módulos Utilitários, Funções e Exports Reais
- `src/data/mockData.ts`: Exporta [`COLABORADORES_RESERVA`, `VEICULOS_INICIAIS`]
- `src/lib/utils.ts`: Exporta [`cn`]
- `src/types/index.ts`: Exporta [`Regional`, `StatusPresenca`, `MotivoFalta`, `Colaborador`, `Equipe`, `Veiculo`, `MetricasGerais`]

---

## 6. 🚨 Regras Críticas de Desenvolvimento e Modificação (Agent Directives)

1. **INTEGRAÇÃO OBRIGATÓRIA (ZERO COMPONENTES ÓRFÃOS)**:
   - Ao criar qualquer novo componente, animação ou elemento (ex: `DogAnimation.tsx`, `PricingTable.tsx`, `AuthModal.tsx`), **é OBRIGATÓRIO modificar o componente pai correspondente** (ex: `Hero.tsx` ou `App.tsx`) para incluir o `import` e renderizá-lo na árvore JSX.
   - NUNCA devolva apenas o arquivo do componente filho isolado sem atualizar o pai onde ele deve ser exibido.

2. **PREVENÇÃO DE ERROS DE RUNTIME E IMPORTS INEXISTENTES (SyntaxError / Module Not Found)**:
   - NUNCA tente importar funções, variáveis ou mocks de arquivos como `src/utils.ts`, `src/lib/utils.ts` ou `src/data/*` que NÃO estejam explicitamente exportados nesses módulos.
   - Se você precisar de uma constante, lista mockada ou função utilitária que não exista (ex: `pessoasLivres`), **declare-a explicitamente no arquivo do componente** ou crie a exportação com os dados no arquivo correspondente.
   - Use SEMPRE optional chaining (`?.`) e valores padrão (`|| []`, `?? ''`) ao renderizar listas e propriedades aninhadas.

3. **PROTEÇÃO DO CONTAINER SPA**:
   - O arquivo `index.html` é estritamente o host de montagem com `<div id="root"></div>` e `<script type="module" src="/src/main.tsx"></script>`.
   - NUNCA substitua `index.html` por páginas HTML estáticas.

4. **MODULARIDADE E ALTO PADRÃO VISUAL**:
   - Cada seção deve ser um componente independente sob `src/components/` e montado em `src/App.tsx`.
   - Use dados realistas (mockups completos sob `src/data/`), efeitos hover/active, estados de transição e paleta harmônica com tokens Tailwind.
