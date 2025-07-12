const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const paymentController = require('../controllers/payment.controller');
const clientAccountController = require('../controllers/clientAccount.controller');
const financeReportController = require('../controllers/financeReport.controller');

// Invoice routes
router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices', invoiceController.getInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.patch('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);

// Payment routes
router.post('/payments', paymentController.createPayment);
router.get('/payments', paymentController.getPayments);
router.get('/payments/:id', paymentController.getPaymentById);
router.patch('/payments/:id', paymentController.updatePayment);
router.delete('/payments/:id', paymentController.deletePayment);

// Client account routes
router.get('/accounts', clientAccountController.getClientAccounts);
router.get('/accounts/:id', clientAccountController.getClientAccountById);
router.patch('/accounts/:id', clientAccountController.updateClientAccount);

// Finance reports
router.get('/reports/revenue', financeReportController.getRevenueReport);
router.get('/reports/outstanding', financeReportController.getOutstandingReport);
router.get('/reports/cashflow', financeReportController.getCashFlowReport);

module.exports = router; 