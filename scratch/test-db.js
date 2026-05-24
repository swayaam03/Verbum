const { PrismaClient } = require("@prisma/client");
const path = require("path");

require("dotenv").config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Checking for existing user...");
    const email = `test_${Date.now()}@example.com`;
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    console.log("Existing check complete:", existing);

    console.log("Attempting user creation...");
    const newUser = await prisma.user.create({
      data: {
        fullName: "Test User",
        email: email,
        password: "hashedpassword123"
      }
    });
    console.log("User successfully created!", newUser);
    
    // Clean up
    console.log("Cleaning up test user...");
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Database operation failed:", err);
    process.exit(1);
  }
}

run();
