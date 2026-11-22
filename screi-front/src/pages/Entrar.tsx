import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  api, ApiError, comoApiError, guardarCredenciais, limparCredenciais,
  type Perfil, type Usuario,
} from '../api'
import { Campo, ErroApi, Logo } from '../components/ui'
import { useAuth } from '../contexto'
import { PERFIL_ROTULO } from '../utils'

const CHAVE_IDS = 'screi.usuarioIds'
const CHAVE_NOMES = 'screi.usuarioNomes'
const PERFIS: Perfil[] = ['RESPONSAVEL', 'FUNCIONARIO']

function chaveEmail(email: string) {
  return email.trim().toLowerCase()
}

function lerMapa<T>(chave: string): Record<string, T> {
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(chave) ?? '{}')
    return salvo && typeof salvo === 'object' && !Array.isArray(salvo)
      ? (salvo as Record<string, T>)
      : {}
  } catch {
    return {}
  }
}

function salvarUsuarioCriado(usuario: Usuario) {
  const email = chaveEmail(usuario.email)
  try {
    localStorage.setItem(CHAVE_IDS, JSON.stringify({ ...lerMapa<number>(CHAVE_IDS), [email]: usuario.id }))
    localStorage.setItem(CHAVE_NOMES, JSON.stringify({ ...lerMapa<string>(CHAVE_NOMES), [email]: usuario.nome }))
  } catch {
    throw new ApiError(0, 'Não foi possível guardar os dados da conta neste navegador. Verifique as configurações de armazenamento.')
  }
}

