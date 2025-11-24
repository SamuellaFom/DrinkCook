import { Request, Response } from "express";
import { CreateUserValidation, GetUserValidation, UpdateUserValidation, UpdatePasswordValidation } from "../../services/validators/backOffice/user-valid";
import { AppDataSource } from "../../services/db/database";
import { User } from "../../services/db/models/user";
import { generateValidationErrorMessage } from "../../services/validators";
import { Franchise } from "../../services/db/models/franchise";
import { hash } from "bcrypt";
import { Role } from "../../services/db/models/role";
import { QueryFailedError } from "typeorm";

export async function addUser(req: Request, res: Response) {
  try {
    const { error, value } = CreateUserValidation.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOneBy({ email: value.email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email déjà utilisé',
      });
    }

    const franchiseRepo = AppDataSource.getRepository(Franchise);
    const roleRepository = AppDataSource.getRepository(Role);
    const foundRole = await roleRepository.findOneBy({ type: value.role });
    const foundFranchise = await franchiseRepo.findOneBy({ id: value.franchise });

    if (!foundFranchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise non trouvée',
      });
    }

    if (!foundRole) {
      return res.status(404).json({
        success: false,
        message: 'Role non trouvée',
      });
    }
    
    await userRepository.save({
      username: value.username,
      email: value.email,
      franchise: foundFranchise,
      role: foundRole
    });

    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
    });

  } catch (error) {
    if (error instanceof QueryFailedError && error.driverError.code === "23505") {
      res.status(400).send({ success: false, message: "Email already exist" })
    }

    if (error instanceof Error) {
      console.log(error.message)
    }
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

export async function getUser(req: Request, res: Response): Promise<Response> {
  try {

    const { error, value } = GetUserValidation.validate(req.params)

    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder('user')
      .leftJoin('user.franchise', 'franchise')
      .addSelect(['franchise.id', 'franchise.nom'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.type'])
      .where('user.id = :id', { id: value.id })
      .getOne();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });

  } catch (err) {
    console.error('Erreur getUser:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getAllUser(req: Request, res: Response): Promise<Response> {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
      .createQueryBuilder('user')
      .addSelect(['user.username', 'user.email', 'user.createdAt'])
      .leftJoin('user.franchise', 'franchise')
      .addSelect(['franchise.id', 'franchise.nom'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.type'])
      .getMany();

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (err) {
    console.error('Erreur getUser:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function updateUser(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdateUserValidation.validate({ ...req.params, ...req.body });
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: value.id },
      relations: ['franchise', 'role'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (value.username) user.username = value.username;
    if (value.email) user.email = value.email;
    if (value.role) {
      const roleRepository = AppDataSource.getRepository(Role);
      const foundRole = await roleRepository.findOneBy({ type: value.role })

      if (!foundRole) {
        return res.status(404).json({
          success: false,
          message: 'Role non trouvée',
        });
      }

      user.role = foundRole;
    }

    if (value.franchise) {
      const franchiseRepo = AppDataSource.getRepository(Franchise);
      const foundFranchise = await franchiseRepo.findOneBy({ id: value.franchise });

      if (!foundFranchise) {
        return res.status(404).json({ success: false, message: 'Franchise non trouvée' });
      }

      user.franchise = foundFranchise;
    }

    const updatedUser = await userRepo.save(user);

    const { password, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: userWithoutPassword,
    });

  } catch (err) {
    console.error('Erreur updateUser:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function updateUserPassword(req: Request, res: Response): Promise<Response> {
  try {
    const { error, value } = UpdatePasswordValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: generateValidationErrorMessage(error.details),
      });
    }

    if (value.password !== value.confirmpassword) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe sont différents',
      });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: value.email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    user.password = await hash(value.password, 10);
    const updatedUser = await userRepo.save(user);

    const { password, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      data: userWithoutPassword,
    });

  } catch (err) {
    console.error('Erreur updateUserPassword:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}