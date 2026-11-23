import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, comoApiError, type ApiError, type Cadastro, type StatusCadastro } from '../api'
import { Cabecalho, Carregando, ErroApi, StatusBadge, Vazio } from '../components/ui'
import { STATUS, STATUS_ORDEM, formatarData } from '../utils'

export default function TodosCadastros() {
  const navigate = useNavigate()
  const [cadastros, setCadastros] = useState<Cadastro[] | null>(null)
  const [erro, setErro] = useState<ApiError | null>(null)
  const [filtro, setFiltro] = useState<StatusCadastro | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    api.cadastros
      .listar()
      .then((lista) => setCadastros([...lista].sort((a, b) => b.id - a.id)))
      .catch((e) => setErro(comoApiError(e)))
  }, [])

  const contagem = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of STATUS_ORDEM) c[s] = 0
    for (const cad of cadastros ?? []) c[cad.status]++
    return c
  }, [cadastros])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (cadastros ?? []).filter((c) => {
      if (filtro && c.status !== filtro) return false
      if (!termo) return true
      const texto = [c.aluno?.nome, c.aluno?.cpf, c.usuario.nome, ...c.responsaveis.map((r) => r.nome)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return texto.includes(termo) || String(c.id) === termo.replace('#', '')
    })
  }, [cadastros, filtro, busca])

  return (
    <div className="pagina">
      <Cabecalho titulo="Todos os cadastros" subtitulo="Visão geral de todos os cadastros, em qualquer status." />

      {erro && <ErroApi erro={erro} />}
      {!erro && !cadastros && <Carregando />}

      {cadastros && (
        <>
          <div className="contadores">
            {STATUS_ORDEM.map((s) => (
              <button
                key={s}
                className={`contador st-${s}${filtro === s ? ' ativo' : ''}`}
                onClick={() => setFiltro(filtro === s ? null : s)}
                aria-pressed={filtro === s}
              >
                <strong>{contagem[s]}</strong>
                <span>{STATUS[s].rotulo}</span>
              </button>
            ))}
          </div>

          <div className="barra-filtros">
            <input
              type="search"
              className="busca"
              placeholder="Buscar por aluno, CPF, responsável ou nº…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {(filtro || busca) && (
              <button className="link" onClick={() => { setFiltro(null); setBusca('') }}>
                Limpar filtros
              </button>
            )}
            <span className="contagem-texto">{visiveis.length} de {cadastros.length}</span>
          </div>

          {visiveis.length === 0 ? (
            <Vazio titulo="Nada encontrado" texto="Nenhum cadastro corresponde aos filtros." />
          ) : (
            <div className="tabela-caixa">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Aluno</th>
                    <th>CPF</th>
                    <th>Responsável</th>
                    <th>Enviado em</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/triagem/${c.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate(`/triagem/${c.id}`)}>
                      <td className="mudo">#{c.id}</td>
                      <td><strong>{c.aluno?.nome || <span className="mudo">Sem nome</span>}</strong></td>
                      <td>{c.aluno?.cpf || <span className="mudo">—</span>}</td>
                      <td>{c.responsaveis[0]?.nome || c.usuario.nome}</td>
                      <td>{formatarData(c.dataEnvio)}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
