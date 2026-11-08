package br.com.screi.controller;

import br.com.screi.service.ExportacaoService;

/**
 * Porta de entrada HTTP da exportação de dados.
 * TODO (equipe): anotar com @RestController e devolver o .xlsx para download.
 */
public class ExportacaoController {

    private final ExportacaoService exportacaoService;

    public ExportacaoController(ExportacaoService exportacaoService) {
        this.exportacaoService = exportacaoService;
    }

    public void exportar() {
        // TODO
    }
}
