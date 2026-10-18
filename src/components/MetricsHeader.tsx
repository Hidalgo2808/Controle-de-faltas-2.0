import React, { useMemo, useState } from 'react';
import { Users, UsersRound, TrendingUp, PlusCircle } from 'lucide-react';
import { Veiculo, MetricasGerais, Regional } from '../types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface MetricsHeaderProps {
  veiculos?: Veiculo[];
  metricas?: MetricasGerais;
  selectedRegional?: Regional | string;
  selectedDate?: Date;
  onFiltroRegionalChange?: (regional: 'todas' | 'ribas' | 'agua_clara') => void;
  onNovaEquipe?: () => void;
}

function calcularEquipes(lista: Veiculo[] = []) {
  let equipesCom2 = 0;
  let equipesCom3 = 0;

  (lista || []).forEach((v) => {
    if (!v || !v.assentos) return;
    const eq1 = [v.assentos?.motorista, v.assentos?.frenteDir].filter(Boolean);
    const eq2 = [v.assentos?.trasEsq, v.assentos?.trasDir].filter(Boolean);

    const ativosEq1 = eq1.filter((c) => c && (c.status === 'presente' || c.status === 'substituto')).length;
    const ativosEq2 = eq2.filter((c) => c && (c.status === 'presente' || c.status === 'substituto')).length;

    if (ativosEq1 === 1) equipesCom2++;
    else if (ativosEq1 >= 2) equipesCom3++;

    if (ativosEq2 === 1) equipesCom2++;
    else if (ativosEq2 >= 2) equipesCom3++;
  });

  return {
    totalVeiculos: (lista || []).length,
    totalEquipes: (lista || []).length * 2,
    equipesCom2,
    equipesCom3,
  };
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  veiculos = [],
  onFiltroRegionalChange,
  onNovaEquipe,
}) => {
  const [activePanel, setActivePanel] = useState<'todas' | 'ribas' | 'agua_clara'>('todas');

  const handlePanelChange = (panel: 'todas' | 'ribas' | 'agua_clara') => {
    setActivePanel(panel);
    onFiltroRegionalChange?.(panel);
  };

  const veiculosSeguros = veiculos || [];

  const veiculosFiltrados = useMemo(() => {
    if (activePanel === 'todas') return veiculosSeguros;
    return veiculosSeguros.filter((v) => v?.regional === activePanel);
  }, [veiculosSeguros, activePanel]);

  const dadosAtivos = useMemo(() => calcularEquipes(veiculosFiltrados), [veiculosFiltrados]);
  const { equipesCom2, equipesCom3, totalEquipes } = dadosAtivos;

  const panelButtons = [
    {
      key: 'todas' as const,
      label: 'Geral',
      activeColor: 'bg-primary text-primary-foreground border-primary/50',
      dot: 'bg-primary',
      count: veiculosSeguros.length,
    },
    {
      key: 'ribas' as const,
      label: 'Ribas',
      activeColor: 'bg-emerald-600 text-white border-emerald-500/50',
      dot: 'bg-emerald-400',
      count: veiculosSeguros.filter((v) => v?.regional === 'ribas').length,
    },
    {
      key: 'agua_clara' as const,
      label: 'Água Clara',
      activeColor: 'bg-teal-600 text-white border-teal-500/50',
      dot: 'bg-teal-400',
      count: veiculosSeguros.filter((v) => v?.regional === 'agua_clara').length,
    },
  ];

  const regionalColor = {
    todas: {
      badge: 'bg-primary/10 border-primary/25 text-primary',
      dot: 'bg-primary',
    },
    ribas: {
      badge: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      dot: 'bg-emerald-400',
    },
    agua_clara: {
      badge: 'bg-teal-500/10 border-teal-500/25 text-teal-400',
      dot: 'bg-teal-400',
    },
  };

  const colors = regionalColor[activePanel] || regionalColor.todas;
  const activePanelInfo = panelButtons.find((b) => b.key === activePanel);

  const cards = [
    {
      key: '2',
      label: 'Duplas Operacionais',
      descricao: '2 operadores ativos',
      total: equipesCom2,
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      numColor: 'text-emerald-300',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      borderColor: 'border-emerald-500/25',
      gradientBg: 'from-emerald-500/8 to-transparent',
    },
    {
      key: '3',
      label: 'Trios / Postos Cheios',
      descricao: '3+ operadores ativos',
      total: equipesCom3,
      icon: <UsersRound className="w-5 h-5 text-teal-400" />,
      numColor: 'text-teal-300',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
      borderColor: 'border-teal-500/25',
      gradientBg: 'from-teal-500/8 to-transparent',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="w-full rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-border/40 bg-gradient-to-r from-muted/30 to-muted/10 space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">Composição de Equipes</span>
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold',
                  colors.badge
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                <span>{activePanelInfo?.label ?? 'Geral'}</span>
                <span className="opacity-60">·</span>
                <span className="tabular-nums">{totalEquipes} equipes</span>
              </div>
            </div>

            {onNovaEquipe && (
              <Button
                type="button"
                onClick={onNovaEquipe}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Equipe</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {panelButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => handlePanelChange(btn.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
                  activePanel === btn.key
                    ? btn.activeColor + ' shadow-sm'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:bg-muted/40'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', btn.dot)} />
                {btn.label}
                <span
                  className={cn(
                    'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums',
                    activePanel === btn.key ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((card) => (
              <div
                key={card.key}
                className={cn(
                  'relative rounded-xl border p-4 bg-gradient-to-br overflow-hidden',
                  card.borderColor,
                  card.gradientBg
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', card.iconBg)}>
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <p className={cn('text-3xl font-extrabold leading-none tabular-nums', card.numColor)}>{card.total}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">equipes</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-foreground">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground">{card.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};