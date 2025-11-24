import { Request, Response } from "express";
import { AppDataSource } from "../../services/db/database";
import { Camion } from "../../services/db/models/camion";
import { CreateCamionValidation, GetCamionValidation, UpdateCamionValidation } from "../../services/validators/backOffice/camion-valid";
import { generateValidationErrorMessage } from "../../services/validators";
import { Franchise } from "../../services/db/models/franchise";
import { PaginationValidation } from "../../services/validators";
import { Emplacement } from "../../services/db/models/emplacement";
import { CamionEmplacement } from "../../services/db/models/camionEmplacement";

export async function addCamion(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = CreateCamionValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const franchiseRepo = AppDataSource.getRepository(Franchise);
    const foundFranchise = await franchiseRepo.findOneBy({ id: value.franchise });

    if (!foundFranchise) {
      return res.status(404).json({ success: false, message: 'Franchise non trouvée' });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const savedCamion = await camionRepo.save({
      franchise: foundFranchise,
      immatriculation: value.immatriculation,
      date_achat: value.date_achat,
      kilometrage: value.kilometrage,
      statut: value.statut,
    });

    return res.status(201).json({
      success: true,
      message: 'Camion créé avec succès',
      data: savedCamion,
    });

  } catch (err) {
    console.error('Erreur addCamion:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getCamion(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = GetCamionValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const camion = await camionRepo
      .createQueryBuilder('camion')
      .leftJoinAndSelect('camion.franchise', 'franchise')
      .addSelect(['franchise.id', 'franchise.nom'])

      .leftJoinAndSelect('camion.pannes', 'panne')
      .addSelect(['panne.id', 'panne.statut', 'panne.created_at', 'panne.date_panne', 'panne.description'])

      .leftJoinAndSelect('camion.entretiens', 'entretien')
      .addSelect([
        'entretien.id',
        'entretien.date_revision',
        'entretien.realisé_par',
        'entretien.kilometrage',
        'entretien.description',
        'entretien.created_at',
      ])

      .leftJoinAndSelect('camion.emplacements', 'assign')
      .leftJoinAndSelect('assign.emplacement', 'emplacement')
      .addSelect(['emplacement.id', 'emplacement.nom', 'emplacement.ville'])

      .where('camion.id = :id', { id: value.id })
      .getOne();

    if (!camion) {
      return res.status(404).json({
        success: false,
        message: 'Camion non trouvé',
      });
    }

    return res.status(200).json({
      success: true,
      data: camion,
    });

  } catch (err) {
    console.error('Erreur getCamion:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getCamionInfo(req: Request, res: Response) {
  try {
    const camions = await AppDataSource.getRepository(Camion).find({
      select: ["id", "immatriculation"]
    })

    return res.status(200).json({
      success: true,
      data: camions,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des infos des camions :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }

}

export async function getAllCamion(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = PaginationValidation.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const camions = await camionRepo
      .createQueryBuilder('camion')
      .leftJoinAndSelect('camion.franchise', 'franchise')
      .addSelect(['franchise.id', 'franchise.nom'])
      .getMany()

    return res.status(200).json({
      success: true,
      data: camions,
    });

  } catch (err) {
    console.error('Erreur getCamion:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function updateCamion(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateCamionValidation.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const camion = await camionRepo.findOne({
      where: { id: value.id },
      relations: ['franchise'],
    });

    if (!camion) {
      return res.status(404).json({ success: false, message: 'Camion non trouvé' });
    }

    if (value.immatriculation) camion.immatriculation = value.immatriculation;
    if (value.statut) camion.statut = value.statut;
    if (value.date_achat) camion.date_achat = new Date(value.date_achat);
    if (value.kilometrage) camion.kilometrage = parseInt(value.kilometrage, 10);

    if (value.franchise) {
      const franchiseRepo = AppDataSource.getRepository(Franchise);
      const foundFranchise = await franchiseRepo.findOneBy({ id: value.franchise });

      if (!foundFranchise) {
        return res.status(404).json({ success: false, message: 'Franchise non trouvée' });
      }

      camion.franchise = foundFranchise;
    }

    const updatedCamion = await camionRepo.save(camion);

    return res.status(200).json({
      success: true,
      message: 'Camion mis à jour',
      data: updatedCamion,
    });

  } catch (err) {
    console.error('Erreur updateCamion:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export const assignCamionToEmplacement = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { camionId, emplacementId } = req.body;

    if (!camionId || !emplacementId) {
      return res.status(400).json({
        success: false,
        message: "camionId et emplacementId sont requis",
      });
    }

    const camionRepo = AppDataSource.getRepository(Camion);
    const emplacementRepo = AppDataSource.getRepository(Emplacement);
    const camionEmplacementRepo = AppDataSource.getRepository(CamionEmplacement);

    const camion = await camionRepo.findOne({ where: { id: camionId } });
    const emplacement = await emplacementRepo.findOne({ where: { id: emplacementId } });

    if (!camion) {
      return res.status(404).json({ success: false, message: "Camion introuvable" });
    }
    if (!emplacement) {
      return res.status(404).json({ success: false, message: "Emplacement introuvable" });
    }
    
    const camionEmplacement = camionEmplacementRepo.create({
      camion,
      emplacement,
    });
    await camionEmplacementRepo.save(camionEmplacement);

    return res.status(201).json({
      success: true,
      message: "Camion assigné avec succès",
      data: camionEmplacement,
    });
  } catch (error) {
    console.error("Erreur assignation camion:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export async function getEmplacementInfo(req: Request, res: Response) {
  try {
    const emplacements = await AppDataSource.getRepository(Emplacement).find({
      select: ["id", "nom"]
    })

    return res.status(200).json({
      success: true,
      data: emplacements,
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des infos des emplacements :', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }

}