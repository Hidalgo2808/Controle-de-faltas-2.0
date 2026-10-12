import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Veiculo, Colaborador, Regional } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA);
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  // Manipulador para atualizar um veículo no estado geral
  const handleUpdateVeiculo = (veiculoAtualizado: Veiculo) => {
    setVeiculos((prev) =>
      prev.map((v) => (v.id === veiculoAtualizado.id ? veiculoAtualizado : v))
    );
  };

  // Manipulador para cadastrar nova equipe vinculada ou criar novo veículo
  const handleCriarNovaEquipe = (novaEquipe: {
    codigo: string;
    regional: 'ribas' | 'agua_clara';
    veiculoPrefixo: string;
    veiculoPlaca: string;
    motorista: { nome: string; cargo: string; telefone: string };
    operador2: { nome: string; cargo: string; telefone: string };
  }) => {
    const novoVeiculo: Veiculo = {
      id: `vtr-${Date.now()}`,
      prefixo: novaEquipe.veiculoPrefixo || `CARRO ${Math.floor(Math.random() * 900) + 100}`,
      placa: novaEquipe.veiculoPlaca || 'BRA-2024',
      modelo: 'Toyota Hilux 4x4 CS',
      ano: new Date().getFullYear(),
      regional: novaEquipe.regional,
      statusOperacional: 'ativo',
      equipe1Codigo: novaEquipe.codigo,
      equipe2Codigo: `${novaEquipe.codigo}-B`,
      assentos: {
        motorista: {
          id: `col-${Date.now()}-1`,
          nome: novaEquipe.motorista.nome,
          cargo: novaEquipe.motorista.cargo || 'Motorista Operador',
          matricula: `MAT-${Math.floor(Math.random() * 8000) + 1000}`,
          foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          telefone: novaEquipe.motorista.telefone || '(67) 99999-0000',
          status: 'presente',
          equipeId: novaEquipe.codigo,
          equipeNumero: 1,
          posicaoVeiculo: 'motorista',
        },
        frenteDir: {
          id: `col-${Date.now()}-2`,
          nome: novaEquipe.operador2.nome,
          cargo: novaEquipe.operador2.cargo || 'Operador Florestal',
          matricula: `MAT-${Math.floor(Math.random() * 8000) + 1000}`,
          foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          telefone: novaEquipe.operador2.telefone || '(67) 99999-0000',
          status: 'presente',
          equipeId: novaEquipe.codigo,
          equipeNumero: 1,
          posicaoVeiculo: 'frente_dir',
        },
        trasEsq: {
          id: `col-${Date.now()}-3`,
          nome: 'Auxiliar Operacional I',
          cargo: 'Ajudante Geral',
          matricula: `MAT-${Math.floor(Math.random() * 8000) + 1000}`,
          foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0001',
          status: 'presente',
          equipeId: `${novaEquipe.codigo}-B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
        },
        trasDir: {
          id: `col-${Date.now()}-4`,
          nome: 'Auxiliar Operacional II',
          cargo: 'Ajudante de Campo',
          matricula: `MAT-${Math.floor(Math.random() * 8000) + 1000}`,
          foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          telefone: '(67) 99999-0002',
          status: 'presente',
          equipeId: `${novaEquipe.codigo}-B`,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
        },
      },
    };

    setVeiculos((prev) => [novoVeiculo, ...prev]);
    setIsNewTeamModalOpen(false);
  };

  // Manipulador para inclusão manual ou importação de colaboradores
  const handleAdicionarColaborador = (novoColab: ColaboradorCompleto) => {
    const colaboradorReserva: Colaborador = {
      id: novoColab.id,
      nome: novoColab.nome,
      cargo: novoColab.cargo,
      matricula: novoColab.matricula,
      foto: novoColab.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      telefone: novoColab.telefone,
      status: novoColab.status,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
    };
    setColaboradoresReserva((prev) => [colaboradorReserva, ...prev]);
  };

  const handleImportarColaboradores = (novosColaboradores: ColaboradorCompleto[]) => {
    const convertidos: Colaborador[] = novosColaboradores.map((nc) => ({
      id: nc.id,
      nome: nc.nome,
      cargo: nc.cargo,
      matricula: nc.matricula,
      foto: nc.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      telefone: nc.telefone,
      status: nc.status,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
    }));
    setColaboradoresReserva((prev) => [...convertidos, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Barra de Navegação Superior Oficial */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNovaEquipeClick={() => setIsNewTeamModalOpen(true)}
      />

      {/* Conteúdo Principal da Aplicação */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Visualização de Veículos e Escala de Presença */}
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
              selectedRegional={selectedRegional}
              colaboradoresReserva={colaboradoresReserva}
              onUpdateVeiculo={handleUpdateVeiculo}
            />
          </div>
        )}

        {/* Gestão Completa de Colaboradores */}
        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            onImportarColaboradores={handleImportarColaboradores}
            onAdicionarColaborador={handleAdicionarColaborador}
          />
        )}

        {/* Gestão das Equipes Florestais */}
        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            selectedRegional={selectedRegional}
            onNovaEquipe={() => setIsNewTeamModalOpen(true)}
            onNovaEquipeClick={() => setIsNewTeamModalOpen(true)}
          />
        )}

        {/* Relatórios Gerenciais e Exportação */}
        {activeTab === 'relatorios' && (
          <ExportReports
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Modal de Criação de Nova Equipe */}
      <NewTeamModal
        isOpen={isNewTeamModalOpen}
        onClose={() => setIsNewTeamModalOpen(false)}
        onSave={handleCriarNovaEquipe}
      />

      {/* Rodapé Institucional */}
      <footer className="border-t border-border/60 bg-card/30 backdrop-blur-md py-4 text-center text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Controle de Faltas Operacional Florestal · Versão 2.4.0</span>
          <span>Polos Ribas do Rio Pardo & Água Clara - MS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;