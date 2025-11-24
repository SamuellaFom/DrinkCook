import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { Entretien } from "../../services/db/models/entretien";
import { generateValidationErrorMessage } from "../../services/validators";
import { Camion } from "../../services/db/models/camion";
import { CreateEntretienValidation } from "../../services/validators/backOffice/entretien-validator";

export async function addEntretion(req: Request, res: Response) {
  try {
    const { error, value } = CreateEntretienValidation.validate(req.body);
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

    const entretienRepo = AppDataSource.getRepository(Entretien);
    const savedEntretien = await entretienRepo.save({
      camion: foundCamion,
      date_revision: new Date(value.date_revision),
      description: value.description,
      kilometrage: value.kilometrage,
      realisé_par: value.realisé_par,
    })

    return res.status(201).json({
      success: true,
      message: 'Camion créé avec succès',
      data: savedEntretien,
    });

  } catch (err) {
    console.error('Erreur addEntretien:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}