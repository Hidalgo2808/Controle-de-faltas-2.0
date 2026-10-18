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
  FileSpreadsheet,
  MapPin,
  AlertCircle,
  BarChart3,
  Flame,
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
  ]},
  { mes: 'Dezembro', mesIndex: 11, faltas: [
    { nome: 'Pedro Henrique Silva', cargo: 'Ajudante Geral', totalFaltas: 3, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
    { nome: 'Marcos Souza', cargo: 'Operador de Máquinas', totalFaltas: 2, regional: 'Ribas do Rio Pardo', regionalKey: 'ribas' },
  ]}
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  selectedRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [filtroRegionalRelatorio, setFiltroRegionalRelatorio] = useState<Regional>(selectedRegional);
  const [mesSelecionado, setMesSelecionado] = useState<number>(selectedDate?.getMonth() ?? new Date().getMonth());

  const faltasDoDia = useMemo(() => {
    const faltosos: Array<{
      id: string;
      nome: string;
      cargo: string;
      matricula: string;
      veiculoPrefixo: string;
      veiculoPlaca: string;
      regional: 'ribas' | 'agua_clara';
      motivoFalta: string;
      observacao: string;
    }> = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;
      if (filtroRegionalRelatorio !== 'todas' && v.regional !== filtroRegionalRelatorio) return;

      const assentos = [
        v.assentos.motorista,
        v.assentos.frenteDir,
        v.assentos.trasEsq,
        v.assentos.trasDir,
      ];

      assentos.forEach((c) => {
        if (c && c.status === 'falta') {
          faltosos.push({
            id: c.id,
            nome: c.nome,
            cargo: c.cargo,
            matricula: c.matricula || 'N/D',
            veiculoPrefixo: v.prefixo,
            veiculoPlaca: v.placa,
            regional: v.regional,
            motivoFalta: c.motivoFalta || 'Falta Injustificada',
            observacao: c.observacao || '-',
          });
        }
      });
    });

    return faltosos;
  }, [veiculos, filtroRegionalRelatorio]);

  const rankingFaltas = useMemo(() => {
    const dadosMes = HISTORICO_MENSAL_FALTAS.find((h) => h.mesIndex === mesSelecionado);
    if (!dadosMes) return [];

    return dadosMes.faltas
      .filter((f) => filtroRegionalRelatorio === 'todas' || f.regionalKey === filtroRegionalRelatorio)
      .sort((a, b) => b.totalFaltas - a.totalFaltas);
  }, [mesSelecionado, filtroRegionalRelatorio]);

  const maxFaltas = useMemo(() => {
    if (rankingFaltas.length === 0) return 5;
    return Math.max(...rankingFaltas.map((f) => f.totalFaltas), 5);
  }, [rankingFaltas]);

  const dataFormatada = useMemo(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return 'Hoje';
    return selectedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [selectedDate]);

  const exportarCSVFaltasDoDia = () => {
    if (faltasDoDia.length === 0) {
      alert('Nenhum colaborador com falta registrado para os filtros selecionados.');
      return;
    }

    const cabecalho = 'Data;Unidade;Colaborador;Cargo;Matrícula;Veículo;Placa;Motivo da Falta;Observação\n';
    const linhas = faltasDoDia.map((f) => {
      const unidade = f.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara';
      return `"${dataFormatada}";"${unidade}";"${f.nome}";"${f.cargo}";"${f.matricula}";"${f.veiculoPrefixo}";"${f.veiculoPlaca}";"${f.motivoFalta}";"${f.observacao}"`;
    }).join('\n');

    const csvContent = '\uFEFF' + cabecalho + linhas;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const unidadeTag = filtroRegionalRelatorio === 'todas' ? 'Geral' : filtroRegionalRelatorio.toUpperCase();
    link.setAttribute('download', `relatorio_faltas_${unidadeTag}_${dataFormatada.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Relatórios Operacionais e Histórico de Absenteísmo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Exportações filtradas por unidade e ranking estatístico de faltas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroRegionalRelatorio}
            onChange={(e) => setFiltroRegionalRelatorio(e.target.value as Regional)}
            className="h-9 px-3 rounded-xl border border-border/60 bg-background/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todas">Todas as Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>

          <Button
            size="sm"
            onClick={exportarCSVFaltasDoDia}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            Exportar Faltas do Dia (CSV)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserX className="w-4 h-4 text-rose-400" />
                    Faltas do Dia ({dataFormatada})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Lista exclusiva de colaboradores ausentes na data selecionada
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold border-rose-500/30 text-rose-400 bg-rose-500/10">
                  {faltasDoDia.length} Ausência{faltasDoDia.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {faltasDoDia.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-border/60 bg-card/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-foreground">Nenhuma falta registrada no dia</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Todas as equipes estão com presença completa na unidade selecionada.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-background/40 overflow-hidden">
                  {faltasDoDia.map((item) => (
                    <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-card/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{item.nome}</span>
                          <span className="text-[11px] text-muted-foreground">({item.cargo})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>Veículo: <strong className="text-foreground">{item.veiculoPrefixo}</strong></span>
                          <span>Unidade: <strong className="text-foreground">{item.regional === 'ribas' ? 'Ribas' : 'Água Clara'}</strong></span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <Badge variant="destructive" className="text-[10px] py-0 px-2 font-medium">
                          {item.motivoFalta}
                        </Badge>
                        {item.observacao && item.observacao !== '-' && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.observacao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border/60 bg-card/40 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Ranking de Faltas
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quem mais faltou no mês
                  </CardDescription>
                </div>

                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-border/60 bg-background/50 text-xs font-semibold text-foreground focus:outline-none"
                >
                  {MESES.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {rankingFaltas.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Sem registros de faltas recorrentes para o mês selecionado.
                </div>
              ) : (
                rankingFaltas.map((r, idx) => {
                  const porcentagem = Math.round((r.totalFaltas / maxFaltas) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-muted text-muted-foreground'
                          )}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-foreground truncate">{r.nome}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-400 shrink-0 tabular-nums">
                          {r.totalFaltas} falta{r.totalFaltas > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{r.cargo}</span>
                        <span>{r.regional}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};