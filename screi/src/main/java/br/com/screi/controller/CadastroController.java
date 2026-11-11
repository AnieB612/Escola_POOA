package br.com.screi.controller;

import br.com.screi.service.CadastroService;

/**
 * Porta de entrada HTTP do Módulo do Responsável.
 * TODO (equipe): anotar com @RestController e @RequestMapping("/api/cadastros")
 * e mapear os métodos (@PostMapping, @GetMapping...). Sem regra de negócio aqui.
 */
public class CadastroController {

    private final CadastroService cadastroService;

    public CadastroController(CadastroService cadastroService) {
        this.cadastroService = cadastroService;
    }

    public void salvarEtapa() {
        // TODO
    }

    public void enviar() {
        // TODO
    }

    public void consultarStatus() {
        // TODO
    }
}
