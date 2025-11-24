import { Request, Response } from "express";
import { CreateStockValidation, GetStockValidation, UpdateStockValidation } from "../../services/validators/backOffice/stock-valid";
import { AppDataSource } from "../../services/db/database";
import { Stock } from "../../services/db/models/stock";
import { Franchise } from "../../services/db/models/franchise";
import { Produit } from "../../services/db/models/produit";
import { generateValidationErrorMessage } from "../../services/validators";
import { ILike } from "typeorm";

export async function addStock(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = CreateStockValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const franchiseRepo = AppDataSource.getRepository(Franchise);
    const produitRepo = AppDataSource.getRepository(Produit);
    const stockRepo = AppDataSource.getRepository(Stock);

    const franchise = await franchiseRepo.findOneBy({ id: value.franchise });
    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise non trouvée',
      });
    }

    const produit = await produitRepo.findOneBy({ id: value.produit });
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    const existingStock = await stockRepo.findOne({
      where: {
        franchise: { id: franchise.id },
        produit: { id: produit.id },
      },
    });

    if (existingStock) {
      return res.status(409).json({
        success: false,
        message: 'Stock déjà existant pour ce produit dans cette franchise',
      });
    }

    const savedStock = await stockRepo.save({
      franchise,
      produit,
      quantite: value.quantite,
    });

    return res.status(201).json({
      success: true,
      data: savedStock,
    });

  } catch (err) {
    console.error('Erreur addStock:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getStocks(req: Request, res: Response): Promise<Response> {
  try {
    const franchiseId = req.query.franchiseId ? req.query.franchiseId : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const search = req.query.search ? String(req.query.search) : "";

    const skip = (page - 1) * limit;

    const stockRepo = AppDataSource.getRepository(Stock);

    const where: any = {};
    if (franchiseId) where.franchise = { id: franchiseId };
    if (search) where.produit = { nom: ILike(`%${search}%`) };

    const [stocks, total] = await stockRepo.findAndCount({
      where,
      relations: {
        franchise: true,
        produit: true,
      },
      skip,
      take: limit,
      order: { id: "DESC" },
    });

    return res.status(200).json({
      success: true,
      data: stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("Erreur getStocks:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
}

export async function updateStock(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateStockValidation.validate(req.params, req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const stockRepo = AppDataSource.getRepository(Stock);
    const franchiseRepo = AppDataSource.getRepository(Franchise);
    const produitRepo = AppDataSource.getRepository(Produit);

    const stock = await stockRepo.findOne({
      where: { id: value.id },
      relations: {
        franchise: true,
        produit: true,
      },
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock non trouvé',
      });
    }

    if (value.franchise) {
      const franchise = await franchiseRepo.findOneBy({ id: value.franchise });
      if (!franchise) {
        return res.status(404).json({ success: false, message: 'Franchise non trouvée' });
      }
      stock.franchise = franchise;
    }

    if (value.produit) {
      const produit = await produitRepo.findOneBy({ id: value.produit });
      if (!produit) {
        return res.status(404).json({ success: false, message: 'Produit non trouvé' });
      }
      stock.produit = produit;
    }

    if (value.quantite) {
      stock.quantite = value.quantite;
    }

    const updatedStock = await stockRepo.save(stock);

    return res.status(200).json({
      success: true,
      data: updatedStock
    });

  } catch (err) {
    console.error('Erreur updateStock:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}