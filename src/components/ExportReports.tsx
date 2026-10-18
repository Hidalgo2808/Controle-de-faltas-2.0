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
    { nome: 'Lucas Gabriel Costa', cargo: 'Motorista de Apoio', totalFaltas: 3, regional: 'Água Clara', regionalKey: 'agua_clara' },
  ]},
];

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  selectedDate = new Date(),
}) => {
  const [mesSelecionado, setMesSelecionado] = useState<number>(selectedDate?.getMonth() ?? 0);

  // Lista de pessoas que faltaram no dia selecionado
  const faltantesDia = useMemo(() => {
    const list: Array<{
      id: string;
      nome: string;
      cargo: string;
      regional: string;
      veiculo: string;
      motivo?: string;
    }> = [];

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;
      if (selectedRegional !== 'todas' && v.regional !== selectedRegional) return;

      const assentos = [v.assentos.motorista, v.assentos.frenteDir, v.assentos.trasEsq, v.assentos.trasDir];
      assentos.forEach((colab) => {
        if (colab && colab.status === 'falta') {
          list.push({
            id: colab.id,
            nome: colab.nome,
            cargo: colab.cargo,
            regional: v.regional === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
            veiculo: v.prefixo,
            motivo: colab.motivoFalta || 'Não justificado',
          });
        }
      });
    });

    return list;
  }, [veiculos, selectedRegional]);

  // Ranking do mês selecionado
  const rankingMes = useMemo(() => {
    const mesObj = HISTORICO_MENSAL_FALTAS.find((m) => m.mesIndex === mesSelecionado);
    if (!mesObj) return [];
    if (selectedRegional === 'todas') return mesObj.faltas;
    return mesObj.faltas.filter((f) => f.regionalKey === selectedRegional);
  }, [mesSelecionado, selectedRegional]);

  const exportarCSV = () => {
    const headers = ['Nome', 'Cargo', 'Unidade', 'Veículo', 'Motivo da Falta'];
    const rows = faltantesDia.map((f) => [f.nome, f.cargo, f.regional, f.veiculo, f.motivo]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_faltas_${selectedRegional}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Relatórios de Frequência & Faltas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filtrado por: <span className="font-semibold text-foreground">{regionalLabel[selectedRegional]}</span>
          </p>
        </div>

        <Button onClick={exportarCSV} className="text-xs gap-1.5 h-9 rounded-xl font-semibold">
          <Download className="w-4 h-4" />
          Exportar Faltas do Dia (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel 1: Faltas do Dia */}
        <Card className="border-border/80">
          <CardHeader className="p-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" />
              Colaboradores Ausentes no Dia
            </CardTitle>
            <CardDescription className="text-xs">
              Lista de ausências registradas para {regionalLabel[selectedRegional]}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {faltantesDia.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-60 mb-2" />
                Nenhuma falta registrada nesta data para a unidade selecionada.
              </div>
            ) : (
              faltantesDia.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{f.nome}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {f.cargo} • {f.veiculo}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/30">
                    {f.motivo}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Painel 2: Ranking Mensal de Faltas */}
        <Card className="border-border/80">
          <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Histórico / Quem Mais Faltou
              </CardTitle>
              <CardDescription className="text-xs">Ranking acumulado no período</CardDescription>
            </div>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
            >
              {MESES.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {rankingMes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nenhum registro para o mês selecionado.
              </p>
            ) : (
              rankingMes.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-foreground">{r.nome}</p>
                      <p className="text-muted-foreground text-[11px]">{r.cargo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-400 tabular-nums">{r.totalFaltas}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">faltas</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};