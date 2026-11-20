import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, comoApiError, type ApiError, type Perfil, type Usuario } from '../api'
import { Avatar, Campo, Carregando, ErroApi, Logo } from '../components/ui'
import { useAuth } from '../contexto'
import { PERFIL_ROTULO } from '../utils'

export default function Entrar() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()

  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [erroLista, setErroLista] = useState<ApiError | null>(null)
  const [criando, setCriando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erroForm, setErroForm] = useState<ApiError | null>(null)
  const [form, setForm] = useState<{ nome: string; email: string; perfil: Perfil }>({
    nome: '',
    email: '',
    perfil: 'RESPONSAVEL',
  })

  function carregar() {
    setErroLista(null)
    setUsuarios(null)
    api.usuarios
      .listar()
      .then((lista) => {
        setUsuarios(lista)
        if (lista.length === 0) setMostrarForm(true)
      })
      .catch((e) => setErroLista(comoApiError(e)))
  }

  useEffect(carregar, [])

  if (usuario) return <Navigate to="/" replace />

  function escolher(u: Usuario) {
    entrar(u)
    navigate('/')
  }

  async function criar(e: FormEvent) {
    e.preventDefault()
    setCriando(true)
    setErroForm(null)
    try {
      escolher(await api.usuarios.criar(form))
    } catch (err) {
      setErroForm(comoApiError(err))
    } finally {
      setCriando(false)
    }
  }

  const grupos: Perfil[] = ['RESPONSAVEL', 'FUNCIONARIO']

  return (
    <div className="entrar">
      <aside className="entrar-arte">
        <div className="entrar-marca">
          <Logo tamanho={44} />
          <span>SCREI</span>
        </div>
        <div className="entrar-chamada">
          <h1>Matrícula escolar sem papelada.</h1>
          <p>
            Famílias preenchem o cadastro do aluno no seu tempo, e a secretaria analisa,
            aprova e exporta tudo num só lugar.
          </p>
          <ul className="entrar-passos">
            <li><span>1</span>Responsável preenche os dados do aluno</li>
            <li><span>2</span>Secretaria faz a triagem</li>
            <li><span>3</span>Cadastro aprovado e pronto para exportar</li>
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
          <h2>Quem está acessando?</h2>
          <p className="subtitulo">Escolha seu usuário para continuar. Ambiente de demonstração, sem senha.</p>

          {erroLista && (
            <>
              <ErroApi erro={erroLista} />
              <button className="btn btn-secundario" onClick={carregar}>Tentar de novo</button>
            </>
          )}

          {!erroLista && !usuarios && <Carregando />}

          {usuarios && usuarios.length > 0 && (
            <div className="lista-usuarios">
              {grupos.map((g) => {
                const doGrupo = usuarios.filter((u) => u.perfil === g)
                if (!doGrupo.length) return null
                return (
                  <div key={g}>
                    <h4 className="grupo-titulo">{g === 'RESPONSAVEL' ? 'Responsáveis' : 'Secretaria'}</h4>
                    {doGrupo.map((u) => (
                      <button key={u.id} className="usuario-opcao" onClick={() => escolher(u)}>
                        <Avatar nome={u.nome} />
                        <span className="usuario-opcao-texto">
                          <strong>{u.nome}</strong>
                          <small>{u.email}</small>
                        </span>
                        <span className={`tag tag-${u.perfil}`}>{PERFIL_ROTULO[u.perfil]}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}

          {usuarios && !mostrarForm && (
            <button className="btn btn-secundario largo" onClick={() => setMostrarForm(true)}>
              + Criar novo usuário
            </button>
          )}

          {usuarios && mostrarForm && (
            <form className="card form-usuario" onSubmit={criar}>
              <h3>Novo usuário</h3>
              {erroForm && <ErroApi erro={erroForm} />}
              <div className="grade grade-1">
                <Campo rotulo="Nome" obrigatorio>
                  <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required autoFocus />
                </Campo>
                <Campo rotulo="E-mail" obrigatorio>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </Campo>
                <div className="campo">
                  <span className="campo-rotulo">Perfil</span>
                  <div className="segmentado" role="radiogroup">
                    {grupos.map((p) => (
                      <button
                        type="button"
                        key={p}
                        role="radio"
                        aria-checked={form.perfil === p}
                        className={form.perfil === p ? 'ativo' : ''}
                        onClick={() => setForm({ ...form, perfil: p })}
                      >
                        <strong>{PERFIL_ROTULO[p]}</strong>
                        <small>{p === 'RESPONSAVEL' ? 'Preenche cadastros' : 'Analisa e aprova'}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="acoes">
                {usuarios.length > 0 && (
                  <button type="button" className="btn btn-fantasma" onClick={() => setMostrarForm(false)}>
                    Cancelar
                  </button>
                )}
                <button className="btn btn-primario" disabled={criando}>
                  {criando ? 'Criando…' : 'Criar e entrar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
