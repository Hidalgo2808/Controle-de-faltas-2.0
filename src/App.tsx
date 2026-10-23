import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal, NovaEquipePayload } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Veiculo, Colaborador, StatusPresenca, MotivoFalta, Regional } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA);
  const [modalNovaEquipeAberto, setModalNovaEquipeAberto] = useState(false);

  // Atualização de presença e substituição direta no estado global
  const handleUpdateColaboradorStatus = (
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => {
    // Busca nome do substituto caso selecionado
    const subColab = substitutoId ? colaboradoresReserva.find((c) => c.id === substitutoId) : undefined;
    const subNome = subColab ? subColab.nome : undefined;

    setVeiculos((prev) =>
      prev.map((v) => {
        const novosAssentos = { ...v.assentos };
        let mudou = false;

        (['motorista', 'frenteDir', 'trasEsq', 'trasDir'] as const).forEach((pos) => {
          const colab = novosAssentos[pos];
          if (colab && colab.id === colaboradorId) {
            novosAssentos[pos] = {
              ...colab,
              status: novoStatus,
              motivoFalta: novoStatus === 'falta' ? motivo : undefined,
              observacao: observacao,
              substitutoId: novoStatus === 'substituto' ? substitutoId : undefined,
              substitutoNome: novoStatus === 'substituto' ? subNome : undefined,
            };
            mudou = true;
          }
        });

        return mudou ? { ...v, assentos: novosAssentos } : v;
      })
    );
  };

  const handleCriarEquipe = (payload: NovaEquipePayload) => {
    const novoVeiculo: Veiculo = {
      id: `veiculo-${Date.now()}`,
      prefixo: payload.veiculoPrefixo,
      placa: payload.veiculoPlaca,
      modelo: payload.veiculoModelo || 'Toyota Hilux 4x4',
      ano: new Date().getFullYear(),
      regional: payload.regional,
      statusOperacional: 'ativo',
      equipe1Codigo: payload.codigo,
      equipe2Codigo: `${payload.codigo}-B`,
      assentos: {
        motorista: payload.motorista,
        frenteDir: payload.frenteDir,
        trasEsq: payload.trasEsq || {
          id: `colab-te-${Date.now()}`,
          nome: 'Operador Traseiro 1',
          cargo: 'Operador Florestal',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.codigo,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
        trasDir: payload.trasDir || {
          id: `colab-td-${Date.now()}`,
          nome: 'Operador Traseiro 2',
          cargo: 'Operador Florestal',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.codigo,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
      },
    };

    setVeiculos((prev) => [novoVeiculo, ...prev]);
  };

  const handleImportarColaboradores = (novos: ColaboradorCompleto[]) => {
    const novosReservas: Colaborador[] = novos.map((n) => ({
      id: n.id,
      nome: n.nome,
      cargo: n.cargo,
      matricula: n.matricula,
      foto: n.foto,
      telefone: n.telefone,
      status: n.status,
      motivoFalta: n.motivoFalta,
      observacao: n.observacao,
      substitutoNome: n.substitutoNome,
      equipeId: n.equipeId,
      equipeNumero: n.equipeNumero,
      posicaoVeiculo: n.posicaoVeiculo,
      unidade: n.unidade,
      dataAdmissao: n.dataAdmissao,
    }));

    setColaboradoresReserva((prev) => [...novosReservas, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Navegação Fixa Superior */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNovaEquipeClick={() => setModalNovaEquipeAberto(true)}
      />

      {/* Conteúdo Principal da SPA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Painel de Métricas e Composição de Equipes */}
        <MetricsHeader
          veiculos={veiculos}
          selectedRegional={selectedRegional}
          selectedDate={selectedDate}
          onFiltroRegionalChange={(reg) => setSelectedRegional(reg)}
          onNovaEquipe={() => setModalNovaEquipeAberto(true)}
        />

        {/* Abas Dinâmicas */}
        {activeTab === 'veiculos' && (
          <VehicleCardGrid
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            onUpdateColaboradorStatus={handleUpdateColaboradorStatus}
            onNovaEquipeClick={() => setModalNovaEquipeAberto(true)}
          />
        )}

        {activeTab === 'colaboradores' && (
          <CollaboratorsManagement
            veiculos={veiculos}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            onUpdateColaboradorStatus={handleUpdateColaboradorStatus}
            onImportarColaboradores={handleImportarColaboradores}
          />
        )}

        {activeTab === 'equipes' && (
          <TeamsManagement
            veiculos={veiculos}
            selectedRegional={selectedRegional}
            onNovaEquipeClick={() => setModalNovaEquipeAberto(true)}
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

      {/* Modal de Cadastro de Nova Equipe */}
      <NewTeamModal
        isOpen={modalNovaEquipeAberto}
        onClose={() => setModalNovaEquipeAberto(false)}
        colaboradoresReserva={colaboradoresReserva}
        onCriarEquipe={handleCriarEquipe}
      />
    </div>
  );
}

export default App;