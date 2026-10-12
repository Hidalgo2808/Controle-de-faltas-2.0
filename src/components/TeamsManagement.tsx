import React, { useState, useMemo } from 'react';
import {
  Layers,
  Users,
  Search,
  Plus,
  Car,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Veiculo, Regional, Colaborador } from '../types';
import { cn } from '@/lib/utils';

export interface TeamsManagementProps {
  veiculos?: Veiculo[];
  selectedRegional?: Regional;
  onNovaEquipe?: () => void;
  onNovaEquipeClick?: () => void;
}

interface EquipeCardData {
  codigo: string;
  numero: 1 | 2;
  veiculoPrefixo: string;
  veiculoPlaca: string;
  regional: 'ribas' | 'agua_clara';
  membros: Colaborador[];
  lider: string;
  status: 'completa' | 'incompleta';
}

const regionalNomeMap: Record<string, string> = {
  ribas: 'Ribas do Rio Pardo',
  agua_clara: 'Água Clara',
};

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  veiculos = [],
  selectedRegional = 'todas',
  onNovaEquipe,
  onNovaEquipeClick,
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'completa' | 'incompleta'>('todas');
  const [filtroRegional, setFiltroRegional] = useState<Regional>(selectedRegional || 'todas');

  const handleOpenNovaEquipe = () => {
    if (typeof onNovaEquipe === 'function') {
      onNovaEquipe();
    } else if (typeof onNovaEquipeClick === 'function') {
      onNovaEquipeClick();
    }
  };

  // Extrai as duas equipes de cada veículo
  const listaEquipes: EquipeCardData[] = useMemo(() => {
    const res: EquipeCardData[] = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;

      // Equipe 1 (Motorista + Frente Dir)
      const membrosEq1 = [v.assentos.motorista, v.assentos.frenteDir].filter(Boolean) as Colaborador[];
      const liderEq1 = v.assentos.motorista?.nome || 'Não definido';
      const presentesEq1 = membrosEq1.filter(
        (m) => m && (m.status === 'presente' || m.status === 'substituto')
      ).length;

      res.push({
        codigo: v.equipe1Codigo || `EQ-${v.prefixo}-1`,
        numero: 1,
        veiculoPrefixo: v.prefixo,
        veiculoPlaca: v.placa,
        regional: v.regional,
        membros: membrosEq1,
        lider: liderEq1,
        status: presentesEq1 >= 2 ? 'completa' : 'incompleta',
      });

      // Equipe 2 (Trás Esq + Trás Dir)
      const membrosEq2 = [v.assentos.trasEsq, v.assentos.trasDir].filter(Boolean) as Colaborador[];
      const liderEq2 = v.assentos.trasEsq?.nome || 'Não definido';
      const presentesEq2 = membrosEq2.filter(
        (m) => m && (m.status === 'presente' || m.status === 'substituto')
      ).length;

      res.push({
        codigo: v.equipe2Codigo || `EQ-${v.prefixo}-2`,
        numero: 2,
        veiculoPrefixo: v.prefixo,
        veiculoPlaca: v.placa,
        regional: v.regional,
        membros: membrosEq2,
        lider: liderEq2,
        status: presentesEq2 >= 2 ? 'completa' : 'incompleta',
      });
    });

    return res;
  }, [veiculos]);

  // Filtros combinados
  const equipesFiltradas = useMemo(() => {
    return listaEquipes.filter((eq) => {
      const matchBusca =
        !termoBusca ||
        eq.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        eq.veiculoPrefixo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        eq.veiculoPlaca.toLowerCase().includes(termoBusca.toLowerCase()) ||
        eq.lider.toLowerCase().includes(termoBusca.toLowerCase()) ||
        eq.membros.some((m) => m?.nome?.toLowerCase().includes(termoBusca.toLowerCase()));

      const matchRegional =
        filtroRegional === 'todas' || eq.regional === filtroRegional;

      const matchStatus =
        filtroStatus === 'todas' || eq.status === filtroStatus;

      return matchBusca && matchRegional && matchStatus;
    });
  }, [listaEquipes, termoBusca, filtroRegional, filtroStatus]);

  const stats = useMemo(() => {
    const total = listaEquipes.length;
    const completas = listaEquipes.filter((e) => e.status === 'completa').length;
    const incompletas = listaEquipes.filter((e) => e.status === 'incompleta').length;
    return { total, completas, incompletas };
  }, [listaEquipes]);

  return (
    <div className="space-y-6">
      {/* Top Header com Resumo e Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md shadow-md">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            Gestão de Equipes Operacionais
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Visualize as duplas e equipes vinculadas aos veículos e sua conformidade diária
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenNovaEquipe}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-lg shadow-emerald-950/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Nova Equipe
        </Button>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total de Equipes</p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-400 font-medium">Equipes Completas</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completas}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-400 font-medium">Equipes com Pendência</p>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.incompletas}</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por código, veículo, placa ou colaborador..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-9 bg-card/70 border-border/80 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Regional */}
          <div className="flex rounded-xl border border-border/80 bg-card/70 p-1">
            <button
              type="button"
              onClick={() => setFiltroRegional('todas')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroRegional === 'todas'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFiltroRegional('ribas')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroRegional === 'ribas'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Ribas
            </button>
            <button
              type="button"
              onClick={() => setFiltroRegional('agua_clara')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroRegional === 'agua_clara'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Água Clara
            </button>
          </div>

          {/* Filtro Status */}
          <div className="flex rounded-xl border border-border/80 bg-card/70 p-1">
            <button
              type="button"
              onClick={() => setFiltroStatus('todas')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroStatus === 'todas'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('completa')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroStatus === 'completa'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Completas
            </button>
            <button
              type="button"
              onClick={() => setFiltroStatus('incompleta')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all',
                filtroStatus === 'incompleta'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Pendentes
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Equipes */}
      {equipesFiltradas.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-border/80">
          <CardContent className="space-y-3">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-base font-semibold text-foreground">Nenhuma equipe encontrada</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Verifique os filtros selecionados ou cadastre uma nova equipe para o quadro florestal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipesFiltradas.map((eq) => (
            <Card
              key={`${eq.codigo}-${eq.veiculoPrefixo}`}
              className="border-border/80 hover:border-emerald-500/40 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-foreground">
                      {eq.codigo}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      Equipe {eq.numero}
                    </Badge>
                  </div>
                  <Badge
                    variant={eq.status === 'completa' ? 'success' : 'destructive'}
                    className="text-[10px]"
                  >
                    {eq.status === 'completa' ? 'Completa' : 'Incompleta'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    {eq.veiculoPrefixo} ({eq.veiculoPlaca})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {regionalNomeMap[eq.regional]}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="py-4 space-y-3 flex-1">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Integrantes da Equipe
                  </p>
                  <div className="space-y-2">
                    {eq.membros.map((m, idx) => (
                      <div
                        key={m?.id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-card/90 border border-border/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={m?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={m?.nome || 'Colaborador'}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
                          />
                          <div className="truncate">
                            <p className="font-semibold text-foreground truncate">{m?.nome}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{m?.cargo}</p>
                          </div>
                        </div>

                        <Badge
                          variant={
                            m?.status === 'presente'
                              ? 'success'
                              : m?.status === 'substituto'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-[9px] shrink-0 capitalize"
                        >
                          {m?.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};