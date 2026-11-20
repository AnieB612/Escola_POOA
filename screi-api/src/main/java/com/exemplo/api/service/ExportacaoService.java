package com.exemplo.api.service;

import com.exemplo.api.model.Aluno;
import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.Endereco;
import com.exemplo.api.model.Responsavel;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExportacaoService {

    private static final String[] CABECALHO = {
        "id", "status", "data_envio", "aluno_nome", "aluno_cpf", "aluno_nascimento",
        "cidade", "uf", "responsavel_nome", "responsavel_telefone", "responsavel_email"
    };

    private final CadastroRepository repository;

    public ExportacaoService(CadastroRepository repository) {
        this.repository = repository;
    }

    /** Gera um CSV (abre no Excel) com os cadastros do status informado. */
    public byte[] baixarArquivo(StatusCadastro status) {
        StringBuilder csv = new StringBuilder("﻿"); // BOM: faz o Excel entender os acentos
        csv.append(linha((Object[]) CABECALHO));
        for (Cadastro c : repository.findByStatus(status)) {
            Aluno aluno = c.getAluno();
            Endereco end = aluno != null ? aluno.getEndereco() : null;
            Responsavel resp = c.getResponsaveis().isEmpty() ? null : c.getResponsaveis().get(0);
            csv.append(linha(
                    c.getId(),
                    c.getStatus(),
                    c.getDataEnvio(),
                    aluno != null ? aluno.getNome() : null,
                    aluno != null ? aluno.getCpf() : null,
                    aluno != null ? aluno.getDataNascimento() : null,
                    end != null ? end.getCidade() : null,
                    end != null ? end.getUf() : null,
                    resp != null ? resp.getNome() : null,
                    resp != null ? resp.getTelefone() : null,
                    resp != null ? resp.getEmail() : null));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String linha(Object... valores) {
        return Stream.of(valores)
                .map(v -> v == null ? "" : "\"" + v.toString().replace("\"", "\"\"") + "\"")
                .collect(Collectors.joining(";")) + "\r\n";
    }
}
