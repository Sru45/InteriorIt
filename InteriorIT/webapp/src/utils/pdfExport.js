import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateHeaderImage } from './headerGenerator';

export const exportToPdf = async (estimate, items, ownerDetails) => {
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
        { content: item.sectionName, styles: { fontStyle: 'bold' } },
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

  doc.autoTable({
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
      5: { cellWidth: 30 },
      6: { cellWidth: 35 }
    }
  });

  const finalY = doc.lastAutoTable.finalY;
  
  // Total Row manually drawn for exact layout mimicking
  doc.setFillColor(255, 255, 255);
  doc.rect(145, finalY, 30, 8, 'FD'); // Rate col width
  doc.rect(175, finalY, 35, 8, 'FD'); // Amount col width
  
  doc.setFont('times', 'bold');
  doc.text('Total', 165, finalY + 5.5, null, null, 'right');
  
  // Green box for total like in Excel
  doc.setDrawColor(84, 130, 53); // RGB for exact Excel selection green #548235
  doc.setLineWidth(0.6);
  doc.rect(175, finalY, 35, 8, 'D');

  doc.setTextColor(0, 0, 0);
  doc.text(`₹ ${estimate.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 207, finalY + 5.5, null, null, 'right');

  doc.save(`Estimate_${Date.now()}.pdf`);
};
