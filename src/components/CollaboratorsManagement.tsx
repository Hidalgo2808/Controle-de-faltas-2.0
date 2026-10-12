import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  RefreshCw,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Camera,
  Trash2,
  IdCard,
  Building2,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Colaborador, Veiculo, StatusPresenca, Regional } from '../types';

export interface ColaboradorCompleto {
  id: string;
  nome: string;
  cargo: string;
  matricula: string;
  foto: string;
  telefone: string;
  status: StatusPresenca;
  motivoFalta?: string;
  substitutoNome?: string;
  equipeId: string;
  equipeNumero: 1 | 2;
  posicaoVeiculo: 'motorista' | 'frente_dir' | 'tras_esq' | 'tras_dir';
  veiculoPrefixo: string;
  veiculoPlaca: string;
  regional: 'ribas' | 'agua_clara';
}

export interface CollaboratorsManagementProps {
  veiculos?: Veiculo[];
  colaboradoresReserva?: Colaborador[];
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

interface RegistroImportado {
  nome: string;
  cargo: string;
  unidade: 'ribas' | 'agua_clara';
  matricula?: string;
  telefone?: string;
}

export const CollaboratorsManagement: React.FC<CollaboratorsManagementProps> = ({
  veiculos = [],
  colaboradoresReserva = [],
  onImportarColaboradores,
  onAdicionarColaborador,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPresenca | 'todos'>('todos');
  const [filterRegional, setFilterRegional] = useState<Regional | 'todas'>('todas');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Estados do Modal de Cadastro Manual de Colaborador
  const [modalNovoColaboradorAberto, setModalNovoColaboradorAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCargo, setNovoCargo] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaFoto, setNovaFoto] = useState<string>('');
  const [novaUnidade, setNovaUnidade] = useState<'ribas' | 'agua_clara'>('ribas');
  const [novoStatus, setNovoStatus] = useState<StatusPresenca>('presente');
  const [formErro, setFormErro] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Estados do Modal de Importação Excel / CSV
  const [modalImportAberto, setModalImportAberto] = useState(false);
  const [arquivoNome, setArquivoNome] = useState('');
  const [registrosPrevia, setRegistrosPrevia] = useState<RegistroImportado[]>([]);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista de colaboradores extraídos dos veículos e lista reserva
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
          matricula: colab.matricula ?? '',
          foto: colab.foto ?? '',
          telefone: colab.telefone ?? '',
          status: colab.status || 'presente',
          motivoFalta: colab.motivoFalta,
          substitutoNome: colab.substitutoNome,
          equipeId: colab.equipeId || '',
          equipeNumero: colab.equipeNumero || 1,
          posicaoVeiculo: pos,
          veiculoPrefixo: v.prefixo || '',
          veiculoPlaca: v.placa || '',
          regional: v.regional || 'ribas',
        });
      });
    });

    // Adiciona colaboradores reserva se houver
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
        substitutoNome: r.substitutoNome,
        equipeId: 'reserva',
        equipeNumero: 1,
        posicaoVeiculo: 'motorista',
        veiculoPrefixo: 'Banco de Reserva',
        veiculoPlaca: '-',
        regional: 'ribas',
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
        (c.matricula || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.veiculoPlaca || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.veiculoPrefixo || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchRegional = filterRegional === 'todas' || c.regional === filterRegional;

      return matchSearch && matchStatus && matchRegional;
    });
  }, [todosColaboradores, search, filterStatus, filterRegional]);

  const stats = useMemo(() => {
    const presentes = todosColaboradores.filter((c) => c.status === 'presente').length;
    const faltas = todosColaboradores.filter((c) => c.status === 'falta').length;
    const substitutos = todosColaboradores.filter((c) => c.status === 'substituto').length;
    return { presentes, faltas, substitutos, total: todosColaboradores.length };
  }, [todosColaboradores]);

  // Handler para Upload de Foto de Colaborador
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErro('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErro('A imagem selecionada deve ter no máximo 5MB.');
      return;
    }

    setFormErro(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNovaFoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverFoto = () => {
    setNovaFoto('');
    if (fotoInputRef.current) {
      fotoInputRef.current.value = '';
    }
  };

  const handleSalvarNovoColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome do colaborador é obrigatório.');
      return;
    }
    if (!novoCargo.trim()) {
      setFormErro('O cargo/função é obrigatório.');
      return;
    }

    const novoColab: ColaboradorCompleto = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim(),
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
      foto: novaFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: novoStatus,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: novaUnidade,
    };

    setColaboradoresAdicionados((prev) => [novoColab, ...prev]);
    if (onAdicionarColaborador) {
      onAdicionarColaborador(novoColab);
    }

    // Reset formulário
    setNovoNome('');
    setNovoCargo('');
    setNovaMatricula('');
    setNovoTelefone('');
    setNovaFoto('');
    setNovoStatus('presente');
    setFormErro(null);
    setModalNovoColaboradorAberto(false);
  };

  // Parser para processar arquivo Excel / CSV
  const processarTextoPlanilha = (conteudo: string) => {
    const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (linhas.length < 2) {
      throw new Error('O arquivo precisa conter uma linha de cabeçalho e pelo menos um registro.');
    }

    // Identifica separador: ';' ou ',' ou '\t'
    const primeiraLinha = linhas[0];
    let separador = ',';
    if (primeiraLinha.includes(';')) separador = ';';
    else if (primeiraLinha.includes('\t')) separador = '\t';

    const normalizar = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/['"]/g, '');

    const cabecalhos = primeiraLinha.split(separador).map(normalizar);

    const idxNome = cabecalhos.findIndex((c) => c.includes('nome') || c.includes('colaborador'));
    const idxCargo = cabecalhos.findIndex((c) => c.includes('cargo') || c.includes('funcao') || c.includes('posto'));
    const idxUnidade = cabecalhos.findIndex((c) => c.includes('unidade') || c.includes('regional') || c.includes('polo') || c.includes('cidade'));
    const idxMatricula = cabecalhos.findIndex((c) => c.includes('matricula') || c.includes('registro') || c.includes('re'));
    const idxTelefone = cabecalhos.findIndex((c) => c.includes('telefone') || c.includes('celular') || c.includes('contato'));

    if (idxNome === -1) {
      throw new Error('Coluna de "Nome" não encontrada no cabeçalho da planilha.');
    }

    const registros: RegistroImportado[] = [];

    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].split(separador).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const nome = colunas[idxNome];
      if (!nome) continue;

      const cargo = (idxCargo !== -1 && colunas[idxCargo]) ? colunas[idxCargo] : 'Operador Florestal';
      const unidadeTexto = (idxUnidade !== -1 && colunas[idxUnidade]) ? normalizar(colunas[idxUnidade]) : 'ribas';

      let unidade: 'ribas' | 'agua_clara' = 'ribas';
      if (unidadeTexto.includes('agua') || unidadeTexto.includes('clara') || unidadeTexto.includes('agc')) {
        unidade = 'agua_clara';
      }

      registros.push({
        nome,
        cargo,
        unidade,
        matricula: idxMatricula !== -1 && colunas[idxMatricula] ? colunas[idxMatricula] : undefined,
        telefone: idxTelefone !== -1 && colunas[idxTelefone] ? colunas[idxTelefone] : undefined,
      });
    }

    return registros;
  };

  const handleArquivoExcelSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroImportacao(null);
    setSucessoMsg(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const conteudo = event.target?.result as string;
        const registros = processarTextoPlanilha(conteudo);

        if (registros.length === 0) {
          setErroImportacao('Nenhum colaborador válido foi encontrado no arquivo.');
          setRegistrosPrevia([]);
          return;
        }

        setRegistrosPrevia(registros);
      } catch (err: any) {
        setErroImportacao(err.message || 'Erro ao ler o arquivo. Certifique-se de que é um CSV ou Excel exportado legível.');
        setRegistrosPrevia([]);
      }
    };

    reader.onerror = () => {
      setErroImportacao('Falha na leitura física do arquivo.');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmarImportacao = () => {
    if (registrosPrevia.length === 0) return;

    const novosColaboradores: ColaboradorCompleto[] = registrosPrevia.map((reg, idx) => ({
      id: `import-${Date.now()}-${idx}`,
      nome: reg.nome,
      cargo: reg.cargo,
      matricula: reg.matricula || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      telefone: reg.telefone || '(67) 99999-0000',
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'presente',
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: reg.unidade,
    }));

    setColaboradoresAdicionados((prev) => [...novosColaboradores, ...prev]);

    if (onImportarColaboradores) {
      onImportarColaboradores(novosColaboradores);
    }

    setSucessoMsg(`${novosColaboradores.length} colaboradores importados com sucesso!`);
    setTimeout(() => {
      setModalImportAberto(false);
      setRegistrosPrevia([]);
      setArquivoNome('');
      setSucessoMsg(null);
    }, 1200);
  };

  const handleBaixarModeloPlanilha = () => {
    const cabecalho = 'Nome;Função;Unidade;Matrícula;Telefone\r\n';
    const linhasExemplo = [
      'Carlos Eduardo Ferreira;Operador de Máquinas;Ribas do Rio Pardo;MAT-1088;(67) 99876-1122',
      'Mariana Ribeiro Silveira;Técnica de Segurança;Água Clara;MAT-1089;(67) 99876-3344',
      'Lucas Andrade Ramos;Motorista Florestal;Ribas do Rio Pardo;MAT-1090;(67) 99876-5566',
      'Roberto Fonseca Dias;Ajudante de Campo;Água Clara;MAT-1091;(67) 99876-7788',
    ].join('\r\n');

    const csvCompleto = '\uFEFF' + cabecalho + linhasExemplo;
    const blob = new Blob([csvCompleto], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_colaboradores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Barra de Ações: Busca, Filtros e Botões Principais */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-md">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, função, matrícula, placa ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/60 border-border/70 focus-visible:ring-emerald-500/30"
          />
        </div>

        {/* Filtros de Status e Unidade */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Regional */}
          <div className="flex items-center rounded-xl bg-background/50 border border-border/70 p-1">
            <button
              type="button"
              onClick={() => setFilterRegional('todas')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                filterRegional === 'todas'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilterRegional('ribas')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                filterRegional === 'ribas'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Ribas
            </button>
            <button
              type="button"
              onClick={() => setFilterRegional('agua_clara')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all',
                filterRegional === 'agua_clara'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Água Clara
            </button>
          </div>

          {/* Filtro de Presença */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-background/80 border border-border/70 text-foreground text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todos">Todos os Status</option>
            <option value="presente">Presentes</option>
            <option value="falta">Com Falta</option>
            <option value="substituto">Substitutos</option>
          </select>

          {/* Botão Subir Planilha Excel / CSV */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalImportAberto(true)}
            className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/60 font-semibold text-xs gap-1.5 rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Subir Excel / CSV</span>
          </Button>

          {/* Botão Adicionar Colaborador Manual */}
          <Button
            type="button"
            onClick={() => setModalNovoColaboradorAberto(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Colaborador</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Listados</p>
          <p className="text-2xl font-black text-foreground mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 shadow-sm">
          <p className="text-xs text-emerald-400 font-medium">Presentes</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{stats.presentes}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-rose-500/25 bg-rose-500/5 shadow-sm">
          <p className="text-xs text-rose-400 font-medium">Faltas</p>
          <p className="text-2xl font-black text-rose-400 mt-0.5">{stats.faltas}</p>
        </div>
        <div className="p-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 shadow-sm">
          <p className="text-xs text-amber-400 font-medium">Substitutos</p>
          <p className="text-2xl font-black text-amber-400 mt-0.5">{stats.substitutos}</p>
        </div>
      </div>

      {/* Grid de Cards de Colaboradores */}
      {colaboradoresFiltrados.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40">
          <Users className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Nenhum colaborador encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente ajustar os filtros ou suba uma planilha com novos colaboradores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradoresFiltrados.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <Card
                key={c.id}
                className={cn(
                  'border border-border/70 bg-card/75 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-200 overflow-hidden',
                  c.status === 'falta' && 'border-rose-500/30 ring-1 ring-rose-500/15',
                  c.status === 'substituto' && 'border-amber-500/30 ring-1 ring-amber-500/15'
                )}
              >
                <div className="p-4 flex flex-col gap-3">
                  {/* Topo do Card: Foto, Nome e Status */}
                  <div className="flex items-start gap-3">
                    <img
                      src={c.foto}
                      alt={c.nome}
                      className="w-12 h-12 rounded-xl object-cover border border-border/80 shrink-0 bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-sm text-foreground truncate">{c.nome}</h4>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-2 py-0.5 shrink-0 capitalize', statusConfig[c.status].className)}
                        >
                          {statusConfig[c.status].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3 h-3 text-emerald-400" />
                        <span className="truncate">{c.cargo}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                        <span className="bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                          {c.matricula}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-sans">
                          <MapPin className="w-3 h-3" />
                          {regionalLabel[c.regional] || c.regional}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Veículo / Alocação */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground/90">{c.veiculoPrefixo}</span>
                      {c.veiculoPlaca !== '-' && (
                        <span className="font-mono text-[10px] bg-muted px-1 rounded">
                          {c.veiculoPlaca}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 font-medium text-[11px]"
                    >
                      {isExpanded ? 'Menos' : 'Detalhes'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Informações Expandidas */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs text-muted-foreground animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span>Telefone:</span>
                        <span className="text-foreground font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" /> {c.telefone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Equipe / Posição:</span>
                        <span className="text-foreground font-medium">
                          Eq. {c.equipeNumero} ({c.posicaoVeiculo})
                        </span>
                      </div>
                      {c.motivoFalta && (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                          <strong>Motivo da Falta:</strong> {c.motivoFalta}
                        </div>
                      )}
                      {c.substitutoNome && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                          <strong>Substituto:</strong> {c.substitutoNome}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBIR PLANILHA EXCEL / CSV                                         */}
      {/* ========================================================================= */}
      {modalImportAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalImportAberto(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Subir Planilha com Colaboradores</h3>
                  <p className="text-xs text-muted-foreground">Importe em lote colunas: Nome, Função e Unidade</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalImportAberto(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Instruções e Botão de Modelo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xs text-emerald-300/90 leading-relaxed">
                  <p className="font-semibold text-emerald-200">Colunas recomendadas no arquivo (.csv ou .xlsx exportado):</p>
                  <p className="mt-0.5"><strong>Nome</strong> | <strong>Função</strong> (ou Cargo) | <strong>Unidade</strong> (Ribas ou Água Clara)</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBaixarModeloPlanilha}
                  className="shrink-0 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Modelo
                </Button>
              </div>

              {/* Zona de Drop / Seleção de Arquivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt, .xlsx, .xls"
                onChange={handleArquivoExcelSelecionado}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
                  'hover:border-emerald-500/60 hover:bg-emerald-500/5',
                  arquivoNome ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/80 bg-muted/10'
                )}
              >
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  {arquivoNome ? arquivoNome : 'Clique para selecionar o arquivo Excel (.csv ou exportado)'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: CSV, XLSX salvo como CSV ou valores separados por vírgula / ponto-e-vírgula
                </p>
              </div>

              {/* Mensagem de Erro */}
              {erroImportacao && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroImportacao}</span>
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {sucessoMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sucessoMsg}</span>
                </div>
              )}

              {/* Tabela de Prévia dos Colaboradores */}
              {registrosPrevia.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      Pré-visualização ({registrosPrevia.length} colaboradores identificados)
                    </span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                      Pronto para importar
                    </Badge>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border/80 bg-muted/20">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 text-muted-foreground sticky top-0 border-b border-border/50">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Nome</th>
                          <th className="px-3 py-2 font-semibold">Função</th>
                          <th className="px-3 py-2 font-semibold">Unidade</th>
                          <th className="px-3 py-2 font-semibold">Matrícula</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {registrosPrevia.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="px-3 py-2 font-semibold text-foreground">{item.nome}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.cargo}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                                  item.unidade === 'ribas'
                                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                )}
                              >
                                {regionalLabel[item.unidade]}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">
                              {item.matricula || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border bg-muted/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalImportAberto(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={registrosPrevia.length === 0}
                onClick={handleConfirmarImportacao}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                Importar {registrosPrevia.length > 0 ? `(${registrosPrevia.length})` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO MANUAL DE NOVO COLABORADOR COM UPLOAD DE FOTO             */}
      {/* ========================================================================= */}
      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Novo Colaborador</h3>
                  <p className="text-xs text-muted-foreground">Cadastre dados e foto de identificação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoColaboradorAberto(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSalvarNovoColaborador} className="p-6 overflow-y-auto space-y-4">
              {formErro && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {formErro}
                </div>
              )}

              {/* Upload de Foto */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  Foto do Colaborador
                </label>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 shrink-0">
                    {novaFoto ? (
                      <img src={novaFoto} alt="Prévia" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-7 h-7 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fotoInputRef.current?.click()}
                      className="text-xs gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {novaFoto ? 'Alterar Foto' : 'Subir Foto'}
                    </Button>
                    {novaFoto && (
                      <button
                        type="button"
                        onClick={handleRemoverFoto}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 self-start"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    )}
                    <span className="text-[11px] text-muted-foreground">PNG, JPG ou WEBP até 5MB</span>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nome Completo *
                </label>
                <Input
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />
              </div>

              {/* Cargo e Matrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Função / Cargo *
                  </label>
                  <Input
                    placeholder="Ex: Operador de Máquinas"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Matrícula
                  </label>
                  <Input
                    placeholder="Ex: MAT-1090"
                    value={novaMatricula}
                    onChange={(e) => setNovaMatricula(e.target.value)}
                  />
                </div>
              </div>

              {/* Telefone e Unidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Telefone
                  </label>
                  <Input
                    placeholder="(67) 99999-0000"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Unidade Operacional
                  </label>
                  <select
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value as any)}
                    className="w-full h-10 bg-background/80 border border-border/80 text-foreground text-xs font-semibold rounded-xl px-3 outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ribas">Ribas do Rio Pardo</option>
                    <option value="agua_clara">Água Clara</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNovoColaboradorAberto(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};