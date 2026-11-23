package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
public class ExportadorXlsx implements Exportador {

    @Override
    public String formato() {
        return "XLSX";
    }

    @Override
    public byte[] exportar(List<Cadastro> cadastros) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cadastros");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] cabecalho = CadastroLinhaRelatorio.CABECALHO;
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < cabecalho.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(cabecalho[col]);
                cell.setCellStyle(headerStyle);
            }

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