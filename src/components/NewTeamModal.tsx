import React, { useState } from 'react';
import { X, Users, Car, MapPin, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Colaborador, Regional } from '../types';

export interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newTeamData: any) => void;
  onSalvar?: (newTeamData: any) => void;
  colaboradoresReserva?: Colaborador[];
}

export const NewTeamModal: React.FC<NewTeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSalvar,
  colaboradoresReserva = [],
}) => {
  const [prefixo, setPrefixo] = useState('');
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [regional, setRegional] = useState<'ribas' | 'agua_clara'>('ribas');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      prefixo: prefixo || 'NOVO CARRO',
      placa: placa.toUpperCase() || 'ABC-1234',
      modelo: modelo || 'Veículo Operacional',
      regional,
    };
    if (onSave) onSave(payload);
    else if (onSalvar) onSalvar(payload);
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Adicionar Nova Equipe / Veículo</h2>
              <p className="text-xs text-muted-foreground">Cadastre novos postos operacionais na frota</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Prefixo do Veículo
            </label>
            <Input
              placeholder="Ex: CARRO 104"
              value={prefixo}
              onChange={(e) => setPrefixo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Placa
              </label>
              <Input
                placeholder="Ex: RRP-9X99"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Modelo
              </label>
              <Input
                placeholder="Ex: Hilux 4x4"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Regional
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRegional('ribas')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  regional === 'ribas'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Ribas do Rio Pardo
              </button>

              <button
                type="button"
                onClick={() => setRegional('agua_clara')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  regional === 'agua_clara'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Água Clara
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Check className="w-4 h-4" />
              Salvar Equipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};