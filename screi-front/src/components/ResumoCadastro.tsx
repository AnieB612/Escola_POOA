import type { Cadastro, Endereco } from '../api'
import { estaVazio, formatarData, idade } from '../utils'
import { Avatar } from './ui'

function textoEndereco(e: Endereco | null | undefined) {
  if (!e || estaVazio(e)) return '—'
  const linha1 = [e.logradouro, e.bairro].filter(Boolean).join(', ')
  const linha2 = [e.cidade, e.uf].filter(Boolean).join(' / ')
  return [linha1, linha2, e.cep && `CEP ${e.cep}`].filter(Boolean).join(' · ')
}

function Item({ rotulo, valor, largo }: { rotulo: string; valor: string | null | undefined; largo?: boolean }) {
  return (
    <div className={largo ? 'item item-largo' : 'item'}>
      <dt>{rotulo}</dt>
      <dd className={valor ? undefined : 'faltando'}>{valor || 'Não informado'}</dd>
    </div>
  )
}

/** Mostra todos os dados de um cadastro (usado na revisão e no detalhe). */
export default function ResumoCadastro({ cadastro }: { cadastro: Cadastro }) {
  const { aluno, responsaveis, contatosEmergencia } = cadastro
  const anos = idade(aluno?.dataNascimento)

  return (
    <div className="resumo">
      <section className="card">
        <h3 className="secao-titulo"><span className="secao-num">1</span>Aluno</h3>
        {aluno && !estaVazio(aluno) ? (
          <dl className="itens">
            <Item rotulo="Nome" valor={aluno.nome} />
            <Item
              rotulo="Data de nascimento"
              valor={aluno.dataNascimento ? `${formatarData(aluno.dataNascimento)}${anos != null ? ` (${anos} anos)` : ''}` : ''}
            />
            <Item rotulo="CPF" valor={aluno.cpf} />
            <Item rotulo="Endereço" valor={textoEndereco(aluno.endereco)} largo />
            <Item rotulo="Observações de saúde" valor={aluno.observacoesSaude} largo />
          </dl>
        ) : (
          <p className="faltando">Dados do aluno ainda não preenchidos.</p>
        )}
      </section>

      <section className="card">
        <h3 className="secao-titulo"><span className="secao-num">2</span>Responsáveis</h3>
        {responsaveis.length === 0 && <p className="faltando">Nenhum responsável informado.</p>}
        <div className="pessoas">
          {responsaveis.map((r, i) => (
            <div className="pessoa" key={i}>
              <div className="pessoa-topo">
                <Avatar nome={r.nome} />
                <div>
                  <strong>{r.nome || 'Sem nome'}</strong>
                  <small>{r.parentesco || 'Parentesco não informado'}</small>
                </div>
              </div>
              <dl className="itens itens-compacto">
                <Item rotulo="CPF" valor={r.cpf} />
                <Item rotulo="Telefone" valor={r.telefone} />
                <Item rotulo="E-mail" valor={r.email} largo />
                <Item rotulo="Endereço" valor={textoEndereco(r.endereco)} largo />
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="secao-titulo"><span className="secao-num">3</span>Contatos de emergência</h3>
        {contatosEmergencia.length === 0 && <p className="faltando">Nenhum contato informado.</p>}
        <ul className="contatos">
          {contatosEmergencia.map((c, i) => (
            <li key={i}>
              <Avatar nome={c.nome} />
              <div>
                <strong>{c.nome || 'Sem nome'}</strong>
                <small>{c.parentesco || '—'}</small>
              </div>
              <a href={c.telefone ? `tel:${c.telefone.replace(/\D/g, '')}` : undefined} className="contato-tel">
                {c.telefone || 'Sem telefone'}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
