export type Perfil = 'cooperador' | 'auxiliar' | 'pai' | 'jovem' | 'pendente';
export type Categoria = 'menina' | 'moca' | 'menino' | 'moco' | 'adulto';
export type StatusReuniao = 'planejamento' | 'preparada' | 'em_andamento' | 'finalizada';
export type StatusParticipante = 'programado' | 'confirmado' | 'ausente' | 'incluido_no_dia' | 'substituido' | 'recitou';

export interface Usuario {
  id: string; // auth.users.id
  pessoaId?: string | null; // Liga o usuário a uma Pessoa na congregação
  nome: string;
  email: string;
  perfil: Perfil;
  comunidadesPermitidas: string[];
  ativo: boolean;
}

export interface Comunidade {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  ativo: boolean;
}

export interface Familia {
  id: string;
  nomeFamilia: string;
  fotoFamiliaUrl?: string;
  fotoFamiliaStoragePath?: string;
  responsavel1?: string; // Mantido para compatibilidade, mas o ideal e buscar na tabela de Pessoas
  responsavel2?: string;
  telefonePrincipal?: string;
  telefone?: string; // Legado
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado?: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  comunidadeId: string;
  observacoes?: string;
  ativo: boolean;
  ultimaVisita?: string;
  proximaVisita?: string;
  statusVisita?: 'verde' | 'amarelo' | 'vermelho' | 'azul' | 'cinza';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface Pessoa {
  id: string;
  nomeCompleto: string;
  fotoUrl?: string;
  fotoStoragePath?: string;
  dataNascimento: string;
  sexo: 'M' | 'F';
  parentesco?: string;
  telefone?: string;
  categoria: Categoria;
  familiaId: string;
  comunidadeId: string;
  batizado: boolean;
  dataBatismo?: string | null;
  isOrganista?: boolean;
  isAuxiliar?: boolean;
  dataApresentacao?: string | null;
  ativo: boolean;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Aliasing Jovem to Pessoa for backward compatibility if needed, or simply replacing it everywhere.
export type Jovem = Pessoa;

export interface Reuniao {
  id: string;
  comunidadeId: string;
  data: string;
  status: StatusReuniao;
  auxiliarMeninas?: string;
  trechoMeninas?: string;
  auxiliarMocas?: string;
  trechoMocas?: string;
  auxiliarMeninos?: string;
  trechoMeninos?: string;
  auxiliarMocos?: string;
  trechoMocos?: string;
  oracaoPaiNosso?: string;
  oracaoEspontanea?: string;
  createdBy: string;
  createdAt?: string;
}

export interface Recitativo {
  id: string;
  reuniaoId: string;
  categoria: Categoria;
  auxiliarResponsavelId: string;
  trechoBiblico: string;
  status: string;
}

export interface ParticipanteRecitativo {
  id: string;
  recitativoId: string;
  pessoaId: string; // Trocado de jovemId para pessoaId
  jovemId?: string; // Legado
  ordemPlanejada: number;
  ordemRealizada?: number;
  versoPlanejado: string;
  versoRealizado?: string;
  status: StatusParticipante;
  presente: boolean;
  observacoes?: string;
}

export interface Visita {
  id: string;
  familiaId: string;
  comunidadeId: string;
  dataVisita: string;
  visitantes?: string[]; // Trocado de responsaveis para visitantes
  responsaveis?: string[]; // Legado
  moradoresPresentes?: string[];
  fotoVisitaUrl?: string; // Nova foto (selfie)
  observacoes?: string;
  resultado?: string;
  necessitaRetorno?: boolean;
  proximaVisita?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Aviso {
  id: string;
  comunidadeId: string;
  titulo: string;
  conteudo: string;
  dataPublicacao: string;
  autorId: string;
  
  // Extra fields for frontend use
  autorNome?: string;
  lidoPorMim?: boolean;
  totalLidos?: number;
}

export interface AvisoLido {
  avisoId: string;
  usuarioId: string;
}
