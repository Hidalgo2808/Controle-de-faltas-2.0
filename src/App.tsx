import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsHeader } from './components/MetricsHeader';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { CollaboratorsManagement, ColaboradorCompleto } from './components/CollaboratorsManagement';
import { TeamsManagement } from './components/TeamsManagement';
import { ExportReports } from './components/ExportReports';
import { NewTeamModal } from './components/NewTeamModal';
import { VEICULOS_INICIAIS, COLABORADORES_RESERVA } from './data/mockData';
import { Regional, StatusPresenca, MotivoFalta, Veiculo, Colaborador } from './types';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary capturou erro:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('controle_faltas_veiculos');
    localStorage.removeItem('controle_faltas_reservas');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center mb-4 text-destructive">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Recuperação de Inicialização</h1>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            O aplicativo detectou uma inconsistência transitória nos dados em cache. Clique abaixo para restaurar o estado operacional.
          </p>
          <Button onClick={this.handleReset} className="gap-2 font-semibold">
            <RotateCcw className="w-4 h-4" />
            Restaurar Painel Operacional
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'colaboradores' | 'equipes' | 'relatorios'>('veiculos');
  const [selectedRegional, setSelectedRegional] = useState<Regional>('todas');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalNovaEquipeAberto, setModalNovaEquipeAberto] = useState(false);

  // Inicialização segura de veículos
  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => {
    try {
      const salvo = localStorage.getItem('controle_faltas_veiculos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.assentos) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar veículos de localStorage, usando padrão:', e);
    }
    return VEICULOS_INICIAIS;
  });

  // Inicialização segura de colaboradores reserva
  const [colaboradoresReserva, setColaboradoresReserva] = useState<Colaborador[]>(() => {
    try {
      const salvo = localStorage.getItem('controle_faltas_reservas');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar reservas de localStorage, usando padrão:', e);
    }
    return COLABORADORES_RESERVA;
  });

  // Persistência com verificação de integridade
  useEffect(() => {
    try {
      if (veiculos && veiculos.length > 0) {
        localStorage.setItem('controle_faltas_veiculos', JSON.stringify(veiculos));
      }
    } catch (e) {
      console.warn('Falha ao persistir veiculos:', e);
    }
  }, [veiculos]);

  useEffect(() => {
    try {
      if (colaboradoresReserva && colaboradoresReserva.length > 0) {
        localStorage.setItem('controle_faltas_reservas', JSON.stringify(colaboradoresReserva));
      }
    } catch (e) {
      console.warn('Falha ao persistir reservas:', e);
    }
  }, [colaboradoresReserva]);

  // Handler de alteração de presença nos assentos
  const handleStatusChange = (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => {
    setVeiculos((prevVeiculos) =>
      (prevVeiculos || []).map((v) => {
        if (!v || v.id !== veiculoId || !v.assentos) return v;

        let substitutoNome: string | undefined = undefined;
        if (substitutoId) {
          const sub = (colaboradoresReserva || []).find((r) => r?.id === substitutoId);
          if (sub) substitutoNome = sub.nome;
        }

        const assentoAtual = v.assentos[posicao];
        if (!assentoAtual) return v;

        return {
          ...v,
          assentos: {
            ...v.assentos,
            [posicao]: {
              ...assentoAtual,
              status: novoStatus,
              motivoFalta: novoStatus === 'falta' ? motivoFalta : undefined,
              observacao: novoStatus === 'falta' ? observacao : undefined,
              substitutoId: novoStatus === 'falta' && substitutoId ? substitutoId : undefined,
              substitutoNome: novoStatus === 'falta' ? substitutoNome : undefined,
            },
          },
        };
      })
    );
  };

  const handleImportarColaboradores = (novos: ColaboradorCompleto[]) => {
    if (!Array.isArray(novos) || novos.length === 0) return;
    const novosFormatados: Colaborador[] = novos.map((n) => ({
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
    setColaboradoresReserva((prev) => [...(prev || []), ...novosFormatados]);
  };

  const handleAdicionarColaborador = (novo: ColaboradorCompleto) => {
    if (!novo) return;
    const novoFormatado: Colaborador = {
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
    setColaboradoresReserva((prev) => [...(prev || []), novoFormatado]);
  };

  const veiculosFiltrados = useMemo(() => {
    const lista = veiculos || [];
    if (selectedRegional === 'todas') return lista;
    return lista.filter((v) => v?.regional === selectedRegional);
  }, [veiculos, selectedRegional]);

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
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
            <div className="space-y-6">
              <MetricsHeader
                veiculos={veiculosFiltrados}
                selectedRegional={selectedRegional}
                selectedDate={selectedDate}
                onFiltroRegionalChange={(reg) => setSelectedRegional(reg)}
                onNovaEquipe={() => setModalNovaEquipeAberto(true)}
              />
              <VehicleCardGrid
                veiculos={veiculosFiltrados}
                colaboradoresReserva={colaboradoresReserva}
                selectedRegional={selectedRegional}
                onStatusChange={handleStatusChange}
              />
            </div>
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
              selectedRegional={selectedRegional}
              onNovaEquipe={() => setModalNovaEquipeAberto(true)}
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

        {modalNovaEquipeAberto && (
          <NewTeamModal
            isOpen={modalNovaEquipeAberto}
            onClose={() => setModalNovaEquipeAberto(false)}
            onSave={(novoVeiculo) => {
              if (novoVeiculo) {
                setVeiculos((prev) => [novoVeiculo, ...(prev || [])]);
              }
              setModalNovaEquipeAberto(false);
            }}
          />
        )}
      </div>
    </AppErrorBoundary>
  );
}

export default App;