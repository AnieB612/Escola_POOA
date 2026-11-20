package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.repository.CadastroRepository;
import jakarta.validation.Validator;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CadastroService {

    private final CadastroRepository repository;
    private final UsuarioService usuarioService;
    private final Validator validator;

    public CadastroService(CadastroRepository repository, UsuarioService usuarioService, Validator validator) {
        this.repository = repository;
        this.usuarioService = usuarioService;
        this.validator = validator;
    }

    /**
     * Cria um cadastro (quando id é null) ou grava uma etapa de um cadastro existente.
     * Só pode editar enquanto está em RASCUNHO ou COM_PENDENCIA.
     */
    public Cadastro salvarEtapa(Long id, SalvarEtapaRequest dados) {
        Cadastro cadastro;
        if (id == null) {
            if (dados.usuarioId() == null) {
                throw new NegocioException(HttpStatus.BAD_REQUEST, "Informe o usuarioId para criar o cadastro");
            }
            cadastro = new Cadastro();
            cadastro.setUsuario(usuarioService.buscar(dados.usuarioId()));
        } else {
            cadastro = buscar(id);
            exigirStatus(cadastro, "editar", StatusCadastro.RASCUNHO, StatusCadastro.COM_PENDENCIA);
        }

        if (dados.aluno() != null) {
            cadastro.setAluno(dados.aluno());
        }
        if (dados.responsaveis() != null) {
            cadastro.getResponsaveis().clear();
            cadastro.getResponsaveis().addAll(dados.responsaveis());
        }
        if (dados.contatosEmergencia() != null) {
            cadastro.getContatosEmergencia().clear();
            cadastro.getContatosEmergencia().addAll(dados.contatosEmergencia());
        }
        return repository.save(cadastro);
    }

    /** Envia o cadastro para a triagem. Antes confere se todos os campos obrigatórios foram preenchidos. */
    public Cadastro enviar(Long id) {
        Cadastro cadastro = buscar(id);
        exigirStatus(cadastro, "enviar", StatusCadastro.RASCUNHO, StatusCadastro.COM_PENDENCIA);

        List<String> pendencias = validator.validate(cadastro).stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .sorted()
                .toList();
        if (!pendencias.isEmpty()) {
            throw new NegocioException(HttpStatus.BAD_REQUEST, "O cadastro está incompleto", pendencias);
        }

        cadastro.enviar();
        return cadastro;
    }

    @Transactional(readOnly = true)
    public StatusResponse consultarStatus(Long id) {
        return StatusResponse.de(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<Cadastro> listar(Long usuarioId) {
        return usuarioId == null ? repository.findAll() : repository.findByUsuarioId(usuarioId);
    }

    @Transactional(readOnly = true)
    public Cadastro buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> NegocioException.naoEncontrado("Cadastro " + id + " não encontrado"));
    }

    /** Só rascunhos podem ser excluídos. */
    public void excluir(Long id) {
        Cadastro cadastro = buscar(id);
        exigirStatus(cadastro, "excluir", StatusCadastro.RASCUNHO);
        repository.delete(cadastro);
    }

    static void exigirStatus(Cadastro cadastro, String acao, StatusCadastro... permitidos) {
        for (StatusCadastro s : permitidos) {
            if (cadastro.getStatus() == s) {
                return;
            }
        }
        throw new NegocioException(HttpStatus.CONFLICT,
                "Não é possível " + acao + " um cadastro com status " + cadastro.getStatus());
    }
}
