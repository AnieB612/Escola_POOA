package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import java.time.LocalDateTime;

/** Resposta do "consultar status". */
public record StatusResponse(Long id, StatusCadastro status, LocalDateTime dataEnvio, String justificativa) {

    public static StatusResponse de(Cadastro c) {
        return new StatusResponse(c.getId(), c.getStatus(), c.getDataEnvio(), c.getJustificativa());
    }
}
