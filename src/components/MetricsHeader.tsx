import React, { useMemo, useState } from 'react';
import { Users, UsersRound, PlusCircle, ShieldCheck } from 'lucide-react';
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
  const { equipesCom2, equipesCom3, totalEquipes, totalVeiculos } = dadosAtivos;

  const panelButtons = [
    {
      key: 'todas' as const,
      label: 'Geral Consolidado',
      count: veiculosSeguros.length,
    },
    {
      key: 'ribas' as const,
      label: 'Ribas do Rio Pardo',
      count: veiculosSeguros.filter((v) => v?.regional === 'ribas').length,
    },
    {
      key: 'agua_clara' as const,
      label: 'Água Clara',
      count: veiculosSeguros.filter((v) => v?.regional === 'agua_clara').length,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Barra de Filtros e Criação de Nova Equipe */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-emerald-900/10 bg-white shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          {panelButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => handlePanelChange(btn.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                activePanel === btn.key
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-700/20'
                  : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-50'
              )}
            >
              <span>{btn.label}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums",
                activePanel === btn.key ? "bg-white/20 text-white font-bold" : "bg-emerald-100 text-emerald-800"
              )}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {onNovaEquipe && (
          <Button
            type="button"
            onClick={onNovaEquipe}
            size="sm"
            className="gap-2 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm shadow-emerald-700/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Equipe</span>
          </Button>
        )}
      </div>

      {/* Grid com Cards de Resumo em Branco e Verde */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Veículos em Campo */}
        <div className="rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900/60">Veículos em Campo</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-950 tabular-nums">
              {totalVeiculos}
            </span>
            <span className="text-xs text-emerald-900/60 font-medium">unidades ativas</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-900/70">
            {totalEquipes} postos florestais monitorados
          </p>
        </div>

        {/* Card 2: Duplas Operacionais */}
        <div className="rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900/60">Duplas Operacionais</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-950 tabular-nums">
              {equipesCom2}
            </span>
            <span className="text-xs text-emerald-900/60 font-medium">equipes</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-900/70">
            2 operadores escalados no veículo
          </p>
        </div>

        {/* Card 3: Trios / Postos Cheios */}
        <div className="rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900/60">Trios / Postos Cheios</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-950 tabular-nums">
              {equipesCom3}
            </span>
            <span className="text-xs text-emerald-900/60 font-medium">equipes</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-900/70">
            3 ou mais operadores escalados
          </p>
        </div>
      </div>
    </div>
  );
};