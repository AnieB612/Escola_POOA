import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, comoApiError, type ApiError, type Cadastro } from '../api'
import { Avatar, Cabecalho, Carregando, ErroApi, StatusBadge, Vazio } from '../components/ui'
import { formatarDataHora, idade, tempoDesde } from '../utils'

export default function TriagemFila() {
  const [fila, setFila] = useState<Cadastro[] | null>(null)
  const [erro, setErro] = useState<ApiError | null>(null)

  useEffect(() => {
    api.triagem
      .listarFila()
      .then(setFila)
      .catch((e) => setErro(comoApiError(e)))
  }, [])

  const maisAntigo = fila?.[0]

  return (
    <div className="pagina">
      <Cabecalho
        titulo="Fila de triagem"
        subtitulo="Cadastros enviados pelas famílias, do mais antigo para o mais recente."
      />

      {erro && <ErroApi erro={erro} />}
      {!erro && !fila && <Carregando />}

      {fila && (
        <div className="indicadores">
          <div className="indicador">
            <small>Aguardando análise</small>
            <strong>{fila.length}</strong>
          </div>
          <div className="indicador">
            <small>Esperando há mais tempo</small>
            <strong>{maisAntigo ? tempoDesde(maisAntigo.dataEnvio).replace('há ', '') : '—'}</strong>
          </div>
          <div className="indicador indicador-destaque">
            <small>Dica</small>
            <span>Abra um cadastro para aprovar ou devolver com pendência.</span>
          </div>
        </div>
      )}

      {fila && fila.length === 0 && (
        <Vazio titulo="Fila vazia 🎉" texto="Nenhum cadastro aguardando análise no momento." />
      )}

      {fila && fila.length > 0 && (
        <ul className="fila">
          {fila.map((c, i) => {
            const anos = idade(c.aluno?.dataNascimento)
            const resp = c.responsaveis[0]
            return (
              <li key={c.id}>
                <Link to={`/triagem/${c.id}`} className="fila-item">
                  <span className="fila-pos">{i + 1}</span>
                  <Avatar nome={c.aluno?.nome} />
                  <span className="fila-principal">
                    <strong>{c.aluno?.nome || 'Aluno sem nome'}</strong>
                    <small>
                      {anos != null ? `${anos} anos · ` : ''}
                      {resp ? `${resp.parentesco || 'Responsável'}: ${resp.nome}` : 'Sem responsável'}
                    </small>
                  </span>
                  <span className="fila-data">
                    <strong>{tempoDesde(c.dataEnvio)}</strong>
                    <small>{formatarDataHora(c.dataEnvio)}</small>
                  </span>
                  <StatusBadge status={c.status} />
                  <span className="fila-seta" aria-hidden="true">›</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
