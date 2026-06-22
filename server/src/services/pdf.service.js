const PDFDocument = require('pdfkit');

class PDFService {
  static generateInvoicePDF(invoice, res) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe its output right to the response
    doc.pipe(res);

    this.generateHeader(doc, invoice);
    this.generateCustomerInformation(doc, invoice);
    this.generateInvoiceTable(doc, invoice);
    this.generateFooter(doc, invoice);

    doc.end();
  }

  static generateInvoicePDFBuffer(invoice) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      this.generateHeader(doc, invoice);
      this.generateCustomerInformation(doc, invoice);
      this.generateInvoiceTable(doc, invoice);
      this.generateFooter(doc, invoice);

      doc.end();
    });
  }

  static generateHeader(doc, invoice) {
    doc
      .fillColor('#4f46e5')
      .fontSize(28)
      .text('INVOICE', 50, 50)
      .fillColor('#475569')
      .fontSize(10)
      .text(`Invoice Number: ${invoice.invoice_number}`, 50, 85)
      .text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 50, 100)
      .text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 50, 115)
      .text(`Status: ${invoice.status}`, 50, 130)
      .moveDown();
  }

  static generateCustomerInformation(doc, invoice) {
    doc
      .fillColor('#1e293b')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Billed To:', 50, 170)
      .font('Helvetica')
      .fontSize(10)
      .text(invoice.customer_name, 50, 185)
      .text(invoice.customer_email || '', 50, 200)
      .text(invoice.customer_phone || '', 50, 215)
      .moveDown();
  }

  static generateInvoiceTable(doc, invoice) {
    const invoiceTableTop = 260;

    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      invoiceTableTop,
      'Description',
      'Quantity',
      'Rate',
      'Amount'
    );
    this.generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    let i = 0;
    const items = invoice.items || [];
    for (i = 0; i < items.length; i++) {
      const item = items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      this.generateTableRow(
        doc,
        position,
        item.description,
        item.quantity.toString(),
        `Rs ${item.rate.toFixed(2)}`,
        `Rs ${item.amount.toFixed(2)}`
      );
      this.generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      subtotalPosition,
      '',
      '',
      'Subtotal',
      `Rs ${invoice.subtotal.toFixed(2)}`
    );

    const gstPosition = subtotalPosition + 20;
    this.generateTableRow(
      doc,
      gstPosition,
      '',
      '',
      `GST (${invoice.gst_rate}%)`,
      `Rs ${invoice.gst_amount.toFixed(2)}`
    );

    const totalPosition = gstPosition + 25;
    doc.font('Helvetica-Bold').fillColor('#4f46e5');
    this.generateTableRow(
      doc,
      totalPosition,
      '',
      '',
      'Grand Total',
      `Rs ${invoice.total.toFixed(2)}`
    );
    doc.fillColor('#1e293b');
  }

  static generateFooter(doc, invoice) {
    if (invoice.notes) {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Notes:', 50, 700)
        .font('Helvetica')
        .text(invoice.notes, 50, 715, { width: 495, align: 'left' });
    }
  }

  static generateTableRow(doc, y, description, quantity, rate, amount) {
    doc
      .fontSize(10)
      .text(description, 50, y, { width: 280 })
      .text(quantity, 330, y, { width: 60, align: 'right' })
      .text(rate, 400, y, { width: 60, align: 'right' })
      .text(amount, 480, y, { width: 65, align: 'right' });
  }

  static generateHr(doc, y) {
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(545, y)
      .stroke();
  }
}

module.exports = PDFService;
