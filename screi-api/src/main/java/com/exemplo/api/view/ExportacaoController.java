package com.exemplo.api.view;

import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.service.ExportacaoService;
import java.time.LocalDate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsável pelo endpoint de exportação de dados (RF013).
 * Mapeado conforme diagrama de classes UML (+exportar()).
 */
@RestController
@RequestMapping("/api/exportacao")
public class ExportacaoController {

    private final ExportacaoService exportacaoService;

    public ExportacaoController(ExportacaoService exportacaoService) {
        this.exportacaoService = exportacaoService;
    }

    /**
     * GET /api/exportacao (padrão: APROVADO) ou /api/exportacao?status=...
     * Baixa o arquivo consolidado em formato XLSX conforme especificado no RF013.
     */
    @GetMapping
    public ResponseEntity<byte[]> exportar(@RequestParam(defaultValue = "APROVADO") StatusCadastro status) {
        String nome = "cadastros-" + status.name().toLowerCase() + "-" + LocalDate.now() + ".xlsx";
        MediaType mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .contentType(mediaType)
                .body(exportacaoService.gerarArquivo(status));
    }
}
