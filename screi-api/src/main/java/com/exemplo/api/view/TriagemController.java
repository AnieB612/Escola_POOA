package com.exemplo.api.view;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.service.TriagemService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Rotas usadas pelo funcionário para analisar os cadastros enviados. */
@RestController
@RequestMapping("/api/triagem")
public class TriagemController {

    private final TriagemService triagemService;

    public TriagemController(TriagemService triagemService) {
        this.triagemService = triagemService;
    }

    /** GET /api/triagem/fila */
    @GetMapping("/fila")
    public List<Cadastro> listarFila() {
        return triagemService.listarFila();
    }

    /** POST /api/triagem/{id}/aprovar */
    @PostMapping("/{id}/aprovar")
    public Cadastro aprovar(@PathVariable Long id) {
        return triagemService.aprovar(id);
    }

    /** POST /api/triagem/{id}/reprovar  corpo: { "justificativa": "..." } */
    @PostMapping("/{id}/reprovar")
    public Cadastro reprovar(@PathVariable Long id, @RequestBody ReprovarRequest dados) {
        return triagemService.reprovar(id, dados.justificativa());
    }

    public record ReprovarRequest(String justificativa) {
    }
}
