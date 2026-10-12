import React, { useState } from 'react';
import { X, UserCheck, UserX, RefreshCw, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Colaborador, StatusPresenca, MotivoFalta } from '../types';
import { COLABORADORES_RESERVA } from '../data/mockData';
import { cn } from '@/lib/utils';

interface AttendanceModalProps {
  colaborador: Colaborador;
  veiculoId: string;
  onClose: () => void;
  onSave: (
    veiculoId: string,
    colaboradorId: string,
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    substituto?: Colaborador
  ) => void;
  colaboradoresReserva?: Colaborador[];
}

const MOTIVOS: MotivoFalta[] = [
  'Atestado Médico',
  'Falta Injustificada',
  'Folga Compensatória',
  'Treinamento / Integração',
  'Problema de Transporte',
  'Licença Especial',
];

const statusOptions: Array<{ value: StatusPresenca; label: string; icon: React.ElementType; color: string }> = [
  { value: 'presente', label: 'Presente', icon: UserCheck, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { value: 'falta', label: 'Falta', icon: UserX, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { value: 'substituto', label: 'Substituto', icon: RefreshCw, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
];

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  colaborador,
  veiculoId,
  onClose,
  onSave,
  colaboradoresReserva = [],
}) => {
  const [status, setStatus] = useState<StatusPresenca>(colaborador?.status || 'presente');
  const [motivo, setMotivo] = useState<MotivoFalta | ''>(colaborador?.motivoFalta || '');
  const [substitutoId, setSubstitutoId] = useState<string>(colaborador?.substitutoId || '');
  const [searchReserva, setSearchReserva] = useState('');

  const reserva = (colaboradoresReserva && colaboradoresReserva.length > 0)
    ? colaboradoresReserva
    : (COLABORADORES_RESERVA || []);

  const reservaFiltrada = reserva.filter((c) => {
    if (!c) return false;
    if (!searchReserva) return true;
    return (
      (c.nome || '').toLowerCase().includes(searchReserva.toLowerCase()) ||
      (c.cargo || '').toLowerCase().includes(searchReserva.toLowerCase())
    );
  });

  const substitutoSelecionado = reserva.find((c) => c.id === substitutoId);

  const handleSave = () => {
    const substituto = substitutoId ? reserva.find((c) => c.id === substitutoId) : undefined;
    onSave(veiculoId, colaborador.id, status, motivo || undefined, substituto);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-muted shrink-0 flex items-center justify-center">
              {colaborador?.foto ? (
                <img src={colaborador.foto} alt={colaborador.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {colaborador?.nome?.charAt(0) ?? '?'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{colaborador?.nome || 'Colaborador'}</h2>
              <p className="text-xs text-muted-foreground">{colaborador?.cargo || 'Operador'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Status de Presença
            </p>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold cursor-pointer',
                    status === value
                      ? color + ' shadow-sm scale-[1.02]'
                      : 'border-border/40 text-muted-foreground hover:border-border hover:bg-muted/40'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo (somente falta) */}
          {status === 'falta' && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Motivo da Falta
              </p>
              <div className="relative">
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value as MotivoFalta | '')}
                  className="w-full h-10 px-3 pr-8 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
                >
                  <option value="">Selecione o motivo...</option>
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Substituto */}
          {status === 'substituto' && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Selecionar Substituto
              </p>

              {reserva.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Nenhum colaborador disponível na reserva.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar substituto por nome ou cargo..."
                      value={searchReserva}
                      onChange={(e) => setSearchReserva(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  {substitutoSelecionado && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-500/40 bg-muted shrink-0 flex items-center justify-center">
                        {substitutoSelecionado.foto ? (
                          <img src={substitutoSelecionado.foto} alt={substitutoSelecionado.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-foreground">{substitutoSelecionado.nome.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{substitutoSelecionado.nome}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{substitutoSelecionado.cargo}</p>
                      </div>
                      <button
                        onClick={() => setSubstitutoId('')}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Trocar
                      </button>
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {reservaFiltrada.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSubstitutoId(c.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors',
                          substitutoId === c.id
                            ? 'bg-amber-500/20 text-foreground font-semibold border border-amber-500/40'
                            : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                          {c.foto ? (
                            <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">
                              {c.nome.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="truncate flex-1">
                          <p className="font-medium text-foreground truncate">{c.nome}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.cargo}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/20 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            Salvar Registro
          </Button>
        </div>
      </div>
    </div>
  );
};