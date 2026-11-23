import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, comoApiError, type ApiError, type Cadastro } from '../api'
import ResumoCadastro from '../components/ResumoCadastro'
import { Aviso, Avatar, Cabecalho, Carregando, ErroApi, LinhaDoTempo, Modal, StatusBadge } from '../components/ui'
import { useAviso } from '../contexto'
import { estaNaFila, formatarDataHora, podeEditar, tempoDesde } from '../utils'

/**
 * Detalhe de um cadastro.
 * modo "responsavel": pode continuar/corrigir e excluir rascunho.
 * modo "triagem": funcionário pode aprovar ou reprovar.
 */
export default function CadastroDetalhe({ modo }: { modo: 'responsavel' | 'triagem' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const avisar = useAviso()

  const [cadastro, setCadastro] = useState<Cadastro | null>(null)
  const [erro, setErro] = useState<ApiError | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [modalReprovar, setModalReprovar] = useState(false)
  const [modalExcluir, setModalExcluir] = useState(false)
  const [justificativa, setJustificativa] = useState('')

  useEffect(() => {
    api.cadastros
      .buscar(Number(id))
      .then(setCadastro)
      .catch((e) => setErro(comoApiError(e)))
  }, [id])

  const fecharReprovar = useCallback(() => setModalReprovar(false), [])
  const fecharExcluir = useCallback(() => setModalExcluir(false), [])

  const voltar = modo === 'triagem' ? '/triagem' : '/cadastros'

  async function acao(fn: () => Promise<Cadastro>, mensagem: string) {
    setOcupado(true)
    setErro(null)
    try {
      setCadastro(await fn())
      avisar(mensagem)
      return true
    } catch (e) {
      setErro(comoApiError(e))
      return false
    } finally {
      setOcupado(false)
    }
  }

  async function reprovar() {
    if (!cadastro || !justificativa.trim()) return
    const ok = await acao(() => api.triagem.reprovar(cadastro.id, justificativa.trim()), 'Cadastro devolvido ao responsável.')
    if (ok) {
      setModalReprovar(false)
      setJustificativa('')
    }
  }

  async function excluir() {
    if (!cadastro) return
    setOcupado(true)
    try {
      await api.cadastros.excluir(cadastro.id)
      avisar('Rascunho excluído.')
      navigate('/cadastros')
    } catch (e) {
      setErro(comoApiError(e))
      setModalExcluir(false)
    } finally {
      setOcupado(false)
    }
  }

  if (!cadastro) {
    return (
      <div className="pagina estreita">
        {erro ? (
          <>
            <Cabecalho titulo="Cadastro" voltar={voltar} />
            <ErroApi erro={erro} />
          </>
        ) : (
          <Carregando />
        )}
      </div>
    )
  }

  const { status } = cadastro
  const responsavel = cadastro.responsaveis[0]

  const acoesResponsavel = modo === 'responsavel' && (
    <>
      {status === 'RASCUNHO' && (
        <button className="btn btn-perigo-leve" onClick={() => setModalExcluir(true)} disabled={ocupado}>
          Excluir rascunho
        </button>
      )}
      {podeEditar(status) && (
        <Link to={`/cadastros/${cadastro.id}/editar`} className="btn btn-primario">
          {status === 'COM_PENDENCIA' ? 'Corrigir cadastro' : 'Continuar preenchendo'}
        </Link>
      )}
    </>
  )

  const acoesTriagem = modo === 'triagem' && estaNaFila(status) && (
    <>
      <button className="btn btn-perigo-leve" onClick={() => setModalReprovar(true)} disabled={ocupado}>
        Devolver com pendência
      </button>
      <button
        className="btn btn-sucesso"
        disabled={ocupado}
        onClick={() => acao(() => api.triagem.aprovar(cadastro.id), 'Cadastro aprovado!')}
      >
        ✓ Aprovar
      </button>
    </>
  )

  return (
    <div className="pagina estreita">
      <Cabecalho
        voltar={voltar}
        titulo={cadastro.aluno?.nome || `Cadastro #${cadastro.id}`}
        subtitulo={
          <span className="linha-meta">
            <span>Cadastro #{cadastro.id}</span>
            <StatusBadge status={status} />
            {cadastro.dataEnvio && <span>Enviado {tempoDesde(cadastro.dataEnvio)}</span>}
          </span>
        }
        acoes={acoesResponsavel || acoesTriagem || undefined}
      />

      {erro && <ErroApi erro={erro} />}

      <section className="card">
        <LinhaDoTempo status={status} dataEnvio={cadastro.dataEnvio} />
      </section>

      {status === 'COM_PENDENCIA' && cadastro.justificativa && (
        <Aviso tipo="pendencia" titulo={modo === 'triagem' ? 'Pendência enviada ao responsável' : 'A secretaria pediu uma correção'}>
          {cadastro.justificativa}
        </Aviso>
      )}
      {status === 'APROVADO' && (
        <Aviso tipo="sucesso" titulo="Cadastro aprovado">
          {modo === 'responsavel' ? 'Está tudo certo! A secretaria aprovou o cadastro.' : 'Este cadastro já entra na exportação de aprovados.'}
        </Aviso>
      )}
      {estaNaFila(status) && modo === 'responsavel' && (
        <Aviso tipo="info" titulo="Aguardando a secretaria">
          Enviado em {formatarDataHora(cadastro.dataEnvio)}. Você será avisado aqui quando houver uma resposta.
        </Aviso>
      )}

      {modo === 'triagem' && (
        <section className="card solicitante">
          <Avatar nome={cadastro.usuario.nome} grande />
          <div>
            <small>Enviado por</small>
            <strong>{cadastro.usuario.nome}</strong>
            <span>{cadastro.usuario.email}</span>
          </div>
          {responsavel?.telefone && (
            <a className="btn btn-fantasma btn-pequeno" href={`tel:${responsavel.telefone.replace(/\D/g, '')}`}>
              Ligar para {responsavel.nome.split(' ')[0] || 'responsável'}
            </a>
          )}
        </section>
      )}

      <ResumoCadastro cadastro={cadastro} />

      <Modal
        aberto={modalReprovar}
        titulo="Devolver com pendência"
        onFechar={fecharReprovar}
        rodape={
          <>
            <button className="btn btn-fantasma" onClick={fecharReprovar}>Cancelar</button>
            <button className="btn btn-perigo" onClick={reprovar} disabled={ocupado || !justificativa.trim()}>
              {ocupado ? 'Enviando…' : 'Devolver ao responsável'}
            </button>
          </>
        }
      >
        <p>O cadastro volta para o responsável com status <strong>Com pendência</strong>. Explique o que precisa ser corrigido:</p>
        <textarea
          rows={4}
          autoFocus
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          placeholder="Ex.: O CPF do aluno está incompleto. Confira e envie novamente."
        />
        <div className="sugestoes">
          {['CPF do aluno inválido', 'Falta o endereço completo', 'Telefone do responsável não atende', 'Informe outro contato de emergência'].map((s) => (
            <button key={s} type="button" className="chip" onClick={() => setJustificativa(s)}>
              {s}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        aberto={modalExcluir}
        titulo="Excluir rascunho?"
        onFechar={fecharExcluir}
        rodape={
          <>
            <button className="btn btn-fantasma" onClick={fecharExcluir}>Cancelar</button>
            <button className="btn btn-perigo" onClick={excluir} disabled={ocupado}>Excluir</button>
          </>
        }
      >
        <p>Os dados preenchidos neste cadastro serão apagados. Essa ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
