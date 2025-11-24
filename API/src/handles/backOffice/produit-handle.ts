import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { Produit } from "../../services/db/models/produit";
import { CreateProduitValidation, GetProduitValidation, UpdateProduitValidation } from "../../services/validators/backOffice/produit-valid";
import { generateValidationErrorMessage, PaginationValidation } from "../../services/validators";
import { CategoryProduct } from "../../services/db/models/categoryProduct";

export async function addProduit(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = CreateProduitValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const categoryRepo = AppDataSource.getRepository(CategoryProduct);
    const foundCategory = await categoryRepo.findOneBy({ id: value.category });
    if (!foundCategory) {
      return res.status(404).json({ success: false, message: 'Categorie non trouvée' });
    }

    const produitRepo = AppDataSource.getRepository(Produit);
    const savedProduit = await produitRepo.save({
      nom: value.nom,
      category: foundCategory,
      description: value.description,
      prix: value.prix,
      actif: value.actif,
    });

    return res.status(201).json({ success: true, data: savedProduit });
  } catch (err) {
    console.error('Erreur addProduit:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getProduit(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = GetProduitValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const produitRepo = AppDataSource.getRepository(Produit);

    const produit = await produitRepo.findOne({
      where: { id: value.id },
      relations: ['stocks', 'commandeStockProduits', 'commandeStockProduits.commande'],
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    return res.status(200).json({ success: true, data: produit });

  } catch (err) {
    console.error('Erreur getProduit:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getAllAProduit(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = PaginationValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const produitRepo = AppDataSource.getRepository(Produit);

    const produits = await produitRepo.find({
      relations: ['stocks', 'category', 'commandeStockProduits', 'commandeStockProduits.commande'],
    });

    return res.status(200).json({ success: true, data: produits });

  } catch (err) {
    console.error('Erreur getProduit:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function updateProduit(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateProduitValidation.validate({...req.params, ...req.body});
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const produitRepo = AppDataSource.getRepository(Produit);
    const produit = await produitRepo.findOneBy({ id: value.id });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    if (value.nom) produit.nom = value.nom;
    if (value.description) produit.description = value.description;
    if (value.prix) produit.prix = value.prix;
    if (value.actif) produit.actif = value.actif;

    if (value.category) {
      const categoryRepo = AppDataSource.getRepository(CategoryProduct);

      const foundCategory = await categoryRepo.findOneBy({ id: value.category });
      if (!foundCategory) {
        return res.status(404).json({ success: false, message: 'Categorie non trouvée' });
      }
      produit.category = foundCategory;
    }

    const updatedProduit = await produitRepo.save(produit);

    return res.status(200).json({
      success: true,
      data: updatedProduit
    });
  } catch (err) {
    console.error('Erreur updateProduit:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}