import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Users,
  Car,
  TrendingUp,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  MapPin,
  AlertCircle,
  BarChart3,
  Building2,
  Briefcase,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Veiculo, Colaborador, Regional } from '../types';

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

const HISTORICO_MENSAL_FALTAS = [
  {
    mes: 'Janeiro',
    mesIndex: 0,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Felipe Augusto Lima', funcao: 'Operador de Motosserra', unidade: 'Ribas do Rio Pardo', dataAdmissao: '01/06/2023', totalFaltas: 2, regionalKey: 'ribas' },
      { nome: 'Roberto Alves Santos', funcao: 'Operador de Carregadeira', unidade: 'Água Clara', dataAdmissao: '22/02/2021', totalFaltas: 1, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Fevereiro',
    mesIndex: 1,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 5, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Roberto Alves Santos', funcao: 'Operador de Carregadeira', unidade: 'Água Clara', dataAdmissao: '22/02/2021', totalFaltas: 2, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Março',
    mesIndex: 2,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 5, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'André Silva Campos', funcao: 'Técnico de Segurança', unidade: 'Ribas do Rio Pardo', dataAdmissao: '10/05/2020', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Abril',
    mesIndex: 3,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 2, regionalKey: 'agua_clara' },
      { nome: 'Felipe Augusto Lima', funcao: 'Operador de Motosserra', unidade: 'Ribas do Rio Pardo', dataAdmissao: '01/06/2023', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Maio',
    mesIndex: 4,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 2, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Junho',
    mesIndex: 5,
    faltas: [
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 2, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Julho',
    mesIndex: 6,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Roberto Alves Santos', funcao: 'Operador de Carregadeira', unidade: 'Água Clara', dataAdmissao: '22/02/2021', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 2, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Agosto',
    mesIndex: 7,
    faltas: [
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 5, regionalKey: 'agua_clara' },
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'André Silva Campos', funcao: 'Técnico de Segurança', unidade: 'Ribas do Rio Pardo', dataAdmissao: '10/05/2020', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Setembro',
    mesIndex: 8,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 3, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Outubro',
    mesIndex: 9,
    faltas: [
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Novembro',
    mesIndex: 10,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 2, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Dezembro',
    mesIndex: 11,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  }
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [mesSelecionadoIndex, setMesSelecionadoIndex] = useState<number>(new Date().getMonth());

  const veiculosFiltrados = useMemo(() => {
    if (selectedRegional === 'todas') return veiculos || [];
    return (veiculos || []).filter((v) => v?.regional === selectedRegional);
  }, [veiculos, selectedRegional]);

  const resumo = useMemo(() => {
    let totalPresentes = 0;
    let totalFaltas = 0;
    let totalSubstitutos = 0;
    let totalOperadores = 0;

    veiculosFiltrados.forEach((v) => {
      if (!v || !v.assentos) return;
      const assentos = [v.assentos.motorista, v.assentos.frenteDir, v.assentos.trasEsq, v.assentos.trasDir].filter(Boolean);
      assentos.forEach((c) => {
        if (!c) return;
        totalOperadores++;
        if (c.status === 'presente') totalPresentes++;
        else if (c.status === 'falta') totalFaltas++;
        else if (c.status === 'substituto') totalSubstitutos++;
      });
    });

    const taxa = totalOperadores > 0 ? Math.round(((totalPresentes + totalSubstitutos) / totalOperadores) * 100) : 100;

    return {
      totalOperadores,
      totalPresentes,
      totalFaltas,
      totalSubstitutos,
      taxa,
    };
  }, [veiculosFiltrados]);

  const faltasMesAtual = useMemo(() => {
    const dadosMes = HISTORICO_MENSAL_FALTAS.find((h) => h.mesIndex === mesSelecionadoIndex) || HISTORICO_MENSAL_FALTAS[0];
    if (selectedRegional === 'todas') return dadosMes.faltas;
    return dadosMes.faltas.filter((f) => f.regionalKey === selectedRegional);
  }, [mesSelecionadoIndex, selectedRegional]);

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportarRelatorioGeral = () => {
    const dataStr = selectedDate.toLocaleDateString('pt-BR');
    const cabecalho = 'Veículo;Placa;Regional;Posição;Operador;Status;Motivo da Falta;Observação\n';
    
    const linhas: string[] = [];
    veiculosFiltrados.forEach((v) => {
      const assentos = [
        { label: 'Motorista (Eq 1)', c: v.assentos?.motorista },
        { label: 'Ajudante (Eq 1)', c: v.assentos?.frenteDir },
        { label: 'Traseiro Esq (Eq 2)', c: v.assentos?.trasEsq },
        { label: 'Traseiro Dir (Eq 2)', c: v.assentos?.trasDir },
      ];

      assentos.forEach(({ label, c }) => {
        if (!c) return;
        linhas.push(
          `"${v.prefixo}";"${v.placa}";"${v.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara'}";"${label}";"${c.nome}";"${c.status}";"${c.motivoFalta || '-'}";"${c.observacao || '-'}"`
        );
      });
    });

    const csvContent = cabecalho + linhas.join('\n');
    downloadCSV(csvContent, `Relatorio_Operacional_${dataStr.replace(/\//g, '-')}.csv`);
  };

  const handleExportarFaltasMensal = () => {
    const mesNome = MESES[mesSelecionadoIndex];
    const cabecalho = 'Mês;Colaborador;Função;Unidade;Data de Admissão;Total de Faltas no Mês\n';
    const linhas = faltasMesAtual.map((f) =>
      `"${mesNome}";"${f.nome}";"${f.funcao}";"${f.unidade}";"${f.dataAdmissao}";"${f.totalFaltas}"`
    );

    const csvContent = cabecalho + linhas.join('\n');
    downloadCSV(csvContent, `Historico_Faltas_${mesNome}_2026.csv`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner de Relatórios */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Relatórios & Histórico Consolidado</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Indicadores diários, consolidação de presença e histórico mensal de absenteísmo por regional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportarRelatorioGeral}
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Escala do Dia (CSV/Excel)</span>
            </Button>
            <Button
              onClick={() => window.print()}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </Button>
          </div>
        </div>

        {/* Tiles Rápidos de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-border/40 bg-card/40 space-y-1">
            <span className="text-[11px] text-muted-foreground">Efetivo Escalado</span>
            <p className="text-xl font-black text-foreground tabular-nums">{resumo.totalOperadores}</p>
          </div>
          <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-1">
            <span className="text-[11px] text-emerald-400">Presentes em Campo</span>
            <p className="text-xl font-black text-emerald-300 tabular-nums">{resumo.totalPresentes}</p>
          </div>
          <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-1">
            <span className="text-[11px] text-rose-400">Faltas Registradas</span>
            <p className="text-xl font-black text-rose-300 tabular-nums">{resumo.totalFaltas}</p>
          </div>
          <div className="p-3 rounded-xl border border-primary/25 bg-primary/5 space-y-1">
            <span className="text-[11px] text-primary">Taxa de Ocupação</span>
            <p className="text-xl font-black text-primary tabular-nums">{resumo.taxa}%</p>
          </div>
        </div>
      </div>

      {/* Histórico Mensal de Faltas */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              <span>Histórico Mensal de Absenteísmo (2026)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Selecione o mês para visualizar o ranking de colaboradores com registros de faltas.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleExportarFaltasMensal}
              size="sm"
              className="gap-2 bg-amber-600 hover:bg-amber-500 text-white"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Mês ({MESES[mesSelecionadoIndex]})</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Seletor de Meses */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {MESES.map((mes, idx) => (
              <button
                key={mes}
                type="button"
                onClick={() => setMesSelecionadoIndex(idx)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  mesSelecionadoIndex === idx
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40 hover:border-border'
                )}
              >
                {mes}
              </button>
            ))}
          </div>

          {/* Tabela de Colaboradores com Faltas */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">Função / Cargo</th>
                    <th className="p-3">Unidade Regional</th>
                    <th className="p-3">Data de Admissão</th>
                    <th className="p-3 text-right">Faltas no Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {faltasMesAtual.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        Nenhum registro de falta no mês de {MESES[mesSelecionadoIndex]}.
                      </td>
                    </tr>
                  ) : (
                    faltasMesAtual.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center">
                            {item.totalFaltas}
                          </span>
                          <span>{item.nome}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{item.funcao}</td>
                        <td className="p-3 text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{item.unidade}</span>
                        </td>
                        <td className="p-3 text-muted-foreground tabular-nums">{item.dataAdmissao}</td>
                        <td className="p-3 text-right">
                          <Badge variant="destructive" className="tabular-nums">
                            {item.totalFaltas} {item.totalFaltas === 1 ? 'falta' : 'faltas'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};