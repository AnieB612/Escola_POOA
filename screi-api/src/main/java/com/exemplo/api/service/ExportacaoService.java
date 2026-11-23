package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExportacaoService {

    private final CadastroRepository repository;
    private final ExportadorFactory exportadorFactory;

    public ExportacaoService(CadastroRepository repository, ExportadorFactory exportadorFactory) {
        this.repository = repository;
        this.exportadorFactory = exportadorFactory;
    }

    public byte[] gerarArquivo(StatusCadastro status, String formato) {
        List<Cadastro> cadastros = repository.findByStatus(status);
        Exportador exportador = exportadorFactory.obterExportador(formato);
        return exportador.exportar(cadastros);
    }
}