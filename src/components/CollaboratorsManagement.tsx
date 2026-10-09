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
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

interface CollaboratorsManagementProps {
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

  // Handler para Submeter Novo Colaborador
  const handleSubmitNovoColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome do colaborador é obrigatório.');
      return;
    }
    if (!novoCargo.trim()) {
      setFormErro('O cargo do colaborador é obrigatório.');
      return;
    }

    const novoColaborador: ColaboradorCompleto = {
      id: `col-novo-${Date.now()}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim(),
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: novaFoto || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
      status: novoStatus,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: novaUnidade,
    };

    setColaboradoresAdicionados((prev) => [novoColaborador, ...prev]);
    onAdicionarColaborador?.(novoColaborador);

    // Resetar formulário
    setNovoNome('');
    setNovoCargo('');
    setNovaMatricula('');
    setNovoTelefone('');
    setNovaFoto('');
    setNovaUnidade('ribas');
    setNovoStatus('presente');
    setFormErro(null);
    setModalNovoColaboradorAberto(false);
    setSucessoMsg(`Colaborador ${novoColaborador.nome} cadastrado com sucesso!`);
    setTimeout(() => setSucessoMsg(null), 4000);
  };

  // Processar arquivo CSV / Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroImportacao(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setErroImportacao('O arquivo deve conter um cabeçalho e pelo menos 1 linha de registro.');
          return;
        }

        const registros: RegistroImportado[] = [];
        // Pular cabeçalho
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 2 && cols[0]) {
            const nome = cols[0];
            const cargo = cols[1] || 'Operador Florestal';
            const unidadeRaw = (cols[2] || 'ribas').toLowerCase();
            const unidade: 'ribas' | 'agua_clara' = unidadeRaw.includes('agua') || unidadeRaw.includes('clara') ? 'agua_clara' : 'ribas';
            const matricula = cols[3] || `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
            const telefone = cols[4] || '(67) 99999-0000';

            registros.push({ nome, cargo, unidade, matricula, telefone });
          }
        }

        if (registros.length === 0) {
          setErroImportacao('Não foi possível identificar registros válidos no arquivo.');
          return;
        }

        setRegistrosPrevia(registros);
      } catch {
        setErroImportacao('Erro ao ler o arquivo. Verifique o formato CSV/Excel.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarImportacao = () => {
    if (registrosPrevia.length === 0) return;

    const novosColaboradores: ColaboradorCompleto[] = registrosPrevia.map((r, idx) => ({
      id: `imp-${Date.now()}-${idx}`,
      nome: r.nome,
      cargo: r.cargo,
      matricula: r.matricula || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      telefone: r.telefone || '(67) 99999-0000',
      status: 'presente',
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: r.unidade,
    }));

    setColaboradoresAdicionados((prev) => [...novosColaboradores, ...prev]);
    onImportarColaboradores?.(novosColaboradores);

    setSucessoMsg(`${novosColaboradores.length} colaboradores importados com sucesso!`);
    setTimeout(() => setSucessoMsg(null), 4000);

    setModalImportAberto(false);
    setRegistrosPrevia([]);
    setArquivoNome('');
  };

  const handleBaixarModelo = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Nome,Cargo,Unidade,Matricula,Telefone\n' +
      'Carlos Oliveira,Operador de Trator,ribas,MAT-5021,(67) 99911-2233\n' +
      'Juliana Silva,Técnica Florestal,agua_clara,MAT-5022,(67) 99922-3344\n' +
      'Marcos Andrade,Motorista Florestal,ribas,MAT-5023,(67) 99933-4455';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'modelo_importacao_colaboradores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Notificação de Sucesso */}
      {sucessoMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="text-sm font-semibold">{sucessoMsg}</span>
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card/40 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Geral</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Presentes</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{stats.presentes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Faltas</p>
              <p className="text-2xl font-black text-rose-400 mt-0.5">{stats.faltas}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Substitutos</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{stats.substitutos}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Ações */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome, cargo, matrícula, veículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-muted/40 border-border/60 rounded-xl text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros e Botões */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                aria-label="Filtrar por status"
                className="h-10 text-xs rounded-xl bg-muted/40 border border-border/60 text-foreground font-semibold px-3 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="todos" className="bg-card text-foreground">Todos os Status</option>
                <option value="presente" className="bg-card text-foreground">Presentes</option>
                <option value="falta" className="bg-card text-foreground">Faltas</option>
                <option value="substituto" className="bg-card text-foreground">Substitutos</option>
              </select>

              {/* Filtro Regional */}
              <select
                value={filterRegional}
                onChange={(e) => setFilterRegional(e.target.value as any)}
                aria-label="Filtrar por unidade regional"
                className="h-10 text-xs rounded-xl bg-muted/40 border border-border/60 text-foreground font-semibold px-3 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="todas" className="bg-card text-foreground">Todas as Unidades</option>
                <option value="ribas" className="bg-card text-foreground">Ribas do Rio Pardo</option>
                <option value="agua_clara" className="bg-card text-foreground">Água Clara</option>
              </select>

              {/* Botão Adicionar Manualmente */}
              <Button
                type="button"
                onClick={() => setModalNovoColaboradorAberto(true)}
                className="h-10 rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Colaborador
              </Button>

              {/* Botão Importar */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalImportAberto(true)}
                className="h-10 rounded-xl gap-2 font-semibold border-border/70 hover:bg-muted/60 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-primary" />
                Importar Lista
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Colaboradores */}
      <div className="space-y-3">
        {colaboradoresFiltrados.length === 0 ? (
          <Card className="border-border/60 bg-card/40">
            <CardContent className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">Nenhum colaborador encontrado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tente ajustar os filtros de busca ou utilize o botão acima para adicionar ou importar colaboradores.
              </p>
            </CardContent>
          </Card>
        ) : (
          colaboradoresFiltrados.map((colab) => {
            const isExpanded = expandedId === colab.id;
            const statusInfo = statusConfig[colab.status] || statusConfig.presente;

            return (
              <Card
                key={colab.id}
                className={cn(
                  'border-border/60 bg-card/70 hover:bg-card/90 transition-all overflow-hidden',
                  isExpanded && 'ring-1 ring-primary/40'
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Foto e Informações Principais */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        {colab.foto ? (
                          <img
                            src={colab.foto}
                            alt={colab.nome}
                            className="w-12 h-12 rounded-2xl object-cover border border-border/80 shadow-md ring-2 ring-border/40"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-muted/70 border border-border flex items-center justify-center text-muted-foreground font-black text-base">
                            {colab.nome.charAt(0)}
                          </div>
                        )}
                        <span
                          className={cn(
                            'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card',
                            colab.status === 'presente' && 'bg-emerald-400',
                            colab.status === 'falta' && 'bg-rose-400',
                            colab.status === 'substituto' && 'bg-amber-400'
                          )}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-foreground">{colab.nome}</h4>
                          <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                            {colab.matricula}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{colab.cargo}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {regionalLabel[colab.regional] || 'Ribas do Rio Pardo'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status e Ações */}
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold border', statusInfo.className)}>
                          {statusInfo.label}
                        </span>
                        {colab.veiculoPrefixo && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50 text-foreground">
                            {colab.veiculoPrefixo}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : colab.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                        <p className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          Contato Direto
                        </p>
                        <p className="text-foreground font-medium">{colab.telefone || 'Não informado'}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                        <p className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          Lotação Operacional
                        </p>
                        <p className="text-foreground font-medium">
                          {colab.veiculoPrefixo} {colab.veiculoPlaca !== '-' ? `(${colab.veiculoPlaca})` : ''}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                        <p className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <IdCard className="w-3.5 h-3.5 text-amber-400" />
                          Ocorrência de Hoje
                        </p>
                        <p className="text-foreground font-medium">
                          {colab.motivoFalta ? `Falta: ${colab.motivoFalta}` : colab.substitutoNome ? `Substituindo ${colab.substitutoNome}` : 'Presença normal em rota'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro Manual de Colaborador */}
      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Adicionar Colaborador</h2>
                  <p className="text-xs text-muted-foreground">Cadastre novos integrantes na base de operação</p>
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

            <form onSubmit={handleSubmitNovoColaborador} className="p-6 space-y-4 overflow-y-auto">
              {formErro && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErro}</span>
                </div>
              )}

              {/* Área de Upload de Foto */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Foto do Colaborador
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center shrink-0 group">
                    {novaFoto ? (
                      <>
                        <img src={novaFoto} alt="Prévia" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoverFoto}
                          className="absolute inset-0 bg-background/70 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Camera className="w-6 h-6 text-muted-foreground/80" />
                        <span className="text-[10px] mt-1">Sem foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                      id="foto-upload-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fotoInputRef.current?.click()}
                      className="h-9 rounded-xl gap-2 text-xs font-semibold cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      {novaFoto ? 'Substituir Foto' : 'Subir Foto do Colaborador'}
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      Formatos aceitos: PNG, JPG ou WEBP (máx. 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Nome Completo *
                </label>
                <Input
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />
              </div>

              {/* Cargo e Matrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Cargo / Função *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Ex: Operador Florestal"
                      value={novoCargo}
                      onChange={(e) => setNovoCargo(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Matrícula (Opcional)
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Ex: MAT-4812"
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Telefone e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Telefone de Contato
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Ex: (67) 99999-1234"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Status Inicial
                  </label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as StatusPresenca)}
                    className="w-full h-10 rounded-xl bg-card/50 border border-input text-sm px-3 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="presente" className="bg-card text-foreground">Presente</option>
                    <option value="falta" className="bg-card text-foreground">Falta</option>
                    <option value="substituto" className="bg-card text-foreground">Substituto</option>
                  </select>
                </div>
              </div>

              {/* Unidade Regional */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Unidade Regional
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNovaUnidade('ribas')}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                      novaUnidade === 'ribas'
                        ? 'bg-sky-500/15 border-sky-500 text-sky-400'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Ribas do Rio Pardo
                  </button>

                  <button
                    type="button"
                    onClick={() => setNovaUnidade('agua_clara')}
                    className={cn(
                      'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                      novaUnidade === 'agua_clara'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Água Clara
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setModalNovoColaboradorAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação Excel / CSV */}
      {modalImportAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setModalImportAberto(false)}
        >
          <div
            className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Importar Colaboradores</h2>
                  <p className="text-xs text-muted-foreground">Envie planilha CSV ou Excel com a listagem de funcionários</p>
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

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 text-xs">
                <div>
                  <p className="font-bold text-foreground">Estrutura recomendada das colunas:</p>
                  <p className="text-muted-foreground mt-0.5">Nome, Cargo, Unidade, Matricula, Telefone</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBaixarModelo}
                  className="h-8 text-xs gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Modelo CSV
                </Button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/30 transition-all rounded-2xl p-6 text-center cursor-pointer space-y-2"
              >
                <UploadCloud className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground">
                  {arquivoNome ? arquivoNome : 'Clique para selecionar arquivo .CSV ou .TXT'}
                </p>
                <p className="text-xs text-muted-foreground">Suporta arquivos separados por vírgula ou ponto e vírgula</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {erroImportacao && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroImportacao}</span>
                </div>
              )}

              {/* Pré-visualização dos Registros */}
              {registrosPrevia.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Prévia dos registros identificados ({registrosPrevia.length})</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                      Pronto para importar
                    </Badge>
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40 text-xs">
                    {registrosPrevia.map((reg, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{reg.nome}</p>
                          <p className="text-[11px] text-muted-foreground">{reg.cargo} • {reg.matricula}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {reg.unidade === 'ribas' ? 'Ribas' : 'Água Clara'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setModalImportAberto(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarImportacao}
                  disabled={registrosPrevia.length === 0}
                  className="gap-2 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Importação ({registrosPrevia.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};