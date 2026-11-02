import React, { useState } from 'react';
import { X, CheckCircle2, UserX, UserCheck, Shield, AlertTriangle, User } from 'lucide-react';
import { Colaborador, StatusPresenca, MotivoFalta } from '../types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: Colaborador | null;
  colaboradoresReserva?: Colaborador[];
  onConfirm: (
    colaboradorId: string,
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

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  colaborador,
  colaboradoresReserva = [],
  onConfirm,
}) => {
  const [status, setStatus] = useState<StatusPresenca>(colaborador?.status || 'presente');
  const [motivo, setMotivo] = useState<MotivoFalta | undefined>(colaborador?.motivoFalta);
  const [observacao, setObservacao] = useState(colaborador?.observacao || '');
  const [substitutoId, setSubstitutoId] = useState(colaborador?.substitutoId || '');

  React.useEffect(() => {
    if (colaborador) {
      setStatus(colaborador.status || 'presente');
      setMotivo(colaborador.motivoFalta);
      setObservacao(colaborador.observacao || '');
      setSubstitutoId(colaborador.substitutoId || '');
    }
  }, [colaborador]);

  if (!isOpen || !colaborador) return null;

  const handleSalvar = () => {
    onConfirm(
      colaborador.id,
      status,
      status === 'falta' ? motivo : undefined,
      observacao,
      status === 'substituto' ? substitutoId : undefined
    );
    onClose();
  };

  const getIniciais = (nome?: string) => {
    if (!nome) return 'CO';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
  };

  const substitutoSelecionado = colaboradoresReserva.find((c) => c.id === substitutoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-900/15 bg-white p-6 shadow-2xl space-y-5">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50 flex items-center justify-center shrink-0 shadow-sm">
              {colaborador.foto ? (
                <img
                  src={colaborador.foto}
                  alt={colaborador.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-sm font-bold text-emerald-900 font-sans">
                  {getIniciais(colaborador.nome)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950 tracking-tight">
                {colaborador.nome}
              </h3>
              <p className="text-xs text-emerald-800/70">
                {colaborador.cargo} • Equipe {colaborador.equipeNumero}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-900/50 hover:bg-emerald-50 hover:text-emerald-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção do Status com 3 opções */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-emerald-900/70">
            Situação Operacional
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStatus('presente')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm',
                status === 'presente'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-emerald-900/10 bg-white text-emerald-950/70 hover:bg-emerald-50/50'
              )}
            >
              <CheckCircle2
                className={cn(
                  'w-5 h-5',
                  status === 'presente' ? 'text-emerald-600' : 'text-emerald-800/40'
                )}
              />
              <span>Presente</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('falta')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm',
                status === 'falta'
                  ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-emerald-900/10 bg-white text-emerald-950/70 hover:bg-emerald-50/50'
              )}
            >
              <UserX
                className={cn(
                  'w-5 h-5',
                  status === 'falta' ? 'text-rose-600' : 'text-emerald-800/40'
                )}
              />
              <span>Falta</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('substituto')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm',
                status === 'substituto'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                  : 'border-emerald-900/10 bg-white text-emerald-950/70 hover:bg-emerald-50/50'
              )}
            >
              <UserCheck
                className={cn(
                  'w-5 h-5',
                  status === 'substituto' ? 'text-amber-600' : 'text-emerald-800/40'
                )}
              />
              <span>Substituição</span>
            </button>
          </div>
        </div>

        {/* Se for Falta: Seleção do Motivo */}
        {status === 'falta' && (
          <div className="space-y-2 p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Motivo da Ausência</span>
            </div>
            <select
              value={motivo || ''}
              onChange={(e) => setMotivo(e.target.value as MotivoFalta)}
              className="w-full h-10 px-3 rounded-xl border border-rose-300 bg-white text-xs text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              <option value="">Selecione o motivo oficial...</option>
              {MOTIVOS_FALTA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Se for Substituição: Colaborador com FOTO e NOME */}
        {status === 'substituto' && (
          <div className="space-y-3 p-4 rounded-xl border border-amber-200 bg-amber-50/60 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Escolher Colaborador Substituto</span>
              </div>
              <span className="text-[10px] text-amber-800/70 font-medium">
                {colaboradoresReserva.length} disponíveis
              </span>
            </div>

            {/* Pré-visualização do substituto selecionado com FOTO e NOME em destaque */}
            {substitutoSelecionado && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-300 bg-white shadow-sm">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-400 bg-amber-50 flex items-center justify-center shrink-0 shadow-sm">
                  {substitutoSelecionado.foto ? (
                    <img
                      src={substitutoSelecionado.foto}
                      alt={substitutoSelecionado.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-amber-900">
                      {getIniciais(substitutoSelecionado.nome)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      Substituto Selecionado
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 truncate mt-0.5">
                    {substitutoSelecionado.nome}
                  </h4>
                  <p className="text-[11px] text-emerald-800/70 font-medium truncate">
                    {substitutoSelecionado.cargo}
                  </p>
                </div>
              </div>
            )}

            {/* Grid interativo com foto e nome de todos os colaboradores para escolha visual */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-amber-950/80">
                Selecione o profissional reserva:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {colaboradoresReserva.map((reserva) => {
                  const isSelected = substitutoId === reserva.id;
                  return (
                    <button
                      key={reserva.id}
                      type="button"
                      onClick={() => setSubstitutoId(reserva.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer',
                        isSelected
                          ? 'border-amber-500 bg-white shadow-sm ring-2 ring-amber-400/30'
                          : 'border-amber-200/60 bg-white/70 hover:bg-white hover:border-amber-300'
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0">
                        {reserva.foto ? (
                          <img
                            src={reserva.foto}
                            alt={reserva.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-amber-900">
                            {getIniciais(reserva.nome)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-950 truncate">
                            {reserva.nome}
                          </p>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-800/70 truncate">
                          {reserva.cargo}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Observações Opcionais */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-emerald-900/70">
            Observações Operacionais (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Liberado pela liderança, aguardando documentação..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-emerald-200 text-emerald-950 hover:bg-emerald-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSalvar}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-sm"
          >
            Salvar Alteração
          </Button>
        </div>
      </div>
    </div>
  );
};