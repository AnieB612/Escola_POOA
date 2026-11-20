import { useState } from 'react'
import { api, comoApiError, type Endereco } from '../api'
import { mascaraCep } from '../utils'
import { Campo } from './ui'

/** Campos de endereço com busca automática pelo CEP (ViaCEP, via API). */
export default function CamposEndereco({ valor, onMudar }: { valor: Endereco; onMudar: (e: Endereco) => void }) {
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState('')

  async function buscar(cep: string, atual: Endereco) {
    const digitos = cep.replace(/\D/g, '')
    if (digitos.length !== 8) return
    setBuscando(true)
    setErro('')
    try {
      const achado = await api.cadastros.buscarCep(digitos)
      onMudar({ ...atual, ...achado, cep: mascaraCep(digitos) })
    } catch (e) {
      setErro(comoApiError(e).message)
    } finally {
      setBuscando(false)
    }
  }

  const mudar = (campo: keyof Endereco, v: string) => onMudar({ ...valor, [campo]: v })

  return (
    <div className="grade">
      <Campo rotulo="CEP" obrigatorio dica={buscando ? 'Buscando endereço…' : erro || 'Digite o CEP e o endereço é preenchido sozinho'}>
        <div className="input-com-acao">
          <input
            value={valor.cep}
            inputMode="numeric"
            placeholder="00000-000"
            onChange={(e) => {
              const cep = mascaraCep(e.target.value)
              const novo = { ...valor, cep }
              onMudar(novo)
              if (cep.replace(/\D/g, '').length === 8) buscar(cep, novo)
            }}
            aria-invalid={erro ? true : undefined}
          />
          {buscando && <span className="spinner spinner-sm" aria-hidden="true" />}
        </div>
      </Campo>
      <Campo rotulo="Logradouro" obrigatorio largura={3}>
        <input value={valor.logradouro} placeholder="Rua, avenida, número…" onChange={(e) => mudar('logradouro', e.target.value)} />
      </Campo>
      <Campo rotulo="Bairro" obrigatorio largura={2}>
        <input value={valor.bairro} onChange={(e) => mudar('bairro', e.target.value)} />
      </Campo>
      <Campo rotulo="Cidade" obrigatorio>
        <input value={valor.cidade} onChange={(e) => mudar('cidade', e.target.value)} />
      </Campo>
      <Campo rotulo="UF" obrigatorio>
        <input value={valor.uf} maxLength={2} placeholder="SP" onChange={(e) => mudar('uf', e.target.value.toUpperCase())} />
      </Campo>
    </div>
  )
}
