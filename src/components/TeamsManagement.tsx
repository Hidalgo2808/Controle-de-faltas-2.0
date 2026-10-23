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

const getIniciais = (nome?: string) => {
  if (!nome) return 'OP';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  veiculos = [],
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
            Organização dos postos por frentes de trabalho, composição e fotos dos operadores
          </p>
        </div>

        {onNovaEquipeClick && (
          <Button
            size="sm"
            onClick={onNovaEquipeClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md rounded-xl"
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
            className="pl-9 h-9 text-xs bg-background/50 border-border/60 rounded-xl"
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
                  'border transition-all duration-200 overflow-hidden rounded-3xl',
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
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {eq.regional === 'ribas' ? 'Ribas' : 'Água Clara'}
                      </span>
                    </div>
                  </div>

                  {/* Fotos dos membros em pilha destacada */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 overflow-hidden p-1">
                      {eq.membros.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'w-10 h-10 rounded-xl overflow-hidden border-2 shadow-md ring-2 shrink-0 bg-muted flex items-center justify-center',
                            m.status === 'falta' ? 'border-rose-500 ring-rose-500/40' : 'border-emerald-500 ring-emerald-500/40'
                          )}
                          title={`${m.nome} (${m.cargo})`}
                        >
                          {m.foto ? (
                            <img src={m.foto} alt={m.nome} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-emerald-300">{getIniciais(m.nome)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/40 mt-2 space-y-3 bg-muted/10">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block pt-3">
                      Integrantes da Equipe
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eq.membros.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-card/60"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                            {m.foto ? (
                              <img src={m.foto} alt={m.nome} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-emerald-300">{getIniciais(m.nome)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h6 className="text-xs font-bold text-foreground truncate">{m.nome}</h6>
                            <p className="text-[11px] text-muted-foreground truncate">{m.cargo}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] py-0 px-1.5 mt-1',
                                m.status === 'falta'
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              )}
                            >
                              {m.status === 'falta' ? 'Falta' : 'Presente'}
                            </Badge>
                          </div>
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