// Import Prisma Client
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the main function that will handle database operations
async function main() {
  try {
  // Create a new user in the database using Prisma Client
  const role1 = await prisma.user_role.createMany({
    data: [
      {
        name: "Admin",
      },
      {
        name: "Authenticated",
      },
      {
        name: "Monitor",
      },
      {
        name: "InventoryManager",
      },
    ],
    skipDuplicates: true,
  });

  const user1 = await prisma.user.upsert({
    where: { net_id: "first_admin" }, // Check if the user already exists by email
      update: {}, // If the user exists, don't update any fields
      create: {
        email: "admin@admin.com",
        net_id: "first_admin",
        first_name: "Admin",
        password: await bcrypt.hash("first_admin", 10),
        user_role: { connect: { id: 1 } }, // Adjust this if you need to connect by something other than ID
      },
  });

  // Output the email of the newly created user
  console.log(`Created user: ${user1.email}`);
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the main function and handle disconnection and errors
main().catch((e) => {
  console.error(e);
  process.exit(1);
});