const sharp = require('sharp')
const fs = require('fs')

module.exports = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "pas d'image" })
    }
    //chemin vers l'image telechargee
    const imagePath = req.file.path

    //redimensionnement de l'image et reduction de la qualité
    sharp(imagePath)
        .resize(200, 200) //redimensionne l'image
        .jpeg({ quality: 80 }) // diminue la qualité d'un jpeg
        .toFile(`images/resize-${req.file.filename}`, (err, info) => {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: 'Erreur lors de l optimisation de l image',
                })
            } else {
                // Supprimer l'ancien fichier
                sharp.cache(false)
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        res.status(500).send(
                            'Une erreur est survenue lors de la suppression de l image.'
                        )
                    } else {
                        req.file.filename = `resize-${req.file.filename}`
                        next()
                    }
                })
            }
        })
}
