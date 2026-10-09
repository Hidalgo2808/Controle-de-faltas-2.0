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
    if (!dadosMes) return [];
    if (unidadeFiltro === 'todas') return dadosMes.faltas;
    const labelFiltro = regionalLabel[unidadeFiltro];
    return dadosMes.faltas.filter((f) => f.regional === labelFiltro);
  }, [selectedMonth, unidadeFiltro]);

  const handleExportCSV = () => {
    let csv = `Relatório Operacional de Frequência\nData: ${dataFormatada}\nUnidade: ${regionalLabel[unidadeFiltro]}\n\n`;
    csv += 'Veículo,Placa,Unidade,Colaborador,Cargo,Matrícula,Status,Motivo Falta,Substituto\n';

    todosColaboradores.forEach(({ colab, veiculo }) => {
      csv += `"${veiculo.prefixo}","${veiculo.placa}","${regionalLabel[veiculo.regional]}","${colab.nome}","${colab.cargo}","${colab.matricula || ''}","${colab.status}","${colab.motivoFalta || ''}","${colab.substitutoNome || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_frequencia_${dataFormatada.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros de Unidade e Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card/60 border border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Relatórios e Histórico de Faltas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize faltas diárias, absenteísmo acumulado por mês e exporte dados consolidados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={unidadeFiltro}
            onChange={(e) => setUnidadeFiltro(e.target.value as Regional)}
            className="h-9 px-3 text-xs bg-muted/50 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todas">Todas as Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>

          <Button
            onClick={handleExportCSV}
            size="sm"
            className="gap-1.5 h-9 text-xs font-semibold shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 h-9 text-xs font-medium border-border"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Visão de Faltas Diárias e Mensais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faltas do Dia */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Faltas Registradas Hoje ({dataFormatada})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Colaboradores ausentes nas turmas no dia selecionado
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-rose-400 border-rose-500/30">
                {faltasDoDia.length} ausência(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {faltasDoDia.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                Nenhuma falta registrada para hoje nesta unidade.
              </div>
            ) : (
              faltasDoDia.map(({ colab, veiculo }) => (
                <div
                  key={colab.id}
                  className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{colab.nome}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{colab.cargo} • {veiculo.prefixo}</p>
                    <p className="text-[10px] text-rose-400 font-medium mt-0.5">
                      Motivo: {colab.motivoFalta || 'Não informado'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-border shrink-0">
                    {regionalLabel[veiculo.regional]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Histórico Mensal de Faltas */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Absenteísmo Mensal
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Histórico acumulado de faltas por colaborador
                </CardDescription>
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-8 px-2.5 text-xs bg-muted/60 border border-border rounded-lg text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MESES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {faltasMesSelecionado.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                Nenhum registro de falta acumulada para {MESES[selectedMonth]}.
              </div>
            ) : (
              faltasMesSelecionado.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{item.nome}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.cargo} • {item.regional}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs font-bold shrink-0">
                    {item.totalFaltas} falta(s)
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};