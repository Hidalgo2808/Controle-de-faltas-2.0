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
  FileDown,
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
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 2, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Outubro',
    mesIndex: 9,
    faltas: [
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 3, regionalKey: 'agua_clara' },
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 3, regionalKey: 'ribas' },
    ]
  },
  {
    mes: 'Novembro',
    mesIndex: 10,
    faltas: [
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 5, regionalKey: 'ribas' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 3, regionalKey: 'ribas' },
      { nome: 'Roberto Alves Santos', funcao: 'Operador de Carregadeira', unidade: 'Água Clara', dataAdmissao: '22/02/2021', totalFaltas: 3, regionalKey: 'agua_clara' },
    ]
  },
  {
    mes: 'Dezembro',
    mesIndex: 11,
    faltas: [
      { nome: 'Lucas Gabriel Costa', funcao: 'Motorista de Apoio', unidade: 'Água Clara', dataAdmissao: '14/11/2022', totalFaltas: 4, regionalKey: 'agua_clara' },
      { nome: 'Pedro Henrique Silva', funcao: 'Ajudante Geral', unidade: 'Ribas do Rio Pardo', dataAdmissao: '12/03/2022', totalFaltas: 4, regionalKey: 'ribas' },
      { nome: 'Carlos Eduardo Santos', funcao: 'Mecânico Florestal', unidade: 'Água Clara', dataAdmissao: '19/01/2023', totalFaltas: 2, regionalKey: 'agua_clara' },
      { nome: 'Marcos Souza', funcao: 'Operador de Máquinas', unidade: 'Ribas do Rio Pardo', dataAdmissao: '05/08/2021', totalFaltas: 2, regionalKey: 'ribas' },
    ]
  },
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [mesSelecionado, setMesSelecionado] = useState<number>(selectedDate?.getMonth?.() ?? 2);
  const [isExporting, setIsExporting] = useState(false);

  // Consolidação de colaboradores atuais
  const todosColaboradores = useMemo(() => {
    const lista: Array<{
      nome: string;
      cargo: string;
      status: string;
      unidade: string;
      dataAdmissao: string;
      veiculoPrefixo: string;
      placa: string;
      regional: string;
      motivo?: string;
    }> = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;
      const assentos = [
        v.assentos.motorista,
        v.assentos.frenteDir,
        v.assentos.trasEsq,
        v.assentos.trasDir,
      ];
      assentos.forEach((c) => {
        if (!c) return;
        lista.push({
          nome: c.nome || 'Não informado',
          cargo: c.cargo || 'Operador Florestal',
          status: c.status === 'presente' ? 'Presente' : c.status === 'substituto' ? 'Substituto' : 'Falta',
          unidade: c.unidade || (v.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo'),
          dataAdmissao: c.dataAdmissao || '10/02/2023',
          veiculoPrefixo: v.prefixo || '',
          placa: v.placa || '',
          regional: v.regional || 'ribas',
          motivo: c.motivoFalta || '-',
        });
      });
    });

    (colaboradoresReserva || []).forEach((r) => {
      if (!r) return;
      lista.push({
        nome: r.nome || 'Não informado',
        cargo: r.cargo || 'Reserva Operacional',
        status: r.status === 'presente' ? 'Presente (Reserva)' : r.status === 'substituto' ? 'Em Campo' : 'Falta',
        unidade: r.unidade || 'Ribas do Rio Pardo',
        dataAdmissao: r.dataAdmissao || '05/06/2023',
        veiculoPrefixo: 'Banco Reserva',
        placa: '-',
        regional: 'ribas',
        motivo: r.motivoFalta || '-',
      });
    });

    return lista;
  }, [veiculos, colaboradoresReserva]);

  const faltasDoMes = useMemo(() => {
    const mesObj = HISTORICO_MENSAL_FALTAS.find((h) => h.mesIndex === mesSelecionado) || HISTORICO_MENSAL_FALTAS[0];
    if (selectedRegional === 'todas') return mesObj.faltas;
    return mesObj.faltas.filter((f) => f.regionalKey === selectedRegional);
  }, [mesSelecionado, selectedRegional]);

  // Função nativa universal de download de planilhas (sem bibliotecas externas)
  const baixarPlanilhaNativa = (nomeArquivo: string, linhas: string[][]) => {
    const conteudoCSV = '\uFEFF' + linhas.map(row => 
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')
    ).join('\r\n');

    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nomeArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportarHistoricoMensal = () => {
    setIsExporting(true);
    try {
      const nomeMes = MESES[mesSelecionado];
      const cabecalho = ['Nome', 'Unidade', 'Função', 'Data de Admissão', 'Total de Faltas no Mês'];
      const dadosLinhas = faltasDoMes.map(f => [
        f.nome,
        f.unidade,
        f.funcao,
        f.dataAdmissao,
        String(f.totalFaltas),
      ]);

      const linhasCompleta = [
        [`Relatório de Faltas Florestais - Mês de ${nomeMes} / 2024`],
        [`Unidade: ${regionalLabel[selectedRegional]}`],
        [`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`],
        [],
        cabecalho,
        ...dadosLinhas,
      ];

      baixarPlanilhaNativa(`relatorio-faltas-${nomeMes.toLowerCase()}-2024`, linhasCompleta);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportarEscalaAtual = () => {
    setIsExporting(true);
    try {
      const dataStr = selectedDate.toLocaleDateString('pt-BR').replace(/\//g, '-');
      const filtrados = todosColaboradores.filter(
        (c) => selectedRegional === 'todas' || c.regional === selectedRegional
      );

      const cabecalho = [
        'Nome',
        'Unidade',
        'Função',
        'Data de Admissão',
        'Status do Dia',
        'Veículo Prefixo',
        'Placa',
        'Observação / Motivo'
      ];

      const dadosLinhas = filtrados.map(c => [
        c.nome,
        c.unidade,
        c.cargo,
        c.dataAdmissao,
        c.status,
        c.veiculoPrefixo,
        c.placa,
        c.motivo || '-',
      ]);

      const linhasCompleta = [
        [`Escala Diária e Presença de Operadores Florestais - ${dataStr}`],
        [`Filtro Unidade: ${regionalLabel[selectedRegional]}`],
        [],
        cabecalho,
        ...dadosLinhas,
      ];

      baixarPlanilhaNativa(`escala-operacional-${dataStr}`, linhasCompleta);
    } finally {
      setIsExporting(false);
    }
  };

  const totalFaltasAcumuladas = useMemo(() => {
    return faltasDoMes.reduce((acc, curr) => acc + curr.totalFaltas, 0);
  }, [faltasDoMes]);

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho da Seção de Relatórios */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Relatórios & Histórico Mensal</h2>
              <p className="text-xs text-muted-foreground">
                Planilhas detalhadas com Nome, Unidade, Função e Data de Admissão
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportarEscalaAtual}
            disabled={isExporting}
            className="gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Exportar Escala do Dia (.csv)</span>
          </Button>

          <Button
            type="button"
            onClick={handleExportarHistoricoMensal}
            disabled={isExporting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Planilha Mensal (.csv)</span>
          </Button>
        </div>
      </div>

      {/* Seletor de Meses do Ano */}
      <Card className="border-border/80">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-base font-bold">Histórico de Faltas por Mês</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                {regionalLabel[selectedRegional]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalFaltasAcumuladas} faltas registradas em {MESES[mesSelecionado]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {MESES.map((nomeMes, index) => (
              <button
                key={nomeMes}
                type="button"
                onClick={() => setMesSelecionado(index)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer',
                  mesSelecionado === index
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-border/40'
                )}
              >
                {nomeMes}
              </button>
            ))}
          </div>

          {/* Tabela com Colunas Obrigatórias */}
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="py-3 px-4">Nome do Colaborador</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Função / Cargo</th>
                  <th className="py-3 px-4">Data de Admissão</th>
                  <th className="py-3 px-4 text-center">Faltas no Mês</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {faltasDoMes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Nenhuma falta registrada para {MESES[mesSelecionado]} nesta unidade.
                    </td>
                  </tr>
                ) : (
                  faltasDoMes.map((item, idx) => (
                    <tr
                      key={`${item.nome}-${idx}`}
                      className="hover:bg-muted/30 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[10px] font-black text-emerald-400">
                            {item.nome.split(' ').map(p => p[0]).slice(0, 2).join('')}
                          </div>
                          <span>{item.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium">
                          <Building2 className="w-3 h-3 text-emerald-400" />
                          {item.unidade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                          <Briefcase className="w-3 h-3 text-teal-400" />
                          {item.funcao}
                        </span>
                      </td>
                      <td className="py-3 px-4 tabular-nums text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.dataAdmissao}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums bg-rose-500/15 text-rose-400 border border-rose-500/25">
                          {item.totalFaltas} {item.totalFaltas === 1 ? 'falta' : 'faltas'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const dados = [
                              ['Relatório Individual de Faltas'],
                              [`Nome: ${item.nome}`],
                              [`Unidade: ${item.unidade}`],
                              [`Função: ${item.funcao}`],
                              [`Data de Admissão: ${item.dataAdmissao}`],
                              [`Mês de Referência: ${MESES[mesSelecionado]}/2024`],
                              [`Faltas no Período: ${item.totalFaltas}`],
                            ];
                            baixarPlanilhaNativa(`faltas-${item.nome.toLowerCase().replace(/\s+/g, '-')}`, dados);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-300 transition-colors"
                        >
                          Exportar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};