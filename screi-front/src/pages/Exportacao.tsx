import { useEffect, useState } from 'react'
import { api, comoApiError, type ApiError, type StatusCadastro } from '../api'
import { Aviso, Cabecalho, ErroApi, StatusBadge } from '../components/ui'
import { useAviso } from '../contexto'
import { STATUS, STATUS_ORDEM, baixarArquivo } from '../utils'

const COLUNAS = ['Nº', 'Status', 'Data de envio', 'Aluno', 'CPF do aluno', 'Nascimento', 'Cidade', 'UF', 'Responsável', 'Telefone', 'E-mail']

export default function Exportacao() {
  const avisar = useAviso()
  const [status, setStatus] = useState<StatusCadastro>('APROVADO')
  const [contagem, setContagem] = useState<Record<string, number> | null>(null)
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro] = useState<ApiError | null>(null)

  useEffect(() => {
    api.cadastros
      .listar()
      .then((lista) => {
        const c: Record<string, number> = {}
        for (const cad of lista) c[cad.status] = (c[cad.status] ?? 0) + 1
        setContagem(c)
      })
      .catch((e) => setErro(comoApiError(e)))
  }, [])

  async function baixar() {
    setBaixando(true)
    setErro(null)
    try {
      const { arquivo, nome } = await api.exportacao.exportar(status)
      baixarArquivo(arquivo, nome)
      avisar(`Arquivo ${nome} baixado.`)
    } catch (e) {
      setErro(comoApiError(e))
    } finally {
      setBaixando(false)
    }
  }

  const total = contagem?.[status] ?? 0

  return (
    <div className="pagina estreita">
      <Cabecalho titulo="Exportação" subtitulo="Baixe uma planilha em formato XLSX (Excel) com os cadastros de um status." />

      {erro && <ErroApi erro={erro} />}

      <section className="card">
        <h2 className="card-titulo">1. Escolha quais cadastros</h2>
        <div className="opcoes-status" role="radiogroup">
          {STATUS_ORDEM.map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={status === s}
              className={`opcao-status${status === s ? ' ativo' : ''}`}
              onClick={() => setStatus(s)}
            >
              <StatusBadge status={s} />
              <strong>{contagem ? contagem[s] ?? 0 : '…'}</strong>
              <small>{STATUS[s].descricao}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-titulo">2. Colunas da planilha</h2>
        <div className="colunas">
          {COLUNAS.map((c) => (
            <span key={c} className="chip chip-fixo">{c}</span>
          ))}
        </div>
        <p className="card-desc">Quando há mais de um responsável, a planilha mostra o primeiro.</p>
      </section>

      {contagem && total === 0 && (
        <Aviso tipo="info" titulo="Nenhum cadastro com esse status">
          A planilha vai sair só com o cabeçalho.
        </Aviso>
      )}

      <div className="barra-acoes">
        <span className="mudo">
          {contagem ? `${total} cadastro${total === 1 ? '' : 's'} · ${STATUS[status].rotulo}` : 'Contando cadastros…'}
        </span>
        <button className="btn btn-primario" onClick={baixar} disabled={baixando}>
          {baixando ? 'Gerando…' : '⤓ Baixar planilha'}
        </button>
      </div>
    </div>
  )
}
