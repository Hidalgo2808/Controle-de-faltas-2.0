import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal, NovaEquipePayload } from './components/NewTeamModal';
import { Veiculo, Colaborador, Regional, StatusPresenca, MotivoFalta } from './types';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { supabase } from './lib/supabase';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  // Estado dos Veículos e Colaboradores
  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => {
    try {
      const saved = localStorage.getItem('@inventar_veiculos');
      return saved ? JSON.parse(saved) : VEICULOS_INICIAIS;
    } catch {
      return VEICULOS_INICIAIS;
    }
  });

  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(() => {
    try {
      const saved = localStorage.getItem('@inventar_reserva');
      return saved ? JSON.parse(saved) : COLABORADORES_RESERVA;
    } catch {
      return COLABORADORES_RESERVA;
    }
  });

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    try {
      localStorage.setItem('@inventar_veiculos', JSON.stringify(veiculos));
    } catch (e) {
      console.warn('Erro ao salvar no cache local:', e);
    }
  }, [veiculos]);

  useEffect(() => {
    try {
      localStorage.setItem('@inventar_reserva', JSON.stringify(colaboradoresReserva));
    } catch (e) {
      console.warn('Erro ao salvar reservas:', e);
    }
  }, [colaboradoresReserva]);

  // Atualização de status de presença de um colaborador em um veículo específico
  const handleUpdateStatus = (
    veiculoId: string,
    posicao: 'motorista' | 'frente_dir' | 'tras_esq' | 'tras_dir',
    status: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => {
    setVeiculos((prev) =>
      prev.map((v) => {
        if (v.id !== veiculoId) return v;

        const chavePosicao =
          posicao === 'motorista'
            ? 'motorista'
            : posicao === 'frente_dir'
            ? 'frenteDir'
            : posicao === 'tras_esq'
            ? 'trasEsq'
            : 'trasDir';

        const colaboradorAtual = v.assentos[chavePosicao];
        if (!colaboradorAtual) return v;

        let substitutoNome: string | undefined = undefined;
        if (status === 'substituto' && substitutoId) {
          const sub = colaboradoresReserva.find((r) => r.id === substitutoId);
          substitutoNome = sub?.nome;
        }

        const colaboradorAtualizado: Colaborador = {
          ...colaboradorAtual,
          status,
          motivoFalta: status === 'falta' ? motivo : undefined,
          observacao: observacao?.trim() || undefined,
          substitutoId: status === 'substituto' ? substitutoId : undefined,
          substitutoNome,
        };

        return {
          ...v,
          assentos: {
            ...v.assentos,
            [chavePosicao]: colaboradorAtualizado,
          },
        };
      })
    );
  };

  // Cadastro de Nova Equipe e Veículo
  const handleNovaEquipeConfirm = (payload: NovaEquipePayload) => {
    const novoVeiculo: Veiculo = {
      id: `v-${Date.now()}`,
      prefixo: payload.prefixoVeiculo || payload.prefixo || 'V-NOVO',
      placa: payload.placaVeiculo || payload.placa || 'ABC-1234',
      modelo: payload.modeloVeiculo || payload.modelo || 'Hilux 4x4',
      ano: payload.anoVeiculo || payload.ano || new Date().getFullYear(),
      regional: payload.regional || 'ribas',
      statusOperacional: 'ativo',
      equipe1Codigo: payload.nomeEquipe1 || 'Equipe 1',
      equipe2Codigo: payload.nomeEquipe2 || 'Equipe 2',
      assentos: {
        motorista: payload.colaboradoresEquipe1[0],
        frenteDir: payload.colaboradoresEquipe1[1],
        trasEsq: payload.colaboradoresEquipe2[0],
        trasDir: payload.colaboradoresEquipe2[1],
      },
    };

    setVeiculos((prev) => [novoVeiculo, ...prev]);
  };

  // Importação e adição de colaboradores avulsos
  const handleAdicionarColaborador = (novo: ColaboradorCompleto) => {
    const novoColab: Colaborador = {
      id: novo.id,
      nome: novo.nome,
      cargo: novo.cargo,
      matricula: novo.matricula,
      foto: novo.foto,
      telefone: novo.telefone,
      status: novo.status,
      motivoFalta: novo.motivoFalta,
      observacao: novo.observacao,
      substitutoNome: novo.substitutoNome,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      unidade: novo.unidade,
      dataAdmissao: novo.dataAdmissao,
    };
    setColaboradoresReserva((prev) => [novoColab, ...prev]);
  };

  const handleImportarColaboradores = (novos: ColaboradorCompleto[]) => {
    const convertidos: Colaborador[] = novos.map((novo) => ({
      id: novo.id,
      nome: novo.nome,
      cargo: novo.cargo,
      matricula: novo.matricula,
      foto: novo.foto,
      telefone: novo.telefone,
      status: novo.status,
      motivoFalta: novo.motivoFalta,
      observacao: novo.observacao,
      substitutoNome: novo.substitutoNome,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      unidade: novo.unidade,
      dataAdmissao: novo.dataAdmissao,
    }));
    setColaboradoresReserva((prev) => [...convertidos, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#0f2419] flex flex-col font-sans transition-colors duration-200">
      {/* Barra de Navegação Superior Verde & Branca */}
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
        {activeTab === 'veiculos' && (
          <div className="space-y-6">
            <MetricsHeader
              veiculos={veiculos}
              selectedRegional={selectedRegional}
              selectedDate={selectedDate}
              onFiltroRegionalChange={setSelectedRegional}
              onNovaEquipe={() => setIsNewTeamModalOpen(true)}
            />
            <VehicleCardGrid
              veiculos={veiculos}
              colaboradoresReserva={colaboradoresReserva}
              selectedRegional={selectedRegional}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}

        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            onAdicionarColaborador={handleAdicionarColaborador}
            onImportarColaboradores={handleImportarColaboradores}
          />
        )}

        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            selectedRegional={selectedRegional}
            onNovaEquipe={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {activeTab === 'relatorios' && (
          <ExportReports
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedDate={selectedDate}
            selectedRegional={selectedRegional}
          />
        )}
      </main>

      {/* Modal de Criação de Nova Equipe / Veículo */}
      <NewTeamModal
        isOpen={isNewTeamModalOpen}
        onClose={() => setIsNewTeamModalOpen(false)}
        onConfirm={handleNovaEquipeConfirm}
        colaboradoresReserva={colaboradoresReserva}
        regionalPadrao={selectedRegional === 'agua_clara' ? 'agua_clara' : 'ribas'}
      />
    </div>
  );
}

export default App;