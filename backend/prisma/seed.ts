import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create an Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'hashed_password_123', // In a real app, always hash passwords
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.username);

  // 2. Create a Parking Lot
  const parkingLot = await prisma.parkingLot.create({
    data: {
      name: 'Downtown Main Parking',
      location: '123 Main St, Downtown',
    },
  });
  console.log('Created parking lot:', parkingLot.name);

  // 3. Create Parking Slots
  const slotsData = [
    { slotNumber: 'A1', type: 'CAR' as const, parkingLotId: parkingLot.id },
    { slotNumber: 'A2', type: 'CAR' as const, parkingLotId: parkingLot.id },
    { slotNumber: 'A3', type: 'CAR' as const, parkingLotId: parkingLot.id },
    { slotNumber: 'B1', type: 'MOTORCYCLE' as const, parkingLotId: parkingLot.id },
    { slotNumber: 'B2', type: 'MOTORCYCLE' as const, parkingLotId: parkingLot.id },
    { slotNumber: 'C1', type: 'TRUCK' as const, parkingLotId: parkingLot.id },
  ];

  for (const slot of slotsData) {
    await prisma.parkingSlot.create({
      data: slot,
    });
  }
  console.log(`Created ${slotsData.length} parking slots.`);

  // 4. Create Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { registrationNo: 'ABC-1234' },
    update: {},
    create: {
      registrationNo: 'ABC-1234',
      type: 'CAR',
      ownerName: 'John Doe',
      phoneNumber: '555-0100',
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { registrationNo: 'XYZ-9876' },
    update: {},
    create: {
      registrationNo: 'XYZ-9876',
      type: 'MOTORCYCLE',
      ownerName: 'Jane Smith',
      phoneNumber: '555-0200',
    },
  });
  
  console.log('Created sample vehicles:', vehicle1.registrationNo, vehicle2.registrationNo);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
