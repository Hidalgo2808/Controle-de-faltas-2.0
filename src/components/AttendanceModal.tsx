import React, { useState } from 'react';
import { X, CheckCircle2, UserX, ArrowRightLeft, ShieldAlert, FileText, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Colaborador, StatusPresenca, MotivoFalta } from '../types';

export interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: Colaborador;
  veiculoPrefixo?: string;
  colaboradoresReserva?: Colaborador[];
  onSave: (
    novoStatus: StatusPresenca,
    motivoFalta?: MotivoFalta,
    observacao?: string,
    substitutoId?: string,
    substitutoNome?: string
  ) => void;
}

const MOTIVOS_FALTA: MotivoFalta[] = [
  'Atestado Médico',
  'Falta Injustificada',
  'Folga Compensatória',
  'Treinamento / Integração',
  'Problema de Transporte',
  'Licença Especial',
];

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  colaborador,
  veiculoPrefixo,
  colaboradoresReserva = [],
  onSave,
}) => {
  const [status, setStatus] = useState<StatusPresenca>(colaborador.status || 'presente');
  const [motivoFalta, setMotivoFalta] = useState<MotivoFalta | undefined>(colaborador.motivoFalta);
  const [observacao, setObservacao] = useState<string>(colaborador.observacao || '');
  const [substitutoId, setSubstitutoId] = useState<string>(colaborador.substitutoId || '');

  if (!isOpen) return null;

  const handleSalvar = () => {
    let substitutoNome: string | undefined = undefined;
    if (status === 'substituto' && substitutoId) {
      const sub = colaboradoresReserva.find((c) => c.id === substitutoId);
      substitutoNome = sub ? sub.nome : undefined;
    }

    onSave(
      status,
      status === 'falta' ? motivoFalta : undefined,
      observacao,
      status === 'substituto' ? substitutoId : undefined,
      substitutoNome
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{colaborador.nome}</h2>
                {veiculoPrefixo && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border">
                    {veiculoPrefixo}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{colaborador.cargo} • Matrícula {colaborador.matricula}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Status de Presença
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('presente')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'presente'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Presente
              </button>

              <button
                type="button"
                onClick={() => setStatus('falta')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'falta'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 ring-2 ring-rose-500/20'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <UserX className="w-5 h-5 text-rose-400" />
                Falta
              </button>

              <button
                type="button"
                onClick={() => setStatus('substituto')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  status === 'substituto'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 ring-2 ring-amber-500/20'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Substituto
              </button>
            </div>
          </div>

          {status === 'falta' && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Classificação do Motivo da Falta</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOTIVOS_FALTA.map((motivo) => (
                  <button
                    key={motivo}
                    type="button"
                    onClick={() => setMotivoFalta(motivo)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      motivoFalta === motivo
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold'
                        : 'border-border/60 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    {motivo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === 'substituto' && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
              <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Selecione o Colaborador Reserva
              </label>
              <select
                value={substitutoId}
                onChange={(e) => setSubstitutoId(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">Selecione um reserva disponível...</option>
                {colaboradoresReserva.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.nome} ({res.cargo})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Observação Operacional (Opcional)
            </label>
            <textarea
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva detalhes como horário de contato, número de CID, etc."
              className="w-full rounded-xl border border-input bg-card/60 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSalvar} className="rounded-xl px-5 font-bold">
            Salvar Status
          </Button>
        </div>
      </div>
    </div>
  );
};