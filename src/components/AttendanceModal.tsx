import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Phone,
  Shield,
  Search,
  User,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Colaborador, StatusPresenca, MotivoFalta } from '../types';
import { cn } from '@/lib/utils';

export interface AttendanceModalProps {
  isOpen: boolean;
  colaborador: Colaborador;
  colaboradoresReserva?: Colaborador[];
  onClose: () => void;
  onSave: (
    status: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
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

const getIniciais = (nome?: string) => {
  if (!nome) return 'CO';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
};

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  colaborador,
  colaboradoresReserva = [],
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<StatusPresenca>(colaborador?.status || 'presente');
  const [motivo, setMotivo] = useState<MotivoFalta | undefined>(colaborador?.motivoFalta);
  const [observacao, setObservacao] = useState(colaborador?.observacao || '');
  const [substitutoId, setSubstitutoId] = useState<string>(colaborador?.substitutoId || '');
  const [buscaSubstituto, setBuscaSubstituto] = useState('');

  if (!isOpen || !colaborador) return null;

  const substitutosFiltrados = (colaboradoresReserva || []).filter((sub) => {
    if (!sub || sub.id === colaborador.id) return false;
    if (!buscaSubstituto) return true;
    return (
      (sub.nome || '').toLowerCase().includes(buscaSubstituto.toLowerCase()) ||
      (sub.cargo || '').toLowerCase().includes(buscaSubstituto.toLowerCase())
    );
  });

  const handleSalvar = () => {
    onSave(
      status,
      status === 'falta' ? motivo : undefined,
      observacao.trim() || undefined,
      status === 'substituto' ? substitutoId : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-3">
            {/* Foto Ampliada no Header do Modal */}
            <div className="w-14 h-14 rounded-2xl border-2 border-emerald-500/40 overflow-hidden shrink-0 shadow-md flex items-center justify-center bg-muted/40">
              {colaborador.foto ? (
                <img
                  src={colaborador.foto}
                  alt={colaborador.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-foreground text-lg">
                  {getIniciais(colaborador.nome)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">{colaborador.nome}</h3>
              <p className="text-xs text-muted-foreground">{colaborador.cargo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção de Status */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Status Operacional</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('presente')}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-xs font-bold transition-all',
                status === 'presente'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              )}
            >
              <CheckCircle2 className="w-5 h-5 mb-1" />
              <span>Presente</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('falta')}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-xs font-bold transition-all',
                status === 'falta'
                  ? 'border-rose-500 bg-rose-500/15 text-rose-400 ring-2 ring-rose-500/20'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              )}
            >
              <UserX className="w-5 h-5 mb-1" />
              <span>Falta</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('substituto')}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-xs font-bold transition-all',
                status === 'substituto'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 ring-2 ring-amber-500/20'
                  : 'border-border/60 text-muted-foreground hover:bg-muted/40'
              )}
            >
              <UserCheck className="w-5 h-5 mb-1" />
              <span>Substituto</span>
            </button>
          </div>
        </div>

        {/* Opções de Falta */}
        {status === 'falta' && (
          <div className="space-y-2 animate-in fade-in">
            <label className="text-xs font-semibold text-foreground">Motivo da Ausência</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value as MotivoFalta)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              <option value="">Selecione o motivo...</option>
              {MOTIVOS_FALTA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seleção de Substituto */}
        {status === 'substituto' && (
          <div className="space-y-3 animate-in fade-in">
            <label className="text-xs font-semibold text-foreground">Selecione o Colaborador Substituto</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar operador por nome ou cargo..."
                value={buscaSubstituto}
                onChange={(e) => setBuscaSubstituto(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-border p-2 bg-muted/20">
              {substitutosFiltrados.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-3">Nenhum operador reserva disponível.</p>
              ) : (
                substitutosFiltrados.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSubstitutoId(sub.id)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all',
                      substitutoId === sub.id
                        ? 'border-amber-500 bg-amber-500/15 text-foreground ring-1 ring-amber-500/30'
                        : 'border-border/50 hover:bg-card text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center bg-muted/40 font-bold text-xs text-foreground">
                        {sub.foto ? (
                          <img src={sub.foto} alt={sub.nome} className="w-full h-full object-cover" />
                        ) : (
                          getIniciais(sub.nome)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">{sub.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{sub.cargo}</p>
                      </div>
                    </div>
                    {substitutoId === sub.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Observações / Detalhes</label>
          <Input
            placeholder="Ex: Atestado entregue ao RH, retorno previsto para amanhã..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="text-xs h-10"
          />
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-2 flex justify-end gap-2 border-t border-border/50">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
          >
            Confirmar Registro
          </Button>
        </div>
      </div>
    </div>
  );
};