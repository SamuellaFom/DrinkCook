import { Request, Response } from "express";
import { CreateFranchiseValidation, GetFranchiseValidation, UpdateFranchiseValidation } from "../../services/validators/backOffice/franchise-valid";
import { AppDataSource } from "../../services/db/database";
import { Franchise } from "../../services/db/models/franchise";
import { generateValidationErrorMessage, PaginationValidation } from "../../services/validators";
import { Brackets, ILike, Repository } from "typeorm";

export async function addFranchise(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = CreateFranchiseValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const franchiseRepository = AppDataSource.getRepository(Franchise);
    const existingFranchise = await franchiseRepository.findOneBy({ siret: value.siret });
    if (existingFranchise) {
      return res.status(409).json({
        success: false,
        message: 'Une franchise avec ce SIRET existe déjà',
      });
    }

    const newFranchise = franchiseRepository.create(value);
    const savedFranchise = await franchiseRepository.save(newFranchise);

    return res.status(201).json({
      success: true,
      data: savedFranchise,
    });
  } catch (err) {
    console.error('Erreur lors de la création de la franchise:', err);
    return res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue.',
    });
  }
}

export async function getFranchiseInfo(req: Request, res: Response): Promise<Response> {
  try {
    const search = req.query.search ? String(req.query.search) : "";
    const status = req.query.status ? String(req.query.status) : "";
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const repo: Repository<Franchise> = AppDataSource.getRepository(Franchise);

    const where: any = {};

    if (status) {
      where.statut = status;
    }

    let franchises: Franchise[];
    let total = 0;

    if (search) {
      [franchises, total] = await repo.findAndCount({
        where: [
          { ...where, nom: ILike(`%${search}%`) },
          { ...where, ville: ILike(`%${search}%`) },
        ],
        select: ["id", "nom", "ville", "statut"],
        skip,
        take: limit,
        order: { nom: "ASC" },
      });
    } else {
      [franchises, total] = await repo.findAndCount({
        where,
        select: ["id", "nom", "ville", "statut"],
        order: { nom: "ASC" },
      });
    }

    return res.status(200).json({
      success: true,
      data: franchises,
      total,
      page,
      limit,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des infos des franchises :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getFranchise(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = GetFranchiseValidation.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const id = value.id

    const franchise = await AppDataSource.getRepository(Franchise)
      .createQueryBuilder("franchise")

      .leftJoin("franchise.users", "users")
      .addSelect(["users.id", "users.username", "users.email", "users.role"])

      .leftJoin("franchise.camion", "camion")
      .addSelect(["camion.id", "camion.immatriculation", "camion.statut"])

      .leftJoin("franchise.ventes", "ventes")
      .addSelect(["ventes.montant", "ventes.dateVente"])

      .leftJoin("franchise.stocks", "stocks")
      .addSelect(["stocks.id", "stocks.quantite"])
      .leftJoin("stocks.produit", "produit")
      .addSelect(["produit.id", "produit.nom", "produit.prix"])

      .leftJoin("franchise.commandesStocks", "commandesStocks")
      .addSelect([
        "commandesStocks.id",
        "commandesStocks.date_commande",
        "commandesStocks.statut",
        "commandesStocks.montant_total",
      ])
      .leftJoin("commandesStocks.produits", "commandeProduits")
      .addSelect(["commandeProduits.id", "commandeProduits.quantite", "commandeProduits.prix_unitaire"])
      .leftJoin("commandeProduits.produit", "produitCommande")
      .addSelect(["produitCommande.id", "produitCommande.nom"])
      .leftJoin("commandesStocks.entrepot", "entrepot")
      .addSelect(["entrepot.id", "entrepot.nom"])

      .where("franchise.id = :id", { id })
      .getOne();

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      data: franchise,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération de la franchise :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getFranchisePdf(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = GetFranchiseValidation.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const id = value.id

    let query = await AppDataSource.getRepository(Franchise)
      .createQueryBuilder("franchise")

      .leftJoin("franchise.users", "users")
      .addSelect(["users.id", "users.username", "users.email", "users.role"])
      
      .leftJoin("users.role", "role")
      .addSelect(["role.type"])

      .leftJoin("franchise.ventes", "ventes")
      .addSelect(["ventes.montant", "ventes.dateVente"])

      .leftJoin("franchise.camion", "camion")
      .addSelect(["camion.id", "camion.immatriculation", "camion.statut", "camion.kilometrage", "camion.date_achat"])

      .leftJoin("franchise.stocks", "stocks")
      .addSelect(["stocks.id", "stocks.quantite"])
      .leftJoin("stocks.produit", "produit")
      .addSelect(["produit.id", "produit.nom", "produit.prix"])

      .leftJoin("franchise.commandesStocks", "commandesStocks")
      .addSelect([
        "commandesStocks.id",
        "commandesStocks.date_commande",
        "commandesStocks.statut",
        "commandesStocks.montant_total",
      ])
      .leftJoin("commandesStocks.produits", "commandeProduits")
      .addSelect(["commandeProduits.id", "commandeProduits.quantite", "commandeProduits.prix_unitaire"])
      .leftJoin("commandeProduits.produit", "produitCommande")
      .addSelect(["produitCommande.id", "produitCommande.nom"])
      .leftJoin("commandesStocks.entrepot", "entrepot")
      .addSelect(["entrepot.id", "entrepot.nom"])
      .where("franchise.id = :id", { id })

    if (startDate) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where("commandesStocks.date_commande >= :startDate", { startDate })
            .orWhere("commandesStocks.id IS NULL");
        })
      ).andWhere(
        new Brackets((qb) => {
          qb.where("ventes.dateVente >= :startDate", { startDate })
            .orWhere("ventes.id IS NULL");
        })
      );
    }

    if (endDate) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where("commandesStocks.date_commande <= :endDate", { endDate })
            .orWhere("commandesStocks.id IS NULL");
        })
      ).andWhere(
        new Brackets((qb) => {
          qb.where("ventes.dateVente <= :endDate", { endDate })
            .orWhere("ventes.id IS NULL");
        })
      );
    }

    const franchise = await query.getOne();

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      data: franchise,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération de la franchise pour pdf:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getAllFranchisePdf(req: Request, res: Response): Promise<Response> {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    let query = AppDataSource.getRepository(Franchise)
      .createQueryBuilder("franchise")
      .leftJoin("franchise.users", "users")
      .addSelect(["users.id"])
      .leftJoin("franchise.ventes", "ventes")
      .addSelect(["ventes.montant", "ventes.dateVente"])
      .leftJoin("franchise.camion", "camion")
      .addSelect(["camion.id", "camion.immatriculation"])
      .leftJoin("franchise.commandesStocks", "commandesStocks")
      .addSelect(["commandesStocks.id", "commandesStocks.date_commande"]);

    if (startDate) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where("commandesStocks.date_commande >= :startDate", { startDate })
            .orWhere("commandesStocks.id IS NULL");
        })
      ).andWhere(
        new Brackets((qb) => {
          qb.where("ventes.dateVente >= :startDate", { startDate })
            .orWhere("ventes.id IS NULL");
        })
      );
    }

    if (endDate) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where("commandesStocks.date_commande <= :endDate", { endDate })
            .orWhere("commandesStocks.id IS NULL");
        })
      ).andWhere(
        new Brackets((qb) => {
          qb.where("ventes.dateVente <= :endDate", { endDate })
            .orWhere("ventes.id IS NULL");
        })
      );
    }

    const franchises = await query.getMany();

    const franchiseFormatted = franchises.map((f) => {
      const ca = f.ventes?.reduce((sum, v) => sum + Number(v.montant || 0), 0) || 0;
      const commandes = f.commandesStocks?.length || 0;
      const employes = f.users?.length || 0;
      const camion = f.camion?.immatriculation || "Aucun";
      const statut = f.statut || "Inconnu";

      return {
        nom: f.nom,
        ville: f.ville,
        ca,
        commandes,
        employes,
        camion,
        statut,
      };
    });

    return res.status(200).json({
      success: true,
      data: franchiseFormatted,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des franchises pour pdf :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}


export async function getAllFranchise(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = PaginationValidation.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const franchises = await AppDataSource.getRepository(Franchise)
      .createQueryBuilder('franchise')
      .leftJoin('franchise.users', 'users')
      .addSelect(['users.id', 'users.username', 'users.role'])

      .leftJoin('franchise.camion', 'camion')
      .addSelect(['camion.id', 'camion.immatriculation', 'camion.statut'])

      .leftJoin('franchise.stocks', 'stocks')
      .addSelect(['stocks.id', 'stocks.quantite'])

      .leftJoin('stocks.produit', 'produit')
      .addSelect(['produit.id', 'produit.nom', 'produit.prix'])

      .leftJoin('franchise.commandesStocks', 'commandesStocks')
      .addSelect(['commandesStocks.id', 'commandesStocks.date_commande', 'commandesStocks.statut'])

      .leftJoin('commandesStocks.produits', 'commandeProduits')
      .addSelect(['commandeProduits.id', 'commandeProduits.quantite', 'commandeProduits.prix_unitaire'])

      .leftJoin('commandeProduits.produit', 'produitCommande')
      .addSelect(['produitCommande.id', 'produitCommande.nom'])

      .leftJoin('commandesStocks.entrepot', 'entrepot')
      .addSelect(['entrepot.id', 'entrepot.nom'])
      .getMany()

    return res.status(200).json({
      success: true,
      data: franchises,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des franchises :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function updateFranchise(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateFranchiseValidation.validate({ ...req.params, ...req.body });

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const franchiseRepository = AppDataSource.getRepository(Franchise);
    const franchise = await franchiseRepository.findOneBy({ id: value.id });
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise introuvable' });
    }

    franchiseRepository.merge(franchise, value);

    const updatedFranchise = await franchiseRepository.save(franchise);

    return res.status(200).json({
      success: true,
      message: 'Franchise mise à jour avec succès',
      data: updatedFranchise,
    });

  } catch (err) {
    console.error('Erreur updateFranchise :', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}