const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('email-validator')
const passwordValidator = require('password-validator')
const sanitize = require('mongo-sanitize')

//logique création user
exports.signup = (req, res, next) => {
    //verifiaction validité d'un email
    if (!validator.validate(req.body.email)) {
        return res.status(400).json({ message: 'email invalide' })
    }
    // Verification validité pwd
    const schema = new passwordValidator()
    schema
        .is()
        .min(4)
        .is()
        .max(100)
        .has()
        .uppercase()
        .has()
        .lowercase()
        .has()
        .digits(1)
        .has()
        .not()
        .spaces()
        .is()
        .not()
        .oneOf(['Passw0rd', 'Password123'])
    if (!schema.validate(req.body.password)) {
        return res.status(400).json({ message: 'password invalide' })
    }

    bcrypt
        .hash(req.body.password, 10) //hachage pwd
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            })
            return user.save()
        })
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) //crée
        .catch((error) => res.status(500).json({ error })) //erreur serveur
}
//logique d'authentification
exports.login = (req, res, next) => {
    const cleanEmail = sanitize(req.body.email)
    var currentUser
    User.findOne({ email: cleanEmail })
        .then((user) => {
            if (!user) {
                return res
                    .status(404) // not found
                    .json({ message: 'Utilisateur non trouvé' })
            }
            currentUser = user
            return bcrypt.compare(req.body.password, user.password)
        })
        .then((valid) => {
            if (!valid) {
                return res
                    .status(400) //bad request
                    .json({ message: 'Mot de passe incorrecte' })
            }
            res.status(200).json({
                //requete valid
                token: jwt.sign(
                    { userId: currentUser._id },
                    process.env.JWT_TOKEN,
                    {
                        expiresIn: process.env.JWT_EXP,
                    }
                ),
                userId: currentUser._id,
            })
        })
        .catch((error) => res.status(500).json({ error })) // erreur serveur
}
