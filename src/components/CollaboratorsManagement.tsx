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
  FileText,
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

  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCargo, setNovoCargo] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaFoto, setNovaFoto] = useState<string>('');
  const [novaUnidade, setNovaUnidade] = useState<'ribas' | 'agua_clara'>('ribas');
  const [novaDataAdmissao, setNovaDataAdmissao] = useState('15/01/2023');

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
          matricula: colab.matricula || '',
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
        matricula: r.matricula || '',
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
      unidade: novaUnidade === 'agua_clara' ? 'Água Clara' : 'Ribas do Rio Pardo',
      dataAdmissao: novaDataAdmissao.trim() || '15/01/2023',
    };

    setColaboradoresAdicionados((prev) => [novo, ...prev]);
    onAdicionarColaborador?.(novo);

    setNovoNome('');
    setNovoCargo('');
    setNovoTelefone('');
    setNovaFoto('');
    setModalNovoAberto(false);
  };

  // Leitura nativa de CSV/TSV sem dependência do pacote xlsx
  const parseCSVText = (text: string): ColaboradorCompleto[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const separator = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ''));

    const nomeIdx = headers.findIndex((h) => h.includes('nome') || h.includes('operador') || h.includes('colaborador'));
    const cargoIdx = headers.findIndex((h) => h.includes('cargo') || h.includes('função') || h.includes('funcao'));
    const telIdx = headers.findIndex((h) => h.includes('telefone') || h.includes('contato') || h.includes('celular') || h.includes('fone'));
    const unidadeIdx = headers.findIndex((h) => h.includes('unidade') || h.includes('regional') || h.includes('polo') || h.includes('cidade'));
    const admIdx = headers.findIndex((h) => h.includes('admissao') || h.includes('admissão') || h.includes('data'));

    const parsed: ColaboradorCompleto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(separator).map((col) => col.trim().replace(/^"(.*)"$/, '$1'));
      const nomeVal = nomeIdx >= 0 ? row[nomeIdx] : row[0];
      if (!nomeVal || nomeVal.length < 2) continue;

      const cargoVal = cargoIdx >= 0 && row[cargoIdx] ? row[cargoIdx] : 'Operador Florestal';
      const telVal = telIdx >= 0 && row[telIdx] ? row[telIdx] : '(67) 99999-0000';
      const unidVal = unidadeIdx >= 0 && row[unidadeIdx] ? row[unidadeIdx] : 'Ribas do Rio Pardo';
      const admVal = admIdx >= 0 && row[admIdx] ? row[admIdx] : '01/01/2023';

      const isAguaClara = unidVal.toLowerCase().includes('agua') || unidVal.toLowerCase().includes('água');
      const regionalKey: 'ribas' | 'agua_clara' = isAguaClara ? 'agua_clara' : 'ribas';

      parsed.push({
        id: `import-${Date.now()}-${i}`,
        nome: nomeVal,
        cargo: cargoVal,
        matricula: '',
        foto: '',
        telefone: telVal,
        status: 'presente',
        equipeId: 'reserva',
        equipeNumero: 1,
        posicaoVeiculo: 'motorista',
        veiculoPrefixo: 'Banco de Reserva',
        veiculoPlaca: '-',
        regional: regionalKey,
        unidade: isAguaClara ? 'Água Clara' : 'Ribas do Rio Pardo',
        dataAdmissao: admVal,
      });
    }

    return parsed;
  };

  const handleProcessarArquivo = async (file: File) => {
    setIsProcessandoExcel(true);
    setExcelErro(null);
    setExcelPreview([]);
    setExcelArquivoNome(file.name);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = parseCSVText(content || '');
          if (parsed.length === 0) {
            setExcelErro('Nenhum colaborador válido identificado no arquivo. Verifique se a primeira linha contém as colunas (Nome, Cargo, Telefone, Unidade).');
          } else {
            setExcelPreview(parsed);
          }
        } catch {
          setExcelErro('Falha ao processar o formato do arquivo. Utilize arquivos .CSV ou texto com delimitador vírgula/ponto-e-vírgula.');
        } finally {
          setIsProcessandoExcel(false);
        }
      };

      reader.onerror = () => {
        setExcelErro('Erro na leitura física do arquivo selecionado.');
        setIsProcessandoExcel(false);
      };

      reader.readAsText(file, 'UTF-8');
    } catch {
      setExcelErro('Não foi possível ler o arquivo. Certifique-se de salvar sua planilha no formato .CSV.');
      setIsProcessandoExcel(false);
    }
  };

  const handleConfirmarImportacao = () => {
    if (excelPreview.length === 0) return;
    setColaboradoresAdicionados((prev) => [...excelPreview, ...prev]);
    onImportarColaboradores?.(excelPreview);
    setExcelImportSucesso(true);
    setTimeout(() => {
      setModalExcelAberto(false);
      setExcelPreview([]);
      setExcelImportSucesso(false);
      setExcelArquivoNome('');
    }, 1200);
  };

  const handleBaixarModelo = () => {
    const csvContent =
      'Nome;Cargo;Telefone;Unidade;Data Admissao\n' +
      'Carlos Eduardo Silva;Operador de Harvester;(67) 99811-2233;Ribas do Rio Pardo;12/03/2022\n' +
      'Lucas Gabriel Ribeiro;Operador de Forwarder;(67) 99722-4455;Água Clara;18/06/2021\n' +
      'Marcio Antonio Souza;Mecânico de Campo;(67) 99633-7788;Ribas do Rio Pardo;05/01/2023\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_colaboradores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusPresenca | 'todos')}
            className="h-10 px-3 rounded-xl border border-input bg-card/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="todos">Todos os Status</option>
            <option value="presente">Presentes</option>
            <option value="falta">Faltas</option>
            <option value="substituto">Substitutos</option>
          </select>

          <select
            value={filterRegional}
            onChange={(e) => setFilterRegional(e.target.value as Regional | 'todas')}
            className="h-10 px-3 rounded-xl border border-input bg-card/60 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="todas">Todas as Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalExcelAberto(true)}
            className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Planilha</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setModalNovoAberto(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </Button>
        </div>
      </div>

      {/* Grid de Cards de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {colaboradoresFiltrados.map((colab) => (
          <Card
            key={colab.id}
            className="group relative overflow-hidden border border-border/60 hover:border-emerald-500/40 transition-all hover:shadow-lg bg-card/70 backdrop-blur-sm"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                {/* Foto Ampliada */}
                <div
                  onClick={() =>
                    colab.foto && setFotoModalAberta({ url: colab.foto, nome: colab.nome, cargo: colab.cargo })
                  }
                  className={cn(
                    'w-16 h-16 rounded-2xl border-2 overflow-hidden shrink-0 shadow-md flex items-center justify-center bg-muted/40 cursor-pointer relative group/avatar transition-transform hover:scale-105',
                    colab.status === 'presente' && 'border-emerald-500/50',
                    colab.status === 'falta' && 'border-rose-500/50',
                    colab.status === 'substituto' && 'border-amber-500/50'
                  )}
                >
                  {colab.foto ? (
                    <>
                      <img src={colab.foto} alt={colab.nome} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <span className="font-black text-foreground text-lg">{getIniciais(colab.nome)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-foreground truncate">{colab.nome}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0',
                        statusConfig[colab.status]?.className || statusConfig.presente.className
                      )}
                    >
                      {statusConfig[colab.status]?.label || 'Presente'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{colab.cargo}</span>
                  </p>

                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>{colab.unidade || 'Ribas do Rio Pardo'}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{colab.telefone || '(67) 99999-0000'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate justify-end">
                  <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{colab.dataAdmissao || '10/02/2023'}</span>
                </div>
              </div>

              {colab.status === 'falta' && colab.motivoFalta && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    <strong>Motivo:</strong> {colab.motivoFalta}
                    {colab.observacao ? ` - ${colab.observacao}` : ''}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {colaboradoresFiltrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl bg-card/30">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-foreground">Nenhum colaborador encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">Ajuste os filtros de busca ou cadastre novos operadores.</p>
        </div>
      )}

      {/* Modal Visualizador de Foto Expandida */}
      {fotoModalAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => setFotoModalAberta(null)}
        >
          <div
            className="relative max-w-sm w-full bg-card border border-border/80 rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h4 className="font-bold text-sm text-foreground">{fotoModalAberta.nome}</h4>
                <p className="text-xs text-muted-foreground">{fotoModalAberta.cargo}</p>
              </div>
              <button
                type="button"
                onClick={() => setFotoModalAberta(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-border/50 bg-black/20">
              <img src={fotoModalAberta.url} alt={fotoModalAberta.nome} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro Manual de Colaborador */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Cadastrar Novo Colaborador</h3>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarColaborador} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Nome Completo</label>
                <Input
                  required
                  placeholder="Ex: João da Silva"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Cargo / Função</label>
                <Input
                  placeholder="Ex: Operador de Máquinas"
                  value={novoCargo}
                  onChange={(e) => setNovoCargo(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">Telefone</label>
                  <Input
                    placeholder="(67) 99999-0000"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Data Admissão</label>
                  <Input
                    placeholder="15/01/2023"
                    value={novaDataAdmissao}
                    onChange={(e) => setNovaDataAdmissao(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Unidade Regional</label>
                <select
                  value={novaUnidade}
                  onChange={(e) => setNovaUnidade(e.target.value as 'ribas' | 'agua_clara')}
                  className="w-full h-10 mt-1 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ribas">Ribas do Rio Pardo</option>
                  <option value="agua_clara">Água Clara</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Foto do Colaborador (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="w-full mt-1 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalNovoAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Salvar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação de Planilha */}
      {modalExcelAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-xl w-full bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-foreground">Importar Colaboradores via Planilha</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalExcelAberto(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Baixe a planilha modelo estruturada com as colunas certas:</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBaixarModelo}
                  className="gap-1.5 h-8 text-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modelo CSV</span>
                </Button>
              </div>

              <div
                onClick={() => excelInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer bg-card/40 transition-colors"
              >
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessarArquivo(file);
                  }}
                />
                <FileUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">
                  {excelArquivoNome || 'Clique para selecionar o arquivo (.CSV ou .TXT)'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Formatos delimitados por vírgula, ponto-e-vírgula ou tabulação
                </p>
              </div>

              {isProcessandoExcel && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-emerald-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando arquivo de colaboradores...</span>
                </div>
              )}

              {excelErro && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{excelErro}</span>
                </div>
              )}

              {excelPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Prévia dos Colaboradores ({excelPreview.length} encontrados):</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-2 bg-muted/20">
                    {excelPreview.slice(0, 15).map((col, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40 text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground">{col.nome}</p>
                          <p className="text-[11px] text-muted-foreground">{col.cargo}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {col.unidade}
                        </Badge>
                      </div>
                    ))}
                    {excelPreview.length > 15 && (
                      <p className="text-center text-[11px] text-muted-foreground py-1">
                        + {excelPreview.length - 15} outros colaboradores inclusos
                      </p>
                    )}
                  </div>
                </div>
              )}

              {excelImportSucesso && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Colaboradores importados com sucesso!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalExcelAberto(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={excelPreview.length === 0 || isProcessandoExcel || excelImportSucesso}
                onClick={handleConfirmarImportacao}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <FileCheck className="w-4 h-4" />
                <span>Confirmar e Importar ({excelPreview.length})</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};