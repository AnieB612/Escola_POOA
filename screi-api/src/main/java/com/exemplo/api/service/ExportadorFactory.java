package com.exemplo.api.service;

import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Fábrica de Exportadores (Padrão GoF Factory Method / Simple Factory).
 * Isola a criação/seleção das estratégias de exportação do cliente (DIP e OCP).
 */
@Component
public class ExportadorFactory {

    private final Map<String, Exportador> exportadores;
    private final Exportador exportadorPadrao;

    public ExportadorFactory(ExportadorXlsx exportadorXlsx, ExportadorCsv exportadorCsv) {
        this.exportadorPadrao = exportadorXlsx;
        this.exportadores = Map.of(
            "XLSX", exportadorXlsx,
            "EXCEL", exportadorXlsx,
            "CSV", exportadorCsv
        );
    }

    /**
     * Retorna a estratégia de exportação correspondente ao formato requisitado.
     * Retorna o exportador XLSX por padrão (atendendo ao RF013).
     */
    public Exportador obterExportador(String formato) {
        if (formato == null || formato.isBlank()) {
            return exportadorPadrao;
        }
        return exportadores.getOrDefault(formato.trim().toUpperCase(), exportadorPadrao);
    }
}
