import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createDebt,
  getDebts,
  getDebtById,
  updateDebt,
  deleteDebt,
} from '../controllers/debtController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createDebt);
router.get('/', getDebts);
router.get('/:id', getDebtById);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);

export default router;
