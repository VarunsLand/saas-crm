const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/db');
const PDFService = require('../services/pdf.service');
const { emailService } = require('../services/email.service');

const getAll = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const where = {
    tenant_id: tenantId,
    ...(search && {
      OR: [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { invoice_date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

const getOne = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, tenant_id: tenantId },
    include: { items: true }
  });

  if (!invoice) {
    return res.status(404).json({ status: 'error', message: 'Invoice not found' });
  }

  res.status(200).json({ status: 'success', data: { invoice } });
});

const create = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { customer_name, customer_email, customer_phone, invoice_date, due_date, notes, items, gst_rate } = req.body;

  if (!customer_name || !items || !items.length) {
    return res.status(400).json({ status: 'error', message: 'Customer name and at least one item are required' });
  }

  // Calculate totals securely on the backend
  let subtotal = 0;
  const calculatedItems = items.map(item => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = qty * rate;
    subtotal += amount;
    return {
      description: item.description,
      quantity: qty,
      rate: rate,
      amount
    };
  });

  const parsedGstRate = parseFloat(gst_rate) >= 0 ? parseFloat(gst_rate) : 18;
  const validGstRate = Math.min(Math.max(parsedGstRate, 0), 100);
  const gst_amount = (subtotal * validGstRate) / 100;
  
  const tax = 0; // Legacy tax field, keep 0 for now
  const total = subtotal + gst_amount;

  // Auto-generate invoice number transactionally
  const invoice = await prisma.$transaction(async (tx) => {
    const lastInvoice = await tx.invoice.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    });

    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoice_number.startsWith('INV-')) {
      const parts = lastInvoice.invoice_number.split('-');
      if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
        nextNum = parseInt(parts[1]) + 1;
      } else {
        const count = await tx.invoice.count({ where: { tenant_id: tenantId } });
        nextNum = count + 1;
      }
    }

    const invoice_number = `INV-${nextNum.toString().padStart(4, '0')}`;

    return await tx.invoice.create({
      data: {
        tenant_id: tenantId,
        invoice_number,
        customer_name,
        customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        invoice_date: new Date(invoice_date),
        due_date: due_date ? new Date(due_date) : null,
        subtotal,
        tax,
        gst_rate: validGstRate,
        gst_amount,
        total,
        notes: notes || null,
        status: 'DRAFT',
        items: {
          create: calculatedItems
        }
      },
      include: { items: true }
    });
  });

  res.status(201).json({ status: 'success', data: { invoice } });
});

const update = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { status } = req.body;

  // For MVP, we only allow updating the status
  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Only status updates are supported in MVP' });
  }

  const invoice = await prisma.invoice.findFirst({ where: { id, tenant_id: tenantId } });
  if (!invoice) {
    return res.status(404).json({ status: 'error', message: 'Invoice not found' });
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: { status }
  });

  res.status(200).json({ status: 'success', data: { invoice: updatedInvoice } });
});

const remove = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({ where: { id, tenant_id: tenantId } });
  if (!invoice) {
    return res.status(404).json({ status: 'error', message: 'Invoice not found' });
  }

  await prisma.invoice.delete({
    where: { id }
  });

  res.status(204).json({ status: 'success', data: null });
});

const getStats = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  const [totalCount, paidCount, pendingCount, overdueCount] = await Promise.all([
    prisma.invoice.count({ where: { tenant_id: tenantId } }),
    prisma.invoice.count({ where: { tenant_id: tenantId, status: 'PAID' } }),
    prisma.invoice.count({ where: { tenant_id: tenantId, status: { in: ['DRAFT', 'SENT', 'PARTIAL'] } } }),
    prisma.invoice.count({ where: { tenant_id: tenantId, status: 'OVERDUE' } })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        total: totalCount,
        paid: paidCount,
        pending: pendingCount,
        overdue: overdueCount
      }
    }
  });
});

const generatePdf = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, tenant_id: tenantId },
    include: { items: true }
  });

  if (!invoice) {
    return res.status(404).json({ status: 'error', message: 'Invoice not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);

  PDFService.generateInvoicePDF(invoice, res);
});

const send = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, tenant_id: tenantId },
    include: { items: true }
  });

  if (!invoice) {
    return res.status(404).json({ status: 'error', message: 'Invoice not found' });
  }

  if (!invoice.customer_email) {
    return res.status(400).json({ status: 'error', message: 'Invoice has no associated customer email' });
  }

  // 1. Generate PDF Buffer
  const pdfBuffer = await PDFService.generateInvoicePDFBuffer(invoice);

  // 2. Send email via Resend
  await emailService.sendInvoiceEmail(invoice, pdfBuffer);

  // 3. Update status and sentAt only if email succeeded
  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date()
    }
  });

  res.status(200).json({ status: 'success', data: { invoice: updatedInvoice } });
});

module.exports = { getAll, getOne, create, update, remove, getStats, generatePdf, send };
