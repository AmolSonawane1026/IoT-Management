import { PrismaClient } from '@prisma/client';

export const startSimulator = (io) => {
    const prisma = new PrismaClient();
    // console.log("Simulator starting");

    const runSimulation = async () => {
        try {
           
            const devices = await prisma.device.findMany({
                where: { isOnline: true }
            });

            if (devices.length === 0) {
                // If no devices, check again in 2s
                setTimeout(runSimulation, 2000);
                return; 
            }

            // console.log(`Updating ${devices.length} online devices...`);

            for (const device of devices) {
                const voltage = 220 + (Math.random() * 10 - 5);
                const current = Math.random() * 5;
                const power = voltage * current;

               
                const telemetry = await prisma.telemetry.create({
                    data: {
                        deviceId: device.id,
                        voltage: parseFloat(voltage.toFixed(2)),
                        current: parseFloat(current.toFixed(2)),
                        power: parseFloat(power.toFixed(2))
                    }
                });

            
                await prisma.device.update({
                    where: { id: device.id },
                    data: { lastSeen: new Date() }
                });

               
                io.emit('telemetry_data', {
                    deviceId: device.id,
                    data: telemetry
                });
            }
        } catch (err) {
           
          
                console.error("Simulator Error:", err);
           
        } finally {
          
            setTimeout(runSimulation, 2000);
        }
    };

    runSimulation();
};
