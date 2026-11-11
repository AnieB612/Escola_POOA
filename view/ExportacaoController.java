package view;

import service.ExportacaoService;

public class ExportacaoController {
	
	private final ExportacaoService exportacaoService;

    public ExportacaoController(ExportacaoService exportacaoService) {
        this.exportacaoService = exportacaoService;
    }

    public void exportar() {
        exportacaoService.baixarArquivo();
    }

}
