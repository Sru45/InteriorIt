import ExcelJS from 'exceljs';
import { generateHeaderImage } from './headerGenerator';

export const exportToExcel = async (estimate, items, ownerDetails) => {
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
  sheet.mergeCells('A1:G5');
  
  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    br: { col: 7, row: 5 }
  });

  // Client Info
  sheet.getCell('A7').value = `Client Name: ${estimate.client?.name || ''}`;
  sheet.getCell('A8').value = `Mobile: ${estimate.client?.mobile || ''}`;
  sheet.getCell('A9').value = `Address: ${estimate.client?.address || ''}`;

  sheet.getCell('A7').font = { name: 'Times New Roman', size: 12 };
  sheet.getCell('A8').font = { name: 'Times New Roman', size: 12 };
  sheet.getCell('A9').font = { name: 'Times New Roman', size: 12 };

  // Columns Width
  sheet.columns = [
    { key: 'col1', width: 5 },
    { key: 'col2', width: 40 },
    { key: 'col3', width: 20 },
    { key: 'col4', width: 8 },
    { key: 'col5', width: 10 },
    { key: 'col6', width: 15 },
    { key: 'col7', width: 22 },
  ];

  // Table Headers
  const tableHeaders = ['#', 'Items & Description', 'Size', 'Qty', 'Sqft', 'Rate', 'Amount'];
  const headerRow = sheet.getRow(11);
  tableHeaders.forEach((th, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = th;
    cell.font = { name: 'Times New Roman', size: 12, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; // Light Grey
    cell.border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
    cell.alignment = { horizontal: 'center' };
  });

  // Table Data
  let startRow = 12;
  let itemNum = 1;
  items.forEach((item) => {
    const row = sheet.getRow(startRow);
    row.font = { name: 'Times New Roman', size: 12 };
    
    if (item.isSection) {
      row.getCell(2).value = item.sectionName;
      row.getCell(2).font = { name: 'Times New Roman', size: 12, bold: true };
      
      for (let c = 1; c <= 7; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        row.getCell(c).border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
      }
      sheet.mergeCells(startRow, 2, startRow, 7);
    } else {
      row.getCell(1).value = itemNum++;
      row.getCell(2).value = item.itemName || '';
      row.getCell(3).value = item.length || item.width ? `${item.length || 0}  x  ${item.width || 0}` : '';
      row.getCell(4).value = Number(item.qty || 0);
      row.getCell(5).value = Number((item.sqft || 0).toFixed(2));
      
      const rateCell = row.getCell(6);
      rateCell.value = Number(item.rate || 0);
      rateCell.numFmt = '[$₹-en-IN] #,##0.00';
      
      const amountCell = row.getCell(7);
      amountCell.value = Number((item.amount || 0).toFixed(2));
      amountCell.numFmt = '[$₹-en-IN] #,##0.00';
      
      for (let c = 1; c <= 7; c++) {
        row.getCell(c).border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };
        if (c === 1 || c === 3 || c === 4 || c === 5) row.getCell(c).alignment = { horizontal: 'center' };
      }
    }
    startRow++;
  });

  // Total Row
  const totalRow = sheet.getRow(startRow);
  totalRow.font = { name: 'Times New Roman', size: 12, bold: true };
  const totalLabel = totalRow.getCell(6);
  totalLabel.value = 'Total';
  totalLabel.alignment = { horizontal: 'right' };
  totalLabel.border = { top: {style: 'thin'}, left: {style: 'thin'}, bottom: {style: 'thin'}, right: {style: 'thin'} };

  const totalAmount = totalRow.getCell(7);
  totalAmount.value = Number(estimate.totalAmount.toFixed(2));
  totalAmount.numFmt = '[$₹-en-IN] #,##0.00';
  totalAmount.border = { 
    top: {style: 'medium', color: {argb: 'FF548235'}}, 
    left: {style: 'medium', color: {argb: 'FF548235'}}, 
    bottom: {style: 'medium', color: {argb: 'FF548235'}}, 
    right: {style: 'medium', color: {argb: 'FF548235'}} 
  }; // Exact Green border shown in Excel selection image

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Estimate_${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
