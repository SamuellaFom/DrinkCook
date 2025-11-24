# Drivn Cook – Frontend + Backend

## Description
**Drivn Cook** est une application composée d’un front-end (React) et d’un back-end (Node.js/Express).  
Le projet est entièrement containerisé avec **Docker Compose** pour simplifier l’installation et le déploiement.

---

## Installation & Lancement
Assurez-vous d'avoir **Docker** et **Docker Compose** installés sur votre machine.

1. **Cloner le projet :**

2. **Créer un fichier `.env` à la racine** 

3. **Lancer les services avec Docker Compose :**
   ```bash
   docker compose --env-file .env up --build -d
   ```

4. **Accéder aux services :**
   - Backend  : [http://localhost:3000/v1](http://localhost:3000/v1)
   - Frontend : [http://localhost:8080/drivn](http://localhost:8080/drivn)

---

## Technologies principales

### **Frontend**
- React
- Tailwind
- Axios
- React Router

### **Backend**
- Node.js + Express
- JWT pour l’authentification
- Base de données (PostgreSQL)

---

## Commandes utiles
- **Arrêter les services :**
  ```bash
  docker compose down
  ```

- **Rebuild et relancer :**
  ```bash
  docker compose --env-file .env up --build -d
  ``` 
