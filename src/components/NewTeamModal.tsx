import React, { useState } from 'react';
import { X, Users, Car, MapPin, Plus, Check } from 'lucide-react';
import { Colaborador, Regional, Veiculo } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface NovaEquipePayload {
  codigo: string;
  regional: 'ribas' | 'agua_clara';
  veiculoPrefixo: string;
  veiculoPlaca: string;
  veiculoModelo: string;
  motorista: Colaborador;
  frenteDir: Colaborador;
  trasEsq?: Colaborador;
  trasDir?: Colaborador;
}

export interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradoresReserva?: Colaborador[];
  onCriarEquipe?: (novaEquipe: NovaEquipePayload) => void;
}

export const NewTeamModal: React.FC<NewTeamModalProps> = ({
  isOpen,
  onClose,
  colaboradoresReserva = [],
  onCriarEquipe,
}) => {
  const [codigoEquipe, setCodigoEquipe] = useState('');
  const [regional, setRegional] = useState<'ribas' | 'agua_clara'>('ribas');
  const [prefixo, setPrefixo] = useState('');
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('Toyota Hilux 4x4');

  const [motoristaId, setMotoristaId] = useState('');
  const [frenteDirId, setFrenteDirId] = useState('');
  const [trasEsqId, setTrasEsqId] = useState('');
  const [trasDirId, setTrasDirId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoEquipe.trim() || !prefixo.trim() || !placa.trim()) return;

    const getColab = (id: string, defaultName: string): Colaborador => {
      const found = colaboradoresReserva.find((c) => c.id === id);
      if (found) return { ...found, equipeId: codigoEquipe, equipeNumero: 1 };
      return {
        id: id || `colab-${Date.now()}-${Math.random()}`,
        nome: defaultName,
        cargo: 'Operador Florestal',
        foto: '',
        telefone: '(67) 99999-0000',
        status: 'presente',
        equipeId: codigoEquipe,
        equipeNumero: 1,
        posicaoVeiculo: 'motorista',
        unidade: regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
      };
    };

    const motorista = getColab(motoristaId, 'Motorista Operacional');
    motorista.posicaoVeiculo = 'motorista';

    const frenteDir = getColab(frenteDirId, 'Operador Dianteiro');
    frenteDir.posicaoVeiculo = 'frente_dir';

    const trasEsq = trasEsqId ? getColab(trasEsqId, 'Operador Traseiro 1') : undefined;
    if (trasEsq) trasEsq.posicaoVeiculo = 'tras_esq';

    const trasDir = trasDirId ? getColab(trasDirId, 'Operador Traseiro 2') : undefined;
    if (trasDir) trasDir.posicaoVeiculo = 'tras_dir';

    onCriarEquipe?.({
      codigo: codigoEquipe.trim(),
      regional,
      veiculoPrefixo: prefixo.trim(),
      veiculoPlaca: placa.trim().toUpperCase(),
      veiculoModelo: modelo.trim(),
      motorista,
      frenteDir,
      trasEsq,
      trasDir,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Cadastrar Nova Equipe</h3>
              <p className="text-xs text-muted-foreground">Adicione um novo veículo e escale os operadores</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Código da Equipe</label>
              <Input
                placeholder="Ex: EQ-07 / FT-01"
                value={codigoEquipe}
                onChange={(e) => setCodigoEquipe(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Unidade Regional</label>
              <select
                value={regional}
                onChange={(e) => setRegional(e.target.value as 'ribas' | 'agua_clara')}
                className="w-full h-10 px-3 rounded-xl border border-input bg-card/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="ribas">Ribas do Rio Pardo</option>
                <option value="agua_clara">Água Clara</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">Prefixo Veículo</label>
              <Input
                placeholder="Ex: V-108"
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Placa</label>
              <Input
                placeholder="Ex: BRA2E19"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">Modelo</label>
              <Input
                placeholder="Ex: Hilux 4x4"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border/40 pt-3 space-y-2">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Escalar Operadores (Banco de Reserva)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Motorista</label>
                <select
                  value={motoristaId}
                  onChange={(e) => setMotoristaId(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="">Selecione da Reserva ou Novo...</option>
                  {colaboradoresReserva.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Ajudante (Frente Dir)</label>
                <select
                  value={frenteDirId}
                  onChange={(e) => setFrenteDirId(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="">Selecione da Reserva ou Novo...</option>
                  {colaboradoresReserva.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Operador Traseiro 1</label>
                <select
                  value={trasEsqId}
                  onChange={(e) => setTrasEsqId(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="">Opcional...</option>
                  {colaboradoresReserva.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cargo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground">Operador Traseiro 2</label>
                <select
                  value={trasDirId}
                  onChange={(e) => setTrasDirId(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="">Opcional...</option>
                  {colaboradoresReserva.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Criar Equipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};