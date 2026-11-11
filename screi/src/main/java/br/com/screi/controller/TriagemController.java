package br.com.screi.controller;

import br.com.screi.service.TriagemService;

/**
 * Porta de entrada HTTP do Módulo da Secretaria (triagem).
 * TODO (equipe): anotar com @RestController e @RequestMapping("/api/secretaria/triagem").
 */
public class TriagemController {

    private final TriagemService triagemService;

    public TriagemController(TriagemService triagemService) {
        this.triagemService = triagemService;
    }

    public void listarFila() {
        // TODO
    }

    public void aprovar() {
        // TODO
    }

    public void reprovar() {
        // TODO
    }
}
