import { useState } from 'react'
import { api, comoApiError, type Endereco } from '../api'
import { mascaraCep } from '../utils'
import { Campo } from './ui'

/** Campos de endereço com busca automática pelo CEP (ViaCEP, via API). */
export default function CamposEndereco({
  valor,
  onMudar,
  erros = {},
  aoSairCampo,
}: {
  valor: Endereco
  onMudar: (e: Endereco) => void
  erros?: Partial<Record<keyof Endereco, string>>
  aoSairCampo?: (campo: keyof Endereco) => void
}) {
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

  const mudar = (campo: keyof Endereco, v: string) => {
    aoSairCampo?.(campo)
    onMudar({ ...valor, [campo]: v })
  }
  const erroCep = erros.cep || erro

  return (
    <div className="grade">
      <Campo
        rotulo="CEP"
        obrigatorio
        erro={erroCep}
        dica={buscando ? 'Buscando endereço…' : erroCep ? undefined : 'Digite o CEP e o endereço é preenchido sozinho'}
      >
        <div className="input-com-acao">
          <input
            value={valor.cep}
            inputMode="numeric"
            placeholder="00000-000"
            aria-invalid={erroCep ? true : undefined}
            onBlur={() => aoSairCampo?.('cep')}
            onChange={(e) => {
              const cep = mascaraCep(e.target.value)
              const novo = { ...valor, cep }
              aoSairCampo?.('cep')
              setErro('')
              onMudar(novo)
              if (cep.replace(/\D/g, '').length === 8) buscar(cep, novo)
            }}
          />
          {buscando && <span className="spinner spinner-sm" aria-hidden="true" />}
        </div>
      </Campo>
      <Campo rotulo="Logradouro" obrigatorio largura={3} erro={erros.logradouro}>
        <input
          value={valor.logradouro}
          placeholder="Rua, avenida, número…"
          aria-invalid={erros.logradouro ? true : undefined}
          onBlur={() => aoSairCampo?.('logradouro')}
          onChange={(e) => mudar('logradouro', e.target.value)}
        />
      </Campo>
      <Campo rotulo="Bairro" obrigatorio largura={2} erro={erros.bairro}>
        <input
          value={valor.bairro}
          aria-invalid={erros.bairro ? true : undefined}
          onBlur={() => aoSairCampo?.('bairro')}
          onChange={(e) => mudar('bairro', e.target.value)}
        />
      </Campo>
      <Campo rotulo="Cidade" obrigatorio erro={erros.cidade}>
        <input
          value={valor.cidade}
          aria-invalid={erros.cidade ? true : undefined}
          onBlur={() => aoSairCampo?.('cidade')}
          onChange={(e) => mudar('cidade', e.target.value)}
        />
      </Campo>
      <Campo rotulo="UF" obrigatorio erro={erros.uf}>
        <input
          value={valor.uf}
          maxLength={2}
          placeholder="SP"
          aria-invalid={erros.uf ? true : undefined}
          onBlur={() => aoSairCampo?.('uf')}
          onChange={(e) => mudar('uf', e.target.value.toUpperCase())}
        />
      </Campo>
    </div>
  )
}
