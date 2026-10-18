import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Regional, Veiculo, StatusPresenca, MotivoFalta, Colaborador } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS || []);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA || []);
  const [modalNovaEquipeAberto, setModalNovaEquipeAberto] = useState(false);

  const handleUpdateAssentoStatus = (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substituto?: { id: string; nome: string }
  ) => {
    setVeiculos((prev) =>
      prev.map((v) => {
        if (v.id !== veiculoId) return v;
        const assentoOriginal = v.assentos?.[posicao];
        if (!assentoOriginal) return v;

        return {
          ...v,
          assentos: {
            ...v.assentos,
            [posicao]: {
              ...assentoOriginal,
              status: novoStatus,
              motivoFalta: motivo,
              observacao: observacao,
              substitutoId: substituto?.id,
              substitutoNome: substituto?.nome,
            },
          },
        };
      })
    );
  };

  const handleSalvarNovaEquipe = (novoVeiculo: any) => {
    const v: Veiculo = {
      id: `veic-${Date.now()}`,
      prefixo: novoVeiculo.prefixo || 'CARRO NOVO',
      placa: novoVeiculo.placa || 'ABC-0000',
      modelo: novoVeiculo.modelo || 'Pick-up Florestal',
      ano: new Date().getFullYear(),
      regional: novoVeiculo.regional || 'ribas',
      statusOperacional: 'ativo',
      equipe1Codigo: `EQ1-${novoVeiculo.prefixo || 'NOVA'}`,
      equipe2Codigo: `EQ2-${novoVeiculo.prefixo || 'NOVA'}`,
      assentos: {
        motorista: {
          id: `colab-${Date.now()}-1`,
          nome: 'Motorista Titular',
          cargo: 'Motorista Florestal',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: '',
          telefone: '(67) 99999-0001',
          status: 'presente',
          equipeId: 'eq1',
          equipeNumero: 1,
          posicaoVeiculo: 'motorista',
        },
        frenteDir: {
          id: `colab-${Date.now()}-2`,
          nome: 'Operador de Apoio',
          cargo: 'Operador Florestal',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: '',
          telefone: '(67) 99999-0002',
          status: 'presente',
          equipeId: 'eq1',
          equipeNumero: 1,
          posicaoVeiculo: 'frente_dir',
        },
        trasEsq: {
          id: `colab-${Date.now()}-3`,
          nome: 'Operador 2',
          cargo: 'Ajudante Geral',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: '',
          telefone: '(67) 99999-0003',
          status: 'presente',
          equipeId: 'eq2',
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
        },
        trasDir: {
          id: `colab-${Date.now()}-4`,
          nome: 'Operador 3',
          cargo: 'Ajudante Geral',
          matricula: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          foto: '',
          telefone: '(67) 99999-0004',
          status: 'presente',
          equipeId: 'eq2',
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
        },
      },
    };

    setVeiculos((prev) => [v, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNovaEquipeClick={() => setModalNovaEquipeAberto(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'veiculos' && (
          <>
            <MetricsHeader
              veiculos={veiculos}
              selectedRegional={selectedRegional}
              selectedDate={selectedDate}
              onFiltroRegionalChange={(reg) => setSelectedRegional(reg)}
              onNovaEquipe={() => setModalNovaEquipeAberto(true)}
            />
            <VehicleCardGrid
              veiculos={veiculos}
              colaboradoresReserva={colaboradoresReserva}
              selectedRegional={selectedRegional}
              onUpdateAssentoStatus={handleUpdateAssentoStatus}
            />
          </>
        )}

        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
          />
        )}

        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
          />
        )}

        {activeTab === 'relatorios' && (
          <ExportReports
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            selectedDate={selectedDate}
          />
        )}
      </main>

      <NewTeamModal
        isOpen={modalNovaEquipeAberto}
        onClose={() => setModalNovaEquipeAberto(false)}
        onSave={handleSalvarNovaEquipe}
        colaboradoresReserva={colaboradoresReserva}
      />
    </div>
  );
}

export default App;