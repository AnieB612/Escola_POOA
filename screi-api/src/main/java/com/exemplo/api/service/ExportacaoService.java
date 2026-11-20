package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável pela geração e download do arquivo de exportação de cadastros (RF013).
 * Utiliza o Exportador (ExportadorXlsx) conforme o diagrama de classes UML.
 */
@Service
@Transactional(readOnly = true)
public class ExportacaoService {

    private final CadastroRepository repository;
    private final Exportador exportador;

    public ExportacaoService(CadastroRepository repository, Exportador exportador) {
        this.repository = repository;
        this.exportador = exportador;
    }

    /**
     * Gera o arquivo de exportação em formato XLSX consolidando os dados dos cadastros aprovados/selecionados.
     * Conforme diagrama de classes UML (+gerarArquivo()).
     */
    public byte[] gerarArquivo(StatusCadastro status) {
        List<Cadastro> cadastros = repository.findByStatus(status);
        return exportador.exportar(cadastros);
    }

    /**
     * Método alternativo (+baixarArquivo()) conforme diagrama de componentes/arquitetura.
     */
    public byte[] baixarArquivo(StatusCadastro status) {
        return gerarArquivo(status);
    }
}
