import React, { useState } from 'react';
import { Veiculo, Colaborador, Regional, StatusPresenca, MotivoFalta } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AttendanceModal } from './AttendanceModal';
import { Users, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VehicleCardGridProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional;
  onUpdateAssentoStatus?: (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substituto?: { id: string; nome: string }
  ) => void;
  onUpdateStatus?: (
    veiculoId: string,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substituto?: { id: string; nome: string }
  ) => void;
}

const statusBadgeConfig: Record<StatusPresenca, { label: string; className: string; icon: any }> = {
  presente: {
    label: 'Presente',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
  },
  falta: {
    label: 'Falta',
    className: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: AlertCircle,
  },
  substituto: {
    label: 'Substituto',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: RefreshCw,
  },
};

export const VehicleCardGrid: React.FC<VehicleCardGridProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onUpdateAssentoStatus,
  onUpdateStatus,
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoAtivo, setVeiculoAtivo] = useState<Veiculo | null>(null);
  const [posicaoAtiva, setPosicaoAtiva] = useState<'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir' | null>(null);
  const [colaboradorAtivo, setColaboradorAtivo] = useState<Colaborador | null>(null);

  const veiculosFiltrados = (veiculos || []).filter((v) => {
    if (!v) return false;
    if (selectedRegional === 'todas') return true;
    return v.regional === selectedRegional;
  });

  const abrirModalPresenca = (
    veiculo: Veiculo,
    posicao: 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir',
    colaborador: Colaborador
  ) => {
    setVeiculoAtivo(veiculo);
    setPosicaoAtiva(posicao);
    setColaboradorAtivo(colaborador);
    setModalAberto(true);
  };

  const handleSalvarPresenca = (
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substituto?: { id: string; nome: string }
  ) => {
    if (!veiculoAtivo || !posicaoAtiva) return;
    const fn = onUpdateAssentoStatus || onUpdateStatus;
    if (typeof fn === 'function') {
      fn(veiculoAtivo.id, posicaoAtiva, novoStatus, motivo, observacao, substituto);
    }
    setModalAberto(false);
  };

  if (!veiculosFiltrados || veiculosFiltrados.length === 0) {
    return (
      <div className="w-full text-center py-16 px-4 border border-dashed border-border/80 rounded-3xl bg-card/40">
        <Users className="w-10 h-10 mx-auto text-muted-foreground opacity-50 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Nenhum veículo encontrado</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Não há viaturas cadastradas para o filtro regional selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {veiculosFiltrados.map((veiculo) => {
          const assentos = [
            { key: 'motorista' as const, label: 'Motorista (Eq. 1)', colab: veiculo.assentos?.motorista },
            { key: 'frenteDir' as const, label: 'Frente Dir. (Eq. 1)', colab: veiculo.assentos?.frenteDir },
            { key: 'trasEsq' as const, label: 'Apoio Trás Esq. (Eq. 2)', colab: veiculo.assentos?.trasEsq },
            { key: 'trasDir' as const, label: 'Apoio Trás Dir. (Eq. 2)', colab: veiculo.assentos?.trasDir },
          ];

          return (
            <Card key={veiculo.id} className="overflow-hidden border-border/80 hover:border-primary/40 transition-all">
              <div className="px-4 py-3 bg-muted/30 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{veiculo.prefixo}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {veiculo.placa} • {veiculo.modelo}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {veiculo.regional === 'ribas' ? 'Ribas' : 'Água Clara'}
                </Badge>
              </div>

              <CardContent className="p-3 space-y-2">
                {assentos.map(({ key, label, colab }) => {
                  if (!colab) return null;
                  const cfg = statusBadgeConfig[colab.status || 'presente'];
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={key}
                      onClick={() => abrirModalPresenca(veiculo, key, colab)}
                      className="p-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {label}
                        </p>
                        <p className="text-xs font-bold text-foreground truncate">{colab.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{colab.cargo}</p>
                      </div>

                      <div className={cn('px-2 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1 shrink-0', cfg.className)}>
                        <Icon className="w-3 h-3" />
                        <span>{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalAberto && colaboradorAtivo && (
        <AttendanceModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          colaborador={colaboradorAtivo}
          onSave={handleSalvarPresenca}
          colaboradoresReserva={colaboradoresReserva}
        />
      )}
    </div>
  );
};