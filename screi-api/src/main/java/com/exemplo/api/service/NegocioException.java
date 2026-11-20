package com.exemplo.api.service;

import java.util.List;
import org.springframework.http.HttpStatus;

/** Erro de regra de negócio. Vira uma resposta HTTP com o status e a mensagem informados. */
public class NegocioException extends RuntimeException {

    private final HttpStatus status;
    private final List<String> pendencias;

    public NegocioException(HttpStatus status, String mensagem) {
        this(status, mensagem, List.of());
    }

    public NegocioException(HttpStatus status, String mensagem, List<String> pendencias) {
        super(mensagem);
        this.status = status;
        this.pendencias = pendencias;
    }

    public static NegocioException naoEncontrado(String mensagem) {
        return new NegocioException(HttpStatus.NOT_FOUND, mensagem);
    }

    public HttpStatus getStatus() { return status; }
    public List<String> getPendencias() { return pendencias; }
}
