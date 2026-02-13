const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const deployConfig = {
  postgres: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  nextjs: {
    buildCommand: 'npm run build',
    startCommand: 'npm start',
  },
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, error);
        return reject(error);
      }
      console.log(`Command output: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function setupDatabase() {
  const { user, host, database, password, port } = deployConfig.postgres;
  const connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
  
  try {
    await runCommand(`npx prisma migrate deploy --url="${connectionString}"`);
    console.log('Database migrations applied successfully.');
  } catch (error) {
    console.error('Failed to apply database migrations:', error);
    process.exit(1);
  }
}

async function buildNextApp() {
  try {
    await runCommand(deployConfig.nextjs.buildCommand);
    console.log('Next.js application built successfully.');
  } catch (error) {
    console.error('Failed to build Next.js application:', error);
    process.exit(1);
  }
}

async function startNextApp() {
  try {
    await runCommand(deployConfig.nextjs.startCommand);
    console.log('Next.js application started successfully.');
  } catch (error) {
    console.error('Failed to start Next.js application:', error);
    process.exit(1);
  }
}

async function setupRedis() {
  const { host, port } = deployConfig.redis;
  try {
    // Assuming Redis is already set up and running
    console.log(`Connecting to Redis at ${host}:${port}`);
    // Add any Redis setup logic here if needed
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

async function deploy() {
  await setupDatabase();
  await setupRedis();
  await buildNextApp();
  await startNextApp();
}

deploy().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});