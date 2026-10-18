import React, { useState } from 'react';
import {
  Car,
  User,
  Users,
  AlertTriangle,
  UserCheck,
  UserX,
  Phone,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Veiculo, Colaborador, StatusPresenca, MotivoFalta, Regional } from '../types';
import { AttendanceModal } from './AttendanceModal';
import { cn } from '@/lib/utils';

export interface VehicleCardGridProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional | string;
  onStatusChange?: (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    observacao?: string,
    substitutoId?: string,
    substitutoNome?: string
  ) => void;
  onAdicionarColaborador?: (veiculoId: string, equipeNumero: 1 | 2) => void;
  onVerDetalhesEquipe?: (veiculoId: string) => void;
}

const statusBadgeConfig: Record<StatusPresenca, { label: string; className: string; icon: React.ElementType }> = {
  presente: {
    label: 'Presente',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: UserCheck,
  },
  falta: {
    label: 'Falta',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: UserX,
  },
  substituto: {
    label: 'Substituto',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: ArrowRightLeft,
  },
};

const posicaoLabel: Record<string, string> = {
  motorista: 'Motorista (Eq. 1)',
  frenteDir: 'Apoio Dianteiro (Eq. 1)',
  trasEsq: 'Apoio Traseiro Esq. (Eq. 2)',
  trasDir: 'Apoio Traseiro Dir. (Eq. 2)',
};

export const VehicleCardGrid: React.FC<VehicleCardGridProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onStatusChange,
  onAdicionarColaborador,
  onVerDetalhesEquipe,
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir'>('motorista');

  const veiculosFiltrados = (veiculos || []).filter((v) => {
    if (!v) return false;
    if (selectedRegional === 'todas') return true;
    return v.regional === selectedRegional;
  });

  const abrirModalChamada = (
    veiculo: Veiculo,
    colaborador: Colaborador,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir'
  ) => {
    setVeiculoSelecionado(veiculo);
    setColaboradorSelecionado(colaborador);
    setPosicaoSelecionada(posicao);
    setModalAberto(true);
  };

  const handleSalvarStatus = (
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    observacao?: string,
    substitutoId?: string,
    substitutoNome?: string
  ) => {
    if (veiculoSelecionado && onStatusChange) {
      onStatusChange(
        veiculoSelecionado.id,
        posicaoSelecionada,
        novoStatus,
        motivoFalta,
        observacao,
        substitutoId,
        substitutoNome
      );
    }
    setModalAberto(false);
  };

  if (veiculosFiltrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40">
        <Car className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Nenhum veículo encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Não há veículos cadastrados para esta regional ou filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {veiculosFiltrados.map((veiculo) => {
          if (!veiculo || !veiculo.assentos) return null;

          const assentosArray: Array<{
            colab: Colaborador;
            posKey: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir';
            equipeNum: 1 | 2;
          }> = [
            { colab: veiculo.assentos.motorista, posKey: 'motorista', equipeNum: 1 },
            { colab: veiculo.assentos.frenteDir, posKey: 'frenteDir', equipeNum: 1 },
            { colab: veiculo.assentos.trasEsq, posKey: 'trasEsq', equipeNum: 2 },
            { colab: veiculo.assentos.trasDir, posKey: 'trasDir', equipeNum: 2 },
          ];

          const totalFaltas = assentosArray.filter((a) => a.colab?.status === 'falta').length;
          const totalPresentes = assentosArray.filter((a) => a.colab?.status === 'presente' || a.colab?.status === 'substituto').length;

          return (
            <Card
              key={veiculo.id}
              className={cn(
                'group relative overflow-hidden transition-all duration-200 hover:shadow-xl border-border/80 bg-card/80 backdrop-blur-sm',
                totalFaltas > 0 && 'border-rose-500/30'
              )}
            >
              {/* Header do Card com Prefixo, Placa e Regional */}
              <CardHeader className="p-4 pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        {veiculo.prefixo}
                        <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono font-medium">
                          {veiculo.placa}
                        </span>
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{veiculo.modelo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-2 py-0.5 font-semibold',
                        veiculo.regional === 'ribas'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-teal-500/30 text-teal-400 bg-teal-500/10'
                      )}
                    >
                      {veiculo.regional === 'ribas' ? 'Ribas' : 'Água Clara'}
                    </Badge>
                  </div>
                </div>

                {/* Sub-barra com status das duas equipes */}
                <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {veiculo.equipe1Codigo}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      {veiculo.equipe2Codigo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {totalFaltas > 0 ? (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        {totalFaltas} {totalFaltas === 1 ? 'falta' : 'faltas'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Equipe 100%
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Assentos dos Colaboradores */}
              <CardContent className="p-3.5 space-y-2">
                {assentosArray.map(({ colab, posKey, equipeNum }) => {
                  if (!colab) return null;
                  const cfg = statusBadgeConfig[colab.status] || statusBadgeConfig.presente;
                  const IconStatus = cfg.icon;

                  return (
                    <div
                      key={colab.id || posKey}
                      onClick={() => abrirModalChamada(veiculo, colab, posKey)}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                        'hover:border-primary/40 hover:bg-muted/40 active:scale-[0.99]',
                        colab.status === 'falta'
                          ? 'border-rose-500/25 bg-rose-500/5 hover:border-rose-500/40'
                          : colab.status === 'substituto'
                          ? 'border-amber-500/25 bg-amber-500/5 hover:border-amber-500/40'
                          : 'border-border/50 bg-card/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {colab.foto ? (
                          <img
                            src={colab.foto}
                            alt={colab.nome}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                            <User className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {colab.nome}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {colab.cargo}
                          </p>
                          {colab.status === 'substituto' && colab.substitutoNome && (
                            <p className="text-[10px] text-amber-400 font-medium truncate mt-0.5">
                              Subst. por: {colab.substitutoNome}
                            </p>
                          )}
                          {colab.status === 'falta' && colab.motivoFalta && (
                            <p className="text-[10px] text-rose-400 font-medium truncate mt-0.5">
                              {colab.motivoFalta}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold', cfg.className)}
                        >
                          <IconStatus className="w-2.5 h-2.5" />
                          {cfg.label}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          {posicaoLabel[posKey] || posKey}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalAberto && colaboradorSelecionado && veiculoSelecionado && (
        <AttendanceModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          colaborador={colaboradorSelecionado}
          veiculo={veiculoSelecionado}
          posicao={posicaoSelecionada}
          colaboradoresReserva={colaboradoresReserva}
          onSalvarStatus={handleSalvarStatus}
        />
      )}
    </>
  );
};