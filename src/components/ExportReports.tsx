import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Users,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Filter,
  UserX,
  MapPin,
  Briefcase,
  Search,
  Sparkles,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Veiculo, Colaborador, Regional } from '../types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export interface ExportReportsProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedDate?: Date;
  selectedRegional?: Regional | string;
}

export const ExportReports: React.FC<ExportReportsProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedDate = new Date(),
  selectedRegional = 'todas',
}) => {
  const [dataInicio, setDataInicio] = useState<string>(() => {
    const hoje = selectedDate instanceof Date && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
    return hoje.toISOString().split('T')[0];
  });
  const [filtroUnidade, setFiltroUnidade] = useState<string>(selectedRegional || 'todas');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState<string>('todos');
  const [gerandoDownload, setGerandoDownload] = useState(false);

  // Consolidação de todos os operadores da operação
  const todosColaboradores = useMemo(() => {
    const lista: Array<{
      colaborador: Colaborador;
      veiculo?: Veiculo;
      regionalOrigem: 'ribas' | 'agua_clara' | string;
    }> = [];

    const jaInseridos = new Set<string>();

    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;
      const assentos = [
        { c: v.assentos.motorista },
        { c: v.assentos.frenteDir },
        { c: v.assentos.trasEsq },
        { c: v.assentos.trasDir },
      ];

      assentos.forEach(({ c }) => {
        if (c && c.id && !jaInseridos.has(c.id)) {
          jaInseridos.add(c.id);
          lista.push({
            colaborador: c,
            veiculo: v,
            regionalOrigem: v.regional || 'ribas',
          });
        }
      });
    });

    (colaboradoresReserva || []).forEach((c) => {
      if (c && c.id && !jaInseridos.has(c.id)) {
        jaInseridos.add(c.id);
        lista.push({
          colaborador: c,
          veiculo: undefined,
          regionalOrigem: c.unidade === 'Água Clara' ? 'agua_clara' : 'ribas',
        });
      }
    });

    return lista;
  }, [veiculos, colaboradoresReserva]);

  // Lista EXCLUSIVA de faltas registradas de TODAS as unidades
  const listaFaltasGeral = useMemo(() => {
    return todosColaboradores.filter((item) => item.colaborador?.status === 'falta');
  }, [todosColaboradores]);

  // Lista filtrada para a visualização na interface de tela
  const listaFaltasFiltrada = useMemo(() => {
    return listaFaltasGeral.filter((item) => {
      const c = item.colaborador;
      const matchBusca =
        !buscaTexto ||
        (c.nome || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (c.cargo || '').toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (c.matricula || '').toLowerCase().includes(buscaTexto.toLowerCase());

      const matchUnidade =
        filtroUnidade === 'todas' || item.regionalOrigem === filtroUnidade;

      const matchMotivo =
        filtroMotivo === 'todos' || c.motivoFalta === filtroMotivo;

      return matchBusca && matchUnidade && matchMotivo;
    });
  }, [listaFaltasGeral, buscaTexto, filtroUnidade, filtroMotivo]);

  // Métricas do dia (Craft Bento Grid)
  const metricas = useMemo(() => {
    const totalEfetivo = todosColaboradores.length;
    const totalFaltas = listaFaltasGeral.length;
    const presentes = todosColaboradores.filter((i) => i.colaborador.status === 'presente').length;
    const substitutos = todosColaboradores.filter((i) => i.colaborador.status === 'substituto').length;
    const taxaPresenca = totalEfetivo > 0 ? Math.round(((presentes + substitutos) / totalEfetivo) * 100) : 100;
    const atestados = listaFaltasGeral.filter((i) => i.colaborador.motivoFalta === 'Atestado Médico').length;
    const injustificadas = listaFaltasGeral.filter((i) => i.colaborador.motivoFalta === 'Falta Injustificada').length;

    return {
      totalEfetivo,
      totalFaltas,
      taxaPresenca,
      atestados,
      injustificadas,
    };
  }, [todosColaboradores, listaFaltasGeral]);

  // Data formatada para cabeçalho
  const dataFormatadaExtenso = useMemo(() => {
    try {
      const [ano, mes, dia] = dataInicio.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia, 12, 0, 0);
      return dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dataInicio;
    }
  }, [dataInicio]);

  const horaEmissao = useMemo(() => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarExcelCSV = () => {
    setGerandoDownload(true);
    try {
      const colunas = [
        'Data',
        'Nome do Colaborador',
        'Unidade Operacional',
        'Cargo / Função',
        'Matrícula',
        'Data de Admissão',
        'Status',
        'Motivo da Falta',
        'Observações',
      ];

      const linhas = listaFaltasGeral.map((item) => {
        const c = item.colaborador;
        const unidadeTexto =
          item.regionalOrigem === 'ribas'
            ? 'Ribas do Rio Pardo'
            : item.regionalOrigem === 'agua_clara'
            ? 'Água Clara'
            : c.unidade || 'Não informada';

        return [
          dataInicio,
          `"${(c.nome || '').replace(/"/g, '""')}"`,
          `"${unidadeTexto}"`,
          `"${(c.cargo || '').replace(/"/g, '""')}"`,
          `"${c.matricula || '-'}"`,
          `"${c.dataAdmissao || '-'}"`,
          'FALTA',
          `"${(c.motivoFalta || 'Não informado').replace(/"/g, '""')}"`,
          `"${(c.observacao || '-').replace(/"/g, '""')}"`,
        ].join(';');
      });

      const csvContent = '\uFEFF' + [colunas.join(';'), ...linhas].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatorio_Faltas_Diario_${dataInicio}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar CSV:', err);
    } finally {
      setGerandoDownload(false);
    }
  };

  const getIniciais = (nome?: string) => {
    if (!nome) return 'CO';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
  };

  return (
    <div className="w-full space-y-6">
      {/* Regras CSS exclusivas para a Impressão A4 de Alto Nível */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              font-size: 9.5pt !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, nav, .nao-imprimir, [data-sidebar], .btn-imprimir, .acoes-tela {
              display: none !important;
            }
            .area-impressao {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .tabela-impressao {
              width: 100% !important;
              table-layout: auto !important;
              border-collapse: collapse !important;
              margin-top: 12px !important;
              font-size: 9pt !important;
            }
            .tabela-impressao th {
              background-color: #f8fafc !important;
              color: #0f172a !important;
              font-weight: 700 !important;
              border-bottom: 2px solid #cbd5e1 !important;
              border-top: 1px solid #e2e8f0 !important;
              padding: 8px 10px !important;
              text-align: left !important;
              font-size: 8.5pt !important;
              text-transform: uppercase !important;
              letter-spacing: 0.03em !important;
            }
            .tabela-impressao td {
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 8px 10px !important;
              vertical-align: middle !important;
              word-break: normal !important;
              white-space: normal !important;
            }
            .tabela-impressao tr:nth-child(even) td {
              background-color: #fafbfc !important;
            }
            .nome-colaborador-print {
              font-weight: 700 !important;
              color: #0f172a !important;
              white-space: normal !important;
            }
            .tag-falta-print {
              display: inline-block !important;
              padding: 2px 7px !important;
              border-radius: 4px !important;
              font-weight: 700 !important;
              font-size: 8pt !important;
              background-color: #fee2e2 !important;
              color: #991b1b !important;
              border: 1px solid #fecaca !important;
            }
          }
        `,
        }}
      />

      {/* HEADER DA VISÃO DE TELA: Estética Moderna Craft UI */}
      <div className="nao-imprimir rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3 h-3" />
                Painel Analítico
              </span>
              <span className="text-xs text-muted-foreground font-medium">· Controle Diário de Ausências</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Relatório Diário de Faltas
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitoramento unificado de todas as frentes florestais para a data selecionada.
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportarExcelCSV}
              disabled={gerandoDownload}
              className="gap-2 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{gerandoDownload ? 'Exportando...' : 'Exportar CSV'}</span>
            </Button>

            <Button
              type="button"
              onClick={handleImprimir}
              className="gap-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório A4</span>
            </Button>
          </div>
        </div>

        {/* BENTO GRID DE MÉTRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Métrica: Efetivo Total */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Efetivo Alocado</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground tabular-nums">{metricas.totalEfetivo}</p>
            <p className="text-[10px] text-muted-foreground">colaboradores no mapa</p>
          </div>

          {/* Métrica: Faltas do Dia */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Faltas Registradas</span>
              <UserX className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-rose-300 tabular-nums">{metricas.totalFaltas}</p>
            <p className="text-[10px] text-rose-400/80">ausências em campo hoje</p>
          </div>

          {/* Métrica: Frequência Operacional */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Assiduidade</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-300 tabular-nums">{metricas.taxaPresenca}%</p>
            <p className="text-[10px] text-emerald-400/80">índice operacional líquido</p>
          </div>

          {/* Métrica: Motivos Críticos */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Motivos Críticos</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-300 tabular-nums">
              {metricas.atestados} <span className="text-xs font-normal text-muted-foreground">atestados /</span> {metricas.injustificadas} <span className="text-xs font-normal text-muted-foreground">injust.</span>
            </p>
            <p className="text-[10px] text-amber-400/80">distribuição de justificativas</p>
          </div>
        </div>

        {/* BARRA DE FILTROS INTERATIVOS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-border/40">
          {/* Data */}
          <div className="flex items-center gap-2 bg-muted/30 border border-border/70 rounded-xl px-3 py-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          {/* Busca por Nome/Cargo */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar colaborador, função ou matrícula..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Filtro de Unidade */}
          <select
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="todas">Todas as Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>

          {/* Filtro de Motivo */}
          <select
            value={filtroMotivo}
            onChange={(e) => setFiltroMotivo(e.target.value)}
            className="h-9 px-3 rounded-xl border border-input bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="todos">Todos os Motivos</option>
            <option value="Atestado Médico">Atestado Médico</option>
            <option value="Falta Injustificada">Falta Injustificada</option>
            <option value="Folga Compensatória">Folga Compensatória</option>
            <option value="Problema de Transporte">Problema de Transporte</option>
            <option value="Licença Especial">Licença Especial</option>
          </select>
        </div>
      </div>

      {/* TABELA DE VISUALIZAÇÃO EM TELA */}
      <div className="nao-imprimir rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-sm text-foreground">
              Quadro de Ausências ({listaFaltasFiltrada.length})
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              · {dataFormatadaExtenso}
            </span>
          </div>

          <Badge variant="outline" className="text-[11px] font-semibold border-border/80 text-muted-foreground">
            {filtroUnidade === 'todas'
              ? 'Consolidado Geral'
              : filtroUnidade === 'ribas'
              ? 'Polo Ribas do Rio Pardo'
              : 'Polo Água Clara'}
          </Badge>
        </div>

        {listaFaltasFiltrada.length === 0 ? (
          <div className="py-14 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Nenhuma falta encontrada</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Não há registros de faltas para os filtros selecionados nesta data. A operação está operando com assiduidade plena.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4">Matrícula</th>
                  <th className="py-3 px-4">Motivo Informado</th>
                  <th className="py-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {listaFaltasFiltrada.map((item) => {
                  const c = item.colaborador;
                  const unidadeNome =
                    item.regionalOrigem === 'ribas'
                      ? 'Ribas do Rio Pardo'
                      : item.regionalOrigem === 'agua_clara'
                      ? 'Água Clara'
                      : c.unidade || 'Ribas';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-center font-bold text-rose-300 text-xs shrink-0">
                            {getIniciais(c.nome)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight group-hover:text-amber-400 transition-colors">
                              {c.nome}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Admissão: {c.dataAdmissao || 'Não informada'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium text-foreground">{unidadeNome}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{c.cargo || 'Operador Florestal'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs tabular-nums px-2 py-0.5 rounded bg-muted/40 border border-border/50 text-foreground">
                          {c.matricula || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[11px] font-semibold py-0.5 px-2.5',
                            c.motivoFalta === 'Atestado Médico'
                              ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                              : c.motivoFalta === 'Falta Injustificada'
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          )}
                        >
                          {c.motivoFalta || 'Falta Registrada'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-muted-foreground line-clamp-2">
                          {c.observacao || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ÁREA DE IMPRESSÃO A4 (APENAS A LISTAGEM DE QUEM FALTOU DE TODAS AS UNIDADES) */}
      <div className="hidden print:block area-impressao">
        {/* Cabeçalho Limpo e Corporativo */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-in-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '15pt', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Relatório Diário de Ausências
              </h1>
              <p style={{ fontSize: '9pt', color: '#475569', margin: '3px 0 0 0' }}>
                Consolidado Geral de Campo · Todas as Unidades Operacionais
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#475569' }}>
              <div><strong>Data de Referência:</strong> {dataFormatadaExtenso}</div>
              <div><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {horaEmissao}</div>
            </div>
          </div>
        </div>

        {/* Resumo Estatístico do Topo da Impressão */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', fontSize: '8.5pt', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div><strong>Total de Faltas no Dia:</strong> {listaFaltasGeral.length} operadores</div>
          <div>·</div>
          <div><strong>Atestados Médicos:</strong> {metricas.atestados}</div>
          <div>·</div>
          <div><strong>Faltas Injustificadas:</strong> {metricas.injustificadas}</div>
          <div>·</div>
          <div><strong>Outros Motivos:</strong> {listaFaltasGeral.length - (metricas.atestados + metricas.injustificadas)}</div>
        </div>

        {/* Tabela de Ausências Pura e Sem Cortes */}
        {listaFaltasGeral.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: '#475569', fontSize: '10pt' }}>
            Nenhuma ausência registrada na data de referência em nenhuma unidade operacional.
          </div>
        ) : (
          <table className="tabela-impressao">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th style={{ width: '30%' }}>Nome do Colaborador</th>
                <th style={{ width: '18%' }}>Unidade</th>
                <th style={{ width: '18%' }}>Função / Cargo</th>
                <th style={{ width: '18%' }}>Motivo da Falta</th>
                <th style={{ width: '12%' }}>Matrícula</th>
              </tr>
            </thead>
            <tbody>
              {listaFaltasGeral.map((item, index) => {
                const c = item.colaborador;
                const unidadeTexto =
                  item.regionalOrigem === 'ribas'
                    ? 'Ribas do Rio Pardo'
                    : item.regionalOrigem === 'agua_clara'
                    ? 'Água Clara'
                    : c.unidade || 'Não informada';

                return (
                  <tr key={`print-${c.id}-${index}`}>
                    <td style={{ color: '#64748b', fontSize: '8pt', textAlign: 'center' }}>
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="nome-colaborador-print">
                      {c.nome}
                    </td>
                    <td style={{ color: '#334155' }}>
                      {unidadeTexto}
                    </td>
                    <td style={{ color: '#334155' }}>
                      {c.cargo || 'Operador Florestal'}
                    </td>
                    <td>
                      <span className="tag-falta-print">
                        {c.motivoFalta || 'Falta Registrada'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '8.5pt', color: '#475569' }}>
                      {c.matricula || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Rodapé formal da impressão */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#94a3b8' }}>
          <span>Sistema de Gestão Operacional Florestal · Controle de Faltas</span>
          <span>Página 1 de 1 · Documento Interno para Auditoria e Apuração</span>
        </div>
      </div>
    </div>
  );
};