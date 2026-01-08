import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import { startSimulator } from '../simulator.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.MODE === 'development' 
  ? 'http://localhost:5173'
  : 'https://iot-management-frontend.vercel.app';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('telemetry_data', (payload) => {
    io.emit('telemetry_data', payload);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startSimulator(io);
});
