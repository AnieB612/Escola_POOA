package com.exemplo.api.service;

import com.exemplo.api.model.Endereco;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Busca endereço pelo CEP no serviço público ViaCEP (https://viacep.com.br). */
@Service
public class ViaCepService {

    private final RestClient client = RestClient.create("https://viacep.com.br/ws");

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
