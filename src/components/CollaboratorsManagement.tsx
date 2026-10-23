import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Phone,
  Building2,
  Briefcase,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  FileCheck,
  Eye,
  FileUp,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Colaborador, Veiculo, StatusPresenca, MotivoFalta, Regional } from '../types';

export interface ColaboradorCompleto {
  id: string;
  nome: string;
  cargo: string;
  matricula?: string;
  foto: string;
  telefone: string;
  status: StatusPresenca;
  motivoFalta?: MotivoFalta;
  observacao?: string;
  substitutoNome?: string;
  equipeId: string;
  equipeNumero: 1 | 2;
  posicaoVeiculo: 'motorista' | 'frente_dir' | 'tras_esq' | 'tras_dir';
  veiculoPrefixo: string;
  veiculoPlaca: string;
  regional: 'ribas' | 'agua_clara';
  unidade?: string;
  dataAdmissao?: string;
}

export interface CollaboratorsManagementProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
  selectedRegional?: Regional;
  onUpdateColaboradorStatus?: (
    colabId: string,
    novoStatus: StatusPresenca,
    motivo?: MotivoFalta,
    obs?: string
  ) => void;
  onImportarColaboradores?: (novosColaboradores: ColaboradorCompleto[]) => void;
  onAdicionarColaborador?: (novoColaborador: ColaboradorCompleto) => void;
}

