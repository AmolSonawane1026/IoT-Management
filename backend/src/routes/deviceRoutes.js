import express from 'express';
import { getDevices, createDevice, deleteDevice, getTelemetry, toggleDeviceStatus } from '../controllers/deviceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getDevices);      
router.post('/', authMiddleware, createDevice);    
router.delete('/:id', authMiddleware, deleteDevice); 
router.patch('/status/:id', authMiddleware, toggleDeviceStatus); 
router.get('/telemetry/:id', authMiddleware, getTelemetry); 

export default router;
