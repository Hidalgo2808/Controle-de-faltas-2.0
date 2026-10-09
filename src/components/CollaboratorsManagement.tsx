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

  const handleSalvarNovoColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome completo do colaborador é obrigatório.');
      return;
    }
    if (!novoCargo.trim()) {
      setFormErro('O cargo da função é obrigatório.');
      return;
    }

    const novoColab: ColaboradorCompleto = {
      id: `col-novo-${Date.now()}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim(),
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: novaFoto || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
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

    // Limpa formulário
    setNovoNome('');
    setNovoCargo('');
    setNovaMatricula('');
    setNovoTelefone('');
    setNovaFoto('');
    setNovaUnidade('ribas');
    setNovoStatus('presente');
    setFormErro(null);
    setModalNovoColaboradorAberto(false);
  };

  // Leitura de CSV / Excel simplificada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroImportacao(null);
    setSucessoMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setErroImportacao('Arquivo vazio ou ilegível.');
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length <= 1) {
        setErroImportacao('O arquivo precisa conter ao menos o cabeçalho e 1 linha de dados.');
        return;
      }

      const rows: RegistroImportado[] = [];
      // Ignora a primeira linha (cabeçalho)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2 && cols[0]) {
          const rawUnidade = (cols[2] || '').toLowerCase();
          const unidade: 'ribas' | 'agua_clara' = rawUnidade.includes('agua') || rawUnidade.includes('água') ? 'agua_clara' : 'ribas';

          rows.push({
            nome: cols[0],
            cargo: cols[1] || 'Operador Florestal',
            unidade,
            matricula: cols[3] || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
            telefone: cols[4] || '(67) 99999-0000',
          });
        }
      }

      if (rows.length === 0) {
        setErroImportacao('Não foi possível identificar registros válidos na planilha.');
      } else {
        setRegistrosPrevia(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarImportacao = () => {
    if (registrosPrevia.length === 0) return;

    const novos: ColaboradorCompleto[] = registrosPrevia.map((r, idx) => ({
      id: `imp-${Date.now()}-${idx}`,
      nome: r.nome,
      cargo: r.cargo,
      matricula: r.matricula || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      telefone: r.telefone || '(67) 99999-0000',
      status: 'presente',
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: r.unidade,
    }));

    setColaboradoresAdicionados((prev) => [...novos, ...prev]);

    if (onImportarColaboradores) {
      onImportarColaboradores(novos);
    }

    setSucessoMsg(`${novos.length} colaboradores importados com sucesso!`);
    setTimeout(() => {
      setModalImportAberto(false);
      setRegistrosPrevia([]);
      setArquivoNome('');
      setSucessoMsg(null);
    }, 1500);
  };

  const handleDownloadModeloCSV = () => {
    const csvContent =
      'Nome Completo,Cargo / Funcao,Unidade (Ribas ou Agua Clara),Matricula,Telefone\n' +
      'Antonio Carlos da Silva,Operador de Motosserra,Ribas do Rio Pardo,MAT-7701,(67) 99911-2233\n' +
      'Juliano Moreira Santos,Motorista Operacional,Agua Clara,MAT-7702,(67) 99944-5566\n' +
      'Rodrigo Fernandes Lima,Ajudante Geral,Ribas do Rio Pardo,MAT-7703,(67) 99977-8899\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_colaboradores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Geral</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Presentes</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.presentes}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Faltas</p>
              <p className="text-2xl font-bold text-rose-400 mt-0.5">{stats.faltas}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UserX className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/80 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Substitutos</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">{stats.substitutos}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Ações e Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome, cargo, matrícula ou veículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRegional}
              onChange={(e) => setFilterRegional(e.target.value as Regional | 'todas')}
              className="h-10 px-3 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="todas">Todas as Unidades</option>
              <option value="ribas">Ribas do Rio Pardo</option>
              <option value="agua_clara">Água Clara</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusPresenca | 'todos')}
              className="h-10 px-3 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="todos">Todos os Status</option>
              <option value="presente">Presentes</option>
              <option value="falta">Faltas</option>
              <option value="substituto">Substitutos</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setModalNovoColaboradorAberto(true)}
            className="gap-2 h-10 px-4 bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Adicionar Colaborador
          </Button>

          <Button
            variant="outline"
            onClick={() => setModalImportAberto(true)}
            className="gap-2 h-10 px-3.5 border-border hover:bg-accent text-xs font-semibold"
          >
            <UploadCloud className="w-4 h-4 text-primary" />
            Importar Excel
          </Button>
        </div>
      </div>

      {/* Lista de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colaboradoresFiltrados.map((c) => {
          const isExpanded = expandedId === c.id;
          const status = statusConfig[c.status] || statusConfig.presente;

          return (
            <Card
              key={c.id}
              className={cn(
                'border transition-all duration-200 hover:border-primary/40 bg-card/60 overflow-hidden',
                c.status === 'falta' && 'border-rose-500/30 bg-rose-500/[0.02]',
                c.status === 'substituto' && 'border-amber-500/30 bg-amber-500/[0.02]'
              )}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border/80 bg-muted">
                      {c.foto ? (
                        <img
                          src={c.foto}
                          alt={c.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-foreground">
                          {c.nome.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-sm text-foreground truncate">{c.nome}</h3>
                      <Badge className={cn('text-[10px] px-2 py-0.5 shrink-0', status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.cargo}</p>
                    <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                      <IdCard className="w-3 h-3 text-muted-foreground" />
                      {c.matricula || 'Sem matrícula'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{regionalLabel[c.regional] || 'Regional'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{c.telefone || 'Sem contato'}</span>
                  </div>
                </div>

                {/* Detalhes extras se houver falta ou substituto */}
                {(c.motivoFalta || c.substitutoNome) && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    {c.motivoFalta && (
                      <p className="text-rose-400 font-medium">
                        Motivo: <span className="text-foreground">{c.motivoFalta}</span>
                      </p>
                    )}
                    {c.substitutoNome && (
                      <p className="text-amber-400 font-medium">
                        Substituído por: <span className="text-foreground">{c.substitutoNome}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {colaboradoresFiltrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/30">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-base font-semibold text-foreground">Nenhum colaborador encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente ajustar os termos de pesquisa ou filtros selecionados.
          </p>
        </div>
      )}

      {/* Modal: Adicionar Colaborador Manualmente com Foto */}
      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-base text-foreground">Adicionar Novo Colaborador</h2>
              </div>
              <button
                onClick={() => setModalNovoColaboradorAberto(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoColaborador} className="p-6 space-y-4">
              {formErro && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formErro}
                </div>
              )}

              {/* Upload de Foto */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/40 bg-muted shrink-0 flex items-center justify-center group">
                  {novaFoto ? (
                    <img src={novaFoto} alt="Previa" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-semibold text-foreground">Foto do Colaborador</p>
                  <p className="text-[11px] text-muted-foreground">Arquivos PNG, JPG ou WEBP até 5MB.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                      id="foto-upload-input"
                    />
                    <label
                      htmlFor="foto-upload-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {novaFoto ? 'Alterar Foto' : 'Selecionar Foto'}
                    </label>
                    {novaFoto && (
                      <button
                        type="button"
                        onClick={handleRemoverFoto}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />
              </div>

              {/* Cargo e Matrícula */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Cargo / Função *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Operador Florestal"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Matrícula
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: MAT-4501"
                    value={novaMatricula}
                    onChange={(e) => setNovaMatricula(e.target.value)}
                  />
                </div>
              </div>

              {/* Telefone e Unidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Telefone / WhatsApp
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: (67) 99812-3344"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Unidade Operacional
                  </label>
                  <select
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value as 'ribas' | 'agua_clara')}
                    className="w-full h-10 px-3 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="ribas">Ribas do Rio Pardo</option>
                    <option value="agua_clara">Água Clara</option>
                  </select>
                </div>
              </div>

              {/* Status Inicial */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Status de Presença
                </label>
                <select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value as StatusPresenca)}
                  className="w-full h-10 px-3 text-xs bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  <option value="presente">Presente</option>
                  <option value="falta">Falta</option>
                  <option value="substituto">Substituto (Reserva)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNovoColaboradorAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="font-semibold">
                  Cadastrar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Importar Planilha Excel / CSV */}
      {modalImportAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setModalImportAberto(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-base text-foreground">Importar Colaboradores</h2>
              </div>
              <button
                onClick={() => setModalImportAberto(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Envie um arquivo <strong>CSV ou Excel</strong> contendo a lista de colaboradores para inclusão automática.
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Modelo de Planilha Padrão</p>
                  <p className="text-muted-foreground text-[11px]">Baixe o layout padrão para preencher seus dados.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadModeloCSV}
                  className="gap-1.5 text-xs h-8"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  Baixar Modelo
                </Button>
              </div>

              {/* Área de Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30"
              >
                <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Clique para selecionar o arquivo</p>
                <p className="text-xs text-muted-foreground mt-0.5">Suporta arquivos .CSV ou .TXT</p>
                {arquivoNome && (
                  <p className="text-xs font-bold text-primary mt-2 flex items-center justify-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {arquivoNome}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {erroImportacao && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {erroImportacao}
                </div>
              )}

              {sucessoMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {sucessoMsg}
                </div>
              )}

              {registrosPrevia.length > 0 && !sucessoMsg && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">
                    Prévia dos Registros Encontrados ({registrosPrevia.length}):
                  </p>
                  <div className="max-h-36 overflow-y-auto border border-border rounded-xl divide-y divide-border/60">
                    {registrosPrevia.map((item, idx) => (
                      <div key={idx} className="p-2 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{item.nome}</p>
                          <p className="text-[11px] text-muted-foreground">{item.cargo}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {item.unidade === 'ribas' ? 'Ribas' : 'Água Clara'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalImportAberto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={registrosPrevia.length === 0}
                  onClick={handleConfirmarImportacao}
                  className="font-semibold"
                >
                  Importar {registrosPrevia.length > 0 ? `(${registrosPrevia.length})` : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};