const statusConfig: Record<StatusPresenca, { label: string; className: string }> = {
  presente: { label: 'Presente', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  falta: { label: 'Falta', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  substituto: { label: 'Substituto', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const regionalLabel: Record<string, string> = {
  ribas: 'Ribas do Rio Pardo',
  agua_clara: 'Água Clara',
};

const getIniciais = (nome?: string) => {
  if (!nome) return 'CO';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + (partes[partes.length - 1]?.[0] || '')).toUpperCase();
};

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  selectedRegional = 'todas',
  onImportarColaboradores,
  onAdicionarColaborador,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPresenca | 'todos'>('todos');
  const [filterRegional, setFilterRegional] = useState<Regional | 'todas'>(selectedRegional);
  const [fotoModalAberta, setFotoModalAberta] = useState<{ url: string; nome: string; cargo: string } | null>(null);

  // Modal de cadastro manual
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCargo, setNovoCargo] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaFoto, setNovaFoto] = useState<string>('');
  const [novaUnidade, setNovaUnidade] = useState<'ribas' | 'agua_clara'>('ribas');
  const [novaDataAdmissao, setNovaDataAdmissao] = useState('15/01/2023');

  // Modal de Importação de Planilha
  const [modalExcelAberto, setModalExcelAberto] = useState(false);
  const [isProcessandoExcel, setIsProcessandoExcel] = useState(false);
  const [excelPreview, setExcelPreview] = useState<ColaboradorCompleto[]>([]);
  const [excelErro, setExcelErro] = useState<string | null>(null);
  const [excelArquivoNome, setExcelArquivoNome] = useState<string>('');
  const [excelImportSucesso, setExcelImportSucesso] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const colaboradoresBase: ColaboradorCompleto[] = useMemo(() => {
    const lista: ColaboradorCompleto[] = [];
    (veiculos || []).forEach((v) => {
      if (!v || !v.assentos) return;
      const assentos: Array<{ colab?: Colaborador; pos: ColaboradorCompleto['posicaoVeiculo'] }> = [
        { colab: v.assentos.motorista, pos: 'motorista' },
        { colab: v.assentos.frenteDir, pos: 'frente_dir' },
        { colab: v.assentos.trasEsq, pos: 'tras_esq' },
        { colab: v.assentos.trasDir, pos: 'tras_dir' },
      ];
      assentos.forEach(({ colab, pos }) => {
        if (!colab) return;
        lista.push({
          id: colab.id,
          nome: colab.nome || 'Sem Nome',
          cargo: colab.cargo || 'Operador',
          matricula: '',
          foto: colab.foto ?? '',
          telefone: colab.telefone ?? '',
          status: colab.status || 'presente',
          motivoFalta: colab.motivoFalta,
          observacao: colab.observacao,
          substitutoNome: colab.substitutoNome,
          equipeId: colab.equipeId || '',
          equipeNumero: colab.equipeNumero || 1,
          posicaoVeiculo: pos,
          veiculoPrefixo: v.prefixo || '',
          veiculoPlaca: v.placa || '',
          regional: v.regional || 'ribas',
          unidade: colab.unidade || (v.regional === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo'),
          dataAdmissao: colab.dataAdmissao || '10/02/2023',
        });
      });
    });

    (colaboradoresReserva || []).forEach((r, idx) => {
      if (!r) return;
      lista.push({
        id: r.id || `res-${idx}`,
        nome: r.nome || 'Colaborador Reserva',
        cargo: r.cargo || 'Reserva Operacional',
        matricula: '',
        foto: r.foto || '',
        telefone: r.telefone || '',
        status: r.status || 'presente',
        motivoFalta: r.motivoFalta,
        observacao: r.observacao,
        substitutoNome: r.substitutoNome,
        equipeId: 'reserva',
        equipeNumero: 1,
        posicaoVeiculo: 'motorista',
        veiculoPrefixo: 'Banco de Reserva',
        veiculoPlaca: '-',
        regional: 'ribas',
        unidade: r.unidade || 'Ribas do Rio Pardo',
        dataAdmissao: r.dataAdmissao || '05/06/2023',
      });
    });

    return lista;
  }, [veiculos, colaboradoresReserva]);

  const [colaboradoresAdicionados, setColaboradoresAdicionados] = useState<ColaboradorCompleto[]>([]);

  const todosColaboradores = useMemo(() => {
    return [...colaboradoresBase, ...colaboradoresAdicionados];
  }, [colaboradoresBase, colaboradoresAdicionados]);

  const colaboradoresFiltrados = useMemo(() => {
    return todosColaboradores.filter((c) => {
      if (!c) return false;
      const matchSearch =
        !search ||
        (c.nome || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.cargo || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.veiculoPlaca || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.veiculoPrefixo || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.unidade || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchRegional = filterRegional === 'todas' || c.regional === filterRegional;

      return matchSearch && matchStatus && matchRegional;
    });
  }, [todosColaboradores, search, filterStatus, filterRegional]);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNovaFoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCadastrarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const novo: ColaboradorCompleto = {
      id: `colab-custom-${Date.now()}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim() || 'Operador Florestal',
      matricula: '',
      foto: novaFoto,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
      status: 'presente',
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: novaUnidade,
      unidade: novaUnidade === 'ribas' ? 'Ribas do Rio Pardo' : 'Água Clara',
      dataAdmissao: novaDataAdmissao || '15/01/2023',
    };

    setColaboradoresAdicionados((prev) => [novo, ...prev]);
    onAdicionarColaborador?.(novo);

    setNovoNome('');
    setNovoCargo('');
    setNovoTelefone('');
    setNovaFoto('');
    setModalNovoAberto(false);
  };

  const parseCSVLinhas = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((linha) => {
      const separator = linha.includes(';') ? ';' : ',';
      return linha.split(separator).map((item) => item.trim().replace(/^["']|["']$/g, ''));
    });
  };

  const handleArquivoExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelArquivoNome(file.name);
    setExcelErro(null);
    setExcelImportSucesso(false);
    setIsProcessandoExcel(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const conteudo = evt.target?.result;
        if (!conteudo) {
          throw new Error('Arquivo vazio ou ilegível');
        }

        const texto = typeof conteudo === 'string' ? conteudo : new TextDecoder('utf-8').decode(conteudo as ArrayBuffer);
        const linhas = parseCSVLinhas(texto);

        if (linhas.length < 2) {
          throw new Error('O arquivo deve conter ao menos 1 linha de cabeçalho e 1 linha de dados.');
        }

        const header = linhas[0].map((h) => h.toLowerCase());
        const colNomeIdx = header.findIndex((h) => h.includes('nome') || h.includes('colaborador'));
        const colCargoIdx = header.findIndex((h) => h.includes('cargo') || h.includes('função') || h.includes('funcao'));
        const colTelIdx = header.findIndex((h) => h.includes('tel') || h.includes('fone') || h.includes('contato'));
        const colUnidadeIdx = header.findIndex((h) => h.includes('unidade') || h.includes('regional') || h.includes('polo'));
        const colAdmissaoIdx = header.findIndex((h) => h.includes('admiss') || h.includes('data'));

        const parsedColaboradores: ColaboradorCompleto[] = [];

        for (let i = 1; i < linhas.length; i++) {
          const row = linhas[i];
          if (!row || row.length === 0 || !row[0]) continue;

          const nome = (colNomeIdx >= 0 ? row[colNomeIdx] : row[0]) || '';
          if (!nome.trim()) continue;

          const cargo = (colCargoIdx >= 0 ? row[colCargoIdx] : row[1]) || 'Operador Florestal';
          const telefone = (colTelIdx >= 0 ? row[colTelIdx] : row[2]) || '(67) 99999-0000';
          const rawUnidade = (colUnidadeIdx >= 0 ? row[colUnidadeIdx] : row[3]) || 'Ribas do Rio Pardo';
          const rawAdmissao = (colAdmissaoIdx >= 0 ? row[colAdmissaoIdx] : row[4]) || '15/01/2023';

          const isAguaClara = rawUnidade.toLowerCase().includes('agua') || rawUnidade.toLowerCase().includes('clara');
          const reg: 'ribas' | 'agua_clara' = isAguaClara ? 'agua_clara' : 'ribas';

          parsedColaboradores.push({
            id: `excel-import-${Date.now()}-${i}`,
            nome: nome.trim(),
            cargo: cargo.trim(),
            matricula: '',
            foto: '',
            telefone: telefone.trim(),
            status: 'presente',
            equipeId: 'reserva',
            equipeNumero: 1,
            posicaoVeiculo: 'motorista',
            veiculoPrefixo: 'Banco de Reserva',
            veiculoPlaca: '-',
            regional: reg,
            unidade: reg === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
            dataAdmissao: rawAdmissao.trim(),
          });
        }

        if (parsedColaboradores.length === 0) {
          throw new Error('Nenhum registro de colaborador foi identificado. Verifique se há uma coluna com "Nome".');
        }

        setExcelPreview(parsedColaboradores);
        setIsProcessandoExcel(false);
      } catch (err: any) {
        setIsProcessandoExcel(false);
        setExcelErro(err.message || 'Falha ao processar arquivo.');
      }
    };

    reader.onerror = () => {
      setIsProcessandoExcel(false);
      setExcelErro('Erro na leitura do arquivo local.');
    };

    reader.readAsText(file);
  };

  const handleConfirmarImportacaoExcel = () => {
    if (excelPreview.length === 0) return;
    setColaboradoresAdicionados((prev) => [...excelPreview, ...prev]);
    onImportarColaboradores?.(excelPreview);
    setExcelImportSucesso(true);
    setTimeout(() => {
      setModalExcelAberto(false);
      setExcelPreview([]);
      setExcelArquivoNome('');
      setExcelImportSucesso(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Ações */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar colaborador por nome, cargo ou veículo..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todos">Todos Status</option>
            <option value="presente">Presentes</option>
            <option value="falta">Faltas</option>
            <option value="substituto">Substitutos</option>
          </select>

          <select
            value={filterRegional}
            onChange={(e) => setFilterRegional(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-input bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todas">Todas Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalExcelAberto(true)}
            className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 h-10 px-3.5 rounded-xl font-bold text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Subir Planilha</span>
          </Button>

          <Button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white h-10 px-3.5 rounded-xl font-bold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </Button>
        </div>
      </div>

      {/* Grid de Colaboradores com FOTOS AMPLIADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {colaboradoresFiltrados.map((colab) => {
          const st = statusConfig[colab.status] || statusConfig.presente;
          return (
            <Card
              key={colab.id}
              className="group border border-border/70 bg-card/70 hover:bg-card hover:border-emerald-500/50 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                {/* Header do Card com Tag de Unidade e Status */}
                <div className="w-full flex items-center justify-between gap-1 mb-3">
                  <Badge variant="outline" className="text-[10px] py-0 px-2 border-border/80">
                    {colab.unidade || regionalLabel[colab.regional] || 'Ribas'}
                  </Badge>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      st.className
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {st.label}
                  </span>
                </div>

                {/* FOTO DO COLABORADOR COM TAMANHO BEM MAIOR */}
                <div
                  onClick={() =>
                    colab.foto &&
                    setFotoModalAberta({
                      url: colab.foto,
                      nome: colab.nome,
                      cargo: colab.cargo,
                    })
                  }
                  className={cn(
                    'relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 shadow-md transition-transform duration-200 group-hover:scale-105 flex items-center justify-center my-1',
                    colab.foto ? 'cursor-zoom-in' : '',
                    colab.status === 'falta'
                      ? 'border-rose-500/50 bg-rose-950/20'
                      : colab.status === 'substituto'
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-emerald-500/40 bg-emerald-950/20'
                  )}
                >
                  {colab.foto ? (
                    <img
                      src={colab.foto}
                      alt={colab.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/60 to-muted/20 text-foreground font-black text-3xl">
                      {getIniciais(colab.nome)}
                    </div>
                  )}

                  {colab.foto && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Ver Foto</span>
                    </div>
                  )}
                </div>

                {/* Nome do Colaborador abaixo da foto */}
                <h4 className="mt-2.5 font-bold text-base text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {colab.nome}
                </h4>
                <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                  {colab.cargo}
                </p>

                {/* Dados Complementares */}
                <div className="w-full mt-3 pt-3 border-t border-border/50 text-left space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      Veículo:
                    </span>
                    <span className="font-semibold text-foreground">{colab.veiculoPrefixo || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      Contato:
                    </span>
                    <span className="font-mono text-[11px] text-foreground">{colab.telefone || '-'}</span>
                  </div>

                  {colab.dataAdmissao && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        Admissão:
                      </span>
                      <span className="font-mono text-[11px] text-foreground">{colab.dataAdmissao}</span>
                    </div>
                  )}

                  {colab.status === 'substituto' && colab.substitutoNome && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] mt-1">
                      <strong>Substituto de:</strong> {colab.substitutoNome}
                    </div>
                  )}

                  {colab.status === 'falta' && colab.motivoFalta && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] mt-1">
                      <strong>Motivo:</strong> {colab.motivoFalta}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Zoom da Foto */}
      {fotoModalAberta && (
        <div
          onClick={() => setFotoModalAberta(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-2xl bg-card border border-border/80 p-5 shadow-2xl text-center space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="text-left">
                <h3 className="font-bold text-base text-foreground">{fotoModalAberta.nome}</h3>
                <p className="text-xs text-muted-foreground">{fotoModalAberta.cargo}</p>
              </div>
              <button
                type="button"
                onClick={() => setFotoModalAberta(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-border shadow-inner bg-black/30">
              <img
                src={fotoModalAberta.url}
                alt={fotoModalAberta.nome}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFotoModalAberta(null)}
              className="w-full rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro Manual */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Novo Colaborador</h3>
                  <p className="text-xs text-muted-foreground">Cadastre um operador ou reserve</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarColaborador} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Nome Completo</label>
                <Input
                  placeholder="Ex: João da Silva"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-foreground mb-1">Cargo / Função</label>
                  <Input
                    placeholder="Ex: Operador Florestal"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Telefone</label>
                  <Input
                    placeholder="(67) 99999-0000"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-foreground mb-1">Unidade</label>
                  <select
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ribas">Ribas do Rio Pardo</option>
                    <option value="agua_clara">Água Clara</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Data de Admissão</label>
                  <Input
                    placeholder="DD/MM/AAAA"
                    value={novaDataAdmissao}
                    onChange={(e) => setNovaDataAdmissao(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Foto do Colaborador</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
              </div>

              {novaFoto && (
                <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-muted/20">
                  <img src={novaFoto} alt="Prévia" className="w-12 h-12 rounded-xl object-cover border" />
                  <span className="text-xs text-emerald-400 font-medium">Foto carregada com sucesso</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNovoAberto(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                  Salvar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação de Planilha Excel / CSV */}
      {modalExcelAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Importar Planilha de Colaboradores</h3>
                  <p className="text-xs text-muted-foreground">Envie uma planilha CSV com colunas de Nome, Cargo e Unidade</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalExcelAberto(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div
                onClick={() => excelInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <FileUp className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="font-bold text-foreground">Clique para selecionar o arquivo</p>
                  <p className="text-muted-foreground text-[11px]">Formatos suportados: .csv ou .xlsx exportado em texto</p>
                </div>
                {excelArquivoNome && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                    {excelArquivoNome}
                  </span>
                )}
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleArquivoExcelUpload}
                  className="hidden"
                />
              </div>

              {isProcessandoExcel && (
                <div className="flex items-center justify-center gap-2 text-emerald-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando linhas da planilha...</span>
                </div>
              )}

              {excelErro && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{excelErro}</span>
                </div>
              )}

              {excelImportSucesso && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Colaboradores importados com sucesso!</span>
                </div>
              )}

              {excelPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Prévia ({excelPreview.length} colaboradores identificados):</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border p-2 space-y-1.5 bg-muted/20">
                    {excelPreview.slice(0, 10).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-card text-[11px]">
                        <span className="font-bold text-foreground truncate max-w-[150px]">{c.nome}</span>
                        <span className="text-muted-foreground truncate max-w-[120px]">{c.cargo}</span>
                        <span className="text-emerald-400">{c.unidade}</span>
                      </div>
                    ))}
                    {excelPreview.length > 10 && (
                      <p className="text-center text-[10px] text-muted-foreground pt-1">
                        + {excelPreview.length - 10} outros registros...
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalExcelAberto(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={excelPreview.length === 0 || isProcessandoExcel}
                  onClick={handleConfirmarImportacaoExcel}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Adicionar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};