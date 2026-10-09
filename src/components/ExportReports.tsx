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
    const registroMes = HISTORICO_MENSAL_FALTAS.find((h) => h.mesIndex === selectedMonth);
    if (!registroMes) return [];
    if (unidadeFiltro === 'todas') return registroMes.faltas;
    const regionalNome = unidadeFiltro === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara';
    return (registroMes.faltas || []).filter((f) => f.regional === regionalNome);
  }, [selectedMonth, unidadeFiltro]);

  // Exportação para CSV (Diário Operacional)
  const exportarCSV = () => {
    const cabecalho = ['Veiculo', 'Placa', 'Regional', 'Colaborador', 'Cargo', 'Matricula', 'Status', 'Motivo Falta', 'Substituto'];
    const linhas = (todosColaboradores || []).map(({ colab, veiculo }) => [
      `"${veiculo?.prefixo || ''}"`,
      `"${veiculo?.placa || ''}"`,
      `"${veiculo?.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}"`,
      `"${colab?.nome || ''}"`,
      `"${colab?.cargo || ''}"`,
      `"${colab?.matricula || ''}"`,
      `"${colab?.status?.toUpperCase() || ''}"`,
      `"${colab?.motivoFalta || ''}"`,
      `"${colab?.substitutoNome || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-presenca-${unidadeFiltro}-${dataFormatada.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Impressão limpa e segura (PDF nativo sem erros de sandbox)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtro de Unidade e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">Relatório e Diário Operacional</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Data de referência: <span className="text-foreground font-semibold">{dataFormatada}</span> • Unidade:{' '}
            <span className="text-emerald-400 font-semibold">{regionalLabel[unidadeFiltro]}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Unidade */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
            <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
            <span className="text-xs font-medium text-muted-foreground pr-1">Unidade:</span>
            {(['todas', 'ribas', 'agua_clara'] as const).map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setUnidadeFiltro(reg)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  unidadeFiltro === reg
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {reg === 'todas' ? 'Todas' : reg === 'ribas' ? 'Ribas' : 'Água Clara'}
              </button>
            ))}
          </div>

          <Button
            onClick={exportarCSV}
            variant="outline"
            size="sm"
            className="gap-2 h-9 rounded-xl border-border bg-card/50 hover:bg-muted/80 text-foreground"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Exportar CSV
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="gap-2 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Salvar em PDF / Imprimir
          </Button>
        </div>
      </div>

      {/* Cards de Métricas do Dia */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Veículos Operando</p>
              <p className="text-xl font-bold text-foreground">{stats.totalVeiculos}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Presentes</p>
              <p className="text-xl font-bold text-emerald-400">
                {stats.totalPresentes} <span className="text-xs font-normal text-muted-foreground">/ {stats.totalGeral}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Faltas Registradas</p>
              <p className="text-xl font-bold text-rose-400">{stats.totalFaltas}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Taxa de Presença</p>
              <p className="text-xl font-bold text-amber-400">{stats.taxaPresenca}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visão de Faltas do Dia */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <CardTitle className="text-base">Faltas do Dia ({dataFormatada})</CardTitle>
            </div>
            <Badge variant="destructive" className="text-xs">
              {faltasDoDia.length} ausência(s)
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Colaboradores ausentes nas frentes de trabalho para a unidade selecionada.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {faltasDoDia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">100% de Presença!</p>
              <p className="text-xs text-muted-foreground">Nenhuma falta registrada nesta data para {regionalLabel[unidadeFiltro]}.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {faltasDoDia.map(({ colab, veiculo }) => (
                <div key={colab.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-rose-500/40 bg-rose-500/10 flex items-center justify-center shrink-0">
                      {colab.foto ? (
                        <img src={colab.foto} alt={colab.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-rose-400">{colab.nome.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{colab.nome}</p>
                      <p className="text-xs text-muted-foreground">{colab.cargo} • Matrícula: {colab.matricula}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{veiculo.prefixo}</p>
                      <p className="text-[11px] text-muted-foreground">{veiculo.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs shrink-0">
                      {colab.motivoFalta || 'Falta Não Justificada'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico Mensal de Faltas */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <CardTitle className="text-base">Histórico Mensal de Faltas</CardTitle>
                <CardDescription className="text-xs">
                  Selecione o mês para acompanhar os colaboradores com maiores índices de faltas.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {MESES.map((nomeMes, idx) => (
                <button
                  key={nomeMes}
                  type="button"
                  onClick={() => setSelectedMonth(idx)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer',
                    selectedMonth === idx
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {nomeMes.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {faltasMesSelecionado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">Sem registros de faltas recorrentes</p>
              <p className="text-xs text-muted-foreground">Nenhuma falta contabilizada no mês de {MESES[selectedMonth]} para o filtro atual.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {faltasMesSelecionado.map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center font-bold text-xs text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">{item.cargo} • {item.regional}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Total no mês:</span>
                    <Badge variant="destructive" className="font-bold text-xs">
                      {item.totalFaltas} falta{item.totalFaltas > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};