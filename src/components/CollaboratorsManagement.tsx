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

  // Cadastrar novo colaborador manual
  const handleCriarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome completo do colaborador é obrigatório.');
      return;
    }
    if (!novoCargo.trim()) {
      setFormErro('O cargo do colaborador é obrigatório.');
      return;
    }

    const novoColab: ColaboradorCompleto = {
      id: `manual-${Date.now()}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim(),
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: novaFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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

    // Limpar formulário e fechar modal
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Gestão de Colaboradores</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhamento de efetivo, faltas, presenças e registros da operação florestal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setModalNovoColaboradorAberto(true)}
            className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Adicionar Colaborador
          </Button>
        </div>
      </div>

      {/* Resumo de Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Ativos</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Presentes</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.presentes}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Faltas</p>
              <h3 className="text-2xl font-black text-rose-400 mt-1">{stats.faltas}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Substitutos</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.substitutos}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, matrícula, cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-muted/30 border-border/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterRegional}
              onChange={(e) => setFilterRegional(e.target.value as any)}
              className="h-11 px-3 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas as Unidades</option>
              <option value="ribas">Ribas do Rio Pardo</option>
              <option value="agua_clara">Água Clara</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-11 px-3 text-xs sm:text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos os Status</option>
              <option value="presente">Presentes</option>
              <option value="falta">Faltas</option>
              <option value="substituto">Substitutos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colaboradoresFiltrados.map((c) => {
          const cfg = statusConfig[c.status] || statusConfig.presente;
          return (
            <Card key={c.id} className="border-border bg-card/50 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border/80 bg-muted">
                    {c.foto ? (
                      <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-foreground bg-muted">
                        {c.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
                      c.status === 'presente' && 'bg-emerald-500',
                      c.status === 'falta' && 'bg-rose-500',
                      c.status === 'substituto' && 'bg-amber-500'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-foreground truncate">{c.nome}</h4>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.className)}>
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{c.cargo}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.matricula}</p>

                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{regionalLabel[c.regional] || 'Ribas'}</span>
                    <span className="font-medium text-foreground">{c.veiculoPrefixo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Adicionar Colaborador */}
      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Novo Colaborador</h3>
                  <p className="text-xs text-muted-foreground">Cadastre um operador ou reserva operacional</p>
                </div>
              </div>
              <button
                onClick={() => setModalNovoColaboradorAberto(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarColaborador} className="p-6 space-y-4">
              {formErro && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formErro}
                </div>
              )}

              {/* Upload da Foto */}
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-muted/20">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center">
                    {novaFoto ? (
                      <img src={novaFoto} alt="Foto prévia" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  {novaFoto && (
                    <button
                      type="button"
                      onClick={handleRemoverFoto}
                      className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full shadow hover:bg-rose-600 transition-colors"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fotoInputRef}
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="hidden"
                  id="foto-colaborador-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fotoInputRef.current?.click()}
                  className="gap-2 text-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {novaFoto ? 'Alterar Foto' : 'Subir Foto do Colaborador'}
                </Button>
                <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG ou WEBP até 5MB</span>
              </div>

              {/* Dados Principais */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Nome Completo *</label>
                  <Input
                    placeholder="Ex: Carlos Roberto de Almeida"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Cargo *</label>
                    <Input
                      placeholder="Ex: Operador Florestal"
                      value={novoCargo}
                      onChange={(e) => setNovoCargo(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Matrícula</label>
                    <Input
                      placeholder="Ex: MAT-4081"
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Telefone</label>
                    <Input
                      placeholder="(67) 99999-9999"
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Unidade / Regional</label>
                    <select
                      value={novaUnidade}
                      onChange={(e) => setNovaUnidade(e.target.value as any)}
                      className="w-full h-10 mt-1 px-3 text-sm bg-muted/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="ribas">Ribas do Rio Pardo</option>
                      <option value="agua_clara">Água Clara</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNovoColaboradorAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar Colaborador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};