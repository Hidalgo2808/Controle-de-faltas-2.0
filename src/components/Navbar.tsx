import React, { useState, useRef, useEffect } from 'react';
import {
  Car,
  Calendar,
  Layers,
  MapPin,
  Users,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Building2,
  Sparkles,
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
  dotColor: string;
  activeBg: string;
  description: string;
}> = [
  {
    id: 'todas',
    label: 'Todas as Unidades',
    tag: 'Geral',
    dotColor: 'bg-emerald-400',
    activeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Visão consolidada da operação florestal',
  },
  {
    id: 'ribas',
    label: 'Ribas do Rio Pardo',
    tag: 'RRP',
    dotColor: 'bg-emerald-400',
    activeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Polo Regional Ribas do Rio Pardo - MS',
  },
  {
    id: 'agua_clara',
    label: 'Água Clara',
    tag: 'AGC',
    dotColor: 'bg-teal-400',
    activeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
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
    { id: 'relatorios' as const, label: 'Relatórios & Histórico', icon: FileSpreadsheet },
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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Linha Superior: Logo Oficial da Empresa + Seletor de Unidades + Seletor de Data */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-3 border-b border-border/40">
          
          {/* Lado Esquerdo: Logo da Empresa + Identificação */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Logo da Empresa estilizada */}
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/25 shadow-sm flex items-center justify-center shrink-0 overflow-hidden group hover:border-emerald-500/40 transition-all">
                <img
                  src="/logo_inventar_expandWEB_novo2.jpg"
                  alt="Logo da Empresa"
                  className="h-8 w-auto max-w-[140px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                    Controle de Faltas
                  </span>
                  <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-400 font-bold bg-emerald-500/10">
                    FLORESTAL
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  Gestão Operacional de Campo
                </span>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="hidden sm:block h-7 w-[1px] bg-border/80 mx-1" />

            {/* Seletor Dropdown de Unidades Operacionais */}
            <div className="relative" ref={dropdownUnidadeRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownUnidadeAberto(!dropdownUnidadeAberto);
                  setDropdownDataAberto(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-sm cursor-pointer',
                  'bg-card/90 hover:bg-card hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                  dropdownUnidadeAberto ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' : 'border-border/80'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-muted-foreground font-normal">Unidade:</span>
                  <span className="text-foreground font-bold">{unidadeAtual.label}</span>
                </div>
                <span className={cn('w-2 h-2 rounded-full ring-2 ring-background shrink-0', unidadeAtual.dotColor)} />
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ml-0.5',
                    dropdownUnidadeAberto && 'rotate-180 text-emerald-400'
                  )}
                />
              </button>

              {/* Menu Dropdown de Unidades */}
              {dropdownUnidadeAberto && (
                <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-emerald-500/30 bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 mb-1 border-b border-border/50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> Selecionar Unidade
                    </p>
                  </div>
                  <div className="space-y-1">
                    {REGIONAIS.map((reg) => {
                      const isSelected = selectedRegional === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            onRegionalChange(reg.id);
                            setDropdownUnidadeAberto(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer',
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                              : 'text-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={cn('w-2 h-2 rounded-full shrink-0', reg.dotColor)} />
                            <div>
                              <p className="font-semibold leading-tight">{reg.label}</p>
                              <p className="text-[10px] text-muted-foreground font-normal leading-tight mt-0.5">
                                {reg.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lado Direito: Seletor de Data */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <div className="relative" ref={dropdownDataRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownDataAberto(!dropdownDataAberto);
                  setDropdownUnidadeAberto(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-sm cursor-pointer',
                  'bg-card/90 hover:bg-card hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
                  dropdownDataAberto ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' : 'border-border/80'
                )}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-foreground capitalize">{formatarDataExibicao(selectedDate)}</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ml-0.5',
                    dropdownDataAberto && 'rotate-180 text-emerald-400'
                  )}
                />
              </button>

              {/* Popover de Seleção de Data */}
              {dropdownDataAberto && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-emerald-500/30 bg-card/95 backdrop-blur-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Escolha o Dia da Operação
                  </p>
                  <input
                    type="date"
                    value={formatarDataInput(selectedDate)}
                    onChange={handleDataChangeFromInput}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border/80 bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => {
                        const ontem = new Date();
                        ontem.setDate(ontem.getDate() - 1);
                        onDateChange(ontem);
                        setDropdownDataAberto(false);
                      }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-emerald-400 transition-colors"
                    >
                      Ontem
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDateChange(new Date());
                        setDropdownDataAberto(false);
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:underline"
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const amanha = new Date();
                        amanha.setDate(amanha.getDate() + 1);
                        onDateChange(amanha);
                        setDropdownDataAberto(false);
                      }}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-emerald-400 transition-colors"
                    >
                      Amanhã
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linha Inferior: Abas de Navegação Principal */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};