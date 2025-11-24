import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { Role } from "../../services/db/models/role";

export async function getRolesInfo(req: Request, res: Response): Promise<Response> {
  try {
    const roles = await AppDataSource.getRepository(Role).find({
      select: ["id","type"],
    })

    return res.status(200).json({
      success: true,
      data: roles,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des infos des roles :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}