import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { Panne } from "../../services/db/models/panne";
import { generateValidationErrorMessage } from "../../services/validators";
import { Camion } from "../../services/db/models/camion";
import { CreatePanneValidation, UpdatePanneValidation } from "../../services/validators/backOffice/panne-validator";

export async function addPanne(req: Request, res: Response) {
  try {

    const { error, value } = CreatePanneValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const foundCamion = await camionRepo.findOneBy({ id: value.camion });

    if (!foundCamion) {
      return res.status(404).json({ success: false, message: 'Camion non trouvée' });
    }

    const panneRepo = AppDataSource.getRepository(Panne);
    const savedPanne = await panneRepo.save({
      camion: foundCamion,
      date_panne: value.date_panne,
      description: value.description,
      statut: value.statut
    })

    return res.status(201).json({
      success: true,
      message: 'Panne créé avec succès',
      data: savedPanne,
    });

  } catch (err) {
    console.error('Erreur addPanne:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getPannes(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    let query = await AppDataSource.getRepository(Panne)
      .createQueryBuilder("panne")
      .leftJoin("panne.camion", "camion")
      .addSelect(["camion.id", "camion.immatriculation"])

    if (startDate) {
      query = query.andWhere("panne.date_panne >= :startDate", { startDate });
    }

    if (endDate) {
      query = query.andWhere("panne.date_panne <= :endDate", { endDate });
    }

    query = query.orderBy("panne.date_panne", "DESC")

    const commandes = await query.getMany();


    return res.status(200).json({
      success: true,
      data: commandes,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des pannes :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getPanne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id est requis",
      });
    }

    let query = await AppDataSource.getRepository(Panne)
      .createQueryBuilder("panne")
      .leftJoin("panne.camion", "camion")
      .addSelect(["camion.id", "camion.immatriculation"])
      .where('panne.id = :id', { id })
      .getOne();

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Panne non trouvé',
      });
    }

    return res.status(200).json({
      success: true,
      data: query,
    });


  } catch (err) {
    console.error('Erreur lors de la récupération de la panne :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function UpdatePanne(req: Request, res: Response) {
  try {

    const { error, value } = UpdatePanneValidation.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }
    const panneRepo = AppDataSource.getRepository(Panne);
    const panne = await panneRepo.findOneBy({ id: value.id });
    if (!panne) {
      return res.status(404).json({ success: false, message: 'Panne introuvable' })
    }

    panneRepo.merge(panne, value);

    const updatePanne = await panneRepo.save(panne);

    return res.status(201).json({
      success: true,
      message: 'Panne créé avec succès',
      data: updatePanne,
    });

  } catch (err) {
    console.error('Erreur addPanne:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}