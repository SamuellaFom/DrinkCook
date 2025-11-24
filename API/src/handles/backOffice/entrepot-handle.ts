import { Request, Response } from "express";
import { CreateEntrepotValidation, GetEntrepotValidation, UpdateEntrepotValidation } from "../../services/validators/backOffice/entrepot-valid";
import { AppDataSource } from "../../services/db/database";
import { Entrepot } from "../../services/db/models/entrepot";
import { generateValidationErrorMessage, PaginationValidation } from "../../services/validators";

export async function addEntrepot(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = CreateEntrepotValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const entrepotRepo = AppDataSource.getRepository(Entrepot);
    const savedEntrepot = await entrepotRepo.save({
      nom: value.nom,
      adresse: value.adresse,
      ville: value.ville,
      code_postal: value.code_postal,
    });

    return res.status(201).json({
      success: true,
      data: savedEntrepot,
    });

  } catch (err) {
    console.error('Erreur addEntrepot:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getEntrepot(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = GetEntrepotValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const id = value.id

    const entrepotRepo = AppDataSource.getRepository(Entrepot);
    const entrepot = await entrepotRepo.createQueryBuilder('entrepot')
      .leftJoin('entrepot.commandesStocks', 'commandesStocks')
      .addSelect(["commandesStocks.id",
        "commandesStocks.id_formatted",
        "commandesStocks.date_commande",
        "commandesStocks.statut",
        "commandesStocks.montant_total"])

      .leftJoin('commandesStocks.produits', 'commandeProduits')
      .addSelect(['commandeProduits.id', 'commandeProduits.quantite', 'commandeProduits.prix_unitaire'])

      .leftJoin('commandeProduits.produit', 'produitCommande')
      .addSelect(['produitCommande.id', 'produitCommande.nom'])
      .where('entrepot.id = :id', { id })
      .getOne();

    if (!entrepot) {
      return res.status(404).json({ success: false, message: 'Entrepôt non trouvé' });
    }

    return res.status(200).json({ success: true, data: entrepot });

  } catch (err) {
    console.error('Erreur getEntrepot:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getAllEntrepot(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = PaginationValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const entrepots = await AppDataSource.getRepository(Entrepot)
      .createQueryBuilder('entrepot')
      .leftJoin('entrepot.commandesStocks', 'commandesStocks')
      .addSelect(["commandesStocks.id",
        "commandesStocks.id_formatted",
        "commandesStocks.date_commande",
        "commandesStocks.statut",
        "commandesStocks.montant_total"])

      .leftJoin('commandesStocks.produits', 'commandeProduits')
      .addSelect(['commandeProduits.id', 'commandeProduits.quantite', 'commandeProduits.prix_unitaire'])

      .leftJoin('commandeProduits.produit', 'produitCommande')
      .addSelect(['produitCommande.id', 'produitCommande.nom'])
      .getMany()

    return res.status(200).json({ success: true, data: entrepots });

  } catch (err) {
    console.error('Erreur getEntrepot:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function updateEntrepot(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateEntrepotValidation.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    console.log(value)

    const entrepotRepo = AppDataSource.getRepository(Entrepot);
    const entrepot = await entrepotRepo.findOneBy({ id: value.id });

    if (!entrepot) {
      return res.status(404).json({ success: false, message: 'Entrepôt non trouvé' });
    }

    if (value.nom) entrepot.nom = value.nom;
    if (value.adresse) entrepot.adresse = value.adresse;
    if (value.ville) entrepot.ville = value.ville;
    if (value.code_postal) entrepot.code_postal = value.code_postal;

    const updated = await entrepotRepo.save(entrepot);

    return res.status(200).json({ success: true, data: updated });

  } catch (err) {
    console.error('Erreur updateEntrepot:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}