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
    reader.onload = (uploadEvent) => {
      setNovaFoto(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCriarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFormErro('O nome completo é obrigatório.');
      return;
    }
    if (!novoCargo.trim()) {
      setFormErro('A função/cargo é obrigatória.');
      return;
    }

    const novo: ColaboradorCompleto = {
      id: `colab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: novoNome.trim(),
      cargo: novoCargo.trim(),
      matricula: novaMatricula.trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      foto: novaFoto,
      telefone: novoTelefone.trim() || '(67) 99999-0000',
      status: novoStatus,
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
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

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setErroImportacao(null);
    setSucessoMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const linhas = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (linhas.length < 2) {
          setErroImportacao('A planilha deve conter um cabeçalho e pelo menos 1 linha de colaboradores.');
          return;
        }

        const separador = linhas[0].includes(';') ? ';' : ',';
        const cabecalho = linhas[0].split(separador).map((c) => c.trim().toLowerCase());

        const idxNome = cabecalho.findIndex((c) => c.includes('nome') || c.includes('colaborador'));
        const idxCargo = cabecalho.findIndex((c) => c.includes('cargo') || c.includes('função') || c.includes('funcao'));
        const idxUnidade = cabecalho.findIndex((c) => c.includes('unidade') || c.includes('regional') || c.includes('polo'));
        const idxMatricula = cabecalho.findIndex((c) => c.includes('matricula') || c.includes('matrícula') || c.includes('chapa'));
        const idxTelefone = cabecalho.findIndex((c) => c.includes('tel') || c.includes('fone') || c.includes('celular'));

        if (idxNome === -1 || idxCargo === -1) {
          setErroImportacao('Cabeçalho inválido. Certifique-se de ter as colunas: "Nome", "Função" e "Unidade".');
          return;
        }

        const registros: RegistroImportado[] = [];
        for (let i = 1; i < linhas.length; i++) {
          const cols = linhas[i].split(separador).map((col) => col.trim().replace(/^["']|["']$/g, ''));
          const nome = cols[idxNome] || '';
          const cargo = cols[idxCargo] || '';
          if (!nome || !cargo) continue;

          let unidade: 'ribas' | 'agua_clara' = 'ribas';
          if (idxUnidade !== -1 && cols[idxUnidade]) {
            const valUnidade = cols[idxUnidade].toLowerCase();
            if (valUnidade.includes('agua') || valUnidade.includes('água') || valUnidade.includes('clara')) {
              unidade = 'agua_clara';
            }
          }

          registros.push({
            nome,
            cargo,
            unidade,
            matricula: idxMatricula !== -1 ? cols[idxMatricula] : undefined,
            telefone: idxTelefone !== -1 ? cols[idxTelefone] : undefined,
          });
        }

        if (registros.length === 0) {
          setErroImportacao('Nenhum colaborador válido foi detectado nas linhas da planilha.');
          return;
        }

        setRegistrosPrevia(registros);
      } catch (err: any) {
        setErroImportacao('Erro ao processar o arquivo. Utilize formato .csv ou .txt delimitado por vírgula ou ponto-e-vírgula.');
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmarImportacao = () => {
    if (registrosPrevia.length === 0) return;

    const novosColaboradores: ColaboradorCompleto[] = registrosPrevia.map((reg, index) => ({
      id: `imp-${Date.now()}-${index}`,
      nome: reg.nome,
      cargo: reg.cargo,
      matricula: reg.matricula || `MAT-${1000 + index}`,
      foto: '',
      telefone: reg.telefone || '(67) 99999-0000',
      status: 'presente',
      equipeId: 'reserva',
      equipeNumero: 1,
      posicaoVeiculo: 'motorista',
      veiculoPrefixo: 'Banco de Reserva',
      veiculoPlaca: '-',
      regional: reg.unidade,
    }));

    setColaboradoresAdicionados((prev) => [...novosColaboradores, ...prev]);
    onImportarColaboradores?.(novosColaboradores);

    setSucessoMsg(`${novosColaboradores.length} colaboradores importados com sucesso!`);
    setTimeout(() => {
      setModalImportAberto(false);
      setRegistrosPrevia([]);
      setArquivoNome('');
      setSucessoMsg(null);
    }, 1200);
  };

  const baixarModeloCsv = () => {
    const csvContent =
      'Nome;Funcao;Unidade;Matricula;Telefone\n' +
      'João da Silva;Operador de Motosserra;Ribas do Rio Pardo;MAT-101;(67) 99123-4567\n' +
      'Marcos Paulo;Mecânico Florestal;Água Clara;MAT-102;(67) 99234-5678\n' +
      'Ana Pereira;Técnica de Segurança;Ribas do Rio Pardo;MAT-103;(67) 99345-6789\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_importacao_colaboradores.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Topo com Estatísticas e Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs py-1 px-3 bg-card border-border/80">
            Total: <span className="font-bold ml-1 tabular-nums">{stats.total}</span>
          </Badge>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Presentes: <span className="font-bold ml-1 tabular-nums">{stats.presentes}</span>
          </Badge>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-rose-500/10 text-rose-400 border-rose-500/30">
            Faltas: <span className="font-bold ml-1 tabular-nums">{stats.faltas}</span>
          </Badge>
          <Badge variant="outline" className="text-xs py-1 px-3 bg-amber-500/10 text-amber-400 border-amber-500/30">
            Substitutos: <span className="font-bold ml-1 tabular-nums">{stats.substitutos}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalImportAberto(true)}
            className="gap-2 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importar Planilha (Excel/CSV)</span>
          </Button>

          <Button
            type="button"
            onClick={() => setModalNovoColaboradorAberto(true)}
            className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cargo, matrícula ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/70 border-border/70"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-border/80 bg-card/70 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos os Status</option>
            <option value="presente">Presentes</option>
            <option value="falta">Faltas</option>
            <option value="substituto">Substitutos</option>
          </select>

          <select
            value={filterRegional}
            onChange={(e) => setFilterRegional(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-border/80 bg-card/70 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todas">Todas Unidades</option>
            <option value="ribas">Ribas do Rio Pardo</option>
            <option value="agua_clara">Água Clara</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colaboradoresFiltrados.map((c) => {
          const cfg = statusConfig[c.status] || statusConfig.presente;
          const isExpanded = expandedId === c.id;

          return (
            <Card
              key={c.id}
              className="border-border/70 hover:border-border transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-muted border border-border/80 flex items-center justify-center overflow-hidden shrink-0">
                      {c.foto ? (
                        <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{c.nome}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3 h-3 text-muted-foreground/70" />
                        {c.cargo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 border', cfg.className)}>
                    {cfg.label}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>{regionalLabel[c.regional] || c.regional}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>{c.telefone || 'Sem telefone'}</span>
                  </div>
                </div>

                {/* Ações Rápidas de Presença */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">Veículo: {c.veiculoPrefixo}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={c.status === 'presente' ? 'default' : 'outline'}
                      onClick={() => onUpdateColaboradorStatus?.(c.id, 'presente')}
                      className="h-7 px-2 text-[11px]"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Presente
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={c.status === 'falta' ? 'destructive' : 'outline'}
                      onClick={() => onUpdateColaboradorStatus?.(c.id, 'falta', 'Falta Injustificada')}
                      className="h-7 px-2 text-[11px]"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" />
                      Falta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {colaboradoresFiltrados.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border/80 bg-card/40">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-bold text-foreground">Nenhum colaborador encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tente ajustar os termos de pesquisa ou filtros selecionados.
          </p>
        </div>
      )}

      {/* Modal de Importação de Arquivo Excel / CSV */}
      {modalImportAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalImportAberto(false)}
        >
          <div
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">Importar Colaboradores via Planilha</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalImportAberto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Envie um arquivo <strong>.CSV</strong> contendo as colunas:{' '}
              <span className="text-foreground font-semibold">Nome, Função (Cargo) e Unidade (Ribas do Rio Pardo ou Água Clara)</span>.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/20"
            >
              <UploadCloud className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {arquivoNome ? arquivoNome : 'Clique para selecionar a planilha'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Formatos aceitos: CSV delimitado por vírgula ou ponto-e-vírgula</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleArquivoSelecionado}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={baixarModeloCsv}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Planilha Modelo (.csv)
              </button>

              {registrosPrevia.length > 0 && (
                <span className="text-xs text-foreground font-semibold">
                  {registrosPrevia.length} colaborador(es) identificados
                </span>
              )}
            </div>

            {erroImportacao && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroImportacao}</span>
              </div>
            )}

            {sucessoMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sucessoMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => setModalImportAberto(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarImportacao}
                disabled={registrosPrevia.length === 0}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <FileCheck className="w-4 h-4" />
                Confirmar Importação ({registrosPrevia.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação Manual de Colaborador */}
      {modalNovoColaboradorAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalNovoColaboradorAberto(false)}
        >
          <div
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Novo Colaborador</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoColaboradorAberto(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarColaborador} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Nome Completo</label>
                <Input
                  placeholder="Ex: João da Silva Santos"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Função / Cargo</label>
                  <Input
                    placeholder="Ex: Operador Florestal"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Matrícula</label>
                  <Input
                    placeholder="Ex: MAT-1082"
                    value={novaMatricula}
                    onChange={(e) => setNovaMatricula(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Unidade</label>
                  <select
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ribas">Ribas do Rio Pardo</option>
                    <option value="agua_clara">Água Clara</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Telefone</label>
                  <Input
                    placeholder="Ex: (67) 99876-5432"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                  />
                </div>
              </div>

              {formErro && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  {formErro}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setModalNovoColaboradorAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Colaborador</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};