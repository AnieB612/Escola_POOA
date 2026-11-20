package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

/**
 * Estratégia concreta de exportação em formato CSV (GoF Strategy).
 * Utiliza o mesmo modelo tabular de dados para garantir consistência (DRY).
 */
@Component("exportadorCsv")
public class ExportadorCsv implements Exportador {

    @Override
    public byte[] exportar(List<Cadastro> cadastros) {
        StringBuilder csv = new StringBuilder("\uFEFF"); // BOM UTF-8 para Excel
        csv.append(linha((Object[]) CadastroLinhaRelatorio.CABECALHO));

        if (cadastros != null) {
            for (Cadastro c : cadastros) {
                csv.append(linha(CadastroLinhaRelatorio.de(c).toArray()));
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
