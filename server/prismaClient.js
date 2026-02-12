const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Example: Fetch all users
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

module.exports = prisma;