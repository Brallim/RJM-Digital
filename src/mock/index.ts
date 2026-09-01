import type { Comunidade, Familia, Pessoa, Usuario } from '../types';

export const mockComunidades: Comunidade[] = [
  { id: '1', nome: 'Jardim Bom Clima', cidade: 'Votuporanga', estado: 'SP', ativo: true },
  { id: '2', nome: 'Jardim Planalto', cidade: 'Votuporanga', estado: 'SP', ativo: true }
];

export const mockUsuarios: Usuario[] = [
  { id: 'u1', nome: 'Irmão Cooperador', email: 'cooperador@rjmdigital.com', perfil: 'cooperador', comunidadesPermitidas: ['1', '2'], ativo: true },
  { id: 'u2', nome: 'Irmã Auxiliar', email: 'auxiliar@rjmdigital.com', perfil: 'auxiliar', comunidadesPermitidas: ['1'], ativo: true },
  { id: 'u3', nome: 'Família Silva', email: 'familia@rjmdigital.com', perfil: 'pai', comunidadesPermitidas: ['1'], ativo: true }
];

export const mockFamilias: Familia[] = [
  {
    id: 'f1', nomeFamilia: 'Família Santos', responsavel1: 'Maria Santos', telefonePrincipal: '(17) 99234-5678',
    endereco: 'Rua das Flores', numero: '125', bairro: 'Jardim Planalto', cidade: 'Votuporanga', cep: '15500-000', estado: 'SP',
    latitude: -20.4238, longitude: -49.9750, comunidadeId: '2', ativo: true,
    ultimaVisita: '2024-05-15', statusVisita: 'verde',
    fotoFamiliaUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'f2', nomeFamilia: 'Família Silva', responsavel1: 'João Silva', telefonePrincipal: '(17) 99123-4567',
    endereco: 'Av. Brasil', numero: '500', bairro: 'Jardim Bom Clima', cidade: 'Votuporanga', cep: '15500-000', estado: 'SP',
    latitude: -20.4281, longitude: -49.9702, comunidadeId: '1', ativo: true,
    proximaVisita: '2024-05-22', statusVisita: 'amarelo',
    fotoFamiliaUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'f3', nomeFamilia: 'Família Oliveira', responsavel1: 'Carlos Oliveira', telefonePrincipal: '(17) 99888-7777',
    endereco: 'Rua Paraná', numero: '302', bairro: 'Centro', cidade: 'Votuporanga', cep: '15500-000', estado: 'SP',
    latitude: -20.4200, longitude: -49.9800, comunidadeId: '1', ativo: true,
    statusVisita: 'vermelho'
  }
];

