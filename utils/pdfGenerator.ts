
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, CompanyProfile, InvoiceItem } from '../types';
import { db } from '../db';

const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += '-' + a[n % 10].trim();
      }
    }
    return str.trim() + ' ';
  };

  if (num === 0) return 'Zero Rupees Only';
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = 'Rupees ' + inWords(integerPart);
  if (decimalPart > 0) {
    result += 'and ' + inWords(decimalPart) + 'Paise ';
  }
  return result + 'Only';
};

export const generateInvoicePDF = async (invoice: Invoice, template: string = 'authentic') => {
  const profile = await db.settings.get(1);
  if (!profile) return;

  const isRetail = invoice.invoiceType === 'RETAIL';
  const doc = new jsPDF({ 
    orientation: 'portrait', 
    unit: 'mm', 
    format: 'a4' 
  });

  const pageWidth = 210; // Forced A4 Width
  const pageHeight = 297; // Forced A4 Height
  const margin = 8; // Optimized Margin

  // --- Background Watermark ---
  doc.setTextColor(252, 252, 252);
  doc.setFontSize(50);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.companyName, pageWidth / 2, pageHeight / 2, { 
    align: 'center', 
    angle: 45 
  });
  doc.setTextColor(0, 0, 0);

  // Outer Border
  doc.setLineWidth(0.3);
  doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

  // --- Top Header ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${profile.gstin}`, margin + 2, margin + 5);
  doc.text(isRetail ? 'RETAIL CASH MEMO' : 'TAX INVOICE', pageWidth / 2, margin + 5, { align: 'center' });
  doc.text('ORIGINAL COPY', pageWidth - margin - 2, margin + 5, { align: 'right' });

  doc.line(margin, margin + 7, pageWidth - margin, margin + 7);

  // --- Branding ---
  doc.setFontSize(22);
  doc.text(profile.companyName, pageWidth / 2, margin + 15, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.addressLine1}, ${profile.addressLine2}`, pageWidth / 2, margin + 20, { align: 'center' });
  
  const dlStr = `D.L. NO: ${profile.dlNo1 || ''} | ${profile.dlNo2 || ''} | ${profile.dlNo3 || ''} | ${profile.dlNo4 || ''}`.replace(/\| \|/g, '').replace(/\| $/g, '').trim();
  doc.setFontSize(7.5);
  doc.text(dlStr, pageWidth / 2, margin + 24, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Contact: ${profile.phone}`, pageWidth - margin - 5, margin + 15, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`${profile.jurisdiction || 'Ahmedabad'} Jurisdiction`, pageWidth - margin - 5, margin + 24, { align: 'right' });

  doc.line(margin, margin + 27, pageWidth - margin, margin + 27);

  // --- Party & Metadata ---
  const boxTop = margin + 27;
  const midX = pageWidth / 2 + 5;
  
  doc.line(midX, boxTop, midX, boxTop + 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(isRetail ? "CUSTOMER DETAILS" : "BILL TO: NAME & ADDRESS", margin + 2, boxTop + 4);
  doc.line(margin, boxTop + 5, midX, boxTop + 5);
  
  doc.setFontSize(10);
  doc.text(invoice.partyName, margin + 2, boxTop + 10);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.partyAddress || '', margin + 2, boxTop + 14, { maxWidth: 85 });
  if (!isRetail && invoice.partyGstin) {
      doc.setFont('helvetica', 'bold');
      doc.text(`GSTIN: ${invoice.partyGstin}`, margin + 2, boxTop + 28);
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`INVOICE NO : ${invoice.invoiceNo}`, midX + 2, boxTop + 5);
  doc.text(`DATE : ${new Date(invoice.date).toLocaleDateString('en-GB')}`, pageWidth - margin - 2, boxTop + 5, { align: 'right' });
  
  doc.line(midX, boxTop + 8, pageWidth - margin, boxTop + 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`GR No: ${invoice.grNo || '-'}`, midX + 2, boxTop + 13);
  doc.text(`Transport: ${invoice.transport || '-'}`, midX + 2, boxTop + 18);
  doc.text(`Vehicle: ${invoice.vehicleNo || '-'}`, midX + 2, boxTop + 23);

  doc.line(margin, boxTop + 30, pageWidth - margin, boxTop + 30);

  // --- Optimized Item Table ---
  // In retail mode, "Rate" is removed. MRP is the primary price column.
  const tableHeaders = isRetail 
    ? [['S.N', 'ITEM DESCRIPTION', 'Batch', 'Exp', 'HSN', 'MRP', 'QTY', 'GST%', 'TOTAL']]
    : [['S.N', 'ITEM DESCRIPTION', 'Batch', 'Exp', 'HSN', 'MRP', 'QTY', 'Fr.', 'RATE', 'Disc%', 'Taxable', 'GST%', 'TOTAL']];

  const tableBody = invoice.items.map((item, idx) => {
    if (isRetail) {
      return [
        idx + 1,
        item.name,
        item.batch,
        item.expiry,
        item.hsn,
        item.mrp.toFixed(2),
        item.quantity,
        item.gstRate.toFixed(0) + '%',
        item.totalAmount.toFixed(2)
      ];
    } else {
      return [
        idx + 1,
        item.name,
        item.batch,
        item.expiry,
        item.hsn,
        item.mrp.toFixed(2),
        item.quantity,
        item.freeQuantity || 0,
        item.saleRate.toFixed(2),
        item.discountPercent.toFixed(1),
        item.taxableValue.toFixed(2),
        item.gstRate.toFixed(0) + '%',
        item.totalAmount.toFixed(2)
      ];
    }
  });

  autoTable(doc, {
    startY: boxTop + 31,
    head: tableHeaders,
    body: tableBody,
    theme: 'grid',
    styles: { 
      fontSize: 8.5, 
      cellPadding: 1.5, 
      lineColor: [0, 0, 0], 
      lineWidth: 0.1, 
      textColor: [0, 0, 0],
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [245, 245, 245], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      halign: 'center' 
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: isRetail ? 85 : 52 }, 
      5: { halign: 'right' },
      6: { halign: 'center' },
      8: { halign: 'right' }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto'
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;

  // --- Totals Box ---
  const summaryX = pageWidth / 2 + 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Taxable Value:`, summaryX, finalY + 4);
  doc.text(invoice.totalTaxable.toFixed(2), pageWidth - margin - 2, finalY + 4, { align: 'right' });

  doc.text(`Total GST:`, summaryX, finalY + 9);
  doc.text((invoice.totalSGST + invoice.totalCGST + invoice.totalIGST).toFixed(2), pageWidth - margin - 2, finalY + 9, { align: 'right' });

  doc.line(summaryX, finalY + 12, pageWidth - margin, finalY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`NET PAYABLE:`, summaryX, finalY + 18);
  doc.text(`INR ${Math.round(invoice.grandTotal).toFixed(2)}`, pageWidth - margin - 2, finalY + 18, { align: 'right' });

  // Words & Terms
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount (in words): ${numberToWords(Math.round(invoice.grandTotal))}`, margin + 2, finalY + 25);

  const footerY = pageHeight - margin - 28;
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(7);
  doc.text('TERMS & CONDITIONS:', margin + 2, footerY + 5);
  const terms = profile.terms.split('\n');
  terms.forEach((line, i) => doc.text(line, margin + 2, footerY + 9 + (i * 3)));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`FOR ${profile.companyName}`, pageWidth - margin - 5, footerY + 5, { align: 'right' });
  doc.text('AUTHORIZED SIGNATORY', pageWidth - margin - 5, footerY + 22, { align: 'right' });
  doc.text('RECEIVER\'S SIGNATURE', margin + 2, footerY + 22);

  doc.save(`${invoice.invoiceNo}_ORIGINAL.pdf`);
};
