package com.exemplo.api.service;

import com.exemplo.api.model.Aluno;
import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.Endereco;
import com.exemplo.api.model.Responsavel;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

/**
 * Estratégia concreta de exportação em formato CSV (Padrão GoF Strategy).
 * Permite extensão sem modificação (Princípio Aberto/Fechado - OCP)
 * e total intercambialidade de contratos (Princípio de Substituição de Liskov - LSP).
 */
@Component("exportadorCsv")
public class ExportadorCsv implements Exportador {

    private static final String[] CABECALHO = {
        "id", "status", "data_envio", "aluno_nome", "aluno_cpf", "aluno_nascimento",
        "cidade", "uf", "responsavel_nome", "responsavel_telefone", "responsavel_email"
    };

    @Override
    public byte[] exportar(List<Cadastro> cadastros) {
        StringBuilder csv = new StringBuilder("\uFEFF"); // BOM UTF-8 para compatibilidade com Excel
        csv.append(linha((Object[]) CABECALHO));

        if (cadastros != null) {
            for (Cadastro c : cadastros) {
                Aluno aluno = c.getAluno();
                Endereco end = aluno != null ? aluno.getEndereco() : null;
                Responsavel resp = (c.getResponsaveis() != null && !c.getResponsaveis().isEmpty())
                        ? c.getResponsaveis().get(0)
                        : null;

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
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String linha(Object... valores) {
        return Stream.of(valores)
                .map(v -> v == null ? "" : "\"" + v.toString().replace("\"", "\"\"") + "\"")
                .collect(Collectors.joining(";")) + "\r\n";
    }
}
