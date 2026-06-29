// Helper to convert number to words
function numberToWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));

    let str = '';
    
    if (Math.floor(num / 10000000) > 0) {
        str += numberToWords(Math.floor(num / 10000000)) + 'Crore ';
        num %= 10000000;
    }
    if (Math.floor(num / 100000) > 0) {
        str += numberToWords(Math.floor(num / 100000)) + 'Lakh ';
        num %= 100000;
    }
    if (Math.floor(num / 1000) > 0) {
        str += numberToWords(Math.floor(num / 1000)) + 'Thousand ';
        num %= 1000;
    }
    if (Math.floor(num / 100) > 0) {
        str += numberToWords(Math.floor(num / 100)) + 'Hundred ';
        num %= 100;
    }
    if (num > 0) {
        if (str !== '') str += 'and ';
        if (num < 20) str += a[num];
        else {
            str += b[Math.floor(num / 10)] + ' ';
            if (num % 10 > 0) str += a[num % 10];
        }
    }
    return str.trim();
}

// Helper to load image for jsPDF
function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
}

export async function generateInvoicePDF(invoice: any) {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('p', 'mm', 'a4'); // A4: 210 x 297 mm
    const pageWidth = doc.internal.pageSize.width; // 210
    
    const mLeft = 10;
    const mRight = pageWidth - 10;
    const mTop = 15;
    const contentWidth = mRight - mLeft;

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Tax Invoice", pageWidth / 2, mTop, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("ORIGINAL FOR RECIPIENT", mRight, mTop, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // --- Company Details Box ---
    let currentY = mTop + 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    
    const companyBoxHeight = 25;
    doc.rect(mLeft, currentY, contentWidth, companyBoxHeight);
    
    // Logo block
    try {
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', mLeft + 2, currentY + 2, 21, 21);
    } catch (e) {
        // Fallback to text box if image doesn't exist
        doc.setFillColor(155, 109, 187); // #9b6dbb
        doc.rect(mLeft + 2, currentY + 2, 21, 21, 'F');
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("Zubizo", mLeft + 12.5, currentY + 16, { align: 'center' });
    }
    
    // Company Text
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Zubizoart", mLeft + 28, currentY + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("SS ARCADE 3F 3RD FLOOR CONVENT ROAD CONTONMENT TRICHY", mLeft + 28, currentY + 11);
    doc.text("Phone: 8124548133", mLeft + 28, currentY + 16);

    doc.text("State: Tamil Nadu", mLeft + 28, currentY + 21);

    currentY += companyBoxHeight;

    // --- Bill To & Invoice Details ---
    const detailBoxHeight = 35;
    const midX = mLeft + (contentWidth / 2);
    
    // Borders
    doc.rect(mLeft, currentY, contentWidth, detailBoxHeight); // Outer
    doc.line(midX, currentY, midX, currentY + detailBoxHeight); // Center vertical
    doc.line(mLeft, currentY + 5, mRight, currentY + 5); // Header underline

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    // Labels
    doc.text("Bill To:", mLeft + 2, currentY + 4);
    doc.text("Invoice Details:", midX + 2, currentY + 4);
    
    // Content Bill To
    doc.setFont("helvetica", "bold");
    doc.text(invoice.customerName || "N/A", mLeft + 2, currentY + 10);
    doc.setFont("helvetica", "normal");
    
    let nextY = currentY + 15;
    if (invoice.customerAddress) {
        const splitAddress = doc.splitTextToSize(invoice.customerAddress, (contentWidth / 2) - 4);
        doc.text(splitAddress, mLeft + 2, nextY);
        nextY += (splitAddress.length * 4) + 1;
    }
    
    doc.text(`Contact No: ${invoice.customerPhone || "N/A"}`, mLeft + 2, nextY);
    
    // Content Invoice Details
    doc.text(`No: ${invoice.orderId || "N/A"}`, midX + 2, currentY + 10);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, midX + 2, currentY + 15);


    currentY += detailBoxHeight;

    // --- Table ---
    const tableData = [];
    
    // Row 1: Primary Design
    tableData.push([
        "1",
        `${invoice.designName || 'N/A'} (SKU: ${invoice.designCode || 'N/A'})`,
        "", // HSN
        invoice.quantity ? invoice.quantity.toString() : "0", // Count
        invoice.quantity ? invoice.quantity.toString() : "0", // Quantity
        "Pcs",
        `Rs. ${invoice.pricePerCard?.toFixed(1) || '0.0'}`,
        `Rs. ${invoice.subtotal?.toFixed(1) || '0.0'}`
    ]);
    
    let index = 2;
    if (invoice.designingCharge > 0) {
        tableData.push([index.toString(), 'Designing Charge', '', '', '1', 'Pcs', `Rs. ${invoice.designingCharge.toFixed(1)}`, `Rs. ${invoice.designingCharge.toFixed(1)}`]);
        index++;
    }
    
    if (invoice.customCharges && invoice.customCharges.length > 0) {
        invoice.customCharges.forEach((c: any) => {
            tableData.push([index.toString(), c.label, '', '', '1', 'Pcs', `Rs. ${Number(c.amount).toFixed(1)}`, `Rs. ${Number(c.amount).toFixed(1)}`]);
            index++;
        });
    }

    // Add empty rows to push summary down if needed, or just draw total
    // Calculate total count and total qty
    let totalCount = 0;
    let totalQty = 0;
    let totalItemValue = 0; // The sum of items before shipping
    
    tableData.forEach(row => {
        totalCount += Number(row[3]) || 0;
        totalQty += Number(row[4]) || 0;
        totalItemValue += parseFloat((row[7] as string).replace('₹ ', '')) || 0;
    });

    tableData.push([
        "", "Total", "", totalCount.toString(), totalQty.toString(), "", "", `Rs. ${totalItemValue.toFixed(1)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['#', 'Item Name', 'HSN/ SAC', 'Count', 'Quantity', 'Unit', 'Price/ Unit', 'Amount']],
        body: tableData,
        theme: 'grid',
        styles: { 
            fontSize: 8, 
            textColor: 0,
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            cellPadding: 1.5,
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: 'normal'
        },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15, halign: 'right' },
            4: { cellWidth: 15, halign: 'right' },
            5: { cellWidth: 15, halign: 'right' },
            6: { cellWidth: 25, halign: 'right' },
            7: { cellWidth: 32, halign: 'right' }
        },
        margin: { left: mLeft, right: mRight },
        tableWidth: contentWidth
    });

    currentY = (doc as any).lastAutoTable.finalY;

    // --- Bottom Layout (Summary, Amount in Words, Payment Mode, Signatures) ---
    const botBoxHeight = 45;
    
    // Outer border
    doc.rect(mLeft, currentY, contentWidth, botBoxHeight);
    
    // Split vertical line
    const sumSplitX = mRight - 60; 
    doc.line(sumSplitX, currentY, sumSplitX, currentY + botBoxHeight);

    // Left Side: Payment Mode & Amount in Words
    doc.setFont("helvetica", "normal");
    doc.text("Payment Mode:", mLeft + 2, currentY + 14);
    doc.text("Indian Bank", mLeft + 2, currentY + 20);

    doc.line(mLeft, currentY + 23, sumSplitX, currentY + 23);
    doc.text("Invoice Amount In Words :", mLeft + 2, currentY + 27);
    
    const amtWords = numberToWords(Math.round(invoice.grandTotal || 0)) + " Rupees only";
    const splitWords = doc.splitTextToSize(amtWords, sumSplitX - mLeft - 4);
    doc.text(splitWords, mLeft + 2, currentY + 32);

    // Right Side: Summary Table
    // Sub Total
    doc.text("Sub Total", sumSplitX + 2, currentY + 5);
    doc.text(":", sumSplitX + 25, currentY + 5);
    doc.text(`Rs. ${totalItemValue.toFixed(1)}`, mRight - 2, currentY + 5, { align: 'right' });
    
    // Shipping
    const shipAmt = invoice.shippingCharge || 0;
    doc.text("Shipping", sumSplitX + 2, currentY + 10);
    doc.text(":", sumSplitX + 25, currentY + 10);
    doc.text(`Rs. ${shipAmt.toFixed(1)}`, mRight - 2, currentY + 10, { align: 'right' });

    doc.line(sumSplitX, currentY + 12, mRight, currentY + 12);
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total", sumSplitX + 2, currentY + 17);
    doc.text(":", sumSplitX + 25, currentY + 17);
    doc.text(`Rs. ${(invoice.grandTotal || 0).toFixed(1)}`, mRight - 2, currentY + 17, { align: 'right' });

    doc.setFont("helvetica", "normal");
    doc.line(sumSplitX, currentY + 23, mRight, currentY + 23);
    
    // Received
    doc.text("Received", sumSplitX + 2, currentY + 28);
    doc.text(":", sumSplitX + 25, currentY + 28);
    // Assuming received = grandTotal for now
    doc.text(`Rs. ${(invoice.grandTotal || 0).toFixed(1)}`, mRight - 2, currentY + 28, { align: 'right' });
    
    // Balance
    doc.text("Balance", sumSplitX + 2, currentY + 33);
    doc.text(":", sumSplitX + 25, currentY + 33);
    doc.text(`Rs. 0.0`, mRight - 2, currentY + 33, { align: 'right' });

    currentY += botBoxHeight;
    
    // Signature Box
    doc.rect(sumSplitX, currentY, contentWidth - (sumSplitX - mLeft), 20);
    doc.text("For Zubizoart:", sumSplitX + 2, currentY + 4);
    
    try {
        const signImg = await loadImage('/signature.png');
        // Fit image within 40x12 box approx
        doc.addImage(signImg, 'PNG', sumSplitX + 10, currentY + 5, 30, 10);
    } catch (e) {
        // Fallback to text signature
        doc.setFont("helvetica", "italic");
        doc.setFontSize(14);
        doc.setTextColor(150, 150, 150);
        doc.text("Zubizo", sumSplitX + 25, currentY + 14);
        doc.setTextColor(0, 0, 0);
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Authorized Signatory", sumSplitX + 30, currentY + 18, { align: 'center' });

    doc.save(`${invoice.orderId}_Invoice.pdf`);
}
