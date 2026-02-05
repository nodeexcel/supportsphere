import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Could not connect to the database');
    }
}

async function disconnectFromDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Disconnected from the database successfully');
    } catch (error) {
        console.error('Error disconnecting from the database:', error);
    }
}

export { prisma, connectToDatabase, disconnectFromDatabase };