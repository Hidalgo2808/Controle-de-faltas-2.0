import React, { useState, useMemo } from 'react';
import { Download, Calendar, Users, Car, TrendingUp, CheckCircle2, Printer, UserCheck, UserX, RefreshCw, FileSpreadsheet, MapPin, AlertCircle, ShieldAlert, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Veiculo, Colaborador, Regional } from '../types';
import { cn } from '@/lib/utils';

interface ExportReportsProps {
  veiculos: Veiculo[];
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

const HISTORICO_MENSAL_FALTAS = [
  { mes: 'Janeiro', mesIndex: 0, faltas: [
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 3, regional: 'Água Clara' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 2, regional: 'Água Clara' },
    { nome: 'Felipe Augusto Lima', cargo: 'Operador de Motosserra', totalFaltas: 1, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Fevereiro', mesIndex: 1, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 5, regional: 'Ribas do Rio Pardo' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 2, regional: 'Água Clara' },
    { nome: 'Bruno Rafael Oliveira', cargo: 'Eletricista de Autos', totalFaltas: 2, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Março', mesIndex: 2, faltas: [
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 4, regional: 'Água Clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 3, regional: 'Água Clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 2, regional: 'Ribas do Rio Pardo' },
    { nome: 'André Silva Campos', cargo: 'Técnico de Segurança', totalFaltas: 2, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Abril', mesIndex: 3, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
    { nome: 'Felipe Augusto Lima', cargo: 'Operador de Motosserra', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 2, regional: 'Água Clara' },
  ]},
  { mes: 'Maio', mesIndex: 4, faltas: [
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 2, regional: 'Água Clara' },
  ]},
  { mes: 'Junho', mesIndex: 5, faltas: [
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 4, regional: 'Água Clara' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Julho', mesIndex: 6, faltas: [
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 3, regional: 'Água Clara' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Agosto', mesIndex: 7, faltas: [
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 5, regional: 'Água Clara' },
    { nome: 'André Silva Campos', cargo: 'Técnico de Segurança', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
  ]},
  { mes: 'Setembro', mesIndex: 8, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo' },
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 3, regional: 'Água Clara' },
  ]},
  { mes: 'Outubro', mesIndex: 9, faltas: [
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 4, regional: 'Ribas do Rio Pardo' },
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 2, regional: 'Água Clara' },
  ]},
  { mes: 'Novembro', mesIndex: 10, faltas: [
    { nome: 'Carlos Eduardo Santos', cargo: 'Mecânico', totalFaltas: 3, regional: 'Água Clara' },
    { nome: 'Roberto Alves Santos', cargo: 'Operador de Carregadeira', totalFaltas: 2, regional: 'Água Clara' },
  ]},
  { mes: 'Dezembro', mesIndex: 11, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 4, regional: 'Ribas do Rio Pardo' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 3, regional: 'Ribas do Rio Pardo' },
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
        v.assentos.motorista,
        v.assentos.frenteDir,
        v.assentos.trasEsq,
        v.assentos.trasDir,
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

  // Faltas do mês selecionado
  const faltasMesSelecionado = useMemo(() => {
    const dadosMes = HISTORICO_MENSAL_FALTAS.find((h) => h.mesIndex === selectedMonth);
    return dadosMes ? dadosMes.faltas : [];
  }, [selectedMonth]);

  // Exportar CSV
  const handleExportCSV = () => {
    const rows = [
      ['Data', 'Unidade', 'Veículo', 'Placa', 'Colaborador', 'Cargo', 'Status', 'Motivo da Falta', 'Substituto'],
      ...(todosColaboradores || []).map(({ colab, veiculo }) => [
        dataFormatada,
        regionalLabel[veiculo.regional] || veiculo.regional,
        veiculo.prefixo,
        veiculo.placa,
        colaboradorNome(colab),
        colab.cargo || '',
        colab.status,
        colab.motivoFalta || '',
        colab.substitutoNome || '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_faltas_${dataFormatada.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function colaboradorNome(c: Colaborador) {
    if (c.status === 'substituto' && c.substitutoNome) {
      return `${c.substitutoNome} (Subst: ${c.nome})`;
    }
    return c.nome;
  }

  return (
    <div className="space-y-6">
      {/* Header do Relatório */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Relatórios de Presença e Faltas</h2>
            <p className="text-sm text-muted-foreground">
              Consolidação analítica do efetivo diário e histórico mensal por regional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={handleExportCSV} className="w-full sm:w-auto gap-2 shadow-md">
            <Download className="w-4 h-4" />
            Exportar CSV / Excel
          </Button>
        </div>
      </div>

      {/* Filtros do Relatório */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Filtrar Unidade:</span>
            <select
              value={unidadeFiltro}
              onChange={(e) => setUnidadeFiltro(e.target.value as Regional)}
              className="h-9 px-3 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas as Unidades</option>
              <option value="ribas">Ribas do Rio Pardo</option>
              <option value="agua_clara">Água Clara</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Histórico Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-9 px-3 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {MESES.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Efetivo Alocado</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats.totalGeral}</h3>
            <span className="text-[11px] text-muted-foreground mt-1 block">em {stats.totalVeiculos} veículos</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-emerald-400 uppercase">Presentes</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.totalPresentes}</h3>
            <span className="text-[11px] text-emerald-400/80 mt-1 block">{stats.taxaPresenca}% de aderência</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-rose-400 uppercase">Faltas Registradas</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">{stats.totalFaltas}</h3>
            <span className="text-[11px] text-rose-400/80 mt-1 block">no dia atual</span>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-amber-400 uppercase">Substituições</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.totalSubst}</h3>
            <span className="text-[11px] text-amber-400/80 mt-1 block">banco reserva ativo</span>
          </CardContent>
        </Card>
      </div>

      {/* Ranking / Faltas Recorrentes do Mês Selecionado */}
      <Card className="border-border bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <CardTitle className="text-base font-bold">Faltas no Mês de {MESES[selectedMonth]}</CardTitle>
          </div>
          <CardDescription>Colaboradores com registros de ausência acumulados no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {faltasMesSelecionado.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-foreground">{f.nome}</p>
                    <p className="text-[11px] text-muted-foreground">{f.cargo} • {f.regional}</p>
                  </div>
                </div>

                <Badge variant="destructive" className="font-mono text-xs">
                  {f.totalFaltas} {f.totalFaltas === 1 ? 'falta' : 'faltas'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};