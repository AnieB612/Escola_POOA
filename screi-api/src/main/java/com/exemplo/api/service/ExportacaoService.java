package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável pela geração e download do arquivo de exportação de cadastros (RF013).
 * Aplica os princípios SOLID:
 * - SRP: Responsável exclusivamente pela coordenação da exportação de dados consolidados.
 * - OCP e DIP: Depende da abstração Exportador / ExportadorFactory, permitindo novos formatos sem alterar este serviço.
 * - LSP: Utiliza qualquer implementação de Exportador de forma transparente.
 */
@Service
@Transactional(readOnly = true)
public class ExportacaoService {

    private final CadastroRepository repository;
    private final ExportadorFactory exportadorFactory;

    public ExportacaoService(CadastroRepository repository, ExportadorFactory exportadorFactory) {
        this.repository = repository;
        this.exportadorFactory = exportadorFactory;
    }

    /**
     * Gera o arquivo de exportação consolidando os dados dos cadastros (+gerarArquivo()).
     * Conforme diagrama de classes UML. Por padrão exporta no formato XLSX.
     */
    public byte[] gerarArquivo(StatusCadastro status) {
        return gerarArquivo(status, "XLSX");
    }

    /**
     * Gera o arquivo no formato solicitado (GoF Strategy via Factory).
     */
    public byte[] gerarArquivo(StatusCadastro status, String formato) {
        List<Cadastro> cadastros = repository.findByStatus(status);
        Exportador exportador = exportadorFactory.obterExportador(formato);
        return exportador.exportar(cadastros);
    }

    /**
     * Alias de consulta (+baixarArquivo()) conforme diagrama de arquitetura.
     */
    public byte[] baixarArquivo(StatusCadastro status) {
        return gerarArquivo(status);
    }
}
