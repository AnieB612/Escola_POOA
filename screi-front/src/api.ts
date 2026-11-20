// Tipos espelhando o "model" da API Java e funções para chamar cada rota.

export type Perfil = 'RESPONSAVEL' | 'FUNCIONARIO'
export type StatusCadastro = 'RASCUNHO' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'COM_PENDENCIA'

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
}

export interface Endereco {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

export interface Aluno {
  nome: string
  dataNascimento: string
  cpf: string
  observacoesSaude: string
  endereco: Endereco
}

export interface Responsavel {
  nome: string
  cpf: string
  parentesco: string
  telefone: string
  email: string
  endereco: Endereco
}

export interface ContatoEmergencia {
  nome: string
  telefone: string
  parentesco: string
}

export interface Cadastro {
  id: number
  status: StatusCadastro
  dataEnvio: string | null
  justificativa: string | null
  usuario: Usuario
  aluno: Aluno | null
  responsaveis: Responsavel[]
  contatosEmergencia: ContatoEmergencia[]
}

export interface StatusResponse {
  id: number
  status: StatusCadastro
  dataEnvio: string | null
  justificativa: string | null
}

export interface EtapaCorpo {
  usuarioId?: number
  aluno?: Aluno
  responsaveis?: Responsavel[]
  contatosEmergencia?: ContatoEmergencia[]
}

/** Erro devolvido pela API: { mensagem, pendencias } */
export class ApiError extends Error {
  status: number
  pendencias: string[]

  constructor(status: number, mensagem: string, pendencias: string[] = []) {
    super(mensagem)
    this.status = status
    this.pendencias = pendencias
  }
}

const SEM_CONEXAO =
  'Não foi possível falar com a API. Confira se ela está rodando (.\\mvnw.cmd spring-boot:run na pasta da API).'

export function comoApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e
  return new ApiError(0, 'Algo deu errado. Tente novamente.')
}

// Campos vazios ("") viram null, que é o que a API espera para "não preenchido".
function paraJson(corpo: unknown) {
  return JSON.stringify(corpo, (_chave, valor) => (valor === '' ? null : valor))
}

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  let resp: Response
  try {
    resp = await fetch('/api' + caminho, {
      method: metodo,
      headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo !== undefined ? paraJson(corpo) : undefined,
    })
  } catch {
    throw new ApiError(0, SEM_CONEXAO)
  }

  if (!resp.ok) {
    let dados: { mensagem?: string; pendencias?: string[] } | null = null
    try {
      dados = await resp.json()
    } catch {
      // resposta sem JSON (ex.: API desligada e o proxy respondeu)
    }
    if (!dados?.mensagem) {
      throw new ApiError(resp.status, resp.status >= 500 ? SEM_CONEXAO : `Erro ${resp.status}`)
    }
    throw new ApiError(resp.status, dados.mensagem, dados.pendencias ?? [])
  }

  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}

export const api = {
  usuarios: {
    listar: () => chamar<Usuario[]>('GET', '/usuarios'),
    criar: (u: Omit<Usuario, 'id'>) => chamar<Usuario>('POST', '/usuarios', u),
  },

  cadastros: {
    listar: (usuarioId?: number) =>
      chamar<Cadastro[]>('GET', '/cadastros' + (usuarioId ? `?usuarioId=${usuarioId}` : '')),
    buscar: (id: number) => chamar<Cadastro>('GET', `/cadastros/${id}`),
    criar: (corpo: EtapaCorpo) => chamar<Cadastro>('POST', '/cadastros', corpo),
    salvarEtapa: (id: number, corpo: EtapaCorpo) => chamar<Cadastro>('PUT', `/cadastros/${id}`, corpo),
    enviar: (id: number) => chamar<Cadastro>('POST', `/cadastros/${id}/enviar`),
    consultarStatus: (id: number) => chamar<StatusResponse>('GET', `/cadastros/${id}/status`),
    excluir: (id: number) => chamar<void>('DELETE', `/cadastros/${id}`),
    buscarCep: (cep: string) => chamar<Endereco>('GET', `/cadastros/cep/${cep}`),
  },

  triagem: {
    listarFila: () => chamar<Cadastro[]>('GET', '/triagem/fila'),
    aprovar: (id: number) => chamar<Cadastro>('POST', `/triagem/${id}/aprovar`),
    reprovar: (id: number, justificativa: string) =>
      chamar<Cadastro>('POST', `/triagem/${id}/reprovar`, { justificativa }),
  },

  exportacao: {
    async exportar(status: StatusCadastro): Promise<{ arquivo: Blob; nome: string }> {
      let resp: Response
      try {
        resp = await fetch(`/api/exportacao?status=${status}`)
      } catch {
        throw new ApiError(0, SEM_CONEXAO)
      }
      if (!resp.ok) throw new ApiError(resp.status, SEM_CONEXAO)
      const disposicao = resp.headers.get('Content-Disposition') ?? ''
      const nome = /filename="([^"]+)"/.exec(disposicao)?.[1] ?? 'cadastros.csv'
      return { arquivo: await resp.blob(), nome }
    },
  },
}
