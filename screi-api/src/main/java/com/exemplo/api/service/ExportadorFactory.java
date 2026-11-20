package com.exemplo.api.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class ExportadorFactory {

    private static final String FORMATO_PADRAO = "XLSX";
    private final Map<String, Exportador> exportadores;

    public ExportadorFactory(List<Exportador> estrategias) {
        this.exportadores = estrategias.stream()
                .collect(Collectors.toUnmodifiableMap(
                        e -> e.formato().toUpperCase(),
                        Function.identity()
                ));
    }

    public Exportador obterExportador(String formato) {
        String chave = (formato == null || formato.isBlank())
                ? FORMATO_PADRAO
                : formato.trim().toUpperCase();
        return exportadores.getOrDefault(chave, exportadores.get(FORMATO_PADRAO));
    }
}