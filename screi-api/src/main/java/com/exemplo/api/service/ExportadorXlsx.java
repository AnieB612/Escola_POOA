package com.exemplo.api.service;

import com.exemplo.api.model.Aluno;
import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.Endereco;
import com.exemplo.api.model.Responsavel;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

/**
 * Implementação da exportação para XLSX (Excel) utilizando Apache POI.
 * Atende ao requisito RF013 e ao diagrama de classes UML.
 */
@Component
public class ExportadorXlsx implements Exportador {

    private static final String[] CABECALHO = {
        "Nº", "Status", "Data de Envio", "Aluno", "CPF do Aluno", "Data de Nascimento",
        "Logradouro", "Bairro", "Cidade", "UF", "Responsável", "Telefone", "E-mail"
    };

    @Override
    public byte[] exportar(List<Cadastro> cadastros) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cadastros");

            // Estilização do cabeçalho
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Cria linha de cabeçalho
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < CABECALHO.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(CABECALHO[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Preenche dados dos cadastros
            int rowIdx = 1;
            if (cadastros != null) {
                for (Cadastro c : cadastros) {
                    Row row = sheet.createRow(rowIdx++);

                    Aluno aluno = c.getAluno();
                    Endereco end = aluno != null ? aluno.getEndereco() : null;
                    Responsavel resp = (c.getResponsaveis() != null && !c.getResponsaveis().isEmpty())
                            ? c.getResponsaveis().get(0)
                            : null;

                    row.createCell(0).setCellValue(c.getId() != null ? c.getId() : 0);
                    row.createCell(1).setCellValue(c.getStatus() != null ? c.getStatus().name() : "");
                    row.createCell(2).setCellValue(c.getDataEnvio() != null ? c.getDataEnvio().toString() : "");
                    row.createCell(3).setCellValue(aluno != null && aluno.getNome() != null ? aluno.getNome() : "");
                    row.createCell(4).setCellValue(aluno != null && aluno.getCpf() != null ? aluno.getCpf() : "");
                    row.createCell(5).setCellValue(aluno != null && aluno.getDataNascimento() != null ? aluno.getDataNascimento().toString() : "");
                    row.createCell(6).setCellValue(end != null && end.getLogradouro() != null ? end.getLogradouro() : "");
                    row.createCell(7).setCellValue(end != null && end.getBairro() != null ? end.getBairro() : "");
                    row.createCell(8).setCellValue(end != null && end.getCidade() != null ? end.getCidade() : "");
                    row.createCell(9).setCellValue(end != null && end.getUf() != null ? end.getUf() : "");
                    row.createCell(10).setCellValue(resp != null && resp.getNome() != null ? resp.getNome() : "");
                    row.createCell(11).setCellValue(resp != null && resp.getTelefone() != null ? resp.getTelefone() : "");
                    row.createCell(12).setCellValue(resp != null && resp.getEmail() != null ? resp.getEmail() : "");
                }
            }

            for (int i = 0; i < CABECALHO.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar arquivo XLSX de exportação", e);
        }
    }
}
