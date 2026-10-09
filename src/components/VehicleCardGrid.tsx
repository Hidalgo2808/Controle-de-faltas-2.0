import React, { useState, useMemo } from 'react';
import {
  Car,
  Search,
  Filter,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle,
  Users,
  MapPin,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Veiculo, Colaborador, StatusPresenca, MotivoFalta, Regional } from '../types';
import { VehicleTopView, VehicleZone } from './VehicleTopView';
import { AttendanceModal } from './AttendanceModal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface VehicleCardGridProps {
  veiculos: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  onUpdateStatus: (
    veiculoId: string,
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    substituto?: Colaborador
  ) => void;
  selectedRegional: Regional;
  onOpenNewTeamModal?: () => void;
}

export const VehicleCardGrid: React.FC<VehicleCardGridProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  onUpdateStatus,
  selectedRegional = 'todas',
  onOpenNewTeamModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'com_faltas' | 'completos'>('todos');
  const [activeUnitTab, setActiveUnitTab] = useState<'todas' | 'ribas' | 'agua_clara'>('todas');

  // Modal de Presença
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string | null>(null);

  // Sincroniza o tab interno com o filtro global de regional caso mude
  const effectiveRegional = selectedRegional !== 'todas' ? selectedRegional : activeUnitTab;

  const handleSeatClick = (veiculoId: string, _posicao: VehicleZone, colaborador: Colaborador) => {
    setSelectedVeiculoId(veiculoId);
    setSelectedColaborador(colaborador);
    setModalOpen(true);
  };

  const handleSaveAttendance = (
    veiculoId: string,
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    substituto?: Colaborador
  ) => {
    onUpdateStatus(veiculoId, colaboradorId, novoStatus, motivoFalta, substituto);
    setModalOpen(false);
    setSelectedColaborador(null);
    setSelectedVeiculoId(null);
  };

  // Filtragem de veículos
  const filteredVeiculos = useMemo(() => {
    return (veiculos || []).filter((veiculo) => {
      if (!veiculo) return false;

      // Filtro por Unidade / Regional
      if (effectiveRegional !== 'todas' && veiculo.regional !== effectiveRegional) {
        return false;
      }

      // Filtro por Busca (prefixo, placa, modelo, ou nomes dos colaboradores)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const prefixoMatch = (veiculo.prefixo || '').toLowerCase().includes(term);
        const placaMatch = (veiculo.placa || '').toLowerCase().includes(term);
        const modeloMatch = (veiculo.modelo || '').toLowerCase().includes(term);
        const eq1Match = (veiculo.equipe1Codigo || '').toLowerCase().includes(term);
        const eq2Match = (veiculo.equipe2Codigo || '').toLowerCase().includes(term);

        const assentos = [
          veiculo.assentos?.motorista?.nome,
          veiculo.assentos?.frenteDir?.nome,
          veiculo.assentos?.trasEsq?.nome,
          veiculo.assentos?.trasDir?.nome,
        ];
        const colabMatch = assentos.some((nome) => (nome || '').toLowerCase().includes(term));

        if (!prefixoMatch && !placaMatch && !modeloMatch && !eq1Match && !eq2Match && !colabMatch) {
          return false;
        }
      }

      // Filtro por Status da Equipe
      if (filterStatus !== 'todos') {
        const assentos = [
          veiculo.assentos?.motorista?.status,
          veiculo.assentos?.frenteDir?.status,
          veiculo.assentos?.trasEsq?.status,
          veiculo.assentos?.trasDir?.status,
        ];

        const temFalta = assentos.some((st) => st === 'falta');
        if (filterStatus === 'com_faltas' && !temFalta) return false;
        if (filterStatus === 'completos' && temFalta) return false;
      }

      return true;
    });
  }, [veiculos, effectiveRegional, searchTerm, filterStatus]);

  // Agrupamento por unidade para enquadramento perfeito em "Todas as Unidades"
  const veiculosPorUnidade = useMemo(() => {
    const ribas = filteredVeiculos.filter((v) => v.regional === 'ribas');
    const aguaClara = filteredVeiculos.filter((v) => v.regional === 'agua_clara');
    return { ribas, aguaClara };
  }, [filteredVeiculos]);

  // Contadores rápidos de enquadramento
  const contadores = useMemo(() => {
    const totalRibas = (veiculos || []).filter((v) => v.regional === 'ribas').length;
    const totalAguaClara = (veiculos || []).filter((v) => v.regional === 'agua_clara').length;
    return {
      total: (veiculos || []).length,
      ribas: totalRibas,
      aguaClara: totalAguaClara,
    };
  }, [veiculos]);

  const renderVeiculoCard = (veiculo: Veiculo) => {
    const assentos = [
      veiculo.assentos?.motorista,
      veiculo.assentos?.frenteDir,
      veiculo.assentos?.trasEsq,
      veiculo.assentos?.trasDir,
    ];

    const presentes = assentos.filter((a) => a?.status === 'presente').length;
    const faltas = assentos.filter((a) => a?.status === 'falta').length;
    const substitutos = assentos.filter((a) => a?.status === 'substituto').length;
    const isEquipeCompleta = faltas === 0;

    return (
      <Card
        key={veiculo.id}
        className={cn(
          'relative overflow-hidden transition-all duration-200 border bg-card/85 hover:shadow-xl hover:border-border/80 flex flex-col',
          faltas > 0
            ? 'border-rose-500/30 ring-1 ring-rose-500/10'
            : substitutos > 0
            ? 'border-amber-500/30 ring-1 ring-amber-500/10'
            : 'border-border/60 hover:border-primary/40'
        )}
      >
        {/* Faixa superior com identificação e status do veículo */}
        <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm shrink-0',
                veiculo.regional === 'ribas'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
              )}
            >
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                  {veiculo.prefixo}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono font-semibold border border-border/40">
                  {veiculo.placa}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>{veiculo.modelo}</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/90">
                  <MapPin className="w-3 h-3 text-primary/70" />
                  {veiculo.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isEquipeCompleta ? 'success' : 'destructive'}
              className="text-[11px] px-2.5 py-0.5 font-semibold"
            >
              {isEquipeCompleta ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completa
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {faltas} Falta{faltas > 1 ? 's' : ''}
                </span>
              )}
            </Badge>
          </div>
        </div>

        {/* Resumo da composição das Equipes 1 e 2 */}
        <div className="px-4 py-2 bg-muted/10 border-b border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Dianteira: <span className="text-foreground">{veiculo.equipe1Codigo || 'EQ-1'}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Traseira: <span className="text-foreground">{veiculo.equipe2Codigo || 'EQ-2'}</span></span>
          </div>
        </div>

        {/* Visualização e Grid dos 4 Assentos */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <VehicleTopView
            veiculo={veiculo}
            onAssentoClick={(posicao, colab) => handleSeatClick(veiculo.id, posicao, colab)}
          />

          {/* Rodapé do card com métricas rápidas de presença */}
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <UserCheck className="w-3.5 h-3.5" /> {presentes} pres.
              </span>
              {faltas > 0 && (
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <UserX className="w-3.5 h-3.5" /> {faltas} falta
                </span>
              )}
              {substitutos > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5" /> {substitutos} subst.
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              Clique no assento p/ alterar
            </span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Barra de Filtros e Enquadramento Superior */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-md">
        {/* Seletor Rápido de Enquadramento por Unidade */}
        <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border/50 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveUnitTab('todas')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              effectiveRegional === 'todas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas as Unidades</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-bold bg-background/50">
              {contadores.total}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveUnitTab('ribas')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              effectiveRegional === 'ribas'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ribas do Rio Pardo</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-bold bg-background/50">
              {contadores.ribas}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveUnitTab('agua_clara')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              effectiveRegional === 'agua_clara'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Água Clara</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 font-bold bg-background/50">
              {contadores.aguaClara}
            </Badge>
          </button>
        </div>

        {/* Busca e Filtros de Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar carro, placa ou colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/30"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setFilterStatus('todos')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'todos'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('com_faltas')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
                filterStatus === 'com_faltas'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-muted-foreground hover:text-rose-400'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Com Faltas
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('completos')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
                filterStatus === 'completos'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-emerald-400'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Completos
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO DO ENQUADRAMENTO */}
      {filteredVeiculos.length === 0 ? (
        <Card className="border-dashed p-12 text-center bg-card/40">
          <div className="w-16 h-16 rounded-full bg-muted/40 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Car className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Nenhum veículo encontrado</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Não encontramos veículos para os filtros e critérios de busca selecionados nesta unidade.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('todos');
              setActiveUnitTab('todas');
            }}
          >
            Limpar Filtros
          </Button>
        </Card>
      ) : effectiveRegional === 'todas' ? (
        /* Enquadramento Duplo e Harmônico para "Todas as Unidades" */
        <div className="space-y-8">
          {/* Seção 1: Ribas do Rio Pardo */}
          {veiculosPorUnidade.ribas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                    Regional Ribas do Rio Pardo
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold">
                      {veiculosPorUnidade.ribas.length} Veículo{veiculosPorUnidade.ribas.length > 1 ? 's' : ''}
                    </Badge>
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Operações Florestais e Transporte Integrado
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {veiculosPorUnidade.ribas.map(renderVeiculoCard)}
              </div>
            </div>
          )}

          {/* Seção 2: Água Clara */}
          {veiculosPorUnidade.aguaClara.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20"></div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                    Regional Água Clara
                    <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold">
                      {veiculosPorUnidade.aguaClara.length} Veículo{veiculosPorUnidade.aguaClara.length > 1 ? 's' : ''}
                    </Badge>
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Unidade Florestal de Apoio e Silvicultura
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {veiculosPorUnidade.aguaClara.map(renderVeiculoCard)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Enquadramento Direto para Unidade Específica */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {filteredVeiculos.map(renderVeiculoCard)}
        </div>
      )}

      {/* Modal de Presença / Falta / Substituto */}
      {modalOpen && selectedColaborador && selectedVeiculoId && (
        <AttendanceModal
          colaborador={selectedColaborador}
          veiculoId={selectedVeiculoId}
          onClose={() => {
            setModalOpen(false);
            setSelectedColaborador(null);
            setSelectedVeiculoId(null);
          }}
          onSave={handleSaveAttendance}
          colaboradoresReserva={colaboradoresReserva}
        />
      )}
    </div>
  );
};