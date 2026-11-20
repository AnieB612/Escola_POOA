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
 * Atua como Facade na camada de apresentação (GoF Facade).
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
     * GET /api/exportacao (padrão: APROVADO, formato XLSX)
     * Suporta também formato CSV via parâmetro opcional ?formato=csv
     * Baixa o arquivo consolidado conforme RF013.
     */
    @GetMapping
    public ResponseEntity<byte[]> exportar(
            @RequestParam(defaultValue = "APROVADO") StatusCadastro status,
            @RequestParam(defaultValue = "XLSX") String formato) {

        String ext = "csv".equalsIgnoreCase(formato) ? "csv" : "xlsx";
        String nome = "cadastros-" + status.name().toLowerCase() + "-" + LocalDate.now() + "." + ext;

        MediaType mediaType = "csv".equalsIgnoreCase(ext)
                ? new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8)
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .contentType(mediaType)
                .body(exportacaoService.gerarArquivo(status, formato));
    }
}
