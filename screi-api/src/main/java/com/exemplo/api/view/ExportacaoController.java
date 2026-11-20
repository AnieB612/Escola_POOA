package com.exemplo.api.view;

import com.exemplo.api.model.StatusCadastro;
import com.exemplo.api.service.ExportacaoService;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exportacao")
public class ExportacaoController {

    private final ExportacaoService exportacaoService;

    public ExportacaoController(ExportacaoService exportacaoService) {
        this.exportacaoService = exportacaoService;
    }

    @GetMapping
    public ResponseEntity<byte[]> exportar(
            @RequestParam(defaultValue = "APROVADO") StatusCadastro status,
            @RequestParam(defaultValue = "XLSX") String formato) {

        String ext = "csv".equalsIgnoreCase(formato) ? "csv" : "xlsx";
        String nome = "cadastros-" + status.name().toLowerCase() + "-" + LocalDate.now() + "." + ext;

        MediaType mediaType = "csv".equalsIgnoreCase(ext)
                ? new MediaType("text", "csv", StandardCharsets.UTF_8)
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
                .contentType(mediaType)
                .body(exportacaoService.gerarArquivo(status, formato));
    }
}