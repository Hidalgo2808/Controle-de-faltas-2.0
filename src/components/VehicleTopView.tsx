import React from 'react';
import { UserCheck, UserX, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { Colaborador, StatusPresenca, Veiculo } from '../types';
import { cn } from '@/lib/utils';

export type VehicleZone = 'motorista' | 'frenteDir' | 'trasEsq' | 'trasDir';

interface VehicleTopViewProps {
  veiculo: Veiculo;
  onAssentoClick: (posicao: VehicleZone, colaborador: Colaborador) => void;
  selectedZone?: VehicleZone | null;
}

const statusBadgeConfig: Record<StatusPresenca, { label: string; bg: string; icon: React.ElementType; border: string; text: string }> = {
  presente: {
    label: 'Presente',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    icon: UserCheck,
  },
  falta: {
    label: 'Falta',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    icon: UserX,
  },
  substituto: {
    label: 'Substituto',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    icon: RefreshCw,
  },
};

export const VehicleTopView: React.FC<VehicleTopViewProps> = ({
  veiculo,
  onAssentoClick,
  selectedZone,
}) => {
  const assentos = veiculo.assentos;

  const renderAssentoCard = (
    posicao: VehicleZone,
    colaborador?: Colaborador
  ) => {
    if (!colaborador) {
      return (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 min-h-[140px] text-center">
          <div className="w-12 h-12 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center mb-2">
            <User className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Vago</span>
        </div>
      );
    }

    const isSelected = selectedZone === posicao;
    const cfg = statusBadgeConfig[colaborador.status] ?? statusBadgeConfig.presente;
    const StatusIcon = cfg.icon;

    const isSubstituto = colaborador.status === 'substituto' && colaborador.substitutoNome;
    const nomeExibido = isSubstituto ? colaborador.substitutoNome : colaborador.nome;

    return (
      <button
        type="button"
        onClick={() => onAssentoClick(posicao, colaborador)}
        className={cn(
          'relative w-full flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all text-center group cursor-pointer overflow-hidden',
          'bg-gradient-to-b from-card/90 to-card/60 hover:shadow-lg hover:-translate-y-0.5',
          isSelected
            ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md shadow-primary/10'
            : colaborador.status === 'falta'
            ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-500/[0.03]'
            : colaborador.status === 'substituto'
            ? 'border-amber-500/40 hover:border-amber-500/70 bg-amber-500/[0.03]'
            : 'border-border/60 hover:border-border hover:bg-muted/30'
        )}
      >
        {/* Foto do Colaborador em Destaque */}
        <div className="relative mb-2.5">
          <div
            className={cn(
              'w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 shadow-md transition-transform group-hover:scale-105',
              colaborador.status === 'falta'
                ? 'border-rose-500 bg-rose-500/20'
                : colaborador.status === 'substituto'
                ? 'border-amber-500 bg-amber-500/20'
                : 'border-emerald-500 bg-emerald-500/20'
            )}
          >
            {colaborador.foto ? (
              <img
                src={colaborador.foto}
                alt={nomeExibido || 'Colaborador'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-base font-bold text-foreground">
                {nomeExibido?.charAt(0) ?? 'C'}
              </div>
            )}
          </div>

          {/* Ícone de status na foto */}
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center shadow',
              colaborador.status === 'falta'
                ? 'bg-rose-500 text-white'
                : colaborador.status === 'substituto'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Nome do Colaborador */}
        <p className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 w-full leading-tight mb-1">
          {nomeExibido}
        </p>

        {/* Cargo / Matrícula */}
        <p className="text-[11px] text-muted-foreground line-clamp-1 w-full font-medium mb-2">
          {colaborador.cargo || 'Operador Florestal'}
        </p>

        {/* Badge de Status */}
        <div
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border mt-auto',
            cfg.bg,
            cfg.border,
            cfg.text
          )}
        >
          <StatusIcon className="w-3 h-3 shrink-0" />
          <span>{cfg.label}</span>
        </div>

        {/* Indicador de substituto se aplicável */}
        {isSubstituto && (
          <p className="text-[9px] text-amber-400 font-medium mt-1 truncate max-w-full">
            Subst: {colaborador.nome}
          </p>
        )}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Assento 1: Motorista / Dianteiro Esquerdo */}
        {renderAssentoCard('motorista', assentos?.motorista)}

        {/* Assento 2: Dianteiro Direito */}
        {renderAssentoCard('frenteDir', assentos?.frenteDir)}

        {/* Assento 3: Traseiro Esquerdo */}
        {renderAssentoCard('trasEsq', assentos?.trasEsq)}

        {/* Assento 4: Traseiro Direito */}
        {renderAssentoCard('trasDir', assentos?.trasDir)}
      </div>
    </div>
  );
};