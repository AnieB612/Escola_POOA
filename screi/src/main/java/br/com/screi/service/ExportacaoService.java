package br.com.screi.service;

import br.com.screi.repository.CadastroRepository;
import br.com.screi.service.exportacao.Exportador;


public class ExportacaoService {

    private final CadastroRepository cadastroRepository;
    private final Exportador exportador;

    public ExportacaoService(CadastroRepository cadastroRepository, Exportador exportador) {
        this.cadastroRepository = cadastroRepository;
        this.exportador = exportador;
    }

    public byte[] gerarArquivo() {
       
        throw new UnsupportedOperationException("TODO");
    }
}
