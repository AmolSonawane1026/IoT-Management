import { PrismaClient } from '@prisma/client';

export const startSimulator = (io) => {
    const prisma = new PrismaClient();
    console.log("Simulator starting (internal mode)...");

    setInterval(async () => {
        try {
            const devices = await prisma.device.findMany();

            if (devices.length === 0) {
                return;
            }

            const onlineDevices = devices.filter(d => d.isOnline);
            if (onlineDevices.length > 0) {
                 console.log(`Updating ${onlineDevices.length} online devices...`); 
            }

            for (const device of devices) {
                if (!device.isOnline) continue;

                const voltage = 220 + (Math.random() * 10);
                const current = Math.random() * 10;
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
        }
    }, 2000); 
};
