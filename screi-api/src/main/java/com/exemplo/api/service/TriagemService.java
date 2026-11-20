package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TriagemService {

    private static final StatusCadastro[] NA_FILA = {StatusCadastro.ENVIADO, StatusCadastro.EM_ANALISE};

    private final CadastroRepository repository;
    private final CadastroService cadastroService;

    public TriagemService(CadastroRepository repository, CadastroService cadastroService) {
        this.repository = repository;
        this.cadastroService = cadastroService;
    }

    @Transactional(readOnly = true)
    public List<Cadastro> listarFila() {
        return repository.findByStatusInOrderByDataEnvioAsc(List.of(NA_FILA));
    }

    public Cadastro iniciarAnalise(Long id) {
        Cadastro cadastro = cadastroService.buscar(id);
        CadastroService.exigirStatus(cadastro, "iniciar análise de", StatusCadastro.ENVIADO);
        cadastro.iniciarAnalise();
        return cadastro;
    }

    public Cadastro aprovar(Long id) {
        Cadastro cadastro = cadastroService.buscar(id);
        CadastroService.exigirStatus(cadastro, "aprovar", NA_FILA);
        cadastro.aprovar();
        return cadastro;
    }

    public Cadastro reprovar(Long id, String justificativa) {
        if (justificativa == null || justificativa.isBlank()) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "Informe a justificativa da reprovação");
        }
        Cadastro cadastro = cadastroService.buscar(id);
        CadastroService.exigirStatus(cadastro, "reprovar", NA_FILA);
        cadastro.reprovar(justificativa);
        return cadastro;
    }
}