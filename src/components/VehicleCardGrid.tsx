import React, { useState } from 'react';
import {
  Car,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Shield,
  Layers,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { Veiculo, Colaborador, StatusPresenca, MotivoFalta, Regional } from '../types';
import { AttendanceModal } from './AttendanceModal';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export interface VehicleCardGridProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional | string;
  selectedDate?: Date;
  onUpdateColaboradorStatus?: (
    colaboradorId: string,
    status: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => void;
  onSubstituirColaborador?: (veiculoId: string, assentoKey: string, novoColaborador: Colaborador) => void;
  onOpenNovaEquipe?: () => void;
}

export const VehicleCardGrid: React.FC<VehicleCardGridProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onUpdateColaboradorStatus,
  onOpenNovaEquipe,
}) => {
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'completos' | 'incompletos'>('todos');

  // Filtragem por Regional e Busca
  const veiculosFiltrados = (veiculos || []).filter((v) => {
    if (!v) return false;
    const matchRegional = selectedRegional === 'todas' || v.regional === selectedRegional;
    const matchSearch =
      !searchTerm ||
      v.prefixo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assentos?.motorista?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assentos?.frenteDir?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assentos?.trasEsq?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assentos?.trasDir?.nome?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchRegional || !matchSearch) return false;

    if (filtroStatus !== 'todos') {
      const assentos = [
        v.assentos?.motorista,
        v.assentos?.frenteDir,
        v.assentos?.trasEsq,
        v.assentos?.trasDir,
      ].filter(Boolean);

      const faltas = assentos.filter((c) => c?.status === 'falta').length;
      if (filtroStatus === 'completos' && faltas > 0) return false;
      if (filtroStatus === 'incompletos' && faltas === 0) return false;
    }

    return true;
  });

  const handleCardColaboradorClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsAttendanceModalOpen(true);
  };

  const handleSalvarPresenca = (
    colaboradorId: string,
    status: StatusPresenca,
    motivo?: MotivoFalta,
    observacao?: string,
    substitutoId?: string
  ) => {
    if (onUpdateColaboradorStatus) {
      onUpdateColaboradorStatus(colaboradorId, status, motivo, observacao, substitutoId);
    }
  };

  const getIniciais = (nome?: string) => {
    if (!nome) return 'OP';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
  };

  // Render do assento individual visto de cima (sem rótulos de motorista, carona ou traseira)
  const renderAssentoTopView = (colaborador?: Colaborador) => {
    if (!colaborador) {
      return (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-emerald-900/20 bg-emerald-50/30 text-emerald-900/40 min-h-[148px]">
          <User className="w-8 h-8 stroke-[1.5] mb-1" />
          <span className="text-[11px] font-medium">Assento Vago</span>
        </div>
      );
    }

    const isPresente = colaborador.status === 'presente';
    const isFalta = colaborador.status === 'falta';
    const isSubstituto = colaborador.status === 'substituto';

    return (
      <div
        onClick={() => handleCardColaboradorClick(colaborador)}
        className={cn(
          'group relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer select-none text-center',
          'min-h-[150px] shadow-sm hover:shadow-md hover:-translate-y-0.5',
          isPresente && 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40',
          isFalta && 'border-rose-300 bg-rose-50/60 hover:border-rose-400 hover:bg-rose-50',
          isSubstituto && 'border-amber-300 bg-amber-50/60 hover:border-amber-400 hover:bg-amber-50'
        )}
      >
        {/* Foto em Destaque */}
        <div className="relative mb-2">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-100 flex items-center justify-center shadow-md transition-transform group-hover:scale-105',
              isPresente && 'border-emerald-500 ring-2 ring-emerald-500/20',
              isFalta && 'border-rose-500 ring-2 ring-rose-500/20',
              isSubstituto && 'border-amber-500 ring-2 ring-amber-500/20'
            )}
          >
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
              <span className="text-base font-bold text-emerald-950 font-sans">
                {getIniciais(colaborador.nome)}
              </span>
            )}
          </div>

          {/* Badge indicador de status sobre a foto */}
          <div className="absolute -bottom-1 -right-1 rounded-full p-1 shadow-sm bg-white">
            {isPresente && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
            {isFalta && <AlertCircle className="w-4 h-4 text-rose-600 fill-rose-100" />}
            {isSubstituto && <UserCheck className="w-4 h-4 text-amber-600 fill-amber-100" />}
          </div>
        </div>

        {/* Nome do Colaborador */}
        <span
          className={cn(
            'text-xs font-bold leading-tight line-clamp-1 max-w-full px-1',
            isFalta ? 'text-rose-950 line-through opacity-80' : 'text-emerald-950'
          )}
          title={colaborador.nome}
        >
          {colaborador.nome}
        </span>

        {/* Cargo */}
        <span className="text-[10px] text-emerald-900/60 line-clamp-1 max-w-full mt-0.5">
          {colaborador.cargo}
        </span>

        {/* Informação adicional se for substituto ou falta */}
        {isSubstituto && colaborador.substitutoNome && (
          <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-100/90 border border-amber-300 text-[10px] text-amber-900 font-semibold line-clamp-1 max-w-full">
            Subst: {colaborador.substitutoNome}
          </div>
        )}

        {isFalta && colaborador.motivoFalta && (
          <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-100/90 border border-rose-300 text-[9px] text-rose-900 font-medium line-clamp-1 max-w-full">
            {colaborador.motivoFalta}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Barra de Filtros e Busca Rápida */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-900/10 bg-white shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-900/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, prefixo, modelo ou nome do colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-emerald-200 bg-white text-xs text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-900/60 font-medium hidden sm:inline">Status:</span>
          {(['todos', 'completos', 'incompletos'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroStatus(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer',
                filtroStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50/60 text-emerald-900/70 hover:bg-emerald-100/80 hover:text-emerald-950'
              )}
            >
              {st === 'todos' ? 'Todos' : st === 'completos' ? 'Equipes 100%' : 'Com Faltas'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Veículos */}
      {veiculosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-emerald-900/20 bg-white text-center shadow-sm">
          <Car className="w-12 h-12 text-emerald-700/40 mb-3" />
          <h3 className="text-base font-bold text-emerald-950">Nenhum veículo localizado</h3>
          <p className="text-xs text-emerald-900/60 max-w-md mt-1 mb-4">
            Não encontramos veículos correspondentes aos filtros selecionados.
          </p>
          {onOpenNovaEquipe && (
            <Button
              onClick={onOpenNovaEquipe}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Cadastrar Nova Equipe & Veículo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {veiculosFiltrados.map((veiculo) => {
            const assentos = [
              veiculo.assentos?.motorista,
              veiculo.assentos?.frenteDir,
              veiculo.assentos?.trasEsq,
              veiculo.assentos?.trasDir,
            ].filter(Boolean);

            const faltasCount = assentos.filter((c) => c?.status === 'falta').length;
            const presentesCount = assentos.filter((c) => c?.status === 'presente' || c?.status === 'substituto').length;

            return (
              <div
                key={veiculo.id}
                className="flex flex-col rounded-2xl border border-emerald-900/15 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Cabeçalho do Card do Veículo */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/50 border-b border-emerald-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-emerald-950 font-sans tracking-tight">
                          {veiculo.prefixo}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-emerald-900 border border-emerald-200 shadow-2xs">
                          {veiculo.placa}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-900/60">
                        {veiculo.modelo} • {veiculo.ano} •{' '}
                        {veiculo.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo'}
                      </span>
                    </div>
                  </div>

                  {/* Badges de Lotação / Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border shadow-2xs',
                        faltasCount === 0
                          ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100/80 text-rose-800 border-rose-300'
                      )}
                    >
                      {presentesCount}/4 Operadores
                    </span>
                    {faltasCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {faltasCount} {faltasCount === 1 ? 'falta' : 'faltas'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estrutura da Cabine Vista de Cima (4 Assentos) */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                  <div className="relative mx-auto w-full max-w-lg rounded-2xl border-2 border-emerald-900/15 bg-emerald-50/20 p-4 sm:p-5 shadow-inner">
                    {/* Linha Frontal (2 Assentos Dianteiros - Sem rótulos de Motorista/Carona) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {renderAssentoTopView(veiculo.assentos?.motorista)}
                      {renderAssentoTopView(veiculo.assentos?.frenteDir)}
                    </div>

                    {/* Divisor Visual Suave entre fileiras */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="w-full border-t border-dashed border-emerald-900/15" />
                    </div>

                    {/* Linha Traseira (2 Assentos Traseiros - Sem rótulos de Traseira) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
                      {renderAssentoTopView(veiculo.assentos?.trasEsq)}
                      {renderAssentoTopView(veiculo.assentos?.trasDir)}
                    </div>
                  </div>
                </div>

                {/* Rodapé com identificadores das Equipes alocadas */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/40 border-t border-emerald-900/10 text-[11px] text-emerald-900/70">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-emerald-950">Frente:</span>
                    <span>{veiculo.equipe1Codigo || 'Equipe 1'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-emerald-950">Retaguarda:</span>
                    <span>{veiculo.equipe2Codigo || 'Equipe 2'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Lançamento de Presença/Falta/Substituição */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedColaborador(null);
        }}
        colaborador={selectedColaborador}
        colaboradoresReserva={colaboradoresReserva}
        onConfirm={handleSalvarPresenca}
      />
    </div>
  );
};