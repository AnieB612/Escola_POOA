package com.exemplo.api.view;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.Endereco;
import com.exemplo.api.service.CadastroService;
import com.exemplo.api.service.SalvarEtapaRequest;
import com.exemplo.api.service.StatusResponse;
import com.exemplo.api.service.ViaCepService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Rotas usadas pelo responsável para preencher e acompanhar o cadastro. */
@RestController
@RequestMapping("/api/cadastros")
public class CadastroController {

    private final CadastroService cadastroService;
    private final ViaCepService viaCepService;

    public CadastroController(CadastroService cadastroService, ViaCepService viaCepService) {
        this.cadastroService = cadastroService;
        this.viaCepService = viaCepService;
    }

    /** POST /api/cadastros: cria o cadastro (rascunho) já com a primeira etapa. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cadastro criar(@RequestBody SalvarEtapaRequest dados) {
        return cadastroService.salvarEtapa(null, dados);
    }

    /** PUT /api/cadastros/{id}: grava mais uma etapa do formulário. */
    @PutMapping("/{id}")
    public Cadastro salvarEtapa(@PathVariable Long id, @RequestBody SalvarEtapaRequest dados) {
        return cadastroService.salvarEtapa(id, dados);
    }

    /** POST /api/cadastros/{id}/enviar: manda para a triagem. */
    @PostMapping("/{id}/enviar")
    public Cadastro enviar(@PathVariable Long id) {
        return cadastroService.enviar(id);
    }

    /** GET /api/cadastros/{id}/status */
    @GetMapping("/{id}/status")
    public StatusResponse consultarStatus(@PathVariable Long id) {
        return cadastroService.consultarStatus(id);
    }

    /** GET /api/cadastros ou /api/cadastros?usuarioId=1 */
    @GetMapping
    public List<Cadastro> listar(@RequestParam(required = false) Long usuarioId) {
        return cadastroService.listar(usuarioId);
    }

    /** GET /api/cadastros/{id} */
    @GetMapping("/{id}")
    public Cadastro buscar(@PathVariable Long id) {
        return cadastroService.buscar(id);
    }

    /** DELETE /api/cadastros/{id}: só rascunhos. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        cadastroService.excluir(id);
    }

    /** GET /api/cadastros/cep/{cep}: preenche o endereço automaticamente. */
    @GetMapping("/cep/{cep}")
    public Endereco buscarEndereco(@PathVariable String cep) {
        return viaCepService.buscarEndereco(cep);
    }
}