export default function Entrar() {
  const { usuario, entrar } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const criandoConta = pathname === '/criar-conta'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [form, setForm] = useState<{ nome: string; email: string; senha: string; perfil: Perfil }>({
    nome: '',
    email: '',
    senha: '',
    perfil: 'RESPONSAVEL',
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<ApiError | null>(null)

  if (usuario) return <Navigate to="/" replace />

  async function identificar(emailUsuario: string): Promise<Usuario> {
    let funcionarios: Usuario[] | null = null
    try {
      funcionarios = await api.usuarios.listar()
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 403) throw e
    }

    if (funcionarios) {
      const funcionario = funcionarios.find((u) => chaveEmail(u.email) === chaveEmail(emailUsuario))
      if (!funcionario) {
        throw new ApiError(404, 'Não foi possível localizar este usuário na lista da secretaria.')
      }
      return funcionario
    }

    const emailChave = chaveEmail(emailUsuario)
    const ids = lerMapa<number>(CHAVE_IDS)
    const nomes = lerMapa<string>(CHAVE_NOMES)
    let id = ids[emailChave]
    let nome = nomes[emailChave]

    if (!id || !nome) {
      const cadastros = await api.cadastros.listar()
      const cadastroUsuario = cadastros.find(
        (cadastro) => chaveEmail(cadastro.usuario.email) === emailChave,
      )?.usuario
      if (cadastroUsuario) {
        id = id || cadastroUsuario.id
        nome = nome || cadastroUsuario.nome
      }
    }

    if (!id) {
      throw new ApiError(
        0,
        'Não foi possível identificar o ID desta conta responsável. Crie a conta por esta tela ou use uma conta que já tenha um cadastro.',
      )
    }
    if (!nome) {
      throw new ApiError(0, 'Não foi possível identificar o nome desta conta. Entre em contato com a secretaria.')
    }
    return { id, nome, email: emailUsuario, perfil: 'RESPONSAVEL' }
  }

  async function autenticar(emailUsuario: string, senhaUsuario: string) {
    guardarCredenciais(emailUsuario, senhaUsuario)
    const usuarioAutenticado = await identificar(emailUsuario)
    entrar(usuarioAutenticado)
    navigate('/')
  }

  async function fazerLogin(evento: FormEvent) {
    evento.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      await autenticar(email.trim(), senha)
    } catch (e) {
      limparCredenciais()
      const erroApi = comoApiError(e)
      setErro(erroApi.status === 401
        ? new ApiError(401, 'E-mail ou senha incorretos')
        : erroApi)
    } finally {
      setCarregando(false)
    }
  }

  async function criarConta(evento: FormEvent) {
    evento.preventDefault()
    setCarregando(true)
    setErro(null)
    try {
      const criada = await api.usuarios.criar(form)
      salvarUsuarioCriado(criada)
      setEmail(form.email)
      setSenha(form.senha)
      await autenticar(form.email, form.senha)
    } catch (e) {
      limparCredenciais()
      const erroApi = comoApiError(e)
      setErro(erroApi.status === 401
        ? new ApiError(401, 'E-mail ou senha incorretos')
        : erroApi)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="entrar">
      <aside className="entrar-arte">
        <div className="entrar-marca">
          <Logo tamanho={44} />
          <span>SCREI</span>
        </div>
        <div className="entrar-chamada">
          <h1>Um espaço pensado para você.</h1>
          <p>
            Acreditamos que uma boa experiência começa com simplicidade, clareza e atenção
            aos detalhes.
          </p>
          <ul className="entrar-passos">
            <li><span>1</span>Simplicidade em cada detalhe</li>
            <li><span>2</span>Clareza para seguir no seu ritmo</li>
            <li><span>3</span>Uma experiência leve e acolhedora</li>
          </ul>
        </div>
        <svg className="entrar-formas" viewBox="0 0 400 300" aria-hidden="true">
          <circle cx="330" cy="70" r="90" fill="rgba(255,255,255,.07)" />
          <circle cx="60" cy="260" r="120" fill="rgba(255,255,255,.05)" />
          <circle cx="372" cy="22" r="22" fill="var(--accent)" opacity=".85" />
        </svg>
      </aside>

      <section className="entrar-painel">
        <div className="entrar-caixa">
          <h2>{criandoConta ? 'Criar conta' : 'Entrar no SCREI'}</h2>
          <p className="subtitulo">
            {criandoConta ? 'Crie seu acesso para começar a usar o SCREI.' : 'Acesse com o e-mail e a senha da sua conta.'}
          </p>
          {erro && <ErroApi erro={erro} />}

          {criandoConta ? (
            <form className="card form-usuario" onSubmit={criarConta}>
              <div className="grade grade-1">
                <Campo rotulo="Nome" obrigatorio>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    autoComplete="name"
                    required
                  />
                </Campo>
                <Campo rotulo="E-mail" obrigatorio>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </Campo>
                <Campo rotulo="Senha" obrigatorio dica="Use pelo menos 6 caracteres.">
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </Campo>
                <div className="campo">
                  <span className="campo-rotulo">Perfil</span>
                  <div className="segmentado" role="radiogroup" aria-label="Perfil da conta">
                    {PERFIS.map((perfil) => (
                      <button
                        type="button"
                        key={perfil}
                        role="radio"
                        aria-checked={form.perfil === perfil}
                        className={form.perfil === perfil ? 'ativo' : ''}
                        onClick={() => setForm({ ...form, perfil })}
                      >
                        <strong>{PERFIL_ROTULO[perfil]}</strong>
                        <small>{perfil === 'RESPONSAVEL' ? 'Preenche cadastros' : 'Analisa e aprova'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="acoes">
                <button className="btn btn-primario" disabled={carregando}>
                  {carregando ? 'Criando…' : 'Criar e entrar'}
                </button>
              </div>
            </form>
          ) : (
            <form className="card" onSubmit={fazerLogin}>
              <div className="grade grade-1">
                <Campo rotulo="E-mail" obrigatorio>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Campo>
                <Campo rotulo="Senha" obrigatorio>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </Campo>
              </div>
              <div className="acoes">
                <button className="btn btn-primario" disabled={carregando}>
                  {carregando ? 'Entrando…' : 'Entrar'}
                </button>
              </div>
            </form>
          )}

          <Link
            to={criandoConta ? '/entrar' : '/criar-conta'}
            className="btn btn-secundario largo"
            onClick={() => setErro(null)}
          >
            {criandoConta ? 'Já tem uma conta? Entrar' : 'Criar nova conta'}
          </Link>
        </div>
      </section>
    </div>
  )
}
