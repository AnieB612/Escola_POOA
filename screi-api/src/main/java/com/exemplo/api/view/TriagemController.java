package com.exemplo.api.view;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.service.TriagemService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/triagem")
public class TriagemController {

    private final TriagemService triagemService;

    public TriagemController(TriagemService triagemService) {
        this.triagemService = triagemService;
    }

    @GetMapping("/fila")
    public List<Cadastro> listarFila() {
        return triagemService.listarFila();
    }

    @PostMapping("/{id}/analisar")
    public Cadastro iniciarAnalise(@PathVariable Long id) {
        return triagemService.iniciarAnalise(id);
    }

    @PostMapping("/{id}/aprovar")
    public Cadastro aprovar(@PathVariable Long id) {
        return triagemService.aprovar(id);
    }

    @PostMapping("/{id}/reprovar")
    public Cadastro reprovar(@PathVariable Long id, @RequestBody ReprovarRequest dados) {
        return triagemService.reprovar(id, dados.justificativa());
    }

    public record ReprovarRequest(String justificativa) {
    }
}