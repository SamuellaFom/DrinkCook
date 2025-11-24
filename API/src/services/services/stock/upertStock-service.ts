import {AppDataSource} from "../../db/database";
import {Stock} from "../../db/models/stock";

export async function upsertStock(
    franchiseId: string,
    produitId: string,
    changementQuantite: number
) {
    const repoStock = AppDataSource.getRepository(Stock);


    let ligneStock = await repoStock.findOne({
        where: { franchise: { id: franchiseId }, produit: { id: produitId } },
    });


    if (!ligneStock) {
        ligneStock = repoStock.create({
            franchise: { id: franchiseId },
            produit:   { id: produitId },
            quantite:  0,
        });
    }

    ligneStock.quantite = Number(ligneStock.quantite) + Number(changementQuantite);

    return await repoStock.save(ligneStock);

}

