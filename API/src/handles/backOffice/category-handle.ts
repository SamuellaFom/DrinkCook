import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { CategoryProduct } from "../../services/db/models/categoryProduct";

export async function getAllCategory(req: Request, res: Response): Promise<Response> {
  try {

    const categoryRepo = AppDataSource.getRepository(CategoryProduct);

    const category = await categoryRepo.find();

    return res.status(200).json({ success: true, data: category });

  } catch (err) {
    console.error('Erreur getcategory:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}