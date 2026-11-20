package com.exemplo.api.service;

import com.exemplo.api.model.Aluno;
import com.exemplo.api.model.ContatoEmergencia;
import com.exemplo.api.model.Responsavel;
import java.util.List;

/**
 * Corpo do "salvar etapa". O formulário é preenchido por etapas, então todos os campos são opcionais:
 * só o que vier preenchido é gravado, o resto continua como estava.
 *
 * @param usuarioId obrigatório só na criação do cadastro
 */
public record SalvarEtapaRequest(
        Long usuarioId,
        Aluno aluno,
        List<Responsavel> responsaveis,
        List<ContatoEmergencia> contatosEmergencia) {
}
