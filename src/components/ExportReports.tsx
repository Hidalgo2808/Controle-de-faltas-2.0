import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Users,
  Car,
  TrendingUp,
  CheckCircle2,
  Printer,
  UserCheck,
  UserX,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  AlertCircle,
  ShieldAlert,
  BarChart3,
  Award,
  Filter,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Veiculo, Colaborador, Regional } from '../types';
import { cn } from '@/lib/utils';

interface ExportReportsProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional;
  selectedDate?: Date;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const regionalLabel: Record<string, string> = {
  todas: 'Todas as Unidades',
  ribas: 'Ribas do Rio Pardo',
  agua_clara: 'Água Clara',
};

// Histórico consolidado de faltas ao longo do ano
const HISTORICO_MENSAL_FALTAS = [
  { mes: 'Janeiro', mesIndex: 0, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Felipe Augusto Lima', cargo: 'Operador de Motosserra', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 1, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Fevereiro', mesIndex: 1, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 5, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Março', mesIndex: 2, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 5, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'André Silva Campos', cargo: 'Técnico de Segurança', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]},
  { mes: 'Abril', mesIndex: 3, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Felipe Augusto Lima', cargo: 'Operador de Motosserra', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]},
  { mes: 'Maio', mesIndex: 4, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Junho', mesIndex: 5, faltas: [
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Julho', mesIndex: 6, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Agosto', mesIndex: 7, faltas: [
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 5, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'André Silva Campos', cargo: 'Técnico de Segurança', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]},
  { mes: 'Setembro', mesIndex: 8, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Outubro', mesIndex: 9, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 5, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Novembro', mesIndex: 10, faltas: [
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
  { mes: 'Dezembro', mesIndex: 11, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 5, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 2, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  selectedRegional: initialRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [unidadeFiltro, setUnidadeFiltro] = useState<Regional>(initialRegional || 'todas');

  const currentMonthIndex = (selectedDate instanceof Date && !isNaN(selectedDate.getTime()))
    ? selectedDate.getMonth()
    : new Date().getMonth();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [periodoFiltro, setPeriodoFiltro] = useState<'mes_atual' | 'acumulado_ano'>('acumulado_ano');

  const dataFormatada = (selectedDate instanceof Date && !isNaN(selectedDate.getTime()))
    ? selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('pt-BR');

  // Filtragem dos veículos por unidade selecionada
  const veiculosFiltrados = useMemo(() => {
    return (veiculos || []).filter((v) => {
      if (!v) return false;
      return unidadeFiltro === 'todas' || v.regional === unidadeFiltro;
    });
  }, [veiculos, unidadeFiltro]);

  // Lista de todos os colaboradores do dia atual com status e faltas
  const todosColaboradores = useMemo(() => {
    const list: Array<{ colab: Colaborador; veiculo: Veiculo }> = [];
    (veiculosFiltrados || []).forEach((v) => {
      if (!v || !v.assentos) return;
      const assentos = [
        v.assentos?.motorista,
        v.assentos?.frenteDir,
        v.assentos?.trasEsq,
        v.assentos?.trasDir,
      ].filter((item): item is Colaborador => Boolean(item));

      assentos.forEach((c) => {
        if (c) list.push({ colab: c, veiculo: v });
      });
    });
    return list;
  }, [veiculosFiltrados]);

  // Faltas do dia
  const faltasDoDia = useMemo(() => {
    return (todosColaboradores || []).filter((item) => item?.colab?.status === 'falta');
  }, [todosColaboradores]);

  // Substitutos do dia
  const substitutosDoDia = useMemo(() => {
    return (todosColaboradores || []).filter((item) => item?.colab?.status === 'substituto');
  }, [todosColaboradores]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalPresentes = (todosColaboradores || []).filter((i) => i?.colab?.status === 'presente').length;
    const totalFaltas = (faltasDoDia || []).length;
    const totalSubst = (substitutosDoDia || []).length;
    const totalGeral = (todosColaboradores || []).length;
    const taxaPresenca = totalGeral > 0 ? Math.round(((totalPresentes + totalSubst) / totalGeral) * 100) : 100;

    return {
      totalVeiculos: (veiculosFiltrados || []).length,
      totalGeral,
      totalPresentes,
      totalFaltas,
      totalSubst,
      taxaPresenca,
    };
  }, [todosColaboradores, faltasDoDia, substitutosDoDia, veiculosFiltrados]);

  // GRÁFICO DE QUEM FALTOU MAIS: Agrupamento consolidado e ranking
  const rankingQuemFaltouMais = useMemo(() => {
    const mapaFaltas = new Map<string, {
      nome: string;
      cargo: string;
      regional: string;
      regionalKey: string;
      totalFaltas: number;
      mesesComFalta: string[];
    }>();

    // Fonte de dados com base no período selecionado
    const mesesAvaliados = periodoFiltro === 'mes_atual'
      ? HISTORICO_MENSAL_FALTAS.filter((h) => h.mesIndex === selectedMonth)
      : HISTORICO_MENSAL_FALTAS;

    mesesAvaliados.forEach((m) => {
      m.faltas.forEach((f) => {
        if (unidadeFiltro !== 'todas' && f.regionalKey !== unidadeFiltro) {
          return;
        }

        const registroAtual = mapaFaltas.get(f.nome);
        if (registroAtual) {
          registroAtual.totalFaltas += f.totalFaltas;
          if (!registroAtual.mesesComFalta.includes(m.mes)) {
            registroAtual.mesesComFalta.push(m.mes);
          }
        } else {
          mapaFaltas.set(f.nome, {
            nome: f.nome,
            cargo: f.cargo,
            regional: f.regional,
            regionalKey: f.regionalKey,
            totalFaltas: f.totalFaltas,
            mesesComFalta: [m.mes],
          });
        }
      });
    });

    // Também soma eventuais faltas do dia atual se aplicável
    faltasDoDia.forEach(({ colab, veiculo }) => {
      const regKey = veiculo.regional || 'ribas';
      if (unidadeFiltro !== 'todas' && regKey !== unidadeFiltro) return;

      const regAtual = mapaFaltas.get(colab.nome);
      if (regAtual) {
        regAtual.totalFaltas += 1;
      } else {
        mapaFaltas.set(colab.nome, {
          nome: colab.nome,
          cargo: colab.cargo,
          regional: regionalLabel[regKey] || regKey,
          regionalKey: regKey,
          totalFaltas: 1,
          mesesComFalta: ['Hoje'],
        });
      }
    });

    const lista = Array.from(mapaFaltas.values());
    lista.sort((a, b) => b.totalFaltas - a.totalFaltas);
    return lista;
  }, [unidadeFiltro, periodoFiltro, selectedMonth, faltasDoDia]);

  // Valor máximo de faltas para escala percentual das barras
  const maxFaltas = useMemo(() => {
    if (rankingQuemFaltouMais.length === 0) return 1;
    return Math.max(...rankingQuemFaltouMais.map((r) => r.totalFaltas), 1);
  }, [rankingQuemFaltouMais]);

  // Total acumulado de faltas no ranking
  const totalFaltasRanking = useMemo(() => {
    return rankingQuemFaltouMais.reduce((acc, curr) => acc + curr.totalFaltas, 0);
  }, [rankingQuemFaltouMais]);

  // Ação de download em CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Ranking,Colaborador,Cargo,Unidade,Total de Faltas,Periodo\n';

    rankingQuemFaltouMais.forEach((item, index) => {
      const periodoTexto = periodoFiltro === 'mes_atual' ? MESES[selectedMonth] : 'Acumulado Geral';
      csvContent += `${index + 1},"${item.nome}","${item.cargo}","${item.regional}",${item.totalFaltas},"${periodoTexto}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ranking_faltas_${periodoFiltro}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Barra de Filtros e Ações de Exportação */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-xl border border-border text-xs">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground font-medium">Unidade:</span>
            <select
              value={unidadeFiltro}
              onChange={(e) => setUnidadeFiltro(e.target.value as Regional)}
              aria-label="Filtrar por unidade"
              className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="todas" className="bg-card text-foreground">Todas as Unidades</option>
              <option value="ribas" className="bg-card text-foreground">Ribas do Rio Pardo</option>
              <option value="agua_clara" className="bg-card text-foreground">Água Clara</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-xl border border-border text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground font-medium">Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Filtrar por mês"
              className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {MESES.map((m, idx) => (
                <option key={m} value={idx} className="bg-card text-foreground">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setPeriodoFiltro('acumulado_ano')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                periodoFiltro === 'acumulado_ano'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Acumulado Anual
            </button>
            <button
              type="button"
              onClick={() => setPeriodoFiltro('mes_atual')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                periodoFiltro === 'mes_atual'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Mês Selecionado ({MESES[selectedMonth]})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl border-border hover:bg-muted/60 text-xs font-semibold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl text-xs font-semibold gap-1.5 shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cartões de Indicadores Gerais do Relatório */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="p-4 border-border/70 bg-gradient-to-br from-card to-card/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total de Faltas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{totalFaltasRanking}</span>
            <span className="text-[11px] text-muted-foreground">ausências registradas</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-gradient-to-br from-card to-card/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Colaboradores com Faltas</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{rankingQuemFaltouMais.length}</span>
            <span className="text-[11px] text-muted-foreground">colaboradores no ranking</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-gradient-to-br from-card to-card/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Maior Volume Individual</span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-400">{rankingQuemFaltouMais[0]?.totalFaltas || 0}</span>
            <span className="text-[11px] text-muted-foreground">faltas (1º colocado)</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-gradient-to-br from-card to-card/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Taxa Média de Presença</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{stats.taxaPresenca}%</span>
            <span className="text-[11px] text-muted-foreground">na operação diária</span>
          </div>
        </Card>
      </div>

      {/* SEÇÃO PRINCIPAL: GRÁFICO VISUAL DE QUEM FALTOU MAIS */}
      <Card className="border-border/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-gradient-to-r from-muted/30 via-muted/10 to-transparent pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  Gráfico de Absenteísmo — Quem Faltou Mais
                  <Badge variant="destructive" className="text-[10px] py-0 px-2 font-bold">
                    RANKING
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Classificação visual e comparativa dos colaboradores com maior número de ausências ({periodoFiltro === 'mes_atual' ? `Mês de ${MESES[selectedMonth]}` : 'Histórico Consolidado'}).
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Alto (&ge; 4)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderado (2-3)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Baixo (1)
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {rankingQuemFaltouMais.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Nenhuma falta registrada no período selecionado</p>
              <p className="text-xs text-muted-foreground">
                Toda a equipe operacional esteve presente ou devidamente coberta por substitutos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankingQuemFaltouMais.map((item, index) => {
                const percentualBarra = Math.round((item.totalFaltas / maxFaltas) * 100);
                const percentualDoTotal = totalFaltasRanking > 0
                  ? Math.round((item.totalFaltas / totalFaltasRanking) * 100)
                  : 0;

                // Cores de criticidade
                let barColor = 'bg-sky-500';
                let badgeVariant = 'border-sky-500/30 text-sky-400 bg-sky-500/10';
                let medalBadge = null;

                if (item.totalFaltas >= 4) {
                  barColor = 'bg-rose-500';
                  badgeVariant = 'border-rose-500/30 text-rose-400 bg-rose-500/10';
                } else if (item.totalFaltas >= 2) {
                  barColor = 'bg-amber-500';
                  badgeVariant = 'border-amber-500/30 text-amber-400 bg-amber-500/10';
                }

                // Destaque de Pódio para os primeiros colocados
                if (index === 0) {
                  medalBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Award className="w-3 h-3 text-amber-400" /> 1º Mais Ausente
                    </span>
                  );
                } else if (index === 1) {
                  medalBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-300/20 text-slate-300 border border-slate-300/30">
                      <Award className="w-3 h-3 text-slate-300" /> 2º Lugar
                    </span>
                  );
                } else if (index === 2) {
                  medalBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-700/20 text-orange-400 border border-orange-700/30">
                      <Award className="w-3 h-3 text-orange-400" /> 3º Lugar
                    </span>
                  );
                }

                return (
                  <div
                    key={item.nome}
                    className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all space-y-2 group"
                  >
                    {/* Linha Superior: Nome, Cargo, Tags e Contador de Faltas */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-card border border-border text-xs font-bold text-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {item.nome}
                            </span>
                            {medalBadge}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{item.cargo}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {item.regional}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-lg font-black text-foreground">
                              {item.totalFaltas}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {item.totalFaltas === 1 ? 'falta' : 'faltas'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {percentualDoTotal}% do total de faltas
                          </span>
                        </div>

                        <Badge variant="outline" className={cn('text-xs font-bold px-2 py-0.5', badgeVariant)}>
                          {item.totalFaltas >= 4 ? 'Crítico' : item.totalFaltas >= 2 ? 'Alerta' : 'Monitorar'}
                        </Badge>
                      </div>
                    </div>

                    {/* Gráfico de Barra Horizontal com Animação e Escala Percentual */}
                    <div className="relative w-full h-3.5 bg-card/80 rounded-full border border-border/60 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out shadow-sm',
                          barColor
                        )}
                        style={{ width: `${Math.max(percentualBarra, 6)}%` }}
                      />
                    </div>

                    {/* Detalhamento dos meses com ausência */}
                    {item.mesesComFalta && item.mesesComFalta.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">Ocorrências registradas em:</span>
                        {item.mesesComFalta.map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.5 rounded bg-card border border-border/80 text-[10px] text-foreground font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela Detalhada com os Registros de Faltas do Dia Atual */}
      <Card className="border-border/80 shadow-lg">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <CardTitle className="text-base font-bold">
                  Ocorrências do Dia Vigente ({dataFormatada})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Faltas operacionais e respectivos substitutos designados para os veículos hoje.
                </CardDescription>
              </div>
            </div>
            <Badge variant="destructive" className="font-bold text-xs">
              {faltasDoDia.length} Ausência(s) Hoje
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {faltasDoDia.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhuma falta registrada para o dia {dataFormatada}. Escala com 100% de preenchimento.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border/40">
                <tr>
                  <th className="px-4 py-3">Colaborador Ausente</th>
                  <th className="px-4 py-3">Cargo / Função</th>
                  <th className="px-4 py-3">Veículo / Placa</th>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Motivo Informado</th>
                  <th className="px-4 py-3">Substituto Designado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {faltasDoDia.map(({ colab, veiculo }) => (
                  <tr key={colab.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{colab.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{colab.cargo}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {veiculo.prefixo} <span className="text-muted-foreground">({veiculo.placa})</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {regionalLabel[veiculo.regional] || veiculo.regional}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {colab.motivoFalta || 'Não Especificado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {colab.substitutoNome ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {colab.substitutoNome}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Sem Substituto
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};