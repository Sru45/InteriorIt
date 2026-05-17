import ExcelJS from 'exceljs';
import { generateHeaderImage } from './headerGenerator';

export const exportToExcel = async (estimate, items, ownerDetails, fileName = 'Estimate') => {
  const showHsn = estimate.showHsn;
  const imageBase64 = await generateHeaderImage(ownerDetails);
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Estimate');

  // Insert the beautifully rendered Canvas Image
  const imageId = workbook.addImage({ base64: base64Data, extension: 'png' });
  
  sheet.addRow(); sheet.addRow(); sheet.addRow(); sheet.addRow(); sheet.addRow();
  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 30;
  sheet.getRow(3).height = 30;
  sheet.getRow(4).height = 30;
  sheet.getRow(5).height = 30;
  sheet.mergeCells(showHsn ? 'A1:H5' : 'A1:G5');
  
  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    br: { col: showHsn ? 8 : 7, row: 5 }
  });

  // Client Info
  sheet.getCell('A7').value = `Client Name: ${estimate.client?.name || ''}`;
  sheet.getCell('A8').value = `GSTIN: ${estimate.client?.gst || ''}`;
  sheet.getCell('A9').value = `Address: ${estimate.client?.address || ''}`;

  sheet.getCell('A7').font = { name: 'Times New Roman', size: 12 };
  sheet.getCell('A8').font = { name: 'Times New Roman', size: 12 };
  sheet.getCell('A9').font = { name: 'Times New Roman', size: 12 };

  // Invoice Info
  const rightColStart = showHsn ? 'F' : 'E';
  const rightColMid = showHsn ? 'G' : 'F';
  const rightColEnd = showHsn ? 'H' : 'G';
  
  sheet.getCell(`${rightColStart}7`).value = 'Tax';
  sheet.getCell(`${rightColStart}7`).font = { name: 'Times New Roman', size: 12, bold: true };
  
  sheet.getCell(`${rightColMid}7`).value = 'Invoice No';
  sheet.getCell(`${rightColMid}7`).font = { name: 'Times New Roman', size: 12, underline: true };
  sheet.getCell(`${rightColMid}7`).alignment = { horizontal: 'right' };
  
  sheet.getCell(`${rightColEnd}7`).value = estimate.invoiceNo || '';
  sheet.getCell(`${rightColEnd}7`).font = { name: 'Times New Roman', size: 12 };
  sheet.getCell(`${rightColEnd}7`).alignment = { horizontal: 'right' };
  
  sheet.getCell(`${rightColMid}8`).value = 'Date';
  sheet.getCell(`${rightColMid}8`).font = { name: 'Times New Roman', size: 12 };
  sheet.getCell(`${rightColMid}8`).alignment = { horizontal: 'right' };
  
  let dateStr = estimate.date || '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  sheet.getCell(`${rightColEnd}8`).value = dateStr;
  sheet.getCell(`${rightColEnd}8`).font = { name: 'Times New Roman', size: 12 };
  sheet.getCell(`${rightColEnd}8`).alignment = { horizontal: 'right' };

  // Columns Width
  const cols = [
    { key: 'col1', width: 8 },
    { key: 'col2', width: 40 },
  ];
  if (showHsn) cols.push({ key: 'col_hsn', width: 12 });
  cols.push(
    { key: 'col3', width: 20 },
    { key: 'col4', width: 8 },
    { key: 'col5', width: 10 },
    { key: 'col6', width: 15 },
    { key: 'col7', width: 22 }
  );
  sheet.columns = cols;

  // Table Headers
  const tableHeaders = ['#', 'Items & Description'];
  if (showHsn) tableHeaders.push('Hsn/Sac');
  tableHeaders.push('Size', 'Qty', 'Sqft', 'Rate', 'Amount');
  const headerRow = sheet.getRow(11);
  tableHeaders.forEach((th, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = th;
    cell.font = { name: 'Times New Roman', size: 12, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; // Light Grey
    cell.border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
    cell.alignment = { horizontal: 'center' };
  });

  // Make headers repeat automatically on every printed page!
  sheet.pageSetup.printTitlesRow = '11:11';

  // Table Data
  let startRow = 12;
  let itemNum = 1;
  let rowCount = 0;
  let rowBreaks = [];

  items.forEach((item) => {
    const row = sheet.getRow(startRow);
    row.font = { name: 'Times New Roman', size: 12 };
    
    if (item.isSection) {
      row.getCell(2).value = item.sectionName;
      row.getCell(2).font = { name: 'Times New Roman', size: 12, bold: true };
      
      for (let c = 1; c <= (showHsn ? 8 : 7); c++) {
        row.getCell(c).border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
      }
    } else {
      row.getCell(1).value = itemNum++;
      row.getCell(2).value = item.itemName || '';
      
      let colIdx = 3;
      if (showHsn) {
        row.getCell(colIdx).value = item.hsn || '';
        row.getCell(colIdx).alignment = { horizontal: 'center' };
        colIdx++;
      }
      
      row.getCell(colIdx++).value = item.length || item.width ? `${item.length || 0}  x  ${item.width || 0}` : '';
      row.getCell(colIdx++).value = Number(item.qty || 0);
      row.getCell(colIdx++).value = Number((item.sqft || 0).toFixed(2));
      
      const rateCell = row.getCell(colIdx++);
      rateCell.value = Number(item.rate || 0);
      rateCell.numFmt = '[$₹-en-IN] #,##0.00';
      
      const amountCell = row.getCell(colIdx++);
      amountCell.value = Number((item.amount || 0).toFixed(2));
      amountCell.numFmt = '[$₹-en-IN] #,##0.00';
      
      for (let c = 1; c <= (showHsn ? 8 : 7); c++) {
        row.getCell(c).border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
        
        if (c === 1 || c === (showHsn ? 4 : 3) || c === (showHsn ? 5 : 4) || c === (showHsn ? 6 : 5)) {
          row.getCell(c).alignment = { horizontal: 'center' };
        }
      }
    }
    startRow++;
  });

  // Total Row
  const totalRow = sheet.getRow(startRow);
  totalRow.font = { name: 'Times New Roman', size: 12, bold: true };
  
  const totalCol = showHsn ? 7 : 6;
  const amountCol = showHsn ? 8 : 7;
  
  const totalLabel = totalRow.getCell(totalCol);
  totalLabel.value = 'Total';
  totalLabel.alignment = { horizontal: 'right' };
  totalLabel.border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };

  const totalAmount = totalRow.getCell(amountCol);
  const subTotal = items.reduce((sum, item) => sum + (item.isSection ? 0 : (item.amount || 0)), 0);
  totalAmount.value = Number(subTotal.toFixed(2));
  totalAmount.numFmt = '[$₹-en-IN] #,##0.00';
  totalAmount.border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };

  let extraRowOffset = 0;
  if (showHsn) {
    const cgst = subTotal * 0.09;
    const sgst = subTotal * 0.09;
    
    const cgstRow = sheet.getRow(startRow + 1);
    cgstRow.getCell(totalCol).value = 'CGST -9%';
    cgstRow.getCell(totalCol).font = { name: 'Times New Roman', size: 11, bold: true };
    cgstRow.getCell(totalCol).alignment = { horizontal: 'right' };
    cgstRow.getCell(amountCol).value = Number(cgst.toFixed(2));
    cgstRow.getCell(amountCol).numFmt = '[$₹-en-IN] #,##0.00';
    
    const sgstRow = sheet.getRow(startRow + 2);
    sgstRow.getCell(totalCol).value = 'SGST -9%';
    sgstRow.getCell(totalCol).font = { name: 'Times New Roman', size: 11, bold: true };
    sgstRow.getCell(totalCol).alignment = { horizontal: 'right' };
    sgstRow.getCell(amountCol).value = Number(sgst.toFixed(2));
    sgstRow.getCell(amountCol).numFmt = '[$₹-en-IN] #,##0.00';
    
    const finalRow = sheet.getRow(startRow + 3);
    finalRow.getCell(totalCol).value = 'TOTAL AMOUNT';
    finalRow.getCell(totalCol).font = { name: 'Times New Roman', size: 12, bold: true };
    finalRow.getCell(totalCol).alignment = { horizontal: 'right' };
    finalRow.getCell(amountCol).value = Number(estimate.totalAmount.toFixed(2));
    finalRow.getCell(amountCol).numFmt = '[$₹-en-IN] #,##0.00';
    
    extraRowOffset = 3;
  }

  // Bank Details
  if (ownerDetails?.acName || ownerDetails?.bankName || ownerDetails?.acNo || ownerDetails?.ifsc) {
    let bankRowIdx = startRow + 2 + extraRowOffset;
    
    const fields = [
      { label: 'A/C Holders Name', value: ownerDetails?.acName || '' },
      { label: 'Bank Name', value: ownerDetails?.bankName || '' },
      { label: 'A/c No.', value: ownerDetails?.acNo || '' },
      { label: 'IFSC Code', value: ownerDetails?.ifsc || '' }
    ];
    
    fields.forEach(field => {
      const row = sheet.getRow(bankRowIdx);
      sheet.mergeCells(`A${bankRowIdx}:B${bankRowIdx}`); // Labels
      sheet.mergeCells(`C${bankRowIdx}:D${bankRowIdx}`); // Values
      
      const labelCell = row.getCell(1);
      labelCell.value = field.label;
      labelCell.font = { name: 'Times New Roman', size: 11, bold: true };
      
      const valueCell = row.getCell(3);
      valueCell.value = field.value;
      valueCell.font = { name: 'Times New Roman', size: 11 };
      
      for (let c = 1; c <= 4; c++) {
        row.getCell(c).border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
      }
      
      bankRowIdx++;
    });
  }

  // Signature Block
  const sigCol = showHsn ? 8 : 7;
  const sigRowStart = sheet.getRow(startRow + 2 + extraRowOffset);
  const sigTopCell = sigRowStart.getCell(sigCol);
  sigTopCell.value = 'For, INTERIOR IT';
  sigTopCell.font = { name: 'Times New Roman', size: 11, bold: true };
  sigTopCell.alignment = { horizontal: 'right' };
  
  const sigBottomRow = sheet.getRow(startRow + 5 + extraRowOffset);
  const sigBottomCell = sigBottomRow.getCell(sigCol);
  sigBottomCell.value = 'Authorised signatory';
  sigBottomCell.font = { name: 'Times New Roman', size: 11 };
  sigBottomCell.alignment = { horizontal: 'right' };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
