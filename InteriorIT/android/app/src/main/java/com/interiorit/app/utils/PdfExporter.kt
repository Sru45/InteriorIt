package com.interiorit.app.utils

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Environment
import com.interiorit.app.data.model.Estimate
import com.interiorit.app.data.model.Item
import java.io.File
import java.io.FileOutputStream

object PdfExporter {
    fun exportToPdf(context: Context, estimate: Estimate, items: List<Item>): File? {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 size
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val paint = Paint()
        paint.color = Color.BLACK
        paint.textSize = 12f

        // Dummy Header Header
        paint.color = Color.RED
        canvas.drawRect(0f, 0f, 595f, 100f, paint)

        paint.color = Color.WHITE
        paint.textSize = 24f
        paint.isFakeBoldText = true
        canvas.drawText("INTERIOR IT", 50f, 50f, paint)

        paint.textSize = 12f
        paint.isFakeBoldText = false
        canvas.drawText("Babu Suthar", 400f, 30f, paint)
        canvas.drawText("+91 97234 65421", 400f, 45f, paint)
        canvas.drawText("Vasad-396001 Gujarat", 400f, 60f, paint)
        canvas.drawText("GSTIN: 24AAAAA0000A1Z5", 400f, 75f, paint)

        paint.color = Color.BLACK
        var y = 130f
        
        // Client Info
        canvas.drawText("Client Name: ${estimate.clientId?.name ?: ""}", 50f, y)
        y += 20f
        canvas.drawText("Mobile: ${estimate.clientId?.mobile ?: ""}", 50f, y)
        y += 20f
        canvas.drawText("Address: ${estimate.clientId?.address ?: ""}", 50f, y)
        y += 40f

        // Table Header
        paint.isFakeBoldText = true
        canvas.drawText("#", 50f, y)
        canvas.drawText("Items & Description", 80f, y)
        canvas.drawText("Size", 250f, y)
        canvas.drawText("Qty", 320f, y)
        canvas.drawText("Sqft", 370f, y)
        canvas.drawText("Rate", 430f, y)
        canvas.drawText("Amount", 500f, y)
        y += 20f
        paint.isFakeBoldText = false

        // Table Data
        items.forEachIndexed { index, item ->
            canvas.drawText((index + 1).toString(), 50f, y)
            canvas.drawText(item.itemName, 80f, y)
            canvas.drawText("${item.length} x ${item.width}", 250f, y)
            canvas.drawText(item.qty.toString(), 320f, y)
            canvas.drawText(String.format("%.2f", item.sqft), 370f, y)
            canvas.drawText("Rs. ${item.rate}", 430f, y)
            canvas.drawText("Rs. ${String.format("%.2f", item.amount)}", 500f, y)
            y += 20f
        }

        y += 20f
        paint.isFakeBoldText = true
        canvas.drawText("Total:", 430f, y)
        canvas.drawText("Rs. ${String.format("%.2f", estimate.totalAmount)}", 500f, y)

        pdfDocument.finishPage(page)

        return try {
            val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            dir.mkdirs()
            val file = File(dir, "Estimate_${System.currentTimeMillis()}.pdf")
            FileOutputStream(file).use { fos ->
                pdfDocument.writeTo(fos)
            }
            pdfDocument.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            pdfDocument.close()
            null
        }
    }
}
