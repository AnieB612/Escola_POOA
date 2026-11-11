package view;

import service.TriagemService;

public class TriagemController {
	
	private final TriagemService triagemService;

    public TriagemController(TriagemService triagemService) {
        this.triagemService = triagemService;
    }

    public void listarFila() {
        triagemService.listarFila();
    }

    public void aprovar() {
        // Lógica do controller para aprovar
    }

    public void reprovar() {
        // Lógica do controller para reprovar
    }

}
