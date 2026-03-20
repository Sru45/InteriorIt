package com.interiorit.app.utils

import android.content.Context
import android.os.Environment
import com.interiorit.app.data.model.Estimate
import com.interiorit.app.data.model.Item
import org.apache.poi.ss.usermodel.*
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import java.io.File
import java.io.FileOutputStream

object ExcelExporter {
    fun exportToExcel(context: Context, estimate: Estimate, items: List<Item>): File? {
        val workbook: Workbook = XSSFWorkbook()
        val sheet: Sheet = workbook.createSheet("Estimate")

        // Styles
        val headerStyle = workbook.createCellStyle().apply {
            fillForegroundColor = IndexedColors.GREY_25_PERCENT.index
            fillPattern = FillPatternType.SOLID_FOREGROUND
            setBorderBottom(BorderStyle.THIN)
            setBorderTop(BorderStyle.THIN)
            setBorderLeft(BorderStyle.THIN)
            setBorderRight(BorderStyle.THIN)
            alignment = HorizontalAlignment.CENTER
        }
        val headerFont = workbook.createFont().apply {
            bold = true
        }
        headerStyle.setFont(headerFont)

        val cellStyle = workbook.createCellStyle().apply {
            setBorderBottom(BorderStyle.THIN)
            setBorderTop(BorderStyle.THIN)
            setBorderLeft(BorderStyle.THIN)
            setBorderRight(BorderStyle.THIN)
        }
        
        val amountStyle = workbook.createCellStyle().apply {
            cloneStyleFrom(cellStyle)
            alignment = HorizontalAlignment.RIGHT
            dataFormat = workbook.createDataFormat().getFormat("₹ #,##0.00")
        }

        var rowNum = 0
        
        // --- Header Matching Design ---
        var row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("INTERIOR IT")
        
        row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("Babu Suthar | +91 97234 65421 | Vasad-396001 Gujarat")
        
        row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("GSTIN: 24AAAAA0000A1Z5   (GST Included)")
        
        rowNum++ // Blank spacer

        // Client Info
        row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("Client Name: ${estimate.clientId?.name ?: ""}")
        
        row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("Mobile: ${estimate.clientId?.mobile ?: ""}")
        
        row = sheet.createRow(rowNum++)
        row.createCell(0).setCellValue("Address: ${estimate.clientId?.address ?: ""}")
        
        rowNum++

        // Table Header
        val headers = arrayOf("#", "Items & Description", "Size", "Qty", "Sqft", "Rate", "Amount")
        val tableHeaderRow = sheet.createRow(rowNum++)
        headers.forEachIndexed { i, title ->
            val cell = tableHeaderRow.createCell(i)
            cell.setCellValue(title)
            cell.cellStyle = headerStyle
        }

        // Table Data
        items.forEachIndexed { index, item ->
            val dataRow = sheet.createRow(rowNum++)
            
            dataRow.createCell(0).apply { setCellValue((index + 1).toString()); cellStyle = cellStyle; alignment = HorizontalAlignment.CENTER }
            dataRow.createCell(1).apply { setCellValue(item.itemName); cellStyle = cellStyle }
            dataRow.createCell(2).apply { setCellValue("${item.length} x ${item.width}"); cellStyle = cellStyle; alignment = HorizontalAlignment.CENTER }
            dataRow.createCell(3).apply { setCellValue(item.qty.toDouble()); cellStyle = cellStyle; alignment = HorizontalAlignment.CENTER }
            dataRow.createCell(4).apply { setCellValue(item.sqft); cellStyle = cellStyle; alignment = HorizontalAlignment.CENTER }
            dataRow.createCell(5).apply { setCellValue("₹ ${item.rate}"); cellStyle = cellStyle; alignment = HorizontalAlignment.RIGHT }
            dataRow.createCell(6).apply { setCellValue(item.amount); cellStyle = amountStyle }
        }

        // Total Row
        val totalRow = sheet.createRow(rowNum++)
        totalRow.createCell(5).apply { setCellValue("Total"); cellStyle = headerStyle }
        totalRow.createCell(6).apply { setCellValue(estimate.totalAmount); cellStyle = amountStyle }

        sheet.setColumnWidth(1, 256 * 30) // Items desc width
        
        return try {
            val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            dir.mkdirs()
            val file = File(dir, "Estimate_${System.currentTimeMillis()}.xlsx")
            FileOutputStream(file).use { fos ->
                workbook.write(fos)
            }
            workbook.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
