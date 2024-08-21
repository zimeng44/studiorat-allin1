// Import Prisma Client
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the main function that will handle database operations
async function main() {
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
  });

  const user1 = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      net_id: "first_admin",
      first_name: "Admin",
      password: await bcrypt.hash("first_admin", 10),
      user_role: { connect: { id: 1 } }, // Note: In a real application, ensure passwords are hashed!
    },
  });

  // Output the email of the newly created user
  console.log(`Created user: ${user1.email}`);
}

// Execute the main function and handle disconnection and errors
main()
  .then(() => prisma.$disconnect()) // Disconnect from the database on successful completion
  .catch(async (e) => {
    console.error(e); // Log any errors
    await prisma.$disconnect(); // Ensure disconnection even if an error occurs
    process.exit(1); // Exit the process with an error code
  });
