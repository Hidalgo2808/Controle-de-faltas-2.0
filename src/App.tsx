import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Veiculo, Colaborador, Regional, StatusPresenca, MotivoFalta, MetricasGerais } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  // Manipulador de atualização de presença
  const handleUpdateStatus = (
    veiculoId: string,
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    substituto?: Colaborador
  ) => {
    setVeiculos((prevVeiculos) =>
      prevVeiculos.map((v) => {
        if (v.id !== veiculoId) return v;

        const atualizarAssento = (c: Colaborador) => {
          if (c.id !== colaboradorId) return c;
          return {
            ...c,
            status: novoStatus,
            motivoFalta: novoStatus === 'falta' ? motivoFalta : undefined,
            substitutoId: novoStatus === 'substituto' || novoStatus === 'falta' ? substituto?.id : undefined,
            substitutoNome: novoStatus === 'substituto' || novoStatus === 'falta' ? substituto?.nome : undefined,
          };
        };

        return {
          ...v,
          assentos: {
            motorista: atualizarAssento(v.assentos.motorista),
            frenteDir: atualizarAssento(v.assentos.frenteDir),
            trasEsq: atualizarAssento(v.assentos.trasEsq),
            trasDir: atualizarAssento(v.assentos.trasDir),
          },
        };
      })
    );
  };

  // Integração de colaboradores importados via Excel / CSV para o banco reserva
  const handleImportarColaboradores = (novos: ColaboradorCompleto[]) => {
    const convertidos: Colaborador[] = novos.map((n) => ({
      id: n.id,
      nome: n.nome,
      cargo: n.cargo,
      matricula: n.matricula,
      foto: n.foto,
      telefone: n.telefone,
      status: n.status,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
    }));
    setColaboradoresReserva((prev) => [...convertidos, ...prev]);
  };

  const handleAdicionarColaborador = (novo: ColaboradorCompleto) => {
    const convert: Colaborador = {
      id: novo.id,
      nome: novo.nome,
      cargo: novo.cargo,
      matricula: novo.matricula,
      foto: novo.foto,
      telefone: novo.telefone,
      status: novo.status,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
    };
    setColaboradoresReserva((prev) => [convert, ...prev]);
  };

  // Salvar novo veículo criado
  const handleSaveNewTeam = (data: {
    prefixo: string;
    placa: string;
    modelo: string;
    regional: 'ribas' | 'agua_clara';
  }) => {
    const num = veiculos.length + 105;
    const novoVeiculo: Veiculo = {
      id: `vtr-${num}`,
      prefixo: data.prefixo,
      placa: data.placa,
      modelo: data.modelo,
      ano: 2024,
      regional: data.regional,
      statusOperacional: 'ativo',
      equipe1Codigo: `EQ-${num}A`,
      equipe2Codigo: `EQ-${num}B`,
      assentos: {
        motorista: {
          id: `col-${num}-1`,
          nome: 'Motorista Designado',
          cargo: 'Motorista Florestal',
          matricula: `MAT-${num}1`,
          foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0001',
          status: 'presente',
          equipeId: `EQ-${num}A`,
          equipeNumero: 1,
          posicaoVeiculo: 'motorista',
        },
        frenteDir: {
          id: `col-${num}-2`,
          nome: 'Ajudante Designado',
          cargo: 'Operador de Campo',
          matricula: `MAT-${num}2`,
          foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0002',
          status: 'presente',
          equipeId: `EQ-${num}A`,
          equipeNumero: 1,
          posicaoVeiculo: 'frente_dir',
        },
        trasEsq: {
          id: `col-${num}-3`,
          nome: 'Técnico Designado',
          cargo: 'Técnico Florestal',
          matricula: `MAT-${num}3`,
          foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0003',
          status: 'presente',
          equipeId: `EQ-${num}B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
        },
        trasDir: {
          id: `col-${num}-4`,
          nome: 'Operador Reserva',
          cargo: 'Ajudante Geral',
          matricula: `MAT-${num}4`,
          foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0004',
          status: 'presente',
          equipeId: `EQ-${num}B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
        },
      },
    };

    setVeiculos((prev) => [novoVeiculo, ...prev]);
  };

  // Cálculo de Métricas Gerais
  const metricas: MetricasGerais = useMemo(() => {
    const totalVeiculos = veiculos.length;
    const veiculosAtivos = veiculos.filter((v) => v.statusOperacional === 'ativo').length;
    const totalEquipes = totalVeiculos * 2;

    let totalColaboradores = 0;
    let colaboradoresPresentes = 0;
    let colaboradoresFaltas = 0;
    let colaboradoresSubstitutos = 0;
    let equipesCompletas = 0;
    let equipesIncompletas = 0;

    veiculos.forEach((v) => {
      const eq1 = [v.assentos.motorista, v.assentos.frenteDir];
      const eq2 = [v.assentos.trasEsq, v.assentos.trasDir];

      const checkEq = (eq: Colaborador[]) => {
        const temFalta = eq.some((c) => c.status === 'falta');
        if (temFalta) equipesIncompletas++;
        else equipesCompletas++;
      };

      checkEq(eq1);
      checkEq(eq2);

      [...eq1, ...eq2].forEach((c) => {
        totalColaboradores++;
        if (c.status === 'presente') colaboradoresPresentes++;
        else if (c.status === 'falta') colaboradoresFaltas++;
        else if (c.status === 'substituto') colaboradoresSubstitutos++;
      });
    });

    const taxaPresenca =
      totalColaboradores > 0
        ? Math.round(((colaboradoresPresentes + colaboradoresSubstitutos) / totalColaboradores) * 100)
        : 100;

    return {
      totalVeiculos,
      veiculosAtivos,
      totalEquipes,
      equipesCompletas,
      equipesIncompletas,
      totalColaboradores,
      colaboradoresPresentes,
      colaboradoresFaltas,
      colaboradoresSubstitutos,
      taxaPresenca,
    };
  }, [veiculos]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Navbar com Logo Oficial, Seletor de Unidades e Data */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNovaEquipeClick={() => setIsNewTeamModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Na aba Veículos, exibe o painel de composição de equipes */}
        {activeTab === 'veiculos' && (
          <MetricsHeader
            veiculos={veiculos}
            metricas={metricas}
            selectedRegional={selectedRegional}
            selectedDate={selectedDate}
            onFiltroRegionalChange={(r) => setSelectedRegional(r)}
            onNovaEquipe={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {/* Visualização por Abas */}
        {activeTab === 'veiculos' && (
          <VehicleCardGrid
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            onUpdateStatus={handleUpdateStatus}
            selectedRegional={selectedRegional}
            onOpenNewTeamModal={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            onImportarColaboradores={handleImportarColaboradores}
            onAdicionarColaborador={handleAdicionarColaborador}
          />
        )}

        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            onNovaEquipe={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {activeTab === 'relatorios' && (
          <ExportReports
            veiculos={veiculos}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Modal de Nova Equipe / Veículo */}
      <NewTeamModal
        isOpen={isNewTeamModalOpen}
        onClose={() => setIsNewTeamModalOpen(false)}
        onSave={handleSaveNewTeam}
        colaboradoresReserva={colaboradoresReserva}
      />
    </div>
  );
}

export default App;