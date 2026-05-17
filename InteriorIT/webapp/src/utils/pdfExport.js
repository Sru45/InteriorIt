import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateHeaderImage } from './headerGenerator';
import { robotoRegular, robotoBold } from './fonts';

export const exportToPdf = async (estimate, items, ownerDetails, fileName = 'Estimate') => {
  const imageBase64 = await generateHeaderImage(ownerDetails);
  const doc = new jsPDF();

  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBold);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  // Draw Exact Match Image Header
  doc.addImage(imageBase64, 'PNG', 0, 0, 210, 40);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('Roboto', 'normal');
  let y = 45;

  // Client Details
  doc.text(`Client Name: ${estimate.client?.name || ''}`, 15, y);
  y += 7;
  doc.text(`GSTIN: ${estimate.client?.gst || ''}`, 15, y);
  y += 7;
  doc.text(`Address: ${estimate.client?.address || ''}`, 15, y);
  // Right side Info
  const rightX = 195;
  doc.setFont('Roboto', 'bold');
  doc.text('Tax', 130, 45);
  
  doc.setFont('Roboto', 'normal');
  doc.text('Invoice No', 160, 45, null, null, 'right');
  doc.text(estimate.invoiceNo || '', rightX, 45, null, null, 'right');
  
  doc.setLineWidth(0.2);
  doc.line(140, 46, 160, 46);
  
  doc.text('Date', 160, 52, null, null, 'right');
  
  let dateStr = estimate.date || '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  doc.text(dateStr, rightX, 52, null, null, 'right');
  
  y += 10;

  const showHsn = estimate.showHsn;

  // Table
  const tableColumn = ["#", "Items & Description"];
  if (showHsn) tableColumn.push("Hsn/Sac");
  tableColumn.push("Size", "Qty", "Sqft", "Rate", "Amount");
  const tableRows = [];

  let itemNum = 1;

  items.forEach((item) => {
    if (item.isSection) {
      const row = ['', item.sectionName || ''];
      if (showHsn) row.push('');
      row.push('', '', '', '', '');
      tableRows.push(row);
    } else {
      const row = [
        itemNum++,
        item.itemName || ''
      ];
      if (showHsn) row.push(item.hsn || '');
      row.push(
        item.length || item.width ? `${item.length || 0} x ${item.width || 0}` : '',
        item.qty || '',
        item.sqft ? item.sqft.toFixed(2) : '0.00',
        `₹ ${(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`,
        `₹ ${(item.amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`
      );
      tableRows.push(row);
    }
  });

  const rateWidth = showHsn ? 28 : 34;
  const amountWidth = showHsn ? 36 : 42;
  const sizeWidth = showHsn ? 20 : 25;
  const qtyWidth = showHsn ? 12 : 15;
  
  const colStyles = { 0: { halign: 'center', cellWidth: 14 } };
  let colIndex = 2;
  if (showHsn) colStyles[colIndex++] = { halign: 'center', cellWidth: 18 };
  colStyles[colIndex++] = { halign: 'center', cellWidth: sizeWidth };
  colStyles[colIndex++] = { halign: 'center', cellWidth: qtyWidth };
  colStyles[colIndex++] = { halign: 'center', cellWidth: 15 };
  colStyles[colIndex++] = { cellWidth: rateWidth };
  colStyles[colIndex++] = { cellWidth: amountWidth };

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: 'grid',
    margin: { right: 15, left: 15 },
    headStyles: { fillColor: [217, 217, 217], textColor: [0, 0, 0], fontStyle: 'bold', font: 'Roboto' },
    styles: { font: 'Roboto', fontSize: 11, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0,0,0], lineWidth: 0.1 },
    columnStyles: colStyles,
    didParseCell: function (data) {
      if (data.section === 'body') {
        const itemIndex = data.row.index;
        const mappedItem = items[itemIndex];
        if (mappedItem && mappedItem.isSection) {
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
          }
        }
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY;
  
  // Check if we need to add a new page before drawing the total box and bank details
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  if (finalY + 75 > pageHeight - 15) {
    doc.addPage();
    finalY = 20;
  }
  
  // Total Row manually drawn for exact layout mimicking
  const amountX = 210 - 15 - amountWidth;
  const rateX = amountX - rateWidth;
  
  const subTotal = items.reduce((sum, item) => sum + (item.isSection ? 0 : (item.amount || 0)), 0);
  
  doc.setFillColor(255, 255, 255);
  doc.rect(rateX, finalY, rateWidth, 8, 'FD'); // Rate col width exactly aligned under row
  doc.rect(amountX, finalY, amountWidth, 8, 'FD'); // Amount col width precisely filling the boundary
  
  doc.setFont('Roboto', 'bold');
  doc.text('TOTAL', amountX - 5, finalY + 5.5, null, null, 'right');
  
  // Close the table grid cleanly
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);
  doc.rect(rateX, finalY, rateWidth, 8, 'S');
  doc.rect(amountX, finalY, amountWidth, 8, 'S');

  doc.setTextColor(0, 0, 0);
  doc.text(`₹ ${subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, amountX + amountWidth - 3, finalY + 5.5, null, null, 'right');
  
  finalY += 8;

  if (showHsn) {
    const cgst = subTotal * 0.09;
    const sgst = subTotal * 0.09;
    
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    
    finalY += 6;
    doc.text('CGST -9%', amountX - 5, finalY, null, null, 'right');
    doc.text(`₹ ${cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, amountX + amountWidth - 3, finalY, null, null, 'right');
    
    finalY += 6;
    doc.text('SGST -9%', amountX - 5, finalY, null, null, 'right');
    doc.text(`₹ ${sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, amountX + amountWidth - 3, finalY, null, null, 'right');
    
    finalY += 6;
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT', amountX - 5, finalY, null, null, 'right');
    doc.text(`₹ ${estimate.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, amountX + amountWidth - 3, finalY, null, null, 'right');
  }

  // Bank Details Table
  if (ownerDetails?.acName || ownerDetails?.bankName || ownerDetails?.acNo || ownerDetails?.ifsc) {
    const bankStartY = finalY + 10;
    autoTable(doc, {
      body: [
        [{ content: 'A/C Holders Name', styles: { fontStyle: 'bold' } }, ownerDetails?.acName || ''],
        [{ content: 'Bank Name', styles: { fontStyle: 'bold' } }, ownerDetails?.bankName || ''],
        [{ content: 'A/c No.', styles: { fontStyle: 'bold' } }, ownerDetails?.acNo || ''],
        [{ content: 'IFSC Code', styles: { fontStyle: 'bold' } }, ownerDetails?.ifsc || '']
      ],
      startY: bankStartY,
      theme: 'grid',
      margin: { left: 15 },
      tableWidth: 90,
      styles: { font: 'Roboto', fontSize: 10, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0,0,0], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 55 }
      }
    });
  }

  // Signature Block
  const sigY = finalY + 10;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(11);
  doc.text('For, INTERIOR IT', 195, sigY, null, null, 'right');
  
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(10);
  doc.text('Authorised signatory', 195, sigY + 20, null, null, 'right');

  doc.save(`${fileName}.pdf`);
};
