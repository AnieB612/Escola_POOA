import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
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

type ErrosFormulario = Record<string, string>

function validarCpf(valor: string) {
  const cpf = valor.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const calcularDigito = (tamanho: number) => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10])
}

function erroCpf(valor: string, rotulo: string) {
  const nome = rotulo === 'CPF do aluno' ? 'o CPF do aluno' : 'o CPF'
  if (!valor.trim()) return `Informe ${nome}.`
  if (validarCpf(valor)) return ''
  return rotulo === 'CPF do aluno' ? 'O CPF do aluno não é válido.' : 'O CPF informado não é válido.'
}

function validarEndereco(endereco: Aluno['endereco'], prefixo: string): ErrosFormulario {
  const erros: ErrosFormulario = {}
  const adicionar = (campo: string, mensagem: string) => { erros[`${prefixo}.${campo}`] = mensagem }
  if (endereco.cep.replace(/\D/g, '').length !== 8) adicionar('cep', 'Informe um CEP válido com 8 números.')
  if (!endereco.logradouro.trim()) adicionar('logradouro', 'Informe o logradouro.')
  if (!endereco.bairro.trim()) adicionar('bairro', 'Informe o bairro.')
  if (!endereco.cidade.trim()) adicionar('cidade', 'Informe a cidade.')
  if (!/^[A-Z]{2}$/.test(endereco.uf)) adicionar('uf', 'Informe uma UF com 2 letras.')
  return erros
}

function validarAluno(aluno: Aluno): ErrosFormulario {
  const erros: ErrosFormulario = {}
  if (!aluno.nome.trim()) erros['aluno.nome'] = 'Informe o nome do aluno.'
  if (!aluno.dataNascimento) erros['aluno.dataNascimento'] = 'Informe a data de nascimento.'
  else {
    const nascimento = new Date(`${aluno.dataNascimento}T00:00:00`)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (Number.isNaN(nascimento.getTime())) erros['aluno.dataNascimento'] = 'Informe uma data válida.'
    else if (nascimento > hoje) erros['aluno.dataNascimento'] = 'A data de nascimento não pode ser futura.'
  }
  const cpf = erroCpf(aluno.cpf, 'CPF do aluno')
  if (cpf) erros['aluno.cpf'] = cpf
  return { ...erros, ...validarEndereco(aluno.endereco, 'aluno.endereco') }
}

function validarResponsavel(responsavel: Responsavel, indice: number): ErrosFormulario {
  const prefixo = `responsaveis[${indice}]`
  const erros: ErrosFormulario = {}
  if (!responsavel.nome.trim()) erros[`${prefixo}.nome`] = 'Informe o nome do responsável.'
  const cpf = erroCpf(responsavel.cpf, 'CPF')
  if (cpf) erros[`${prefixo}.cpf`] = cpf
  if (!responsavel.parentesco.trim()) erros[`${prefixo}.parentesco`] = 'Informe o parentesco.'
  const telefone = responsavel.telefone.replace(/\D/g, '')
  if (telefone.length !== 10 && telefone.length !== 11) {
    erros[`${prefixo}.telefone`] = 'Informe um telefone com DDD e 8 ou 9 dígitos.'
  }
  if (responsavel.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavel.email.trim())) {
    erros[`${prefixo}.email`] = 'Informe um e-mail válido.'
  }
  return { ...erros, ...validarEndereco(responsavel.endereco, `${prefixo}.endereco`) }
}

function validarContato(contato: ContatoEmergencia, indice: number): ErrosFormulario {
  const prefixo = `contatosEmergencia[${indice}]`
  const erros: ErrosFormulario = {}
  if (!contato.nome.trim()) erros[`${prefixo}.nome`] = 'Informe o nome do contato.'
  const telefone = contato.telefone.replace(/\D/g, '')
  if (telefone.length !== 10 && telefone.length !== 11) {
    erros[`${prefixo}.telefone`] = 'Informe um telefone com DDD e 8 ou 9 dígitos.'
  }
  if (!contato.parentesco.trim()) erros[`${prefixo}.parentesco`] = 'Informe o parentesco.'
  return erros
}

