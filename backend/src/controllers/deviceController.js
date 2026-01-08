import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDevices = async (req, res) => {
  try {
    const { search = '', status } = req.query;
    
    const where = {
      name: { contains: search, mode: 'insensitive' },
      ...(status && { isOnline: status === 'online' })
    };

    const devices = await prisma.device.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
      include: {
        telemetry: {
          take: 1, 
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const  createDevice = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Device name and type are required' });
    }

    const device = await prisma.device.create({
      data: {
        name,
        type,
        isOnline: false, 
        lastSeen: new Date()
      }
    });

    res.status(201).json({ message: 'Device registered successfully', device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    await prisma.device.delete({ where: { id: req.params.id } });
    req.io.emit('device_deleted', req.params.id); 
    res.json({ message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTelemetry = async (req, res) => {
  try {
    const data = await prisma.telemetry.findMany({
      where: { deviceId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(data.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleDeviceStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { id } = req.params;
    const { isOnline } = req.body;

    const device = await prisma.device.update({
      where: { id },
      data: { isOnline }
    });

    req.io.emit('device_updated', device); 

    res.json({ message: `Device is now ${isOnline ? 'Online' : 'Offline'}`, device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
