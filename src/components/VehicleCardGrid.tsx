import React, { useState } from 'react';
import {
  Car,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
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
    colabId: string,
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    obs?: string,
    substituto?: Colaborador
  ) => {
    onUpdateColaboradorStatus?.(
      colabId,
      novoStatus,
      motivo,
      obs,
      substituto?.id
    );

    if (
      novoStatus === 'substituto' &&
      substituto &&
      selectedVeiculo &&
      selectedPosicao
    ) {
      onSubstituirColaborador?.(selectedVeiculo.id, selectedPosicao, substituto);
    }
  };

  const renderColaboradorAssento = (
    colaborador: Colaborador | undefined,
    veiculo: Veiculo,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir'
  ) => {
    if (!colaborador) {
      return (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 min-h-[148px]">
          <div className="w-14 h-14 rounded-full border border-dashed border-border/80 flex items-center justify-center mb-2 text-muted-foreground/50">
            <User className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Vago</span>
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

        {/* Nome do Colaborador abaixo da foto */}
        <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 w-full px-1">
          {colaborador.nome}
        </span>

        {/* Cargo */}
        <span className="text-[11px] text-muted-foreground line-clamp-1 w-full px-1 mt-0.5">
          {colaborador.cargo}
        </span>

        {/* Badge de Status */}
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

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground self-end sm:self-center">
          <span className="tabular-nums font-bold text-foreground">{veiculosFiltrados.length}</span>{' '}
          {veiculosFiltrados.length === 1 ? 'veículo listado' : 'veículos listados'}
        </div>
      </div>

      {veiculosFiltrados.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border flex items-center justify-center mx-auto mb-3">
            <Car className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">Nenhum veículo encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Não encontramos registros para o filtro ou termo de busca selecionado no momento.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {veiculosFiltrados.map((veiculo) => {
            const ativos = [
              veiculo.assentos?.motorista,
              veiculo.assentos?.frenteDir,
              veiculo.assentos?.trasEsq,
              veiculo.assentos?.trasDir,
            ].filter(
              (c) => c && (c.status === 'presente' || c.status === 'substituto')
            ).length;

            return (
              <Card
                key={veiculo.id}
                className="overflow-hidden border border-border/80 bg-card/70 backdrop-blur-md hover:border-border transition-all duration-200 shadow-lg flex flex-col"
              >
                {/* Cabeçalho do Card de Veículo */}
                <div className="px-5 py-3.5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base tracking-tight text-foreground">
                          {veiculo.prefixo}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono uppercase tracking-wider py-0 px-1.5 border-border/80 text-muted-foreground"
                        >
                          {veiculo.placa}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {veiculo.modelo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-semibold py-1 px-2.5',
                        veiculo.regional === 'ribas'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-teal-500/30 text-teal-400 bg-teal-500/10'
                      )}
                    >
                      {veiculo.regional === 'ribas' ? 'Ribas' : 'Água Clara'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-border/60 bg-muted/40 tabular-nums">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{ativos}/4</span>
                    </div>
                  </div>
                </div>

                {/* Grid dos 4 Assentos Operacionais */}
                <CardContent className="p-4 sm:p-5 flex-1">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {renderColaboradorAssento(
                      veiculo.assentos?.motorista,
                      veiculo,
                      'motorista'
                    )}
                    {renderColaboradorAssento(
                      veiculo.assentos?.frenteDir,
                      veiculo,
                      'frenteDir'
                    )}
                    {renderColaboradorAssento(
                      veiculo.assentos?.trasEsq,
                      veiculo,
                      'trasEsq'
                    )}
                    {renderColaboradorAssento(
                      veiculo.assentos?.trasDir,
                      veiculo,
                      'trasDir'
                    )}
                  </div>
                </CardContent>

                {/* Rodapé informativo sutil */}
                <div className="px-5 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Toque em qualquer colaborador para marcar presença ou substituição</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedColaborador && (
        <AttendanceModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedColaborador(null);
            setSelectedVeiculo(null);
            setSelectedPosicao(null);
          }}
          colaborador={selectedColaborador}
          colaboradoresReserva={colaboradoresReserva}
          onSave={handleSaveAttendance}
        />
      )}
    </div>
  );
};