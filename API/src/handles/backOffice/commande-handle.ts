import { Request, Response } from "express";
import { CommandeStock } from "../../services/db/models/commandes_stock";
import { AppDataSource } from "../../services/db/database";
import { StatutCommande } from "../../services/enums";
import { UpdateCommandeStockStatusValidation } from "../../services/validators/backOffice/commandeStock-valid";
import { generateValidationErrorMessage } from "../../services/validators";

export async function getCommandStock(req: Request, res: Response) {
  try {
    const franchiseId = req.query.franchiseId ? String(req.query.franchiseId) : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const skip = (page - 1) * limit;

    const commandStockRepo = AppDataSource.getRepository(CommandeStock);

    let query = commandStockRepo
      .createQueryBuilder("commande")
      .leftJoinAndSelect("commande.franchise", "franchise")
      .leftJoinAndSelect("commande.entrepot", "entrepot")
      .leftJoinAndSelect("commande.produits", "csp")
      .leftJoinAndSelect("csp.produit", "produit");

    if (franchiseId) {
      query = query.andWhere("franchise.id = :franchiseId", { franchiseId });
    }

    if (startDate) {
      query = query.andWhere("commande.date_commande >= :startDate", { startDate });
    }

    if (endDate) {
      query = query.andWhere("commande.date_commande <= :endDate", { endDate });
    }

    query = query.orderBy("commande.date_commande", "DESC")
      .skip(skip)
      .take(limit);

    const [commandes, total] = await query.getManyAndCount();

    return res.status(200).json({
      success: true,
      data: commandes,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("Erreur getCommandStock:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
}

export async function getCommandStockByStatus(req: Request, res: Response) {
  try {
    const status = StatutCommande.SOUMISE;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const commandStockRepo = AppDataSource.getRepository(CommandeStock);

    const [commandes, total] = await commandStockRepo.findAndCount({
      where: { statut: status },
      relations: ["franchise", "entrepot", "produits", "produits.produit"],
      skip,
      take: limit,
      order: { date_commande: "DESC" },
    });

    return res.status(200).json({
      success: true,
      data: commandes,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("Erreur getCommandStockByStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
}

export async function updateStatut(req: Request, res: Response) {
  try {
    const { error, value } = UpdateCommandeStockStatusValidation.validate({ ...req.params, ...req.body });

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const commandStockRepo = AppDataSource.getRepository(CommandeStock);
    const commande = await commandStockRepo.findOneBy({ id: value.id });

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    commandStockRepo.merge(commande, value);

    const updateCommande = await commandStockRepo.save(commande);

    return res.status(200).json({
      success: true,
      message: 'Commande stock mise à jour avec succès',
      data: updateCommande,
    });
  } catch (err) {
    console.error('Erreur updateCommandeStock :', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}