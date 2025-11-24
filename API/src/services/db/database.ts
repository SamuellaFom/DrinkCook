import { DataSource } from "typeorm";
import { config } from "../../config/config";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.dbHost,
  port: 5432,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  synchronize: config.dbSynchronise,
  entities: [
    isProduction
      ? "dist/services/db/models/*.js"
      : "src/services/db/models/*.ts"
  ],
  migrations: [
    isProduction
      ? "dist/services/db/migrations/*.js"
      : "src/services/db/migrations/*.ts"
  ]
})