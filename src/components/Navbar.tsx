import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Calendar,
  Layers,
  Users,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { Regional } from '../types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  activeTab?: 'veiculos' | 'colaboradores' | 'equipes' | 'relatorios';
  onTabChange?: (tab: 'veiculos' | 'colaboradores' | 'equipes' | 'relatorios') => void;
  selectedRegional: Regional;
  onRegionalChange: (regional: Regional) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onNovaEquipeClick?: () => void;
}

const REGIONAIS: Array<{
  id: Regional;
  label: string;
  tag: string;
  description: string;
}> = [
  {
    id: 'todas',
    label: 'Todas as Unidades',
    tag: 'Geral',
    description: 'Visão consolidada da operação florestal',
  },
  {
    id: 'ribas',
    label: 'Ribas do Rio Pardo',
    tag: 'RRP',
    description: 'Polo Regional Ribas do Rio Pardo - MS',
  },
  {
    id: 'agua_clara',
    label: 'Água Clara',
    tag: 'AGC',
    description: 'Polo Regional Água Clara - MS',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'veiculos',
  onTabChange,
  selectedRegional = 'todas',
  onRegionalChange,
  selectedDate = new Date(),
  onDateChange,
}) => {
  const [dropdownUnidadeAberto, setDropdownUnidadeAberto] = useState(false);
  const [dropdownDataAberto, setDropdownDataAberto] = useState(false);
  const dropdownUnidadeRef = useRef<HTMLDivElement>(null);
  const dropdownDataRef = useRef<HTMLDivElement>(null);

  const unidadeAtual = REGIONAIS.find((r) => r.id === selectedRegional) || REGIONAIS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownUnidadeRef.current &&
        !dropdownUnidadeRef.current.contains(event.target as Node)
      ) {
        setDropdownUnidadeAberto(false);
      }
      if (
        dropdownDataRef.current &&
        !dropdownDataRef.current.contains(event.target as Node)
      ) {
        setDropdownDataAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabSelect = (tab: 'veiculos' | 'colaboradores' | 'equipes' | 'relatorios') => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  const navItems = [
    { id: 'veiculos' as const, label: 'Veículos & Escala', icon: Car },
    { id: 'colaboradores' as const, label: 'Colaboradores', icon: Users },
    { id: 'equipes' as const, label: 'Equipes', icon: Layers },
    { id: 'relatorios' as const, label: 'Relatórios Diários', icon: FileSpreadsheet },
  ];

  const formatarDataExibicao = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'Hoje';
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatarDataInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const handleDataChangeFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [ano, mes, dia] = val.split('-').map(Number);
      const novaData = new Date(ano, mes - 1, dia, 12, 0, 0);
      onDateChange(novaData);
      setDropdownDataAberto(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-3 border-b border-emerald-900/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo da Inventar com moldura limpa */}
            <div className="flex items-center gap-3">
              <div className="h-10 px-2 rounded-xl bg-white border border-emerald-600/20 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-[1.02]">
                <img
                  src="/logo_inventar_expandWEB_novo2.jpg"
                  alt="Inventar Florestal"
                  className="h-8 w-auto max-w-[135px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-emerald-950 font-sans">
                    Controle de Faltas
                  </span>
                  <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Inventar
                  </span>
                </div>
                <span className="text-xs text-emerald-900/60 font-medium">
                  Gestão Operacional de Efetivo & Transporte
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-emerald-900/10 mx-1" />

            {/* Seletor de Unidade com tema Verde e Branco */}
            <div className="relative" ref={dropdownUnidadeRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownUnidadeAberto(!dropdownUnidadeAberto);
                  setDropdownDataAberto(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-sm',
                  'bg-white hover:bg-emerald-50/60 border-emerald-200 text-emerald-950',
                  dropdownUnidadeAberto && 'border-emerald-600 ring-2 ring-emerald-500/20'
                )}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-900/60 font-normal">Unidade:</span>
                <span className="font-semibold text-emerald-950">{unidadeAtual.label}</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-emerald-700/60 transition-transform ml-0.5',
                    dropdownUnidadeAberto && 'rotate-180 text-emerald-600'
                  )}
                />
              </button>

              {dropdownUnidadeAberto && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl border border-emerald-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800/70 uppercase tracking-wider">
                    Unidades Operacionais Inventar
                  </div>
                  <div className="space-y-1">
                    {REGIONAIS.map((reg) => {
                      const ativo = selectedRegional === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            onRegionalChange(reg.id);
                            setDropdownUnidadeAberto(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer',
                            ativo
                              ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                              : 'text-emerald-950 hover:bg-emerald-50/50'
                          )}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {reg.label}
                              <Badge
                                variant={ativo ? 'default' : 'secondary'}
                                className="text-[10px] py-0 px-1.5 h-4 bg-emerald-100 text-emerald-800 border-none"
                              >
                                {reg.tag}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-emerald-900/60 font-normal">{reg.description}</div>
                          </div>
                          {ativo && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seletor de Data */}
          <div className="flex items-center gap-2" ref={dropdownDataRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDropdownDataAberto(!dropdownDataAberto);
                  setDropdownUnidadeAberto(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer shadow-sm',
                  'bg-white hover:bg-emerald-50/60 border-emerald-200 text-emerald-950',
                  dropdownDataAberto && 'border-emerald-600 ring-2 ring-emerald-500/20'
                )}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize font-semibold">{formatarDataExibicao(selectedDate)}</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-emerald-700/60 transition-transform ml-0.5',
                    dropdownDataAberto && 'rotate-180 text-emerald-600'
                  )}
                />
              </button>

              {dropdownDataAberto && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-emerald-200 bg-white p-3 shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                    <span>Selecione a Data Operacional</span>
                  </div>

                  <input
                    type="date"
                    value={formatarDataInput(selectedDate)}
                    onChange={handleDataChangeFromInput}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-emerald-200 bg-emerald-50/30 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />

                  <div className="flex justify-between gap-2 pt-1 border-t border-emerald-100">
                    <button
                      type="button"
                      onClick={() => {
                        onDateChange(new Date());
                        setDropdownDataAberto(false);
                      }}
                      className="px-2 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setDropdownDataAberto(false)}
                      className="px-2 py-1 text-xs font-medium text-emerald-700/60 hover:text-emerald-950"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAtivo = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  isAtivo
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                    : 'text-emerald-950/70 hover:text-emerald-950 hover:bg-emerald-100/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isAtivo ? 'text-white' : 'text-emerald-600')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};