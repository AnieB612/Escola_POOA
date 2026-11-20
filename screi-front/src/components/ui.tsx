import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ApiError, StatusCadastro } from '../api'
import { STATUS, formatarDataHora, formatarPendencia, iniciais } from '../utils'

export function Logo({ tamanho = 34 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--primary)" />
      <path d="M10 14c3.5-1.6 7-1.4 10 1v13c-3-2.4-6.5-2.6-10-1z" fill="#fff" />
      <path d="M30 14c-3.5-1.6-7-1.4-10 1v13c3-2.4 6.5-2.6 10-1z" fill="var(--accent)" />
      <circle cx="20" cy="9.2" r="2.4" fill="#fff" />
    </svg>
  )
}

export function StatusBadge({ status }: { status: StatusCadastro }) {
  return (
    <span className={`badge st-${status}`}>
      <i aria-hidden="true" />
      {STATUS[status].rotulo}
    </span>
  )
}

const TONS = ['t1', 't2', 't3', 't4', 't5']

export function Avatar({ nome, grande }: { nome: string | null | undefined; grande?: boolean }) {
  const texto = nome ?? ''
  let soma = 0
  for (const ch of texto) soma += ch.charCodeAt(0)
  return (
    <span className={`avatar ${TONS[soma % TONS.length]}${grande ? ' avatar-lg' : ''}`} aria-hidden="true">
      {iniciais(texto)}
    </span>
  )
}

export function Campo(props: {
  rotulo: string
  children: ReactNode
  dica?: string
  obrigatorio?: boolean
  largura?: 1 | 2 | 3 | 4
}) {
  return (
    <label className={`campo span-${props.largura ?? 1}`}>
      <span className="campo-rotulo">
        {props.rotulo}
        {props.obrigatorio && <em className="obrigatorio"> *</em>}
      </span>
      {props.children}
      {props.dica && <span className="campo-dica">{props.dica}</span>}
    </label>
  )
}

export function Aviso(props: {
  tipo: 'info' | 'pendencia' | 'sucesso' | 'erro'
  titulo: string
  children?: ReactNode
}) {
  const icone = { info: 'i', pendencia: '!', sucesso: '✓', erro: '×' }[props.tipo]
  return (
    <div className={`aviso aviso-${props.tipo}`} role={props.tipo === 'erro' ? 'alert' : undefined}>
      <span className="aviso-icone" aria-hidden="true">{icone}</span>
      <div>
        <strong>{props.titulo}</strong>
        {props.children && <div className="aviso-corpo">{props.children}</div>}
      </div>
    </div>
  )
}

export function ErroApi({ erro, onCorrigir }: { erro: ApiError; onCorrigir?: (pendencia: string) => void }) {
  return (
    <Aviso tipo="erro" titulo={erro.message}>
      {erro.pendencias.length > 0 && (
        <ul className="pendencias">
          {erro.pendencias.map((p) => (
            <li key={p}>
              <span>{formatarPendencia(p)}</span>
              {onCorrigir && (
                <button type="button" className="link" onClick={() => onCorrigir(p)}>
                  Corrigir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Aviso>
  )
}

export function Cabecalho(props: { titulo: string; subtitulo?: ReactNode; voltar?: string; acoes?: ReactNode }) {
  return (
    <div className="cabecalho">
      <div>
        {props.voltar && (
          <Link to={props.voltar} className="voltar">
            ← Voltar
          </Link>
        )}
        <h1>{props.titulo}</h1>
        {props.subtitulo && <p className="subtitulo">{props.subtitulo}</p>}
      </div>
      {props.acoes && <div className="cabecalho-acoes">{props.acoes}</div>}
    </div>
  )
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="carregando">
      <span className="spinner" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function Vazio(props: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="vazio">
      <svg width="120" height="96" viewBox="0 0 120 96" aria-hidden="true">
        <rect x="18" y="14" width="70" height="78" rx="10" fill="var(--primary-soft)" />
        <rect x="32" y="6" width="70" height="78" rx="10" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
        <rect x="44" y="22" width="34" height="6" rx="3" fill="var(--primary)" opacity=".5" />
        <rect x="44" y="36" width="46" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="44" y="48" width="40" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="44" y="60" width="28" height="5" rx="2.5" fill="var(--border-strong)" />
        <circle cx="96" cy="70" r="13" fill="var(--accent)" />
        <path d="M90 70h12M96 64v12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h3>{props.titulo}</h3>
      {props.texto && <p>{props.texto}</p>}
      {props.acao}
    </div>
  )
}

export function Modal(props: {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
  rodape?: ReactNode
}) {
  const { aberto, onFechar } = props
  useEffect(() => {
    if (!aberto) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aberto, onFechar])

  if (!aberto) return null
  return (
    <div className="modal-fundo" onMouseDown={onFechar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={props.titulo} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-topo">
          <h2>{props.titulo}</h2>
          <button className="icone-btn" onClick={onFechar} aria-label="Fechar">×</button>
        </div>
        <div className="modal-corpo">{props.children}</div>
        {props.rodape && <div className="modal-rodape">{props.rodape}</div>}
      </div>
    </div>
  )
}

/** Linha do tempo: Rascunho → Enviado → Em análise / Com pendência → Aprovado */
export function LinhaDoTempo({ status, dataEnvio }: { status: StatusCadastro; dataEnvio: string | null }) {
  const passos: StatusCadastro[] =
    status === 'COM_PENDENCIA'
      ? ['RASCUNHO', 'ENVIADO', 'COM_PENDENCIA', 'APROVADO']
      : ['RASCUNHO', 'ENVIADO', 'EM_ANALISE', 'APROVADO']
  const atual = passos.indexOf(status)
  return (
    <ol className="linha-tempo">
      {passos.map((p, i) => {
        const estado = status === 'APROVADO' || i < atual ? 'feito' : i === atual ? 'atual' : 'futuro'
        return (
          <li key={p} className={`passo ${estado} st-${p}`}>
            <span className="passo-marca">{estado === 'feito' ? '✓' : i + 1}</span>
            <span className="passo-texto">
              <strong>{STATUS[p].rotulo}</strong>
              <small>
                {p === 'ENVIADO' && dataEnvio && estado !== 'futuro' ? formatarDataHora(dataEnvio) : STATUS[p].descricao}
              </small>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
