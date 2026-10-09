import React, { useState, useMemo } from 'react';
import { Layers, Search, MapPin, Users, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Veiculo, Regional, Colaborador } from '../types';
import { cn } from '@/lib/utils';

export interface TeamsManagementProps {
  veiculos?: Veiculo[];
  selectedRegional?: Regional;
  onOpenNewTeamModal?: () => void;
  onNovaEquipe?: () => void;
}

interface EquipeCardData {
  id: string;
  codigo: string;
  nome: string;
  numero: 1 | 2;
  prefixoVeiculo: string;
  placaVeiculo: string;
  regional: 'ribas' | 'agua_clara';
  colaboradores: Colaborador[];
  status: 'completa' | 'incompleta';
}

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  veiculos = [],
  selectedRegional = 'todas',
  onOpenNewTeamModal,
  onNovaEquipe,
}) => {
  const [search, setSearch] = useState('');

  const handleOpenModal = () => {
    if (onOpenNewTeamModal) onOpenNewTeamModal();
    else if (onNovaEquipe) onNovaEquipe();
  };

  const equipes: EquipeCardData[] = useMemo(() => {
    const lista: EquipeCardData[] = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;

      const colabs1 = [v.assentos.motorista, v.assentos.frenteDir].filter(Boolean);
      const colabs2 = [v.assentos.trasEsq, v.assentos.trasDir].filter(Boolean);

      const ativos1 = colabs1.filter((c) => c && (c.status === 'presente' || c.status === 'substituto')).length;
      const ativos2 = colabs2.filter((c) => c && (c.status === 'presente' || c.status === 'substituto')).length;

      lista.push({
        id: `${v.id}-eq1`,
        codigo: v.equipe1Codigo || 'EQ-1',
        nome: `Equipe 1 (${v.prefixo})`,
        numero: 1,
        prefixoVeiculo: v.prefixo,
        placaVeiculo: v.placa,
        regional: v.regional,
        colaboradores: colabs1,
        status: ativos1 >= 2 ? 'completa' : 'incompleta',
      });

      lista.push({
        id: `${v.id}-eq2`,
        codigo: v.equipe2Codigo || 'EQ-2',
        nome: `Equipe 2 (${v.prefixo})`,
        numero: 2,
        prefixoVeiculo: v.prefixo,
        placaVeiculo: v.placa,
        regional: v.regional,
        colaboradores: colabs2,
        status: ativos2 >= 2 ? 'completa' : 'incompleta',
      });
    });

    return lista;
  }, [veiculos]);

  const equipesFiltradas = useMemo(() => {
    return equipes.filter((eq) => {
      const matchRegional = selectedRegional === 'todas' || eq.regional === selectedRegional;
      const matchSearch =
        !search ||
        eq.codigo.toLowerCase().includes(search.toLowerCase()) ||
        eq.prefixoVeiculo.toLowerCase().includes(search.toLowerCase()) ||
        eq.colaboradores.some((c) => c.nome.toLowerCase().includes(search.toLowerCase()));

      return matchRegional && matchSearch;
    });
  }, [equipes, selectedRegional, search]);

  return (
    <div className="space-y-6">
      {/* Topo com Busca e Botão Nova Equipe */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Composição das Equipes Operacionais
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acompanhe a formação das frentes de trabalho por veículo
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipe ou operador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Button
            type="button"
            onClick={handleOpenModal}
            className="gap-2 h-9 text-xs font-bold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Equipe
          </Button>
        </div>
      </div>

      {/* Grid de Equipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipesFiltradas.map((eq) => (
          <Card
            key={eq.id}
            className={cn(
              'border-border/60 bg-card/60 backdrop-blur-md overflow-hidden transition-all hover:border-primary/40',
              eq.status === 'incompleta' && 'border-amber-500/30 bg-amber-500/5'
            )}
          >
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-border/40 space-y-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold px-2 py-0.5 border-primary/30 text-primary">
                  {eq.codigo}
                </Badge>
                <span className="text-xs font-bold text-foreground">{eq.prefixoVeiculo}</span>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5',
                  eq.status === 'completa'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                )}
              >
                {eq.status === 'completa' ? 'Completa' : 'Incompleta'}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                {eq.colaboradores.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={c.foto}
                        alt={c.nome}
                        className="w-7 h-7 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{c.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.cargo}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0',
                        c.status === 'presente' && 'text-emerald-400 bg-emerald-500/10',
                        c.status === 'falta' && 'text-rose-400 bg-rose-500/10',
                        c.status === 'substituto' && 'text-amber-400 bg-amber-500/10'
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {eq.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}
                </span>
                <span>{eq.placaVeiculo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};