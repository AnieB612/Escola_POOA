package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Estratégia concreta de exportação em planilha XLSX com Apache POI (GoF Strategy).
 * Atende ao requisito funcional RF013 e ao diagrama de classes UML.
 */
@Primary
@Component("exportadorXlsx")
public class ExportadorXlsx implements Exportador {

    @Override
    public byte[] exportar(List<Cadastro> cadastros) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cadastros");

            // Estilização do cabeçalho
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Cabeçalho unificado
            String[] cabecalho = CadastroLinhaRelatorio.CABECALHO;
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < cabecalho.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(cabecalho[col]);
                cell.setCellStyle(headerStyle);
            }

            // Preenchimento dos dados com DTO compartilhado (DRY)
            if (cadastros != null) {
                int rowIdx = 1;
                for (Cadastro c : cadastros) {
                    Row row = sheet.createRow(rowIdx++);
                    Object[] valores = CadastroLinhaRelatorio.de(c).toArray();
                    for (int col = 0; col < valores.length; col++) {
                        row.createCell(col).setCellValue(valores[col] != null ? valores[col].toString() : "");
                    }
                }
            }

            for (int col = 0; col < cabecalho.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar arquivo XLSX de exportação", e);
        }
    }
}
