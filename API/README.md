# API REST - Node.js / TypeScript / PostgreSQL 

API REST complète construite avec Node.js, Express et TypeScript, connectée aux bases de données PostgreSQL. Le tout est conteneurisé avec Docker, et prêt pour un déploiement en production.

---

## Fonctionnalités

- API RESTful en TypeScript
- Authentification JWT
- Bases de données PostgreSQL
- Fichiers de migration et fixtures
- Environnements dev / prod séparés
- Docker + docker-compose (multi-environnements)

---

## Lancer en développement

```bash
cp .env.dev .env

npm run migration:run

npm run fixtures:dev

npm run start:dev
```

* API : [http://localhost:3000/v1](http://localhost:3000/v1)

---

## Commandes utiles

```bash
npm run build            # Compile TypeScript
npm run start:prod       # Démarre l'app en production
```

---