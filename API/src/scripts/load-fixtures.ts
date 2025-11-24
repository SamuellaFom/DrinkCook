import "reflect-metadata";
import { AppDataSource } from "../services/db/database";
import { loadFixtures } from "../fixtures/fixturesLoader";

async function main() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    await loadFixtures();
    console.log("Fixtures loaded successfully!");

    await AppDataSource.destroy();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error loading fixtures:", error);
    process.exit(1);
  }
}

main();