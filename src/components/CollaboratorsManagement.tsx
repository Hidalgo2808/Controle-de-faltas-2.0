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
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Camera,
  Trash2,
  Building2,
  Briefcase,
  FileCheck,
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
  matricula: string;
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
  selectedRegional = 'todas',
  onUpdateColaboradorStatus,
  onImportarColaboradores,
  onAdicionarColaborador,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPresenca | 'todos'>('todos');
  const [filterRegional, setFilterRegional] = useState<Regional | 'todas'>(selectedRegional);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const [modalImportAberto, setModalImportAberto] = useState(false);
  const [arquivoNome, setArquivoNome] = useState('');
  const [registrosPrevia, setRegistrosPrevia] = useState<RegistroImportado[]>([]);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          observacao: colab.observacao,
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
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNovaFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCriarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome do colaborador é obrigatório.');
      return;
    }

    const novo: ColaboradorCompleto = {
      id: `colab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim() || 'Operador Florestal',
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: novaFoto,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
      status: novoStatus,
      equipeId: 'banco-reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: 'RESERVA',
      regional: novaUnidade,
    };

    setColaboradoresAdicionados((prev) => [novo, ...prev]);
    onAdicionarColaborador?.(novo);

    setNovoNome('');
    setNovoCargo('');
    setNovaMatricula('');
    setNovoTelefone('');
    setNovaFoto('');
    setFormErro(null);
    setModalNovoColaboradorAberto(false);
  };

  const processarTextoCSV = (texto: string) => {
    const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (linhas.length < 2) {
      setErroImportacao('O arquivo precisa conter cabeçalho e pelo menos uma linha de dados.');
      return;
    }

    const separador = linhas[0].includes(';') ? ';' : ',';
    const cabecalho = linhas[0].split(separador).map((c) => c.trim().toLowerCase());

    const idxNome = cabecalho.findIndex((c) => c.includes('nome'));
    const idxCargo = cabecalho.findIndex((c) => c.includes('cargo') || c.includes('função') || c.includes('funcao'));
    const idxUnidade = cabecalho.findIndex((c) => c.includes('unidade') || c.includes('regional') || c.includes('polo'));
    const idxMatricula = cabecalho.findIndex((c) => c.includes('matricula') || c.includes('matrícula'));
    const idxTelefone = cabecalho.findIndex((c) => c.includes('telefone') || c.includes('celular') || c.includes('contato'));

    if (idxNome === -1) {
      setErroImportacao('Coluna "Nome" não encontrada no cabeçalho da planilha.');
      return;
    }

    const importados: RegistroImportado[] = [];

    for (let i = 1; i < linhas.length; i++) {
      const colunas = linhas[i].split(separador).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const nome = colunas[idxNome];
      if (!nome) continue;

      const cargo = (idxCargo !== -1 && colunas[idxCargo]) ? colunas[idxCargo] : 'Operador Florestal';
      const unidadeRaw = (idxUnidade !== -1 && colunas[idxUnidade]) ? colunas[idxUnidade].toLowerCase() : '';
      const unidade: 'ribas' | 'agua_clara' =
        unidadeRaw.includes('agua') || unidadeRaw.includes('água') || unidadeRaw.includes('clara')
          ? 'agua_clara'
          : 'ribas';

      const matricula = idxMatricula !== -1 ? colunas[idxMatricula] : undefined;
      const telefone = idxTelefone !== -1 ? colunas[idxTelefone] : undefined;

      importados.push({
        nome,
        cargo,
        unidade,
        matricula,
        telefone,
      });
    }

    if (importados.length === 0) {
      setErroImportacao('Nenhum registro válido identificado na planilha.');
      return;
    }

    setRegistrosPrevia(importados);
    setErroImportacao(null);
  };

  const handleArquivoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroImportacao(null);
    setSucessoMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      if (conteudo) {
        processarTextoCSV(conteudo);
      }
    };
    reader.onerror = () => {
      setErroImportacao('Falha ao ler o arquivo selecionado.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const confirmarImportacao = () => {
    if (registrosPrevia.length === 0) return;

    const convertidos: ColaboradorCompleto[] = registrosPrevia.map((reg, idx) => ({
      id: `import-${Date.now()}-${idx}`,
      nome: reg.nome,
      cargo: reg.cargo,
      matricula: reg.matricula || `IMP-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: '',
      telefone: reg.telefone || '(67) 99999-0000',
      status: 'presente',
      equipeId: 'banco-reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: 'RESERVA',
      regional: reg.unidade,
    }));

    setColaboradoresAdicionados((prev) => [...convertidos, ...prev]);
    onImportarColaboradores?.(convertidos);

    setSucessoMsg(`${convertidos.length} colaboradores importados com sucesso!`);
    setTimeout(() => {
      setModalImportAberto(false);
      setRegistrosPrevia([]);
      setArquivoNome('');
      setSucessoMsg(null);
    }, 1200);
  };

  const baixarModeloCSV = () => {
    const conteudo = 'Nome,Função,Unidade,Matrícula,Telefone\n' +
      'Carlos Eduardo Santos,Mecânico Florestal,Ribas do Rio Pardo,10482,(67) 99876-1234\n' +
      'Marcos Souza Alves,Operador de Trator,Água Clara,10599,(67) 99765-4321\n' +
      'Pedro Henrique Silva,Ajudante Geral,Ribas do Rio Pardo,10611,(67) 99654-9876\n';

    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Quadro de Colaboradores
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestão da equipe de campo, postos em veículos e banco de reserva
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalImportAberto(true)}
            className="text-xs font-semibold gap-1.5 border-border/80 bg-card/60 hover:border-emerald-500/50"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            Importar Planilha (Excel/CSV)
          </Button>

          <Button
            size="sm"
            onClick={() => setModalNovoColaboradorAberto(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border/60 bg-card/50">
          <p className="text-[11px] text-muted-foreground font-medium">Total Geral</p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[11px] text-emerald-400 font-medium">Presentes</p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums mt-0.5">{stats.presentes}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <p className="text-[11px] text-rose-400 font-medium">Faltas Registradas</p>
          <p className="text-2xl font-bold text-rose-400 tabular-nums mt-0.5">{stats.faltas}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-[11px] text-amber-400 font-medium">Substitutos Ativos</p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums mt-0.5">{stats.substitutos}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-border/60">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, função, matrícula ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-border/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-border/60 bg-background/50 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todos">Todos os Status</option>
            <option value="presente">Presentes</option>
            <option value="falta">Faltas</option>
            <option value="substituto">Substitutos</option>
          </select>

          <select
            value={filterRegional}
            onChange={(e) => setFilterRegional(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-border/60 bg-background/50 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="todas">Todas as Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {colaboradoresFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/20">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">Nenhum colaborador encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Ajuste os filtros ou cadastre novos membros na equipe.</p>
          </div>
        ) : (
          colaboradoresFiltrados.map((c) => {
            const isExpanded = expandedId === c.id;
            const statusInfo = statusConfig[c.status] || statusConfig.presente;

            return (
              <Card key={c.id} className="border-border/60 bg-card/40 overflow-hidden hover:border-emerald-500/40 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {c.foto ? (
                        <img
                          src={c.foto}
                          alt={c.nome}
                          className="w-11 h-11 rounded-xl object-cover border border-border/80 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                          {c.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-foreground line-clamp-1">{c.nome}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-muted-foreground" />
                          {c.cargo}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                          Mat: {c.matricula || 'N/D'}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className={cn('text-[10px] py-0 px-2 shrink-0 font-semibold', statusInfo.className)}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      {regionalLabel[c.regional] || c.regional}
                    </span>
                    <span className="text-[11px] font-mono text-foreground/80">
                      {c.veiculoPrefixo}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 pt-1 transition-colors"
                  >
                    <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t border-border/40 space-y-2 text-xs animate-in fade-in-50">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Telefone:</span>
                        <span className="font-mono text-foreground">{c.telefone || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Veículo Atual:</span>
                        <span className="font-semibold text-foreground">{c.veiculoPrefixo} ({c.veiculoPlaca})</span>
                      </div>
                      {c.motivoFalta && (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                          <strong>Motivo da Falta:</strong> {c.motivoFalta}
                          {c.observacao && <p className="mt-0.5 text-muted-foreground">{c.observacao}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">Cadastrar Novo Colaborador</h3>
                  <p className="text-[11px] text-muted-foreground">Inclusão direta na escala e banco de reserva</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoColaboradorAberto(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarColaborador} className="p-5 space-y-4">
              {formErro && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErro}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome Completo *</label>
                <Input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: João da Silva Santos"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Função / Cargo</label>
                  <Input
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    placeholder="Ex: Operador Florestal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Matrícula</label>
                  <Input
                    value={novaMatricula}
                    onChange={(e) => setNovaMatricula(e.target.value)}
                    placeholder="Ex: MAT-1082"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefone</label>
                  <Input
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    placeholder="(67) 99999-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Unidade</label>
                  <select
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-card/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ribas">Ribas do Rio Pardo</option>
                    <option value="agua_clara">Água Clara</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setModalNovoColaboradorAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Salvar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalImportAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalImportAberto(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">Importação em Massa (Excel / CSV)</h3>
                  <p className="text-[11px] text-muted-foreground">Envie uma planilha com Nome, Função e Unidade</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalImportAberto(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Formato Aceito</p>
                  <p>Arquivo .csv ou tabela delimitada por vírgula/ponto-e-vírgula com cabeçalho.</p>
                </div>
                <Button size="sm" variant="outline" onClick={baixarModeloCSV} className="text-xs gap-1.5 shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  Baixar Modelo
                </Button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-card/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleArquivoUpload}
                />
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">
                  {arquivoNome || 'Clique para selecionar o arquivo CSV/Excel'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Colunas sugeridas: Nome, Função, Unidade, Matrícula</p>
              </div>

              {erroImportacao && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroImportacao}</span>
                </div>
              )}

              {sucessoMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sucessoMsg}</span>
                </div>
              )}

              {registrosPrevia.length > 0 && !sucessoMsg && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Pré-visualização ({registrosPrevia.length} registros encontrados)
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-border/60 bg-background/50 divide-y divide-border/40">
                    {registrosPrevia.slice(0, 10).map((r, idx) => (
                      <div key={idx} className="p-2 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{r.nome}</span>
                          <span className="text-muted-foreground ml-2">({r.cargo})</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {r.unidade === 'ribas' ? 'Ribas' : 'Água Clara'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {registrosPrevia.length > 10 && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      + {registrosPrevia.length - 10} outros registros na lista
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setModalImportAberto(false)}>
                  Fechar
                </Button>
                <Button
                  type="button"
                  disabled={registrosPrevia.length === 0}
                  onClick={confirmarImportacao}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  Confirmar e Importar ({registrosPrevia.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};