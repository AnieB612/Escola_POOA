import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Usuario } from './api'

// ---------- Usuário logado (sem senha: só escolhe quem está usando) ----------

const CHAVE = 'screi.usuario'

interface AuthCtx {
  usuario: Usuario | null
  entrar: (u: Usuario) => void
  sair: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

function lerSalvo(): Usuario | null {
  try {
    const s = localStorage.getItem(CHAVE)
    return s ? (JSON.parse(s) as Usuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerSalvo)

  const entrar = useCallback((u: Usuario) => {
    setUsuario(u)
    try { localStorage.setItem(CHAVE, JSON.stringify(u)) } catch { /* navegador sem storage */ }
  }, [])

  const sair = useCallback(() => {
    setUsuario(null)
    try { localStorage.removeItem(CHAVE) } catch { /* navegador sem storage */ }
  }, [])

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}

// ---------- Avisos rápidos (toast) ----------

type TipoAviso = 'sucesso' | 'erro' | 'info'
interface Aviso { id: number; texto: string; tipo: TipoAviso }

const AvisoContext = createContext<((texto: string, tipo?: TipoAviso) => void) | null>(null)

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const avisar = useCallback((texto: string, tipo: TipoAviso = 'sucesso') => {
    const id = Date.now() + Math.random()
    setAvisos((a) => [...a, { id, texto, tipo }])
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3800)
  }, [])

  return (
    <AvisoContext.Provider value={avisar}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast-${a.tipo}`}>
            <span className="toast-icone">{a.tipo === 'sucesso' ? '✓' : a.tipo === 'erro' ? '!' : 'i'}</span>
            {a.texto}
          </div>
        ))}
      </div>
    </AvisoContext.Provider>
  )
}

export function useAviso() {
  const ctx = useContext(AvisoContext)
  if (!ctx) throw new Error('useAviso fora do AvisoProvider')
  return ctx
}