export const mockPessoas: Pessoa[] = [
  // Adultos Responsáveis (adicionados para dar contexto familiar)
  { id: 'p_resp1', nomeCompleto: 'Maria Santos', dataNascimento: '1985-04-12', sexo: 'F', parentesco: 'Mãe', categoria: 'adulto', familiaId: 'f1', comunidadeId: '2', batizado: true, dataBatismo: '2005-10-10', ativo: true },
  { id: 'p_resp2', nomeCompleto: 'João Silva', dataNascimento: '1982-11-05', sexo: 'M', parentesco: 'Pai', categoria: 'adulto', familiaId: 'f2', comunidadeId: '1', batizado: true, dataBatismo: '2000-01-20', ativo: true },
  { id: 'p_resp3', nomeCompleto: 'Carlos Oliveira', dataNascimento: '1979-08-30', sexo: 'M', parentesco: 'Pai', categoria: 'adulto', familiaId: 'f3', comunidadeId: '1', batizado: true, dataBatismo: '1998-05-15', ativo: true },

  // Meninas (5)
  { id: 'j1', nomeCompleto: 'Maria Eduarda Santos', dataNascimento: '2012-05-12', sexo: 'F', parentesco: 'Filha', categoria: 'menina', familiaId: 'f1', comunidadeId: '1', batizado: false, ativo: true, fotoUrl: 'https://images.unsplash.com/photo-1544281679-52e80eb0b368?w=150&auto=format&fit=crop&q=60' },
  { id: 'j2', nomeCompleto: 'Ana Clara Oliveira', dataNascimento: '2013-01-27', sexo: 'F', parentesco: 'Filha', categoria: 'menina', familiaId: 'f2', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menina_3', nomeCompleto: 'Beatriz Costa Silva', dataNascimento: '2014-04-10', sexo: 'F', parentesco: 'Filha', categoria: 'menina', familiaId: 'f1', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menina_4', nomeCompleto: 'Laura Mendes', dataNascimento: '2011-09-05', sexo: 'F', parentesco: 'Filha', categoria: 'menina', familiaId: 'f2', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menina_5', nomeCompleto: 'Isabela Ferreira', dataNascimento: '2012-11-20', sexo: 'F', parentesco: 'Filha', categoria: 'menina', familiaId: 'f3', comunidadeId: '1', batizado: false, ativo: true },
  
  // Moças (5)
  { id: 'j3', nomeCompleto: 'Juliana Pereira Lima', dataNascimento: '2008-03-15', sexo: 'F', parentesco: 'Filha', categoria: 'moca', familiaId: 'f1', comunidadeId: '1', batizado: true, dataBatismo: '2023-01-10', ativo: true, fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60' },
  { id: 'j_moca_2', nomeCompleto: 'Letícia Gomes', dataNascimento: '2007-07-22', sexo: 'F', parentesco: 'Filha', categoria: 'moca', familiaId: 'f2', comunidadeId: '1', batizado: true, dataBatismo: '2022-10-15', ativo: true },
  { id: 'j_moca_3', nomeCompleto: 'Camila Rocha', dataNascimento: '2006-12-12', sexo: 'F', parentesco: 'Filha', categoria: 'moca', familiaId: 'f3', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_moca_4', nomeCompleto: 'Fernanda Alves', dataNascimento: '2009-02-18', sexo: 'F', parentesco: 'Filha', categoria: 'moca', familiaId: 'f2', comunidadeId: '1', batizado: true, dataBatismo: '2023-11-20', ativo: true },
  { id: 'j_moca_5', nomeCompleto: 'Mariana Martins', dataNascimento: '2008-10-30', sexo: 'F', parentesco: 'Filha', categoria: 'moca', familiaId: 'f1', comunidadeId: '1', batizado: true, dataBatismo: '2024-01-10', ativo: true },

  // Meninos (5)
  { id: 'j4', nomeCompleto: 'João Pedro Silva', dataNascimento: '2011-08-03', sexo: 'M', parentesco: 'Filho', categoria: 'menino', familiaId: 'f2', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menino_2', nomeCompleto: 'Pedro Henrique Dias', dataNascimento: '2012-02-14', sexo: 'M', parentesco: 'Filho', categoria: 'menino', familiaId: 'f1', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menino_3', nomeCompleto: 'Davi Lucca', dataNascimento: '2013-05-29', sexo: 'M', parentesco: 'Filho', categoria: 'menino', familiaId: 'f3', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menino_4', nomeCompleto: 'Arthur Miguel', dataNascimento: '2014-01-08', sexo: 'M', parentesco: 'Filho', categoria: 'menino', familiaId: 'f1', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_menino_5', nomeCompleto: 'Heitor Souza', dataNascimento: '2011-12-11', sexo: 'M', parentesco: 'Filho', categoria: 'menino', familiaId: 'f2', comunidadeId: '1', batizado: false, ativo: true },

  // Moços (5)
  { id: 'j5', nomeCompleto: 'Lucas Gabriel Almeida', dataNascimento: '2004-06-15', sexo: 'M', parentesco: 'Filho', categoria: 'moco', familiaId: 'f2', comunidadeId: '1', batizado: true, dataBatismo: '2020-11-20', ativo: true },
  { id: 'j_moco_2', nomeCompleto: 'Mateus Carvalho', dataNascimento: '2005-09-02', sexo: 'M', parentesco: 'Filho', categoria: 'moco', familiaId: 'f1', comunidadeId: '1', batizado: true, dataBatismo: '2021-08-15', ativo: true },
  { id: 'j_moco_3', nomeCompleto: 'Gabriel Ribeiro', dataNascimento: '2003-04-19', sexo: 'M', parentesco: 'Filho', categoria: 'moco', familiaId: 'f3', comunidadeId: '1', batizado: true, dataBatismo: '2019-12-25', ativo: true },
  { id: 'j_moco_4', nomeCompleto: 'Felipe Cardoso', dataNascimento: '2006-08-25', sexo: 'M', parentesco: 'Filho', categoria: 'moco', familiaId: 'f1', comunidadeId: '1', batizado: false, ativo: true },
  { id: 'j_moco_5', nomeCompleto: 'Tiago Fernandes', dataNascimento: '2007-03-05', sexo: 'M', parentesco: 'Filho', categoria: 'moco', familiaId: 'f2', comunidadeId: '1', batizado: true, dataBatismo: '2022-04-10', ativo: true },
];

