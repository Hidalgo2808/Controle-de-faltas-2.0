import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  MapPin,
  Car,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Veiculo, Colaborador, Regional } from '../types';
import { cn } from '@/lib/utils';

export interface TeamsManagementProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional;
  onNovaEquipeClick?: () => void;
}

const regionalLabel: Record<string, string> = {
  todas: 'Todas as Unidades',
  ribas: 'Ribas do Rio Pardo',
  agua_clara: 'Água Clara',
};

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onNovaEquipeClick,
}) => {
  const [search, setSearch] = useState('');
  const [filterRegional, setFilterRegional] = useState<Regional | 'todas'>(selectedRegional);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const equipesDetalhadas = useMemo(() => {
    const lista: Array<{
      id: string;
      codigo: string;
      numero: 1 | 2;
      veiculoPrefixo: string;
      veiculoPlaca: string;
      regional: 'ribas' | 'agua_clara';
      membros: Colaborador[];
      totalMembros: number;
      presentes: number;
      faltas: number;
    }> = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;

      const eq1Membros = [v.assentos.motorista, v.assentos.frenteDir].filter(Boolean) as Colaborador[];
      const eq2Membros = [v.assentos.trasEsq, v.assentos.trasDir].filter(Boolean) as Colaborador[];

      lista.push({
        id: `${v.id}-eq1`,
        codigo: v.equipe1Codigo || `${v.prefixo} - EQ 1`,
        numero: 1,
        veiculoPrefixo: v.prefixo,
        veiculoPlaca: v.placa,
        regional: v.regional,
        membros: eq1Membros,
        totalMembros: eq1Membros.length,
        presentes: eq1Membros.filter((m) => m.status === 'presente' || m.status === 'substituto').length,
        faltas: eq1Membros.filter((m) => m.status === 'falta').length,
      });

      lista.push({
        id: `${v.id}-eq2`,
        codigo: v.equipe2Codigo || `${v.prefixo} - EQ 2`,
        numero: 2,
        veiculoPrefixo: v.prefixo,
        veiculoPlaca: v.placa,
        regional: v.regional,
        membros: eq2Membros,
        totalMembros: eq2Membros.length,
        presentes: eq2Membros.filter((m) => m.status === 'presente' || m.status === 'substituto').length,
        faltas: eq2Membros.filter((m) => m.status === 'falta').length,
      });
    });

    return lista;
  }, [veiculos]);

  const equipesFiltradas = useMemo(() => {
    return equipesDetalhadas.filter((eq) => {
      const matchSearch =
        !search ||
        eq.codigo.toLowerCase().includes(search.toLowerCase()) ||
        eq.veiculoPrefixo.toLowerCase().includes(search.toLowerCase()) ||
        eq.membros.some((m) => m.nome.toLowerCase().includes(search.toLowerCase()));

      const matchRegional = filterRegional === 'todas' || eq.regional === filterRegional;

      return matchSearch && matchRegional;
    });
  }, [equipesDetalhadas, search, filterRegional]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Gestão Operacional de Equipes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organização dos postos por frentes de trabalho, composição e lotação
          </p>
        </div>

        {onNovaEquipeClick && (
          <Button
            size="sm"
            onClick={onNovaEquipeClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nova Equipe
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-border/60">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar equipe ou colaborador integrante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-border/60"
          />
        </div>

        <select
          value={filterRegional}
          onChange={(e) => setFilterRegional(e.target.value as any)}
          className="h-9 px-3 rounded-xl border border-border/60 bg-background/50 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <option value="todas">Todas as Unidades</option>
          <option value="ribas">Ribas do Rio Pardo</option>
          <option value="agua_clara">Água Clara</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipesFiltradas.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/20">
            <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">Nenhuma equipe encontrada</p>
            <p className="text-xs text-muted-foreground mt-1">Ajuste os filtros de busca para visualizar os registros.</p>
          </div>
        ) : (
          equipesFiltradas.map((eq) => {
            const isExpanded = expandedTeamId === eq.id;
            const isIncompleta = eq.faltas > 0;

            return (
              <Card
                key={eq.id}
                className={cn(
                  'border transition-all duration-200 overflow-hidden',
                  isIncompleta ? 'border-amber-500/30 bg-card/70' : 'border-border/60 bg-card/40'
                )}
              >
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedTeamId(isExpanded ? null : eq.id)}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{eq.codigo}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] py-0 px-2 font-semibold',
                          isIncompleta
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        )}
                      >
                        {isIncompleta ? 'Com Desfalque' : 'Completa'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-muted-foreground" />
                        {eq.veiculoPrefixo}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {regionalLabel[eq.regional]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground tabular-nums">
                        {eq.presentes}/{eq.totalMembros}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">operadores</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/40 bg-muted/10 space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Integrantes do Posto
                    </p>
                    <div className="space-y-1.5">
                      {eq.membros.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-card/60 border border-border/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={m.foto}
                              alt={m.nome}
                              className="w-7 h-7 rounded-lg object-cover border border-border/40"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                              }}
                            />
                            <div>
                              <p className="font-bold text-foreground text-xs leading-none">{m.nome}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{m.cargo}</p>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] py-0 px-1.5',
                              m.status === 'presente' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                              m.status === 'falta' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                              m.status === 'substituto' && 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            )}
                          >
                            {m.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};