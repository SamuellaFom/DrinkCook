export const productFixture = [
  // Boissons
  { nom: "Eau plate 50 cl", description: "Bouteille 50 cl", prix: 0.26, actif: true, category: { id: 1 } },
  { nom: "Eau pétillante 50 cl", description: "Bouteille 50 cl", prix: 0.30, actif: true, category: { id: 1 } },
  { nom: "Limonade artisanale 33 cl", description: "Bouteille 33 cl", prix: 0.60, actif: true, category: { id: 1 } },
  { nom: "Thé glacé pêche 33 cl", description: "Bouteille 33 cl", prix: 0.50, actif: true, category: { id: 1 } },
  { nom: "Soda cola artisanal 33 cl", description: "Bouteille 33 cl", prix: 0.45, actif: true, category: { id: 1 } },
  { nom: "Jus d’orange pressé 25 cl", description: "Bouteille 25 cl", prix: 0.85, actif: true, category: { id: 1 } },
  { nom: "Smoothie mangue-ananas 25 cl", description: "Bouteille 25 cl", prix: 1.20, actif: true, category: { id: 1 } },
  { nom: "Kombucha framboise 33 cl", description: "Bouteille 33 cl", prix: 1.35, actif: true, category: { id: 1 } },

  // Café
  { nom: "Espresso 25 cl", description: "Dosette ou grains", prix: 0.22, actif: true, category: { id: 6 } },
  { nom: "Americano 25 cl", description: "", prix: 0.28, actif: true, category: { id: 6 } },
  { nom: "Cappuccino 25 cl", description: "Café + lait + gobelet", prix: 0.42, actif: true, category: { id: 6 } },
  { nom: "Latte vanille 30 cl", description: "Sirop inclus", prix: 0.55, actif: true, category: { id: 6 } },
  { nom: "Macchiato caramel 20 cl", description: "", prix: 0.48, actif: true, category: { id: 6 } },
  { nom: "Café glacé 30 cl", description: "", prix: 0.62, actif: true, category: { id: 6 } },
  { nom: "Décaféiné 25 cl", description: "", prix: 0.25, actif: true, category: { id: 6 } },
  { nom: "Chocolat chaud 25 cl", description: "Poudre cacao + lait", prix: 0.58, actif: true, category: { id: 6 } },

  // Desserts
  { nom: "Cookie chocolat 80 g", description: "", prix: 0.75, actif: true, category: { id: 2 } },
  { nom: "Brownie noix 90 g", description: "", prix: 1.00, actif: true, category: { id: 2 } },
  { nom: "Cheesecake fruits rouges 120 g", description: "", prix: 1.80, actif: true, category: { id: 2 } },
  { nom: "Mousse au chocolat 110 g", description: "", prix: 1.10, actif: true, category: { id: 2 } },
  { nom: "Tiramisu 120 g", description: "", prix: 1.60, actif: true, category: { id: 2 } },
  { nom: "Muffin myrtille 90 g", description: "", prix: 0.85, actif: true, category: { id: 2 } },
  { nom: "Salade de fruits 150 g", description: "", prix: 1.20, actif: true, category: { id: 2 } },
  { nom: "Pavlova 110 g", description: "Base + crème", prix: 1.40, actif: true, category: { id: 2 } },

  // Snacks
  { nom: "Frites 150 g", description: "Portion individuelle", prix: 0.35, actif: true, category: { id: 3 } },
  { nom: "Potatoes 150 g", description: "Portion individuelle", prix: 0.42, actif: true, category: { id: 3 } },
  { nom: "Bâtonnets mozzarella 25 g", description: "Portion individuelle", prix: 0.30, actif: true, category: { id: 3 } },
  { nom: "Onion rings 25 g", description: "Portion individuelle", prix: 0.22, actif: true, category: { id: 3 } },
  { nom: "Nuggets poulet 20 g", description: "Portion individuelle", prix: 0.23, actif: true, category: { id: 3 } },
  { nom: "Ailes de poulet BBQ 80–100 g", description: "", prix: 0.65, actif: true, category: { id: 3 } },
  { nom: "Nachos + cheddar portion", description: "", prix: 0.85, actif: true, category: { id: 3 } },
  { nom: "Falafels 25 g", description: "", prix: 0.18, actif: true, category: { id: 3 } },

  // Salades
  { nom: "César poulet 350 g", description: "", prix: 3.60, actif: true, category: { id: 4 } },
  { nom: "Grecque 320 g", description: "", prix: 3.10, actif: true, category: { id: 4 } },
  { nom: "Quinoa/avocat/pois-chiches 360 g", description: "", prix: 3.90, actif: true, category: { id: 4 } },
  { nom: "Niçoise 350 g", description: "", prix: 3.50, actif: true, category: { id: 4 } },
  { nom: "Burrata & tomates 350 g", description: "", prix: 4.10, actif: true, category: { id: 4 } },
  { nom: "Falafel bowl 350 g", description: "", prix: 3.40, actif: true, category: { id: 4 } },
  { nom: "Poulet teriyaki 360 g", description: "", prix: 3.90, actif: true, category: { id: 4 } },
  { nom: "Saumon fumé agrumes 360 g", description: "", prix: 4.60, actif: true, category: { id: 4 } },

  // Sandwiches
  { nom: "Burger classique", description: "", prix: 3.20, actif: true, category: { id: 5 } },
  { nom: "Burger veggie", description: "", prix: 3.30, actif: true, category: { id: 5 } },
  { nom: "Hot-dog gourmet", description: "", prix: 1.60, actif: true, category: { id: 5 } },
  { nom: "Panini jambon-fromage", description: "", prix: 1.80, actif: true, category: { id: 5 } },
  { nom: "Panini caprese", description: "", prix: 1.95, actif: true, category: { id: 5 } },
  { nom: "Wrap poulet curry", description: "", prix: 2.50, actif: true, category: { id: 5 } },
  { nom: "Bánh mì poulet", description: "", prix: 2.70, actif: true, category: { id: 5 } },
  { nom: "Club sandwich", description: "", prix: 2.80, actif: true, category: { id: 5 } },
];