function CampoParentesco({
  valor,
  onMudar,
  erro,
  onBlur,
}: {
  valor: string
  onMudar: (valor: string) => void
  erro?: string
  onBlur: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(-1)
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const opcoesId = `${id}-opcoes`
  const opcoes = PARENTESCOS.filter((parentesco) =>
    parentesco.toLocaleLowerCase().includes(valor.trim().toLocaleLowerCase()),
  )

  useEffect(() => {
    function fecharAoClicarFora(evento: PointerEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false)
    }
    document.addEventListener('pointerdown', fecharAoClicarFora)
    return () => document.removeEventListener('pointerdown', fecharAoClicarFora)
  }, [])

  function tratarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAberto(true)
      setAtivo((atual) => {
        if (!opcoes.length) return -1
        if (evento.key === 'ArrowDown') return atual < opcoes.length - 1 ? atual + 1 : 0
        return atual > 0 ? atual - 1 : opcoes.length - 1
      })
    } else if (evento.key === 'Enter' && aberto && ativo >= 0 && ativo < opcoes.length) {
      evento.preventDefault()
      onMudar(opcoes[ativo])
      setAberto(false)
      setAtivo(-1)
    } else if (evento.key === 'Escape') {
      setAberto(false)
      setAtivo(-1)
    }
  }

  return (
    <div className="parentesco-seletor" ref={containerRef}>
      <div className="parentesco-campo">
        <input
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={aberto}
          aria-controls={opcoesId}
          aria-activedescendant={aberto && ativo >= 0 ? `${id}-opcao-${ativo}` : undefined}
          aria-invalid={erro ? true : undefined}
          value={valor}
          onFocus={() => setAberto(true)}
          onBlur={onBlur}
          onChange={(evento) => {
            onMudar(evento.target.value)
            setAberto(true)
            setAtivo(-1)
          }}
          onKeyDown={tratarTecla}
        />
        <span className={`parentesco-seta${aberto ? ' aberto' : ''}`} aria-hidden="true" />
      </div>
      {aberto && (
        <div className="parentesco-opcoes" id={opcoesId} role="listbox" aria-label="Opções de parentesco">
          {opcoes.map((parentesco, indice) => {
            return (
              <button
                type="button"
                id={`${id}-opcao-${indice}`}
                role="option"
                aria-selected={valor === parentesco}
                className={`parentesco-opcao${ativo === indice ? ' ativo' : ''}`}
                key={parentesco}
                onPointerDown={(evento) => evento.preventDefault()}
                onClick={() => {
                  onMudar(parentesco)
                  setAberto(false)
                  setAtivo(-1)
                }}
              >
                {parentesco}
              </button>
            )
          })}
          {opcoes.length === 0 && (
            <div className="parentesco-vazio">Nenhuma opção encontrada. Você pode usar esse texto.</div>
          )}
        </div>
      )}
    </div>
  )
}

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
  const [camposTocados, setCamposTocados] = useState<Set<string>>(() => new Set())

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
    const camposInvalidos = Object.keys(errosCadastro).filter((campo) => errosCadastro[campo])
    if (camposInvalidos.length) {
      setCamposTocados((atuais) => new Set([...atuais, ...camposInvalidos]))
      const etapaDoErro = etapaDaPendencia(camposInvalidos[0])
      if (etapaDoErro != null && etapaDoErro !== etapa) {
        setParams({ etapa: String(etapaDoErro) })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
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

  const mudarAluno = (campo: keyof Aluno) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    tocarCampo(`aluno.${campo}`)
    setAluno({ ...aluno, [campo]: e.target.value })
  }
  const errosCadastro = {
    ...validarAluno(aluno),
    ...Object.assign({}, ...responsaveis.map(validarResponsavel)),
    ...Object.assign({}, ...contatos.map(validarContato)),
  }
  const erroCampo = (caminho: string) => camposTocados.has(caminho) ? errosCadastro[caminho] : undefined
  const tocarCampo = (caminho: string) =>
    setCamposTocados((atuais) => new Set(atuais).add(caminho))
  const errosEnderecoVisiveis = (prefixo: string) => {
    const campos: (keyof Aluno['endereco'])[] = ['cep', 'logradouro', 'bairro', 'cidade', 'uf']
    return Object.fromEntries(
      campos
        .map((campo) => [campo, erroCampo(`${prefixo}.${campo}`)])
        .filter(([, mensagem]) => Boolean(mensagem)),
    ) as Partial<Record<keyof Aluno['endereco'], string>>
  }

  // ✓ só nas etapas que já têm dados salvos
  const etapaFeita = [
    Boolean(cadastro && !estaVazio(cadastro.aluno)),
    Boolean(cadastro?.responsaveis.length),
    Boolean(cadastro?.contatosEmergencia.length),
    false,
  ]

  const mudarResp = (i: number, r: Responsavel) => setResponsaveis(responsaveis.map((x, j) => (j === i ? r : x)))
  const mudarContato = (i: number, c: ContatoEmergencia) => setContatos(contatos.map((x, j) => (j === i ? c : x)))
  function removerItem(colecao: 'responsaveis' | 'contatosEmergencia', indice: number) {
    setCamposTocados((atuais) => {
      const regex = new RegExp(`^${colecao}\\[(\\d+)\\](.*)$`)
      const novos = new Set<string>()
      for (const campo of atuais) {
        const correspondencia = regex.exec(campo)
        if (!correspondencia) {
          novos.add(campo)
          continue
        }
        const numero = Number(correspondencia[1])
        if (numero < indice) novos.add(campo)
        else if (numero > indice) novos.add(`${colecao}[${numero - 1}]${correspondencia[2]}`)
      }
      return novos
    })
  }

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
            <Campo rotulo="Nome completo" obrigatorio largura={4} erro={erroCampo('aluno.nome')}>
              <input
                value={aluno.nome}
                onChange={mudarAluno('nome')}
                onBlur={() => tocarCampo('aluno.nome')}
                aria-invalid={erroCampo('aluno.nome') ? true : undefined}
                placeholder="Nome do aluno"
                autoFocus
              />
            </Campo>
            <Campo rotulo="Data de nascimento" obrigatorio largura={2} erro={erroCampo('aluno.dataNascimento')}>
              <input
                type="date"
                value={aluno.dataNascimento}
                onChange={mudarAluno('dataNascimento')}
                onBlur={() => tocarCampo('aluno.dataNascimento')}
                aria-invalid={erroCampo('aluno.dataNascimento') ? true : undefined}
              />
            </Campo>
            <Campo rotulo="CPF do aluno" obrigatorio largura={2} erro={erroCampo('aluno.cpf')}>
              <input
                value={aluno.cpf}
                inputMode="numeric"
                placeholder="000.000.000-00"
                onBlur={() => tocarCampo('aluno.cpf')}
                aria-invalid={erroCampo('aluno.cpf') ? true : undefined}
                onChange={(e) => {
                  tocarCampo('aluno.cpf')
                  setAluno({ ...aluno, cpf: mascaraCpf(e.target.value) })
                }}
              />
            </Campo>
            <Campo rotulo="Observações de saúde" largura={4} dica="Alergias, medicamentos, restrições alimentares, necessidades especiais…">
              <textarea rows={3} value={aluno.observacoesSaude} onChange={mudarAluno('observacoesSaude')} />
            </Campo>
          </div>

          <h3 className="sub-titulo">Endereço do aluno</h3>
          <CamposEndereco
            valor={aluno.endereco}
            onMudar={(endereco) => setAluno({ ...aluno, endereco })}
            erros={errosEnderecoVisiveis('aluno.endereco')}
            aoSairCampo={(campo) => tocarCampo(`aluno.endereco.${campo}`)}
          />
        </section>
      )}

      {etapa === 1 && (
        <>
          {responsaveis.map((r, i) => (
            <section className="card" key={i}>
              <div className="card-topo">
                <h2 className="card-titulo">Responsável {i + 1}</h2>
                {responsaveis.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-perigo-leve btn-pequeno"
                    onClick={() => {
                      removerItem('responsaveis', i)
                      setResponsaveis(responsaveis.filter((_, j) => j !== i))
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>
              <div className="grade">
                <Campo rotulo="Nome completo" obrigatorio largura={2} erro={erroCampo(`responsaveis[${i}].nome`)}>
                  <input
                    value={r.nome}
                    onChange={(e) => {
                      tocarCampo(`responsaveis[${i}].nome`)
                      mudarResp(i, { ...r, nome: e.target.value })
                    }}
                    onBlur={() => tocarCampo(`responsaveis[${i}].nome`)}
                    aria-invalid={erroCampo(`responsaveis[${i}].nome`) ? true : undefined}
                  />
                </Campo>
                <Campo rotulo="Parentesco" obrigatorio erro={erroCampo(`responsaveis[${i}].parentesco`)}>
                  <CampoParentesco
                    valor={r.parentesco}
                    onMudar={(parentesco) => {
                      tocarCampo(`responsaveis[${i}].parentesco`)
                      mudarResp(i, { ...r, parentesco })
                    }}
                    onBlur={() => tocarCampo(`responsaveis[${i}].parentesco`)}
                    erro={erroCampo(`responsaveis[${i}].parentesco`)}
                  />
                </Campo>
                <Campo rotulo="CPF" obrigatorio erro={erroCampo(`responsaveis[${i}].cpf`)}>
                  <input
                    value={r.cpf}
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    onBlur={() => tocarCampo(`responsaveis[${i}].cpf`)}
                    aria-invalid={erroCampo(`responsaveis[${i}].cpf`) ? true : undefined}
                    onChange={(e) => {
                      tocarCampo(`responsaveis[${i}].cpf`)
                      mudarResp(i, { ...r, cpf: mascaraCpf(e.target.value) })
                    }}
                  />
                </Campo>
                <Campo rotulo="Telefone" obrigatorio largura={2} erro={erroCampo(`responsaveis[${i}].telefone`)}>
                  <input
                    value={r.telefone}
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    onBlur={() => tocarCampo(`responsaveis[${i}].telefone`)}
                    aria-invalid={erroCampo(`responsaveis[${i}].telefone`) ? true : undefined}
                    onChange={(e) => {
                      tocarCampo(`responsaveis[${i}].telefone`)
                      mudarResp(i, { ...r, telefone: mascaraTelefone(e.target.value) })
                    }}
                  />
                </Campo>
                <Campo rotulo="E-mail" largura={2} erro={erroCampo(`responsaveis[${i}].email`)}>
                  <input
                    type="email"
                    value={r.email}
                    onBlur={() => tocarCampo(`responsaveis[${i}].email`)}
                    aria-invalid={erroCampo(`responsaveis[${i}].email`) ? true : undefined}
                    onChange={(e) => {
                      tocarCampo(`responsaveis[${i}].email`)
                      mudarResp(i, { ...r, email: e.target.value })
                    }}
                  />
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
              <CamposEndereco
                valor={r.endereco}
                onMudar={(endereco) => mudarResp(i, { ...r, endereco })}
                erros={errosEnderecoVisiveis(`responsaveis[${i}].endereco`)}
                aoSairCampo={(campo) => tocarCampo(`responsaveis[${i}].endereco.${campo}`)}
              />
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
                  <Campo rotulo="Nome" obrigatorio largura={2} erro={erroCampo(`contatosEmergencia[${i}].nome`)}>
                    <input
                      value={c.nome}
                      onChange={(e) => {
                        tocarCampo(`contatosEmergencia[${i}].nome`)
                        mudarContato(i, { ...c, nome: e.target.value })
                      }}
                      onBlur={() => tocarCampo(`contatosEmergencia[${i}].nome`)}
                      aria-invalid={erroCampo(`contatosEmergencia[${i}].nome`) ? true : undefined}
                    />
                  </Campo>
                  <Campo rotulo="Telefone" obrigatorio erro={erroCampo(`contatosEmergencia[${i}].telefone`)}>
                    <input
                      value={c.telefone}
                      inputMode="tel"
                      placeholder="(00) 00000-0000"
                      onBlur={() => tocarCampo(`contatosEmergencia[${i}].telefone`)}
                      aria-invalid={erroCampo(`contatosEmergencia[${i}].telefone`) ? true : undefined}
                      onChange={(e) => {
                        tocarCampo(`contatosEmergencia[${i}].telefone`)
                        mudarContato(i, { ...c, telefone: mascaraTelefone(e.target.value) })
                      }}
                    />
                  </Campo>
                  <Campo rotulo="Parentesco" obrigatorio erro={erroCampo(`contatosEmergencia[${i}].parentesco`)}>
                    <CampoParentesco
                      valor={c.parentesco}
                      onMudar={(parentesco) => {
                        tocarCampo(`contatosEmergencia[${i}].parentesco`)
                        mudarContato(i, { ...c, parentesco })
                      }}
                      onBlur={() => tocarCampo(`contatosEmergencia[${i}].parentesco`)}
                      erro={erroCampo(`contatosEmergencia[${i}].parentesco`)}
                    />
                  </Campo>
                </div>
                {contatos.length > 1 && (
                  <button
                    type="button"
                    className="icone-btn"
                    aria-label={`Remover contato ${i + 1}`}
                    onClick={() => {
                      removerItem('contatosEmergencia', i)
                      setContatos(contatos.filter((_, j) => j !== i))
                    }}
                  >
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
