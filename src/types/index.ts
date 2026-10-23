export type Regional = 'ribas' | 'agua_clara' | 'todas';

export type StatusPresenca = 'presente' | 'falta' | 'substituto';

export type MotivoFalta = 
  | 'Atestado Médico'
  | 'Falta Injustificada'
  | 'Folga Compensatória'
  | 'Treinamento / Integração'
  | 'Problema de Transporte'
  | 'Licença Especial';

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  matricula?: string;
  foto: string;
  telefone: string;
  status: StatusPresenca;
  motivoFalta?: MotivoFalta;
  observacao?: string;
  substitutoId?: string;
  substitutoNome?: string;
  equipeId: string;
  equipeNumero: 1 | 2;
  posicaoVeiculo: 'motorista' | 'frente_dir' | 'tras_esq' | 'tras_dir';
  unidade?: string;
  dataAdmissao?: string;
}

export interface Equipe {
  id: string;
  codigo: string;
  nome: string;
  numero: 1 | 2;
  regional: 'ribas' | 'agua_clara';
  lider: string;
  veiculoPrefixo: string;
  colaboradoresIds: string[];
}

export interface Veiculo {
  id: string;
  prefixo: string;
  placa: string;
  modelo: string;
  ano: number;
  regional: 'ribas' | 'agua_clara';
  statusOperacional: 'ativo' | 'manutencao' | 'reserva';
  equipe1Codigo: string;
  equipe2Codigo: string;
  assentos: {
    motorista: Colaborador; // Equipe 1
    frenteDir: Colaborador; // Equipe 1
    trasEsq: Colaborador;   // Equipe 2
    trasDir: Colaborador;   // Equipe 2
  };
}

export interface MetricasGerais {
  totalVeiculos: number;
  veiculosAtivos: number;
  totalEquipes: number;
  equipesCompletas: number;
  equipesIncompletas: number;
  totalColaboradores: number;
  colaboradoresPresentes: number;
  colaboradoresFaltas: number;
  colaboradoresSubstitutos: number;
  taxaPresenca: number;
}