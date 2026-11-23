package com.exemplo.api.service;

import com.exemplo.api.model.Aluno;
import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.Endereco;
import com.exemplo.api.model.Responsavel;

/**
 * Representação tabular (DTO imutável / Record) de um cadastro para exportação.
 * Centraliza o cabeçalho e a extração dos campos, eliminando código duplicado entre os exportadores (DRY e SRP).
 */
public record CadastroLinhaRelatorio(
        Long id,
        String status,
        String dataEnvio,
        String alunoNome,
        String alunoCpf,
        String alunoNascimento,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        String responsavelNome,
        String responsavelTelefone,
        String responsavelEmail) {

    public static final String[] CABECALHO = {
        "Nº", "Status", "Data de Envio", "Aluno", "CPF do Aluno", "Nascimento",
        "Logradouro", "Bairro", "Cidade", "UF", "Responsável", "Telefone", "E-mail"
    };

    public static CadastroLinhaRelatorio de(Cadastro c) {
        Aluno aluno = c.getAluno();
        Endereco end = aluno != null ? aluno.getEndereco() : null;
        Responsavel resp = (c.getResponsaveis() != null && !c.getResponsaveis().isEmpty())
                ? c.getResponsaveis().get(0)
                : null;

        return new CadastroLinhaRelatorio(
                c.getId(),
                c.getStatus() != null ? c.getStatus().name() : "",
                c.getDataEnvio() != null ? c.getDataEnvio().toString() : "",
                aluno != null && aluno.getNome() != null ? aluno.getNome() : "",
                aluno != null && aluno.getCpf() != null ? aluno.getCpf() : "",
                aluno != null && aluno.getDataNascimento() != null ? aluno.getDataNascimento().toString() : "",
                end != null && end.getLogradouro() != null ? end.getLogradouro() : "",
                end != null && end.getBairro() != null ? end.getBairro() : "",
                end != null && end.getCidade() != null ? end.getCidade() : "",
                end != null && end.getUf() != null ? end.getUf() : "",
                resp != null && resp.getNome() != null ? resp.getNome() : "",
                resp != null && resp.getTelefone() != null ? resp.getTelefone() : "",
                resp != null && resp.getEmail() != null ? resp.getEmail() : ""
        );
    }

    public Object[] toArray() {
        return new Object[] {
            id, status, dataEnvio, alunoNome, alunoCpf, alunoNascimento,
            logradouro, bairro, cidade, uf, responsavelNome, responsavelTelefone, responsavelEmail
        };
    }
}
