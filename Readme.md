# Mon vieux Grimoire

---

Projet n°7 de la formation developpeur Web d'Openclassroom

---

## Information Générale

Il s’agit d’une petite chaîne de librairies qui souhaite ouvrir un site de référencement et de notation de livres : Mon Vieux Grimoire.

Ce projet contient toutes la partie Back End de l'application Mon vieux Grimoire.

Il est réalisé avec NodeJs, Express, Et il utilise MongoDb pour la persistance de données.

> **_Note:_** Le fichier .env est mis à disposition sur le dépot git pour les besoins de l'excercice, normalement ce dernier ne doit pas être commité pour des questions de sécurité

---

## Technologies

Nodejs version 4.0.0
Mongoose version 8.2.1
Express version 4.18.3

---

## Installation

#### Front End

Suivez les étapes ci-dessous pour installer et configurer le projet localement :

Clonez ce dépôt sur votre machine :
git clone https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres

Avec npm
Faites la commande `npm install` pour installer les dépendances puis `npm start` pour lancer le projet.

Le projet a été testé sur node 19

L'application sera accessible à l'adresse http://localhost:3000. Si le serveur fonctionne sur un port différent pour une raison quelconque, le numéro de port correspondant s'affichera dans la console.

#### Back End

Suivez les étapes ci-dessous pour installer et configurer le projet localement :

Clonez ce dépôt sur votre machine :
git clone https://github.com/DelphineSalmon/Mon_vieux_grimoire

Installez les dépendances nécessaires avec la commande suivante :

```bash
npm install
```

## Configuration

La commande `npm start` lance la commande ` nodemon --env-file=.env server`

Le fichier .env contient toutes les varaibles d'environnement neccessaire au projet:

-   USER_NAME => userName Mongo
-   USER_PWD => mot de passe Mongo
-   MONGODB_NAME => Nom du serveur Mongo
-   APP_NAME=> Nom de l'application
-   JWT_TOKEN=> Secret JWT
-   JWT_EXP=> Temps de validité du token (ex:24h)

---

## Lancement du Back-End

Lancez l'application avec la commande suivante :

```bash
npm start
```

L'application sera accessible à l'adresse http://localhost:4000. Si le serveur fonctionne sur un port différent pour une raison quelconque, le numéro de port correspondant s'affichera dans la console.
