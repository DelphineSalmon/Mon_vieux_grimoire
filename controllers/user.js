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
        .hash(req.body.password, 10)
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            })
            user.save()
                .then(() =>
                    res.status(201).json({ message: 'Utilisateur créé !' })
                )
                .catch((error) => res.status(400).json({ error }))
        })
        .catch((error) => res.status(500).json({ error }))
}
//logique d'authentification
exports.login = (req, res, next) => {
    const cleanEmail = sanitize(req.body.email)
    User.findOne({ email: cleanEmail })
        .then((user) => {
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Utilisateur non trouvé' })
            }
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res
                            .status(400)
                            .json({ message: 'Mot de passe incorrecte' })
                    }
                    res.status(200).json({
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_TOKEN,
                            { expiresIn: process.env.JWT_EXP }
                        ),
                        userId: user._id,
                    })
                })
                .catch((error) => res.status(500).json({ error }))
        })
        .catch((error) => res.status(500).json({ error }))
}
