import { Router } from 'express';
import healthCheck from './health-check.js';
import quotesRouter from './quotes.js';
import invoicesRouter from './invoices.js';
import invitationsRouter from './invitations.js';
import integratedAiRouter from './integrated-ai.js';
import cashbookRouter from './cashbook.js';
import expensesRouter from './expenses.js';
import advancesRouter from './advances.js';
import payrollRouter from './payroll.js';
import attendanceRouter from './attendance.js';
import tripsRouter from './trips.js';
import fuelLogsRouter from './fuelLogs.js';
import tripCalculationsRouter from './tripCalculations.js';
import mailboxRouter from './mailbox.js';
import trucksRouter from './trucks.js';
import analyticsRouter from './analytics.js';


const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/quotes', quotesRouter);
    router.use('/invoices', invoicesRouter);
    router.use('/invitations', invitationsRouter);
    router.use('/integrated-ai', integratedAiRouter);
    router.use('/cashbook', cashbookRouter);
    router.use('/expenses', expensesRouter);
    router.use('/advances', advancesRouter);
    router.use('/payroll', payrollRouter);
    router.use('/attendance', attendanceRouter);
    router.use('/trips', tripsRouter);
    router.use('/fuel-logs', fuelLogsRouter);
    router.use('/trip-calculations', tripCalculationsRouter);
    router.use('/mailbox', mailboxRouter);
    router.use('/trucks', trucksRouter);
    router.use('/api/trucks', trucksRouter);
    router.use('/analytics', analyticsRouter);


    return router;
};