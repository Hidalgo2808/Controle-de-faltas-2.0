import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Regional, StatusPresenca, MotivoFalta, Colaborador, Veiculo } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  // Atualização do status de presença/falta de um colaborador
  const handleUpdateStatus = (
    veiculoId: string,
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    substituto?: Colaborador
  ) => {
    setVeiculos((prev) =>
      prev.map((v) => {
        if (v.id !== veiculoId) return v;

        const updatedAssentos = { ...v.assentos };
        (Object.keys(updatedAssentos) as Array<keyof typeof updatedAssentos>).forEach((key) => {
          const colab = updatedAssentos[key];
          if (colab && colab.id === colaboradorId) {
            updatedAssentos[key] = {
              ...colab,
              status: novoStatus,
              motivoFalta: novoStatus === 'falta' ? motivoFalta : undefined,
              substitutoId: novoStatus === 'substituto' ? substituto?.id : undefined,
              substitutoNome: novoStatus === 'substituto' ? substituto?.nome : undefined,
            };
          }
        });

        return { ...v, assentos: updatedAssentos };
      })
    );
  };

  // Cadastro de novo veículo / equipe
  const handleSaveNewTeam = (newTeamData: any) => {
    const newVeiculo: Veiculo = {
      id: `vtr-${Date.now()}`,
      prefixo: newTeamData.prefixo || 'CARRO NOVO',
      placa: newTeamData.placa || 'NEW-0000',
      modelo: newTeamData.modelo || 'Veículo Operacional',
      ano: 2024,
      regional: newTeamData.regional || 'ribas',
      statusOperacional: 'ativo',
      equipe1Codigo: `EQ-${Date.now()}A`,
      equipe2Codigo: `EQ-${Date.now()}B`,
      assentos: {
        motorista: {
          id: `col-${Date.now()}-1`,
          nome: 'Motorista Titular',
          cargo: 'Motorista Operador',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0001',
          status: 'presente',
          equipeId: `EQ-${Date.now()}A`,
          equipeNumero: 1,
          posicaoVeiculo: 'motorista',
        },
        frenteDir: {
          id: `col-${Date.now()}-2`,
          nome: 'Ajudante Operacional',
          cargo: 'Ajudante Geral',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0002',
          status: 'presente',
          equipeId: `EQ-${Date.now()}A`,
          equipeNumero: 1,
          posicaoVeiculo: 'frente_dir',
        },
        trasEsq: {
          id: `col-${Date.now()}-3`,
          nome: 'Operador Técnico',
          cargo: 'Técnico de Campo',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0003',
          status: 'presente',
          equipeId: `EQ-${Date.now()}B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
        },
        trasDir: {
          id: `col-${Date.now()}-4`,
          nome: 'Assistente Florestal',
          cargo: 'Operador de Máquina',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0004',
          status: 'presente',
          equipeId: `EQ-${Date.now()}B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
        },
      },
    };

    setVeiculos((prev) => [newVeiculo, ...prev]);
  };

  // Importação e adição de colaboradores
  const handleImportarColaboradores = (novos: ColaboradorCompleto[]) => {
    const novosReserva: Colaborador[] = novos.map((n) => ({
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
    setColaboradoresReserva((prev) => [...prev, ...novosReserva]);
  };

  const handleAdicionarColaborador = (novo: ColaboradorCompleto) => {
    const novoReserva: Colaborador = {
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
    setColaboradoresReserva((prev) => [novoReserva, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col bg-modern-grid">
      {/* Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Aba de Veículos & Escala */}
        {activeTab === 'veiculos' && (
          <div className="space-y-6">
            <MetricsHeader
              veiculos={veiculos}
              selectedRegional={selectedRegional}
              selectedDate={selectedDate}
              onFiltroRegionalChange={(r) => setSelectedRegional(r)}
              onNovaEquipe={() => setIsNewTeamModalOpen(true)}
            />

            <VehicleCardGrid
              veiculos={veiculos}
              colaboradoresReserva={colaboradoresReserva}
              onUpdateStatus={handleUpdateStatus}
              selectedRegional={selectedRegional}
              onOpenNewTeamModal={() => setIsNewTeamModalOpen(true)}
            />
          </div>
        )}

        {/* Aba de Colaboradores */}
        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            onImportarColaboradores={handleImportarColaboradores}
            onAdicionarColaborador={handleAdicionarColaborador}
          />
        )}

        {/* Aba de Equipes */}
        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            selectedRegional={selectedRegional}
            onNovaEquipeClick={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {/* Aba de Relatórios */}
        {activeTab === 'relatorios' && (
          <ExportReports
            veiculos={veiculos}
            selectedRegional={selectedRegional}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Modal de Cadastro de Nova Equipe / Veículo */}
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