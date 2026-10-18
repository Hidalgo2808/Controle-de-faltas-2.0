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
  FileDown,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Veiculo, Colaborador, Regional } from '../types';
import { cn } from '@/lib/utils';

export interface ExportReportsProps {
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

// Histórico consolidado de faltas ao longo do ano para o ranking anual/mensal
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
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]},
  { mes: 'Dezembro', mesIndex: 11, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 4, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico Florestal', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]},
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [dataFiltro, setDataFiltro] = useState<string>(
    selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [unidadeFiltro, setUnidadeFiltro] = useState<Regional>(selectedRegional);
  const [periodoFiltro, setPeriodoFiltro] = useState<'dia' | 'mes' | 'ano'>('dia');
  const [mesSelecionado, setMesSelecionado] = useState<number>(selectedDate ? selectedDate.getMonth() : new Date().getMonth());
  const [isExporting, setIsExporting] = useState(false);

  // Filtra os veículos pela unidade selecionada
  const veiculosFiltrados = useMemo(() => {
    if (unidadeFiltro === 'todas') return veiculos;
    return veiculos.filter((v) => v?.regional === unidadeFiltro);
  }, [veiculos, unidadeFiltro]);

  // Lista de todos os colaboradores do dia com seus dados de presença
  const todosColaboradoresDia = useMemo(() => {
    const lista: Array<{
      colaborador: Colaborador;
      veiculoPrefixo: string;
      veiculoPlaca: string;
      regional: 'ribas' | 'agua_clara';
      equipeCodigo: string;
      equipeNumero: 1 | 2;
    }> = [];

    (veiculosFiltrados || []).forEach((v) => {
      if (!v || !v.assentos) return;
      const assentosMap = [
        { c: v.assentos.motorista, eq: v.equipe1Codigo, eqNum: 1 as const },
        { c: v.assentos.frenteDir, eq: v.equipe1Codigo, eqNum: 1 as const },
        { c: v.assentos.trasEsq, eq: v.equipe2Codigo, eqNum: 2 as const },
        { c: v.assentos.trasDir, eq: v.equipe2Codigo, eqNum: 2 as const },
      ];

      assentosMap.forEach(({ c, eq, eqNum }) => {
        if (!c) return;
        lista.push({
          colaborador: c,
          veiculoPrefixo: v.prefixo,
          veiculoPlaca: v.placa,
          regional: v.regional,
          equipeCodigo: eq,
          equipeNumero: eqNum,
        });
      });
    });

    return lista;
  }, [veiculosFiltrados]);

  // Apenas as faltas do dia de acordo com o filtro selecionado
  const faltasDoDia = useMemo(() => {
    return todosColaboradoresDia.filter((item) => item.colaborador.status === 'falta');
  }, [todosColaboradoresDia]);

  // Cálculo das faltas para o gráfico (Ranking de quem mais faltou)
  const rankingQuemFaltouMais = useMemo(() => {
    const contagemMap = new Map<string, { nome: string; cargo: string; regional: string; totalFaltas: number }>();

    // 1. Considera o histórico do mês/ano
    HISTORICO_MENSAL_FALTAS.forEach((bloco) => {
      if (periodoFiltro === 'mes' && bloco.mesIndex !== mesSelecionado) {
        return;
      }

      bloco.faltas.forEach((reg) => {
        if (unidadeFiltro !== 'todas' && reg.regionalKey !== unidadeFiltro) {
          return;
        }

        const atual = contagemMap.get(reg.nome);
        if (atual) {
          atual.totalFaltas += reg.totalFaltas;
        } else {
          contagemMap.set(reg.nome, {
            nome: reg.nome,
            cargo: reg.cargo,
            regional: reg.regional,
            totalFaltas: reg.totalFaltas,
          });
        }
      });
    });

    // 2. Adiciona as faltas do dia corrente
    faltasDoDia.forEach(({ colaborador, regional }) => {
      const regNome = regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara';
      const atual = contagemMap.get(colaborador.nome);
      if (atual) {
        atual.totalFaltas += 1;
      } else {
        contagemMap.set(colaborador.nome, {
          nome: colaborador.nome,
          cargo: colaborador.cargo,
          regional: regNome,
          totalFaltas: 1,
        });
      }
    });

    const lista = Array.from(contagemMap.values());
    lista.sort((a, b) => b.totalFaltas - a.totalFaltas);
    return lista.slice(0, 8); // Top 8 colaboradores
  }, [periodoFiltro, mesSelecionado, unidadeFiltro, faltasDoDia]);

  const maxFaltasRanking = useMemo(() => {
    if (rankingQuemFaltouMais.length === 0) return 1;
    return Math.max(...rankingQuemFaltouMais.map((r) => r.totalFaltas), 1);
  }, [rankingQuemFaltouMais]);

  // Estatísticas gerais
  const totalColaboradores = todosColaboradoresDia.length;
  const totalPresentes = todosColaboradoresDia.filter((i) => i.colaborador.status === 'presente').length;
  const totalSubstitutos = todosColaboradoresDia.filter((i) => i.colaborador.status === 'substituto').length;
  const totalFaltas = faltasDoDia.length;
  const taxaPresenca = totalColaboradores > 0 ? Math.round(((totalPresentes + totalSubstitutos) / totalColaboradores) * 100) : 100;

  // Função para exportar CSV apenas com quem faltou conforme especificado
  const handleExportarFaltasCSV = () => {
    setIsExporting(true);

    const cabecalho = 'Data;Unidade;Nome;Cargo;Matricula;Equipe;Veiculo;Placa;Motivo da Falta;Substituto Designado\n';
    const linhas = faltasDoDia.map((item) => {
      const c = item.colaborador;
      const unLabel = item.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara';
      const motivo = c.motivoFalta || 'Falta Registrada';
      const subst = c.substitutoNome || 'Sem Substituto';
      return `"${dataFiltro}";"${unLabel}";"${c.nome}";"${c.cargo}";"${c.matricula || ''}";"${item.equipeCodigo}";"${item.veiculoPrefixo}";"${item.veiculoPlaca}";"${motivo}";"${subst}"`;
    });

    const csvContent = '\uFEFF' + cabecalho + linhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_faltas_${unidadeFiltro}_${dataFiltro}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 600);
  };

  // Função para exportar ranking em CSV
  const handleExportarRankingCSV = () => {
    setIsExporting(true);

    const periodoTexto = periodoFiltro === 'ano' ? 'Ano Atual' : MESES[mesSelecionado];
    const cabecalho = 'Posição;Colaborador;Cargo;Unidade;Periodo;Total de Faltas\n';
    const linhas = rankingQuemFaltouMais.map((item, idx) => {
      return `"${idx + 1}º";"${item.nome}";"${item.cargo}";"${item.regional}";"${periodoTexto}";"${item.totalFaltas}"`;
    });

    const csvContent = '\uFEFF' + cabecalho + linhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ranking_faltas_${unidadeFiltro}_${periodoFiltro}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 600);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros de Unidade, Data e Período */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Relatórios & Faltas
                    <Badge variant="outline" className="text-xs font-normal">
                      {regionalLabel[unidadeFiltro]}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Exportação filtrada por unidade e data específica, com relatório detalhado de faltantes.
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Ações de Impressão e Exportação Rápida */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImprimir}
                className="gap-2 text-xs border-border/60 hover:bg-muted/50"
              >
                <Printer className="w-4 h-4 text-muted-foreground" />
                Imprimir
              </Button>
              <Button
                size="sm"
                onClick={handleExportarFaltasCSV}
                disabled={isExporting}
                className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              >
                <Download className="w-4 h-4" />
                Exportar Faltas do Dia (.CSV)
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Barra de Filtros Customizados */}
        <CardContent className="pt-4 pb-4 bg-muted/15">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Seletor de Unidade */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Unidade / Regional
              </label>
              <select
                aria-label="Selecionar Unidade ou Regional"
                value={unidadeFiltro}
                onChange={(e) => setUnidadeFiltro(e.target.value as Regional)}
                className="w-full h-9 rounded-xl border border-input bg-card/70 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              >
                <option value="todas">Todas as Unidades (Geral)</option>
                <option value="ribas">Ribas do Rio Pardo</option>
                <option value="agua_clara">Água Clara</option>
              </select>
            </div>

            {/* Seletor de Data Específica */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Data do Registro
              </label>
              <input
                type="date"
                aria-label="Selecionar Data do Registro"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card/70 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </div>

            {/* Período do Gráfico de Ranking */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                Período do Gráfico
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPeriodoFiltro('dia')}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-xs font-semibold border transition-all',
                    periodoFiltro === 'dia'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border/60 bg-card/70 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  Dia
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodoFiltro('mes')}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-xs font-semibold border transition-all',
                    periodoFiltro === 'mes'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border/60 bg-card/70 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  Mês
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodoFiltro('ano')}
                  className={cn(
                    'flex-1 h-9 rounded-xl text-xs font-semibold border transition-all',
                    periodoFiltro === 'ano'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border/60 bg-card/70 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  Ano
                </button>
              </div>
            </div>

            {/* Seletor de Mês (quando filtro = mês) */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Mês de Referência
              </label>
              <select
                aria-label="Selecionar Mês de Referência"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                disabled={periodoFiltro !== 'mes'}
                className="w-full h-9 rounded-xl border border-input bg-card/70 px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium disabled:opacity-40"
              >
                {MESES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo da Data Filtrada */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Efetivo Escalado</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{totalColaboradores}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{veiculosFiltrados.length} veículos ativos</p>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Presentes</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{totalPresentes}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Operando normalmente</p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Faltas Registradas</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{totalFaltas}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Nesta data / filtro</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Substitutos Ativos</span>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{totalSubstitutos}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{taxaPresenca}% de presença geral</p>
        </div>
      </div>

      {/* GRÁFICO DE QUEM MAIS FALTOU */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Ranking: Quem Mais Faltou
                  <Badge variant="destructive" className="text-[10px] py-0 px-2">
                    Top Faltas
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Visualização gráfica comparativa de ausências recorrentes por colaborador ({periodoFiltro === 'ano' ? 'Ano Todo' : periodoFiltro === 'mes' ? MESES[mesSelecionado] : 'Dia Selecionado'}).
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportarRankingCSV}
              disabled={isExporting || rankingQuemFaltouMais.length === 0}
              className="gap-2 text-xs border-border/60 hover:bg-muted/50"
            >
              <FileDown className="w-3.5 h-3.5 text-muted-foreground" />
              Exportar Ranking (.CSV)
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {rankingQuemFaltouMais.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <p className="font-semibold text-foreground text-sm">Nenhuma falta computada para este filtro</p>
              <p className="text-xs">Não há faltas cadastradas para o período e unidade selecionados.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {rankingQuemFaltouMais.map((item, index) => {
                const percentual = Math.round((item.totalFaltas / maxFaltasRanking) * 100);
                const isPrimeiro = index === 0;

                return (
                  <div key={item.nome} className="group relative">
                    <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            index === 0
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                              : index === 1
                              ? 'bg-amber-500 text-white'
                              : index === 2
                              ? 'bg-amber-400/80 text-black'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="font-bold text-foreground truncate">{item.nome}</span>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          ({item.cargo})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                          {item.regional}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-rose-400 text-xs">
                          {item.totalFaltas} {item.totalFaltas === 1 ? 'falta' : 'faltas'}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso do Gráfico */}
                    <div className="w-full h-3 rounded-full bg-muted/30 overflow-hidden p-0.5 border border-border/40">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          isPrimeiro
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm shadow-rose-500/30'
                            : index < 3
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-primary/70 to-primary'
                        )}
                        style={{ width: `${Math.max(percentual, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABELA DE FALTAS DO DIA ESPECÍFICO */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Colaboradores Que Faltaram no Dia
                  <Badge variant="outline" className="text-xs">
                    {dataFiltro}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Listagem restrita às pessoas que faltaram na data selecionada para a unidade{' '}
                  <span className="font-semibold text-foreground">{regionalLabel[unidadeFiltro]}</span>.
                </CardDescription>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleExportarFaltasCSV}
              disabled={faltasDoDia.length === 0}
              className="gap-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Esta Lista (.CSV)
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {faltasDoDia.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
              <p className="font-semibold text-foreground text-sm">Nenhuma falta registrada nesta data!</p>
              <p className="text-xs text-muted-foreground">
                Todos os colaboradores escalados para {regionalLabel[unidadeFiltro]} compareceram no dia {dataFiltro}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Cargo / Função</th>
                    <th className="py-3 px-4">Unidade</th>
                    <th className="py-3 px-4">Equipe / Veículo</th>
                    <th className="py-3 px-4">Motivo da Falta</th>
                    <th className="py-3 px-4">Substituto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {faltasDoDia.map(({ colaborador, veiculoPrefixo, veiculoPlaca, regional, equipeCodigo }) => (
                    <tr key={colaborador.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={colaborador.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={colaborador.nome}
                            className="w-8 h-8 rounded-full object-cover border border-border/60 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-foreground text-xs">{colaborador.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{colaborador.matricula || 'Sem matrícula'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{colaborador.cargo}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <MapPin className="w-3 h-3 text-primary" />
                          {regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{veiculoPrefixo}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {equipeCodigo} • {veiculoPlaca}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="destructive" className="text-[10px]">
                          {colaborador.motivoFalta || 'Falta Registrada'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {colaborador.substitutoNome ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <UserCheck className="w-3 h-3" />
                            {colaborador.substitutoNome}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[11px]">Nenhum substituto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};