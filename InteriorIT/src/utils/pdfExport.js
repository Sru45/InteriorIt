import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateHeaderImage } from './headerGenerator';

export const exportToPdf = async (estimate, items, ownerDetails, fileName = 'Estimate') => {
  const imageBase64 = await generateHeaderImage(ownerDetails);
  const doc = new jsPDF();

  // Draw Exact Match Image Header
  doc.addImage(imageBase64, 'PNG', 0, 0, 210, 40);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  let y = 45;

  // Client Details
  doc.text(`Client Name: ${estimate.client?.name || ''}`, 15, y);
  y += 7;
  doc.text(`Mobile: ${estimate.client?.mobile || ''}`, 15, y);
  y += 7;
  doc.text(`Address: ${estimate.client?.address || ''}`, 15, y);
  y += 10;

  // Table
  const tableColumn = ["#", "Items & Description", "Size", "Qty", "Sqft", "Rate", "Amount"];
  const tableRows = [];

  let itemNum = 1;

  items.forEach((item) => {
    if (item.isSection) {
      tableRows.push([
        '',
        item.sectionName || '', // Plain string to avoid jspdf-autotable crashing on object structures or undefined
        '', '', '', '', ''
      ]);
    } else {
      tableRows.push([
        itemNum++,
        item.itemName || '',
        item.length || item.width ? `${item.length || 0} x ${item.width || 0}` : '',
        item.qty || '',
        item.sqft ? item.sqft.toFixed(2) : '0.00',
        `Rs. ${(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`,
        `Rs. ${(item.amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`
      ]);
    }
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: [217, 217, 217], textColor: [0, 0, 0], fontStyle: 'bold', font: 'times' },
    styles: { font: 'times', fontSize: 11, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0,0,0], lineWidth: 0.1 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { cellWidth: 32 },
      6: { cellWidth: 36 }
    },
    // Dynamically intercept rows to apply styling
    didParseCell: function (data) {
      if (data.section === 'body') {
        const itemIndex = data.row.index;
        const mappedItem = items[itemIndex];
        if (mappedItem && mappedItem.isSection) {
          // If this is a Section row, bold the text in the "Items & Description" column
          if (data.column.index === 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
          }
        }
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY;
  
  // Total Row manually drawn for exact layout mimicking
  doc.setFillColor(255, 255, 255);
  doc.rect(127, finalY, 32, 8, 'FD'); // Rate col width exactly aligned under row
  doc.rect(159, finalY, 36, 8, 'FD'); // Amount col width precisely filling the boundary
  
  doc.setFont('times', 'bold');
  doc.text('Total', 154, finalY + 5.5, null, null, 'right');
  
  // Green box for total like in Excel
  doc.setDrawColor(84, 130, 53); // RGB for exact Excel selection green #548235
  doc.setLineWidth(0.6);
  doc.rect(159, finalY, 36, 8, 'D');

  doc.setTextColor(0, 0, 0);
  doc.text(`Rs. ${estimate.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 192, finalY + 5.5, null, null, 'right');

  doc.save(`${fileName}.pdf`);
};
