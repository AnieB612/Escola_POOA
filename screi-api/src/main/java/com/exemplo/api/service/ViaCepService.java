package com.exemplo.api.service;

import com.exemplo.api.model.Endereco;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Serviço de integração com o serviço público ViaCEP (https://viacep.com.br).
 * 
 * Padrões e Princípios aplicados:
 * - GoF Adapter: Adapta o formato de dados retornado pela API externa (ViaCepResposta)
 *   para o modelo de domínio interno da aplicação (Endereco).
 * - SOLID SRP: Responsabilidade única e exclusiva de consultar e normalizar dados de endereço postal.
 * - SOLID DIP: Pode ser consumido através da abstração do serviço pela camada de apresentação.
 */
@Service
public class ViaCepService {

    private final RestClient client = RestClient.create("https://viacep.com.br/ws");

    /**
     * Consulta o CEP informado e retorna o Endereço preenchido (+buscarEndereco(cep)).
     * Conforme diagrama UML e requisito do MVP (Anexo C).
     *
     * @param cep CEP com ou sem pontuação
     * @return Endereco correspondente
     */
    public Endereco buscarEndereco(String cep) {
        String digitos = cep == null ? "" : cep.replaceAll("\\D", "");
        if (digitos.length() != 8) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "CEP inválido: informe 8 números");
        }

        ViaCepResposta r;
        try {
            r = client.get().uri("/{cep}/json/", digitos).retrieve().body(ViaCepResposta.class);
        } catch (RestClientException e) {
            throw new NegocioException(HttpStatus.BAD_GATEWAY, "Não foi possível consultar o ViaCEP agora");
        }
        if (r == null || "true".equals(r.erro())) {
            throw NegocioException.naoEncontrado("CEP " + digitos + " não encontrado");
        }

        Endereco endereco = new Endereco();
        endereco.setCep(r.cep());
        endereco.setLogradouro(r.logradouro());
        endereco.setBairro(r.bairro());
        endereco.setCidade(r.localidade());
        endereco.setUf(r.uf());
        return endereco;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ViaCepResposta(String cep, String logradouro, String bairro, String localidade, String uf, String erro) {
    }
}
