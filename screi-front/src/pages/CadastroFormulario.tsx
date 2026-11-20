import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  api, comoApiError,
  type ApiError, type Aluno, type Cadastro, type ContatoEmergencia, type EtapaCorpo, type Responsavel,
} from '../api'
import CamposEndereco from '../components/CamposEndereco'
import ResumoCadastro from '../components/ResumoCadastro'
import { Aviso, Cabecalho, Campo, Carregando, ErroApi } from '../components/ui'
import { useAuth, useAviso } from '../contexto'
import {
  PARENTESCOS, alunoVazio, contatoVazio, estaVazio, etapaDaPendencia, mascaraCpf, mascaraTelefone,
  normalizarAluno, normalizarContato, normalizarResponsavel, podeEditar, responsavelVazio,
} from '../utils'

const ETAPAS = [
  { titulo: 'Aluno', desc: 'Dados e endereço' },
  { titulo: 'Responsáveis', desc: 'Quem responde pelo aluno' },
  { titulo: 'Emergência', desc: 'Quem chamar' },
  { titulo: 'Revisão', desc: 'Conferir e enviar' },
]

/** Formulário em etapas: cria (rota /novo) ou continua (rota /:id/editar) um cadastro. */
export default function CadastroFormulario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { usuario } = useAuth()
  const avisar = useAviso()

  const etapa = Math.min(Math.max(Number(params.get('etapa')) || 0, 0), ETAPAS.length - 1)

  const [cadastro, setCadastro] = useState<Cadastro | null>(null)
  const [aluno, setAluno] = useState<Aluno>(alunoVazio)
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(() => [responsavelVazio()])
  const [contatos, setContatos] = useState<ContatoEmergencia[]>(() => [contatoVazio()])
  const [carregando, setCarregando] = useState(Boolean(id))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!id) return
    let ativo = true
    setCarregando(true)
    api.cadastros
      .buscar(Number(id))
      .then((c) => {
        if (!ativo) return
        if (!podeEditar(c.status)) {
          navigate(`/cadastros/${c.id}`, { replace: true })
          return
        }
        setCadastro(c)
        setAluno(normalizarAluno(c.aluno))
        const resp = c.responsaveis.filter(Boolean).map(normalizarResponsavel)
        const cont = c.contatosEmergencia.filter(Boolean).map(normalizarContato)
        setResponsaveis(resp.length ? resp : [responsavelVazio()])
        setContatos(cont.length ? cont : [contatoVazio()])
      })
      .catch((e) => ativo && setErro(comoApiError(e)))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [id, navigate])

  function corpoDaEtapa(n: number): EtapaCorpo | null {
    if (n === 0) return { aluno }
    if (n === 1) return { responsaveis: responsaveis.filter((r) => !estaVazio(r)) }
    if (n === 2) return { contatosEmergencia: contatos.filter((c) => !estaVazio(c)) }
    return null
  }

  /** Grava a etapa atual na API. Na primeira vez, cria o cadastro. */
  async function salvar(): Promise<Cadastro | null> {
    const corpo = corpoDaEtapa(etapa)
    if (!corpo) return cadastro
    if (!usuario) return null
    setSalvando(true)
    setErro(null)
    try {
      const salvo = cadastro
        ? await api.cadastros.salvarEtapa(cadastro.id, corpo)
        : await api.cadastros.criar({ usuarioId: usuario.id, ...corpo })
      setCadastro(salvo)
      return salvo
    } catch (e) {
      setErro(comoApiError(e))
      return null
    } finally {
      setSalvando(false)
    }
  }

  async function irPara(n: number) {
    if (n === etapa) return
    const salvo = await salvar()
    if (!salvo) return
    if (!id) navigate(`/cadastros/${salvo.id}/editar?etapa=${n}`, { replace: true })
    else setParams({ etapa: String(n) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function salvarESair() {
    const salvo = await salvar()
    if (!salvo) return
    avisar('Rascunho salvo. Você pode continuar quando quiser.')
    navigate('/cadastros')
  }

  async function enviar() {
    if (!cadastro) return
    setSalvando(true)
    setErro(null)
    try {
      await api.cadastros.enviar(cadastro.id)
      avisar('Cadastro enviado para a secretaria!')
      navigate(`/cadastros/${cadastro.id}`)
    } catch (e) {
      setErro(comoApiError(e))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <div className="pagina estreita"><Carregando /></div>

  if (id && !cadastro && erro) {
    return (
      <div className="pagina estreita">
        <Cabecalho titulo="Cadastro" voltar="/cadastros" />
        <ErroApi erro={erro} />
      </div>
    )
  }

  const mudarAluno = (campo: keyof Aluno) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAluno({ ...aluno, [campo]: e.target.value })

  // ✓ só nas etapas que já têm dados salvos
  const etapaFeita = [
    Boolean(cadastro && !estaVazio(cadastro.aluno)),
    Boolean(cadastro?.responsaveis.length),
    Boolean(cadastro?.contatosEmergencia.length),
    false,
  ]

  const mudarResp = (i: number, r: Responsavel) => setResponsaveis(responsaveis.map((x, j) => (j === i ? r : x)))
  const mudarContato = (i: number, c: ContatoEmergencia) => setContatos(contatos.map((x, j) => (j === i ? c : x)))

  return (
    <div className="pagina estreita">
      <Cabecalho
        titulo={cadastro ? `Cadastro #${cadastro.id}` : 'Novo cadastro'}
        subtitulo={
          cadastro?.status === 'COM_PENDENCIA'
            ? 'Faça as correções pedidas e envie de novo.'
            : 'Preencha no seu ritmo: cada etapa é salva quando você avança.'
        }
        voltar="/cadastros"
      />

      {cadastro?.status === 'COM_PENDENCIA' && cadastro.justificativa && (
        <Aviso tipo="pendencia" titulo="A secretaria pediu uma correção">
          {cadastro.justificativa}
        </Aviso>
      )}

      <ol className="etapas">
        {ETAPAS.map((e, i) => (
          <li key={e.titulo} className={i === etapa ? 'atual' : etapaFeita[i] ? 'feita' : ''}>
            <button type="button" onClick={() => irPara(i)} disabled={salvando}>
              <span className="etapa-num">{i !== etapa && etapaFeita[i] ? '✓' : i + 1}</span>
              <span className="etapa-texto">
                <strong>{e.titulo}</strong>
                <small>{e.desc}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {erro && (
        <ErroApi
          erro={erro}
          onCorrigir={(p) => {
            const n = etapaDaPendencia(p)
            if (n != null) irPara(n)
          }}
        />
      )}

      {etapa === 0 && (
        <section className="card">
          <h2 className="card-titulo">Dados do aluno</h2>
          <div className="grade">
            <Campo rotulo="Nome completo" obrigatorio largura={4}>
              <input value={aluno.nome} onChange={mudarAluno('nome')} placeholder="Nome do aluno" autoFocus />
            </Campo>
            <Campo rotulo="Data de nascimento" obrigatorio largura={2}>
              <input type="date" value={aluno.dataNascimento} onChange={mudarAluno('dataNascimento')} />
            </Campo>
            <Campo rotulo="CPF do aluno" obrigatorio largura={2}>
              <input
                value={aluno.cpf}
                inputMode="numeric"
                placeholder="000.000.000-00"
                onChange={(e) => setAluno({ ...aluno, cpf: mascaraCpf(e.target.value) })}
              />
            </Campo>
            <Campo rotulo="Observações de saúde" largura={4} dica="Alergias, medicamentos, restrições alimentares, necessidades especiais…">
              <textarea rows={3} value={aluno.observacoesSaude} onChange={mudarAluno('observacoesSaude')} />
            </Campo>
          </div>

          <h3 className="sub-titulo">Endereço do aluno</h3>
          <CamposEndereco valor={aluno.endereco} onMudar={(endereco) => setAluno({ ...aluno, endereco })} />
        </section>
      )}

      {etapa === 1 && (
        <>
          {responsaveis.map((r, i) => (
            <section className="card" key={i}>
              <div className="card-topo">
                <h2 className="card-titulo">Responsável {i + 1}</h2>
                {responsaveis.length > 1 && (
                  <button type="button" className="btn btn-perigo-leve btn-pequeno" onClick={() => setResponsaveis(responsaveis.filter((_, j) => j !== i))}>
                    Remover
                  </button>
                )}
              </div>
              <div className="grade">
                <Campo rotulo="Nome completo" obrigatorio largura={2}>
                  <input value={r.nome} onChange={(e) => mudarResp(i, { ...r, nome: e.target.value })} />
                </Campo>
                <Campo rotulo="Parentesco" obrigatorio>
                  <input list="parentescos" value={r.parentesco} onChange={(e) => mudarResp(i, { ...r, parentesco: e.target.value })} />
                </Campo>
                <Campo rotulo="CPF" obrigatorio>
                  <input value={r.cpf} inputMode="numeric" placeholder="000.000.000-00" onChange={(e) => mudarResp(i, { ...r, cpf: mascaraCpf(e.target.value) })} />
                </Campo>
                <Campo rotulo="Telefone" obrigatorio largura={2}>
                  <input value={r.telefone} inputMode="tel" placeholder="(00) 00000-0000" onChange={(e) => mudarResp(i, { ...r, telefone: mascaraTelefone(e.target.value) })} />
                </Campo>
                <Campo rotulo="E-mail" largura={2}>
                  <input type="email" value={r.email} onChange={(e) => mudarResp(i, { ...r, email: e.target.value })} />
                </Campo>
              </div>

              <div className="sub-titulo-linha">
                <h3 className="sub-titulo">Endereço</h3>
                {!estaVazio(aluno.endereco) && (
                  <button type="button" className="link" onClick={() => mudarResp(i, { ...r, endereco: { ...aluno.endereco } })}>
                    Usar o mesmo endereço do aluno
                  </button>
                )}
              </div>
              <CamposEndereco valor={r.endereco} onMudar={(endereco) => mudarResp(i, { ...r, endereco })} />
            </section>
          ))}
          <button type="button" className="btn btn-tracejado" onClick={() => setResponsaveis([...responsaveis, responsavelVazio()])}>
            + Adicionar outro responsável
          </button>
        </>
      )}

      {etapa === 2 && (
        <section className="card">
          <h2 className="card-titulo">Contatos de emergência</h2>
          <p className="card-desc">Pessoas que a escola pode chamar se não conseguir falar com os responsáveis.</p>
          <div className="lista-contatos">
            {contatos.map((c, i) => (
              <div className="linha-contato" key={i}>
                <span className="linha-num">{i + 1}</span>
                <div className="grade">
                  <Campo rotulo="Nome" obrigatorio largura={2}>
                    <input value={c.nome} onChange={(e) => mudarContato(i, { ...c, nome: e.target.value })} />
                  </Campo>
                  <Campo rotulo="Telefone" obrigatorio>
                    <input value={c.telefone} inputMode="tel" placeholder="(00) 00000-0000" onChange={(e) => mudarContato(i, { ...c, telefone: mascaraTelefone(e.target.value) })} />
                  </Campo>
                  <Campo rotulo="Parentesco" obrigatorio>
                    <input list="parentescos" value={c.parentesco} onChange={(e) => mudarContato(i, { ...c, parentesco: e.target.value })} />
                  </Campo>
                </div>
                {contatos.length > 1 && (
                  <button type="button" className="icone-btn" aria-label={`Remover contato ${i + 1}`} onClick={() => setContatos(contatos.filter((_, j) => j !== i))}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-tracejado" onClick={() => setContatos([...contatos, contatoVazio()])}>
            + Adicionar contato
          </button>
        </section>
      )}

      {etapa === 3 &&
        (cadastro ? (
          <>
            <Aviso tipo="info" titulo="Confira tudo antes de enviar">
              Depois de enviado, o cadastro vai para a secretaria e não pode mais ser alterado, a não ser que
              ela devolva pedindo correção.
            </Aviso>
            <ResumoCadastro cadastro={cadastro} />
          </>
        ) : (
          <Aviso tipo="info" titulo="Nada para revisar ainda">
            Preencha as etapas anteriores primeiro.
          </Aviso>
        ))}

      <datalist id="parentescos">
        {PARENTESCOS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      <div className="barra-acoes">
        <button type="button" className="btn btn-fantasma" disabled={salvando || etapa === 0} onClick={() => irPara(etapa - 1)}>
          ← Voltar
        </button>
        <div className="barra-acoes-dir">
          {etapa < 3 && (
            <button type="button" className="btn btn-secundario" disabled={salvando} onClick={salvarESair}>
              Salvar e sair
            </button>
          )}
          {etapa < 3 ? (
            <button type="button" className="btn btn-primario" disabled={salvando} onClick={() => irPara(etapa + 1)}>
              {salvando ? 'Salvando…' : 'Salvar e continuar →'}
            </button>
          ) : (
            <button type="button" className="btn btn-destaque" disabled={salvando || !cadastro} onClick={enviar}>
              {salvando ? 'Enviando…' : 'Enviar para a secretaria'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
