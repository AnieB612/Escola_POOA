package com.exemplo.api.view;

import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.service.ExportacaoService;
import java.time.LocalDate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exportacao")
public class ExportacaoController {

    private final ExportacaoService exportacaoService;

    public ExportacaoController(ExportacaoService exportacaoService) {
        this.exportacaoService = exportacaoService;
    }

    /** GET /api/exportacao (aprovados) ou /api/exportacao?status=ENVIADO: baixa um arquivo CSV. */
    @GetMapping
    public ResponseEntity<byte[]> exportar(@RequestParam(defaultValue = "APROVADO") StatusCadastro status) {
        String nome = "cadastros-" + status.name().toLowerCase() + "-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
                .body(exportacaoService.baixarArquivo(status));
    }
}
