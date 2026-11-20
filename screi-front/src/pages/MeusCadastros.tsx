import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, comoApiError, type ApiError, type Cadastro } from '../api'
import { Cabecalho, Carregando, ErroApi, StatusBadge, Vazio } from '../components/ui'
import { useAuth } from '../contexto'
import { STATUS, etapasPreenchidas, formatarDataHora, podeEditar } from '../utils'

export default function MeusCadastros() {
  const { usuario } = useAuth()
  const [cadastros, setCadastros] = useState<Cadastro[] | null>(null)
  const [erro, setErro] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!usuario) return
    api.cadastros
      .listar(usuario.id)
      .then((lista) => setCadastros([...lista].sort((a, b) => b.id - a.id)))
      .catch((e) => setErro(comoApiError(e)))
  }, [usuario])

  const novo = (
    <Link to="/cadastros/novo" className="btn btn-primario">
      + Novo cadastro
    </Link>
  )

  const pendentes = cadastros?.filter((c) => c.status === 'COM_PENDENCIA').length ?? 0

  return (
    <div className="pagina">
      <Cabecalho
        titulo={`Olá, ${usuario?.nome.split(' ')[0]}!`}
        subtitulo="Aqui ficam os cadastros dos alunos pelos quais você é responsável."
        acoes={cadastros && cadastros.length > 0 ? novo : undefined}
      />

      {erro && <ErroApi erro={erro} />}
      {!erro && !cadastros && <Carregando />}

      {pendentes > 0 && (
        <div className="faixa faixa-pendencia">
          <strong>{pendentes === 1 ? '1 cadastro precisa' : `${pendentes} cadastros precisam`} de correção.</strong> A
          secretaria deixou uma mensagem explicando o que ajustar.
        </div>
      )}

      {cadastros && cadastros.length === 0 && (
        <Vazio
          titulo="Nenhum cadastro ainda"
          texto="Comece o cadastro do aluno. Você pode salvar e continuar depois, no seu tempo."
          acao={novo}
        />
      )}

      {cadastros && cadastros.length > 0 && (
        <div className="cartoes">
          {cadastros.map((c) => {
            const feitas = etapasPreenchidas(c)
            const editavel = podeEditar(c.status)
            return (
              <article key={c.id} className={`cartao-cadastro st-borda-${c.status}`}>
                <div className="cartao-topo">
                  <span className="cartao-id">#{c.id}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3>{c.aluno?.nome || 'Aluno sem nome'}</h3>
                <p className="cartao-desc">
                  {c.dataEnvio ? `Enviado em ${formatarDataHora(c.dataEnvio)}` : STATUS[c.status].descricao}
                </p>

                {c.status === 'COM_PENDENCIA' && c.justificativa && (
                  <p className="cartao-justificativa">“{c.justificativa}”</p>
                )}

                {c.status === 'RASCUNHO' && (
                  <div className="progresso" aria-label={`${feitas} de 3 etapas preenchidas`}>
                    <div className="progresso-barra">
                      <span style={{ width: `${(feitas / 3) * 100}%` }} />
                    </div>
                    <small>{feitas} de 3 etapas</small>
                  </div>
                )}

                <div className="cartao-acoes">
                  <Link to={`/cadastros/${c.id}`} className="btn btn-fantasma btn-pequeno">
                    Ver detalhes
                  </Link>
                  {editavel && (
                    <Link to={`/cadastros/${c.id}/editar`} className="btn btn-primario btn-pequeno">
                      {c.status === 'COM_PENDENCIA' ? 'Corrigir' : 'Continuar'}
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
