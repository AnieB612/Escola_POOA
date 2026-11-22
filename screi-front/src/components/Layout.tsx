import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { Perfil } from '../api'
import { useAuth } from '../contexto'
import { PERFIL_ROTULO } from '../utils'
import { Avatar, Logo } from './ui'

const LINKS: Record<Perfil, { para: string; rotulo: string }[]> = {
  RESPONSAVEL: [{ para: '/cadastros', rotulo: 'Meus cadastros' }],
  FUNCIONARIO: [
    { para: '/triagem', rotulo: 'Fila de triagem' },
    { para: '/todos', rotulo: 'Todos os cadastros' },
    { para: '/exportacao', rotulo: 'Exportação' },
  ],
}

export default function Layout() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()

  if (!usuario) return <Navigate to="/entrar" replace />

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-dentro">
          <Link to="/" className="marca">
            <Logo />
            <span>
              SCREI
              <small>Cadastro escolar</small>
            </span>
          </Link>

          <nav className="menu">
            {LINKS[usuario.perfil].map((l) => (
              <NavLink key={l.para} to={l.para} className={({ isActive }) => (isActive ? 'menu-link ativo' : 'menu-link')}>
                {l.rotulo}
              </NavLink>
            ))}
          </nav>

          <div className="usuario">
            <Avatar nome={usuario.nome} />
            <div className="usuario-texto">
              <strong>{usuario.nome}</strong>
              <small>{PERFIL_ROTULO[usuario.perfil]}</small>
            </div>
            <button
              className="btn btn-fantasma btn-pequeno"
              onClick={() => {
                sair()
                navigate('/entrar')
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}

/** Só deixa entrar quem tem o perfil certo; os outros voltam para a tela inicial deles. */
export function SoPerfil({ perfil }: { perfil: Perfil }) {
  const { usuario } = useAuth()
  if (usuario?.perfil !== perfil) return <Navigate to="/" replace />
  return <Outlet />
}

export function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={usuario?.perfil === 'FUNCIONARIO' ? '/triagem' : '/cadastros'} replace />
}
