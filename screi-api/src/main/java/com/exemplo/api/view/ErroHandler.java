package com.exemplo.api.view;

import com.exemplo.api.service.NegocioException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Transforma os erros em respostas JSON simples: { "mensagem": "...", "pendencias": [...] } */
@RestControllerAdvice
public class ErroHandler {

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<Map<String, Object>> negocio(NegocioException e) {
        return resposta(e.getStatus(), e.getMessage(), e.getPendencias());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException e) {
        List<String> pendencias = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .sorted()
                .toList();
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos", pendencias);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException e) {
        return resposta(HttpStatus.BAD_REQUEST, "JSON inválido ou com campo em formato errado", List.of());
    }

    private static ResponseEntity<Map<String, Object>> resposta(HttpStatus status, String mensagem, List<String> pendencias) {
        return ResponseEntity.status(status).body(Map.of("mensagem", mensagem, "pendencias", pendencias));
    }
}
