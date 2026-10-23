import React, { useState } from 'react';
import {
  Car,
  User,
  Users,
  Search,
  PlusCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Veiculo, Colaborador, StatusPresenca, MotivoFalta, Regional } from '../types';
import { AttendanceModal } from './AttendanceModal';
import { Card, CardHeader, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface VehicleCardGridProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional | string;
  onUpdateColaboradorStatus?: (
    colabId: string,
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    obs?: string,
    substitutoId?: string
  ) => void;
  onSubstituirColaborador?: (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    substituto: Colaborador
  ) => void;
  onNovaEquipeClick?: () => void;
}

const statusBadgeStyles: Record<StatusPresenca, string> = {
  presente: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  falta: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  substituto: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const statusBorderStyles: Record<StatusPresenca, string> = {
  presente: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/10',
  falta: 'border-rose-500/30 hover:border-rose-500/60 bg-rose-950/10',
  substituto: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/10',
};

export const VehicleCardGrid: React.FC<VehicleCardGridProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onUpdateColaboradorStatus,
  onSubstituirColaborador,
  onNovaEquipeClick,
}) => {
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [selectedPosicao, setSelectedPosicao] = useState<
    'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir' | null
  >(null);
  const [searchTerm, setSearchTerm] = useState('');

  const veiculosFiltrados = (veiculos || []).filter((v) => {
    if (!v) return false;
    const matchRegional = selectedRegional === 'todas' || v.regional === selectedRegional;
    const matchSearch =
      !searchTerm ||
      (v.prefixo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assentos?.motorista?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assentos?.frenteDir?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assentos?.trasEsq?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assentos?.trasDir?.nome || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchRegional && matchSearch;
  });

  const handleOpenAttendance = (
    colaborador: Colaborador,
    veiculo: Veiculo,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir'
  ) => {
    setSelectedColaborador(colaborador);
    setSelectedVeiculo(veiculo);
    setSelectedPosicao(posicao);
    setModalOpen(true);
  };

  const handleSaveAttendance = (
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    obs?: string,
    substitutoId?: string
  ) => {
    if (!selectedColaborador) return;

    onUpdateColaboradorStatus?.(
      selectedColaborador.id,
      novoStatus,
      motivo,
      obs,
      substitutoId
    );

    if (
      novoStatus === 'substituto' &&
      substitutoId &&
      selectedVeiculo &&
      selectedPosicao
    ) {
      const substituto = (colaboradoresReserva || []).find((c) => c.id === substitutoId);
      if (substituto) {
        onSubstituirColaborador?.(selectedVeiculo.id, selectedPosicao, substituto);
      }
    }

    setModalOpen(false);
  };

  const renderColaboradorAssento = (
    colaborador: Colaborador | undefined,
    veiculo: Veiculo,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    etiquetaPosicao: string
  ) => {
    if (!colaborador) {
      return (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 min-h-[160px]">
          <div className="w-16 h-16 rounded-full border border-dashed border-border/80 flex items-center justify-center mb-2 text-muted-foreground/40">
            <User className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Posto Vago</span>
          <span className="text-[10px] text-muted-foreground/60">{etiquetaPosicao}</span>
        </div>
      );
    }

    const status = colaborador.status || 'presente';
    const borderStyle = statusBorderStyles[status] || statusBorderStyles.presente;
    const badgeStyle = statusBadgeStyles[status] || statusBadgeStyles.presente;

    return (
      <div
        onClick={() => handleOpenAttendance(colaborador, veiculo, posicao)}
        className={cn(
          'group relative flex flex-col items-center justify-start p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center',
          borderStyle
        )}
      >
        <div className="relative mb-2 shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-border/80 overflow-hidden shadow-md group-hover:scale-105 group-hover:border-primary/50 transition-all bg-muted flex items-center justify-center">
            {colaborador.foto ? (
              <img
                src={colaborador.foto}
                alt={colaborador.nome}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <User className="w-10 h-10 text-muted-foreground/60" />
            )}
          </div>

          <span
            className={cn(
              'absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-card ring-1 ring-black/20',
              status === 'presente'
                ? 'bg-emerald-500'
                : status === 'falta'
                ? 'bg-rose-500'
                : 'bg-amber-500'
            )}
          />
        </div>

        <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 w-full px-1">
          {colaborador.nome}
        </span>

        <span className="text-[11px] text-muted-foreground line-clamp-1 w-full px-1 mt-0.5">
          {colaborador.cargo}
        </span>

        <span className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">
          {etiquetaPosicao}
        </span>

        <div className="mt-2">
          <Badge variant="outline" className={cn('text-[10px] py-0 px-2 font-medium capitalize', badgeStyle)}>
            {status === 'substituto' ? 'Substituição' : status}
          </Badge>
        </div>

        {colaborador.substitutoNome && (
          <span className="text-[10px] text-amber-400/90 font-medium line-clamp-1 mt-1">
            Subst: {colaborador.substitutoNome}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por veículo, placa ou colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card/60 backdrop-blur-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            Exibindo <strong className="text-foreground">{veiculosFiltrados.length}</strong> de{' '}
            <strong className="text-foreground">{(veiculos || []).length}</strong> veículos
          </span>

          {onNovaEquipeClick && (
            <Button
              type="button"
              onClick={onNovaEquipeClick}
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Equipe</span>
            </Button>
          )}
        </div>
      </div>

      {veiculosFiltrados.length === 0 ? (
        <div className="w-full rounded-2xl border border-dashed border-border/80 bg-card/30 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mb-3">
            <Car className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-base font-bold text-foreground">Nenhum veículo encontrado</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Ajuste a busca ou os filtros de regional para visualizar a escala de frotas e colaboradores.
          </p>
          {onNovaEquipeClick && (
            <Button
              type="button"
              onClick={onNovaEquipeClick}
              size="sm"
              className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Primeira Equipe</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {veiculosFiltrados.map((veiculo) => (
            <Card
              key={veiculo.id}
              className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur-md shadow-md hover:shadow-lg transition-all"
            >
              <CardHeader className="px-5 py-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground tracking-tight">
                        {veiculo.prefixo}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border text-foreground font-mono font-bold">
                        {veiculo.placa}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {veiculo.modelo} {veiculo.ano ? `• ${veiculo.ano}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="capitalize text-xs font-semibold border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  >
                    {veiculo.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Equipe Dianteira (Cabine 1)
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {veiculo.equipe1Codigo || 'EQ-01'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderColaboradorAssento(
                      veiculo.assentos?.motorista,
                      veiculo,
                      'motorista',
                      'Motorista Operacional'
                    )}
                    {renderColaboradorAssento(
                      veiculo.assentos?.frenteDir,
                      veiculo,
                      'frenteDir',
                      'Auxiliar / Ajudante'
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Users className="w-3.5 h-3.5 text-teal-400" />
                      Equipe Traseira (Cabine 2)
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {veiculo.equipe2Codigo || 'EQ-02'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderColaboradorAssento(
                      veiculo.assentos?.trasEsq,
                      veiculo,
                      'trasEsq',
                      'Operador Traseiro 1'
                    )}
                    {renderColaboradorAssento(
                      veiculo.assentos?.trasDir,
                      veiculo,
                      'trasDir',
                      'Operador Traseiro 2'
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedColaborador && (
        <AttendanceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          colaborador={selectedColaborador}
          colaboradoresReserva={colaboradoresReserva}
          onSave={handleSaveAttendance}
        />
      )}
    </div>
  );
};