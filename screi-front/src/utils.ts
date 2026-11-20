import type { Aluno, ContatoEmergencia, Endereco, Perfil, Responsavel, StatusCadastro } from './api'

// ---------- Status ----------

export const STATUS: Record<StatusCadastro, { rotulo: string; descricao: string }> = {
  RASCUNHO: { rotulo: 'Rascunho', descricao: 'Ainda está sendo preenchido' },
  ENVIADO: { rotulo: 'Enviado', descricao: 'Aguardando a triagem da secretaria' },
  EM_ANALISE: { rotulo: 'Em análise', descricao: 'A secretaria está analisando' },
  APROVADO: { rotulo: 'Aprovado', descricao: 'Cadastro aprovado' },
  COM_PENDENCIA: { rotulo: 'Com pendência', descricao: 'Precisa de correção' },
}

export const STATUS_ORDEM: StatusCadastro[] = ['RASCUNHO', 'ENVIADO', 'EM_ANALISE', 'COM_PENDENCIA', 'APROVADO']

export const PERFIL_ROTULO: Record<Perfil, string> = {
  RESPONSAVEL: 'Responsável',
  FUNCIONARIO: 'Funcionário(a)',
}

export const podeEditar = (s: StatusCadastro) => s === 'RASCUNHO' || s === 'COM_PENDENCIA'
export const estaNaFila = (s: StatusCadastro) => s === 'ENVIADO' || s === 'EM_ANALISE'

export const PARENTESCOS = ['Mãe', 'Pai', 'Avó', 'Avô', 'Tia', 'Tio', 'Irmã', 'Irmão', 'Madrasta', 'Padrasto', 'Responsável legal']

// ---------- Objetos vazios e normalização ----------

export const enderecoVazio = (): Endereco => ({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '' })
export const alunoVazio = (): Aluno => ({
  nome: '', dataNascimento: '', cpf: '', observacoesSaude: '', endereco: enderecoVazio(),
})
export const responsavelVazio = (): Responsavel => ({
  nome: '', cpf: '', parentesco: '', telefone: '', email: '', endereco: enderecoVazio(),
})
export const contatoVazio = (): ContatoEmergencia => ({ nome: '', telefone: '', parentesco: '' })

/** Copia os dados vindos da API para o formato do formulário (null vira ""). */
function preencher<T extends object>(base: T, dados: unknown): T {
  const saida = { ...base } as Record<string, unknown>
  const origem = dados && typeof dados === 'object' ? (dados as Record<string, unknown>) : {}
  for (const chave of Object.keys(base)) {
    const padrao = (base as Record<string, unknown>)[chave]
    const valor = origem[chave]
    saida[chave] =
      padrao && typeof padrao === 'object'
        ? preencher(padrao as object, valor)
        : valor == null ? '' : String(valor)
  }
  return saida as T
}

export const normalizarAluno = (a: unknown) => preencher(alunoVazio(), a)
export const normalizarResponsavel = (r: unknown) => preencher(responsavelVazio(), r)
export const normalizarContato = (c: unknown) => preencher(contatoVazio(), c)

/** true se todos os campos (inclusive os de dentro) estão em branco. */
export function estaVazio(valor: unknown): boolean {
  if (valor == null) return true
  if (typeof valor === 'object') return Object.values(valor).every(estaVazio)
  return String(valor).trim() === ''
}

// ---------- Máscaras ----------

const digitos = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max)

export function mascaraCpf(v: string) {
  return digitos(v, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function mascaraCep(v: string) {
  const d = digitos(v, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function mascaraTelefone(v: string) {
  const d = digitos(v, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const corte = resto.length === 9 ? 5 : 4
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

// ---------- Datas ----------

export function formatarData(iso: string | null | undefined) {
  if (!iso) return '—'
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatarDataHora(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function idade(dataNascimento: string | null | undefined) {
  const m = dataNascimento ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento) : null
  if (!m) return null
  const hoje = new Date()
  let anos = hoje.getFullYear() - Number(m[1])
  const mes = hoje.getMonth() + 1 - Number(m[2])
  if (mes < 0 || (mes === 0 && hoje.getDate() < Number(m[3]))) anos--
  return anos
}

export function tempoDesde(iso: string | null | undefined) {
  if (!iso) return ''
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'agora mesmo'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

// ---------- Textos ----------

export function iniciais(nome: string | null | undefined) {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  return ((partes[0][0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

const ROTULOS: Record<string, string> = {
  aluno: 'Aluno',
  responsaveis: 'Responsáveis',
  contatosEmergencia: 'Contatos de emergência',
  endereco: 'endereço',
  nome: 'nome',
  dataNascimento: 'data de nascimento',
  cpf: 'CPF',
  observacoesSaude: 'observações de saúde',
  parentesco: 'parentesco',
  telefone: 'telefone',
  email: 'e-mail',
  cep: 'CEP',
  logradouro: 'logradouro',
  bairro: 'bairro',
  cidade: 'cidade',
  uf: 'UF',
}

/** "responsaveis[0].endereco.cep: não deve estar em branco" → "Responsável 1 › endereço › CEP: não deve estar em branco" */
export function formatarPendencia(p: string) {
  const i = p.indexOf(': ')
  if (i < 0) return p
  const caminho = p.slice(0, i)
  const mensagem = p.slice(i + 2)
  const partes = caminho.split('.').map((parte) => {
    const m = /^(\w+)\[(\d+)\]$/.exec(parte)
    if (m) {
      const n = Number(m[2]) + 1
      if (m[1] === 'responsaveis') return `Responsável ${n}`
      if (m[1] === 'contatosEmergencia') return `Contato ${n}`
    }
    return ROTULOS[parte] ?? parte
  })
  return `${partes.join(' › ')}: ${mensagem}`
}

/** Em qual etapa do formulário o campo da pendência fica. */
export function etapaDaPendencia(p: string): number | null {
  if (p.startsWith('aluno')) return 0
  if (p.startsWith('responsaveis')) return 1
  if (p.startsWith('contatosEmergencia')) return 2
  return null
}

/** Quantas das 3 etapas já têm algo preenchido. */
export function etapasPreenchidas(c: { aluno: unknown; responsaveis: unknown[]; contatosEmergencia: unknown[] }) {
  return (estaVazio(c.aluno) ? 0 : 1) + (c.responsaveis.length ? 1 : 0) + (c.contatosEmergencia.length ? 1 : 0)
}

export function baixarArquivo(arquivo: Blob, nome: string) {
  const url = URL.createObjectURL(arquivo)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
