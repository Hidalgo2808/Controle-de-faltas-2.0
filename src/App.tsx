import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { AttendanceModal } from './components/AttendanceModal';
import { NewTeamModal, NovaEquipePayload } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Veiculo, Colaborador, Regional, StatusPresenca, MotivoFalta } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [veiculos, setVeiculos] = useState<Veiculo[]>(VEICULOS_INICIAIS);
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(COLABORADORES_RESERVA);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>('');

  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);

  const handleUpdateColaboradorStatus = (
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => {
    let substitutoNome: string | undefined;
    if (substitutoId) {
      const sub = colaboradoresReserva.find((c) => c.id === substitutoId);
      if (sub) substitutoNome = sub.nome;
    }

    setVeiculos((prevVeiculos) =>
      prevVeiculos.map((veiculo) => {
        const assentos = { ...veiculo.assentos };
        let atualizou = false;

        (['motorista', 'frenteDir', 'trasEsq', 'trasDir'] as const).forEach((pos) => {
          if (assentos[pos]?.id === colaboradorId) {
            assentos[pos] = {
              ...assentos[pos],
              status: novoStatus,
              motivoFalta: novoStatus === 'falta' ? motivo : undefined,
              observacao: observacao || undefined,
              substitutoId: novoStatus === 'substituto' ? substitutoId : undefined,
              substitutoNome: novoStatus === 'substituto' ? substitutoNome : undefined,
            };
            atualizou = true;
          }
        });

        if (atualizou) {
          return { ...veiculo, assentos };
        }
        return veiculo;
      })
    );

    setColaboradoresReserva((prev) =>
      prev.map((c) => {
        if (c.id === colaboradorId) {
          return {
            ...c,
            status: novoStatus,
            motivoFalta: novoStatus === 'falta' ? motivo : undefined,
            observacao: observacao || undefined,
            substitutoId: novoStatus === 'substituto' ? substitutoId : undefined,
            substitutoNome: novoStatus === 'substituto' ? substitutoNome : undefined,
          };
        }
        return c;
      })
    );
  };

  const handleOpenAttendanceModal = (colaborador: Colaborador, veiculoId: string) => {
    setSelectedColaborador(colaborador);
    setSelectedVeiculoId(veiculoId);
    setIsAttendanceModalOpen(true);
  };

  const handleCriarNovaEquipe = (payload: NovaEquipePayload) => {
    const novoVeiculo: Veiculo = {
      id: `v-novo-${Date.now()}`,
      prefixo: payload.prefixoVeiculo,
      placa: payload.placaVeiculo || 'ABC-0000',
      modelo: payload.modeloVeiculo || 'Camionete Florestal 4x4',
      ano: payload.anoVeiculo || new Date().getFullYear(),
      regional: payload.regional,
      statusOperacional: 'ativo',
      equipe1Codigo: payload.nomeEquipe1,
      equipe2Codigo: payload.nomeEquipe2,
      assentos: {
        motorista: {
          id: `colab-eq1-mot-${Date.now()}`,
          nome: payload.colaboradoresEquipe1[0] || 'Líder Equipe 1',
          cargo: 'Motorista / Líder Operacional',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.nomeEquipe1,
          equipeNumero: 1,
          posicaoVeiculo: 'motorista',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
        frenteDir: {
          id: `colab-eq1-aux-${Date.now()}`,
          nome: payload.colaboradoresEquipe1[1] || 'Auxiliar Equipe 1',
          cargo: 'Operador Florestal',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.nomeEquipe1,
          equipeNumero: 1,
          posicaoVeiculo: 'frente_dir',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
        trasEsq: {
          id: `colab-eq2-mot-${Date.now()}`,
          nome: payload.colaboradoresEquipe2[0] || 'Líder Equipe 2',
          cargo: 'Operador de Máquina',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.nomeEquipe2,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_esq',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
        trasDir: {
          id: `colab-eq2-aux-${Date.now()}`,
          nome: payload.colaboradoresEquipe2[1] || 'Auxiliar Equipe 2',
          cargo: 'Operador Florestal',
          foto: '',
          telefone: '(67) 99999-0000',
          status: 'presente',
          equipeId: payload.nomeEquipe2,
          equipeNumero: 2,
          posicaoVeiculo: 'tras_dir',
          unidade: payload.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
        },
      },
    };

    setVeiculos((prev) => [novoVeiculo, ...prev]);
    setIsNewTeamModalOpen(false);
  };

  const handleImportarColaboradores = (novosColaboradores: ColaboradorCompleto[]) => {
    const convertidos: Colaborador[] = novosColaboradores.map((nc) => ({
      id: nc.id,
      nome: nc.nome,
      cargo: nc.cargo,
      matricula: nc.matricula,
      foto: nc.foto,
      telefone: nc.telefone,
      status: nc.status,
      motivoFalta: nc.motivoFalta,
      observacao: nc.observacao,
      substitutoNome: nc.substitutoNome,
      equipeId: nc.equipeId,
      equipeNumero: nc.equipeNumero,
      posicaoVeiculo: nc.posicaoVeiculo,
      unidade: nc.unidade,
      dataAdmissao: nc.dataAdmissao,
    }));

    setColaboradoresReserva((prev) => [...convertidos, ...prev]);
  };

  const veiculosFiltrados = useMemo(() => {
    if (selectedRegional === 'todas') return veiculos;
    return veiculos.filter((v) => v.regional === selectedRegional);
  }, [veiculos, selectedRegional]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedRegional={selectedRegional}
        onRegionalChange={setSelectedRegional}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNovaEquipeClick={() => setIsNewTeamModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <MetricsHeader
          veiculos={veiculos}
          selectedRegional={selectedRegional}
          selectedDate={selectedDate}
          onFiltroRegionalChange={(reg) => setSelectedRegional(reg)}
          onNovaEquipe={() => setIsNewTeamModalOpen(true)}
        />

        {activeTab === 'veiculos' && (
          <VehicleCardGrid
            veiculos={veiculosFiltrados}
            colaboradoresReserva={colaboradoresReserva}
            selectedRegional={selectedRegional}
            onUpdateColaboradorStatus={handleUpdateColaboradorStatus}
            onOpenAttendanceModal={handleOpenAttendanceModal}
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
            veiculos={veiculosFiltrados}
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

      {isAttendanceModalOpen && selectedColaborador && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => {
            setIsAttendanceModalOpen(false);
            setSelectedColaborador(null);
            setSelectedVeiculoId('');
          }}
          colaborador={selectedColaborador}
          veiculoId={selectedVeiculoId}
          colaboradoresReserva={colaboradoresReserva}
          onConfirm={(colaboradorId, novoStatus, motivo, observacao, substitutoId) => {
            handleUpdateColaboradorStatus(colaboradorId, novoStatus, motivo, observacao, substitutoId);
          }}
        />
      )}

      {isNewTeamModalOpen && (
        <NewTeamModal
          isOpen={isNewTeamModalOpen}
          onClose={() => setIsNewTeamModalOpen(false)}
          onSave={handleCriarNovaEquipe}
          colaboradoresReserva={colaboradoresReserva}
          defaultRegional={selectedRegional}
        />
      )}
    </div>
  );
}

export default App;