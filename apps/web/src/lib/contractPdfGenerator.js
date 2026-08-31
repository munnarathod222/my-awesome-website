import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCorporateContractPdf = (contractData) => {
  const doc = new jsPDF();
  const primaryNavy = [15, 23, 42];
  const accentGold = [217, 119, 6];
  const secondaryGray = [71, 85, 105];

  // Top Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, doc.internal.pageSize.width, 7, 'F');
  doc.setFillColor(...accentGold);
  doc.rect(0, 7, doc.internal.pageSize.width, 1.5, 'F');

  // Company Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryNavy);
  doc.text('JAI BHAVANI CARGO', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...secondaryGray);
  doc.text('Plot no 3, Patel nagar, Ghatkesar, pin: 501301 | GSTIN: 36DPXPR9171A1Z8', 14, 25);
  doc.text('Phone: +91 7794072244 | Email: operations@jaibhavanicargo.com', 14, 30);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...accentGold);
  doc.text('B2B LOGISTICS CONTRACT & RATE AGREEMENT', doc.internal.pageSize.width - 14, 20, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(...secondaryGray);
  doc.text(`Agreement Ref: JBC-CTR-${Date.now().toString().substring(7)}`, doc.internal.pageSize.width - 14, 26, { align: 'right' });
  doc.text(`Effective Date: ${new Date().toLocaleDateString('en-IN')}`, doc.internal.pageSize.width - 14, 31, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 37, doc.internal.pageSize.width - 14, 37);

  // Parties Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, doc.internal.pageSize.width - 28, 28, 2, 2, 'F');
  doc.roundedRect(14, 42, doc.internal.pageSize.width - 28, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('SERVICE PROVIDER (TRANSPORTER):', 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('JAI BHAVANI CARGO (Represented by Vinod Kumar Rathod, Managing Director)', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CLIENT / CONSIGNOR:', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(contractData.clientName || 'Valued Corporate Partner (Amazon / Corporate Shipper)', 18, 66);

  // Contract Clauses & Rates Table
  const tableData = [
    ['1', 'Hyderabad (Telangana)', 'Bangalore (Karnataka)', '32 FT Multi-Axle (15-18 MT)', '₹17,100 / Trip'],
    ['2', 'Warangal (Telangana)', 'Hyderabad (Telangana)', '32 FT Multi-Axle (15-18 MT)', '₹7,100 / Trip'],
    ['3', 'Chennai (Tamil Nadu)', 'Hyderabad (Telangana)', '32 FT Multi-Axle (15-18 MT)', '₹26,500 / Trip'],
    ['4', 'Pune (Maharashtra)', 'Hyderabad (Telangana)', '32 FT Multi-Axle (15-18 MT)', '₹24,000 / Trip']
  ];

  autoTable(doc, {
    startY: 76,
    head: [['Sl', 'Origin City / Hub', 'Destination City / Hub', 'Vehicle Category / Capacity', 'Agreed Freight Rate']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryNavy, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 50 },
      4: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('STANDARD TERMS & OPERATIONAL CONDITIONS:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryGray);
  const terms = [
    '1. Payment Terms: Credit billing Net 30 days from official statement / invoice submission.',
    '2. Diesel Escalation: Base diesel rate benchmarked at ₹94.20/L. Variance > ₹5/L subject to mutual adjustment.',
    '3. Transit Insurance: Consignment covered under carrier risk as per standard Carriage by Road Act 2007.',
    '4. Detention / Free Hours: 24 free hours permitted for loading and 24 free hours for unloading.',
    '5. Jurisdiction: All disputes arising under this agreement subject to the exclusive jurisdiction of Hyderabad Courts.'
  ];
  doc.text(terms.join('\n'), 14, finalY + 5);

  // Signatures
  const sigY = finalY + 36;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, sigY, doc.internal.pageSize.width - 14, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('For JAI BHAVANI CARGO', 14, sigY + 6);
  doc.text('For CLIENT (Authorized Signatory)', doc.internal.pageSize.width - 14, sigY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryGray);
  doc.text('Vinod Kumar Rathod (Managing Director)', 14, sigY + 18);
  doc.text('Authorized Representative & Seal', doc.internal.pageSize.width - 14, sigY + 18, { align: 'right' });

  return doc.output('arraybuffer');
};
