import { AppDataSource } from "../services/db/database";
import { Role } from "../services/db/models/role";
import { Client } from "../services/db/models/client";
import { CategoryProduct } from "../services/db/models/categoryProduct";
import { Camion } from "../services/db/models/camion";
import { Franchise } from "../services/db/models/franchise";
import { User } from "../services/db/models/user";
import { Produit } from "../services/db/models/produit";
import { Emplacement } from "@/services/db/models/emplacement";

import { camionFixture } from "./camion-fixture";
import { categoryFixture } from "./category-fixture";
import { clientFixture } from "./client-fixture";
import { franchiseFixture } from "./franchise-fixture";
import { roleFixture } from "./role-fixture";
import { userFixture } from "./user-fixture";
import { productFixture } from "./productFixture";
import { emplacementFixture } from "./emplacement-fixture";

export async function loadFixtures() {
  const roleRepo = AppDataSource.getRepository(Role);
  const categoryRepo = AppDataSource.getRepository(CategoryProduct);
  const clientRepo = AppDataSource.getRepository(Client);
  const franchiseRepo = AppDataSource.getRepository(Franchise);
  const camionRepo = AppDataSource.getRepository(Camion);
  const userRepo = AppDataSource.getRepository(User);
  const produitRepo = AppDataSource.getRepository(Produit);
  const emplacementRepo = AppDataSource.getRepository(Emplacement);

  for (const roleData of roleFixture) {
    const role = roleRepo.create(roleData);
    await roleRepo.save(role);
  }

  for (const categoryData of categoryFixture) {
    const category = categoryRepo.create(categoryData);
    await categoryRepo.save(category);
  }

  for (const clientData of clientFixture) {
    const client = clientRepo.create(clientData);
    await clientRepo.save(client);
  }

  for (const franchiseData of franchiseFixture) {
    const franchise = franchiseRepo.create(franchiseData);
    await franchiseRepo.save(franchise);
  }

  for (const camionData of camionFixture) {
    const camion = camionRepo.create(camionData);
    await camionRepo.save(camion);
  }

  for (const produitData of productFixture) {
    const produit = produitRepo.create(produitData);
    await produitRepo.save(produit);
  }

  for (const emplacementData of emplacementFixture) {
    const emplacement = emplacementRepo.create(emplacementData);
    await emplacementRepo.save(emplacement);
  }

  for (const userData of userFixture) {
    const user = userRepo.create(userData);
    await userRepo.save(user);
  }

  console.log("All fixtures loaded successfully!");
}