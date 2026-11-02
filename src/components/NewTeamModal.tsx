import React, { useState } from 'react';
import { X, Users, Car, Shield, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Colaborador } from '../types';

export interface NovaEquipePayload {
  prefixoVeiculo: string;
  placaVeiculo: string;
  modeloVeiculo: string;
  anoVeiculo: number;
  regional: 'ribas' | 'agua_clara';
  nomeEquipe1: string;
  nomeEquipe2: string;
  colaboradoresEquipe1: Colaborador[];
  colaboradoresEquipe2: Colaborador[];
  prefixo?: string;
  placa?: string;
  modelo?: string;
  ano?: number;
}

export interface NewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (payload: NovaEquipePayload) => void;
  onConfirm?: (payload: NovaEquipePayload) => void;
  colaboradoresReserva?: Colaborador[];
  regionalPadrao?: 'ribas' | 'agua_clara';
}

export const NewTeamModal: React.FC<NewTeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onConfirm,
  colaboradoresReserva = [],
  regionalPadrao = 'ribas',
}) => {
  const [regional, setRegional] = useState<'ribas' | 'agua_clara'>(regionalPadrao);
  const [prefixoVeiculo, setPrefixoVeiculo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('Toyota Hilux 4x4');
  const [anoVeiculo, setAnoVeiculo] = useState<number>(new Date().getFullYear());

  const [nomeEquipe1, setNomeEquipe1] = useState('');
  const [nomeEquipe2, setNomeEquipe2] = useState('');

  // Operadores Equipe 1
  const [motNome, setMotNome] = useState('');
  const [motCargo, setMotCargo] = useState('Motorista Operacional');
  const [frenteNome, setFrenteNome] = useState('');
  const [frenteCargo, setFrenteCargo] = useState('Líder de Campo');

  // Operadores Equipe 2
  const [trasEsqNome, setTrasEsqNome] = useState('');
  const [trasEsqCargo, setTrasEsqCargo] = useState('Operador Florestal');
  const [trasDirNome, setTrasDirNome] = useState('');
  const [trasDirCargo, setTrasDirCargo] = useState('Operador Florestal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prefixoFinal = prefixoVeiculo.trim() || `VAN-${Math.floor(100 + Math.random() * 900)}`;
    const eq1Cod = `EQ-${Math.floor(10 + Math.random() * 89)}A`;
    const eq2Cod = `EQ-${Math.floor(10 + Math.random() * 89)}B`;

    const colab1: Colaborador = {
      id: `c-new-${Date.now()}-1`,
      nome: motNome.trim() || 'Motorista Titular',
      cargo: motCargo.trim() || 'Motorista Operacional',
      foto: '',
      telefone: '(67) 99999-0001',
      status: 'presente',
      equipeId: eq1Cod,
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      unidade: regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
    };

    const colab2: Colaborador = {
      id: `c-new-${Date.now()}-2`,
      nome: frenteNome.trim() || 'Operador Frente',
      cargo: frenteCargo.trim() || 'Líder de Campo',
      foto: '',
      telefone: '(67) 99999-0002',
      status: 'presente',
      equipeId: eq1Cod,
      equipeNumero: 1,
      posicaoVeiculo: 'frente_dir',
      unidade: regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
    };

    const colab3: Colaborador = {
      id: `c-new-${Date.now()}-3`,
      nome: trasEsqNome.trim() || 'Operador Retaguarda 1',
      cargo: trasEsqCargo.trim() || 'Operador Florestal',
      foto: '',
      telefone: '(67) 99999-0003',
      status: 'presente',
      equipeId: eq2Cod,
      equipeNumero: 2,
      posicaoVeiculo: 'tras_esq',
      unidade: regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
    };

    const colab4: Colaborador = {
      id: `c-new-${Date.now()}-4`,
      nome: trasDirNome.trim() || 'Operador Retaguarda 2',
      cargo: trasDirCargo.trim() || 'Operador Florestal',
      foto: '',
      telefone: '(67) 99999-0004',
      status: 'presente',
      equipeId: eq2Cod,
      equipeNumero: 2,
      posicaoVeiculo: 'tras_dir',
      unidade: regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
    };

    const payload: NovaEquipePayload = {
      prefixoVeiculo: prefixoFinal,
      placaVeiculo: placaVeiculo.trim().toUpperCase() || 'BRA2E19',
      modeloVeiculo: modeloVeiculo.trim() || 'Toyota Hilux 4x4',
      anoVeiculo: Number(anoVeiculo) || new Date().getFullYear(),
      regional,
      nomeEquipe1: nomeEquipe1.trim() || `Equipe Alfa (${prefixoFinal})`,
      nomeEquipe2: nomeEquipe2.trim() || `Equipe Beta (${prefixoFinal})`,
      colaboradoresEquipe1: [colab1, colab2],
      colaboradoresEquipe2: [colab3, colab4],
      prefixo: prefixoFinal,
      placa: placaVeiculo.trim().toUpperCase() || 'BRA2E19',
      modelo: modeloVeiculo.trim() || 'Toyota Hilux 4x4',
      ano: Number(anoVeiculo) || new Date().getFullYear(),
    };

    if (onConfirm) {
      onConfirm(payload);
    } else if (onSave) {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-900/15 bg-white p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950 tracking-tight">Nova Equipe & Veículo</h3>
              <p className="text-xs text-emerald-800/70">Cadastrar veículo e compor as duas equipes operacionais</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados do Veículo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Identificação do Veículo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Unidade Regional</label>
                <select
                  value={regional}
                  onChange={(e) => setRegional(e.target.value as 'ribas' | 'agua_clara')}
                  className="w-full h-10 px-3 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="ribas">Ribas do Rio Pardo - MS</option>
                  <option value="agua_clara">Água Clara - MS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Prefixo do Veículo</label>
                <Input
                  placeholder="Ex: VAN-042 ou V-18"
                  value={prefixoVeiculo}
                  onChange={(e) => setPrefixoVeiculo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Placa</label>
                <Input
                  placeholder="Ex: RRP-4A20"
                  value={placaVeiculo}
                  onChange={(e) => setPlacaVeiculo(e.target.value)}
                  className="h-10 text-xs uppercase bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Modelo</label>
                <Input
                  placeholder="Ex: Toyota Hilux 4x4"
                  value={modeloVeiculo}
                  onChange={(e) => setModeloVeiculo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>
            </div>
          </div>

          {/* Equipe 1 */}
          <div className="space-y-3 pt-3 border-t border-emerald-900/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Equipe 1 (Motorista & Carona Frente)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Nome do Motorista</label>
                <Input
                  placeholder="Nome completo..."
                  value={motNome}
                  onChange={(e) => setMotNome(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Função / Cargo</label>
                <Input
                  value={motCargo}
                  onChange={(e) => setMotCargo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Operador Frente Direita</label>
                <Input
                  placeholder="Nome completo..."
                  value={frenteNome}
                  onChange={(e) => setFrenteNome(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Função / Cargo</label>
                <Input
                  value={frenteCargo}
                  onChange={(e) => setFrenteCargo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950"
                />
              </div>
            </div>
          </div>

          {/* Equipe 2 */}
          <div className="space-y-3 pt-3 border-t border-emerald-900/10">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Equipe 2 (Retaguarda)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Operador Traseiro Esquerdo</label>
                <Input
                  placeholder="Nome completo..."
                  value={trasEsqNome}
                  onChange={(e) => setTrasEsqNome(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Função / Cargo</label>
                <Input
                  value={trasEsqCargo}
                  onChange={(e) => setTrasEsqCargo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Operador Traseiro Direito</label>
                <Input
                  placeholder="Nome completo..."
                  value={trasDirNome}
                  onChange={(e) => setTrasDirNome(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-900/70 mb-1">Função / Cargo</label>
                <Input
                  value={trasDirCargo}
                  onChange={(e) => setTrasDirCargo(e.target.value)}
                  className="h-10 text-xs bg-emerald-50/30 border-emerald-200 text-emerald-950"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-emerald-900/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-emerald-200 text-emerald-900 hover:bg-emerald-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              Cadastrar Veículo & Equipe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};