package view;

import service.CadastroService;
import service.ViaCepService;

public class CadastroController {
	
	private final CadastroService cadastroService;
    private final ViaCepService viaCepService;

    public CadastroController(CadastroService cadastroService, ViaCepService viaCepService) {
        this.cadastroService = cadastroService;
        this.viaCepService = viaCepService;
    }

    public void salvarEtapa() {
        cadastroService.salvarEtapa();
    }

    public void enviar() {
        cadastroService.enviar();
    }

    public void consultarStatus() {
        cadastroService.consultarStatus();
    }

}
