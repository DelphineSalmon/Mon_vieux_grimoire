const express = require('express')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user')
const bookRoutes = require('./routes/book')
const path = require('path')
const rateLimit = require('express-rate-limit')
const app = express()

//config rate limit pour controler le trafic
const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})

//recuperation des variables d'environnement des données de connection sensible defini dans .env//
const userName = process.env.USER_NAME
const pwd = process.env.USER_PWD
const mongoServerName = process.env.MONGODB_NAME
const appName = process.env.APP_NAME

//mongo connection
mongoose
    .connect(
        `mongodb+srv://${userName}:${pwd}@${mongoServerName}/?retryWrites=true&w=majority&appName=${appName}`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log(`Connexion à MongoDB échouée !`))

//middelware générique
//application de  rate limiting
app.use(limiter)

// utilisation du json dans le corps des requete
app.use(express.json())

//  add response header server
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})

// middelware lier a une url
//répertoire statique pour les images
app.use('/images', express.static(path.join(__dirname, 'images')))
// routes
app.use('/api/auth', userRoutes)
app.use('/api/books', bookRoutes)

module.exports = app
