// Tipos espelhando o "model" da API Java e funções para chamar cada rota.

export type Perfil = 'RESPONSAVEL' | 'FUNCIONARIO'
export type StatusCadastro = 'RASCUNHO' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'COM_PENDENCIA'

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
}

export interface CriarUsuario {
  nome: string
  email: string
  senha: string
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
const CHAVE_CREDENCIAIS = 'screi.credenciais'

interface Credenciais {
  email: string
  senha: string
}

function lerCredenciais(): Credenciais | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE_CREDENCIAIS)
    return salvo ? (JSON.parse(salvo) as Credenciais) : null
  } catch {
    return null
  }
}

export function guardarCredenciais(email: string, senha: string) {
  sessionStorage.setItem(CHAVE_CREDENCIAIS, JSON.stringify({ email, senha }))
}

export function limparCredenciais() {
  sessionStorage.removeItem(CHAVE_CREDENCIAIS)
}

function basicAuth(email: string, senha: string) {
  const bytes = new TextEncoder().encode(`${email}:${senha}`)
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return `Basic ${btoa(binario)}`
}

async function buscar(caminho: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('X-Requested-With', 'XMLHttpRequest')
  const credenciais = lerCredenciais()
  if (credenciais) headers.set('Authorization', basicAuth(credenciais.email, credenciais.senha))

  let resp: Response
  try {
    resp = await fetch(caminho, { ...init, headers })
  } catch {
    throw new ApiError(0, SEM_CONEXAO)
  }

  if (resp.status === 401 && credenciais) {
    limparCredenciais()
    window.dispatchEvent(new Event('screi:unauthorized'))
  }
  return resp
}

export function comoApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e
  return new ApiError(0, 'Algo deu errado. Tente novamente.')
}

// Campos vazios ("") viram null, que é o que a API espera para "não preenchido".
function paraJson(corpo: unknown) {
  return JSON.stringify(corpo, (_chave, valor) => (valor === '' ? null : valor))
}

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const resp = await buscar('/api' + caminho, {
    method: metodo,
    headers: corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo !== undefined ? paraJson(corpo) : undefined,
  })

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
    criar: (u: CriarUsuario) => chamar<Usuario>('POST', '/usuarios', u),
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
      const resp = await buscar(`/api/exportacao?status=${status}`)
      if (!resp.ok) throw new ApiError(resp.status, SEM_CONEXAO)
      const disposicao = resp.headers.get('Content-Disposition') ?? ''
      const nome = /filename="([^"]+)"/.exec(disposicao)?.[1] ?? 'cadastros.xlsx'
      return { arquivo: await resp.blob(), nome }
    },
  },
}
