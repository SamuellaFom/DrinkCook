import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import morgan from 'morgan';
import dotenv from 'dotenv';
import { routerAuth } from "./routes/auth";
import { AppDataSource } from "./services/db/database";
import { routerBackoffice } from "./routes/backOffice";
import {routerFrontoffice} from "./routes/frontOffice";

dotenv.config();

const app = async () => {
  const app = express();
  const port = process.env.PORT || 3002;

  try {
    await AppDataSource.initialize();

    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan("dev"));
    app.use(
      cors({
        origin: process.env.CORSURL,
        credentials: true,
      })
    );


    app.use(`/${process.env.API_PREFIX}/back-office`, routerBackoffice);
    app.use(`/${process.env.API_PREFIX}/front-office`, routerFrontoffice);

    app.use(`/${process.env.API_PREFIX}/auth`, routerAuth);

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/${process.env.API_PREFIX}`)
    })

  } catch (error) {
    console.error("Échec de la connexion à la base de données :", error);
    process.exit(1);
  }
};

app()