const Book = require('../models/Book')
const fs = require('fs')
const path = require('path')
const sanitize = require('mongo-sanitize')

//logique recherche des livres
exports.bookList = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books)) // requete ok
        .catch((error) => res.status(500).json({ error })) //erreur serveur
}
// logique création d'un livre
exports.addBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
              userId: req.auth.userId,
          }
        : { ...req.body }

    const book = new Book({
        ...bookObject,
        averageRating: bookObject.ratings[0].grade,
    })

    book.ratings[0].userId = req.auth.userId
    book.save() // enregistrement d'un livre
        .then(() => {
            res.status(201).json({ message: 'Livre enregistré!' }) // requete crée
        })
        .catch((error) => {
            res.status(400).json({ error }) // bad request
        })
}
//logique de recherche de livre sous id
exports.findBook = (req, res, next) => {
    const cleanBookId = sanitize(req.params.id)
    Book.findOne({ _id: cleanBookId })
        .then((book) => res.status(200).json(book)) // requete ok
        .catch((error) => res.status(400).json({ error })) // bad request
}

//logique modification d'un livre sous id et authentification
exports.updateBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.file.filename
              }`,
              userId: req.auth.userId,
              _id: req.params.id,
          }
        : { ...req.body, _id: req.params.id, userId: req.auth.userId }

    Book.findOneAndUpdate(
        { _id: sanitize(req.params.id), userId: sanitize(req.auth.userId) },
        bookObject
    )
        .then((oldBook) => {
            if (!oldBook) {
                res.status(400).json({ message: 'Livre non modifiable' }) //bad request
            } else if (req.file) {
                const oldImageName = oldBook.imageUrl.split('/').pop()
                const oldImagePath = path.join(
                    path.dirname(req.file.path),
                    oldImageName
                )
                // supprime l'ancienne photo
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        res.status(500).send(
                            // erreur serveur
                            'Une erreur est survenue lors de la suppression de l image.'
                        )
                    } else {
                        res.status(200).json({ message: 'Livre modifié!' }) // requête ok
                    }
                })
            } else {
                res.status(200).json({ message: 'Livre modifié!' }) //requête ok
            }
        })
        .catch((error) => {
            res.status(400).json({ error }) // bad request
        })
}

//logique suppresion de livre sous id et authentification
exports.deleteBook = (req, res, next) => {
    const cleanBook = sanitize(req.params.id)
    const cleanAuth = sanitize(req.auth.userId)

    Book.findOneAndDelete({ _id: cleanBook, userId: cleanAuth })
        .then((oldBook) => {
            const oldImageName = oldBook.imageUrl.split('/').pop()
            const oldImagePath = path.join(
                __dirname,
                '..',
                'images',
                oldImageName
            )
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    res.status(500).send(
                        //erreur serveur
                        'Une erreur est survenue lors de la suppression de l image.'
                    )
                } else {
                    res.status(200).json({ message: 'Livre supprimé!' }) //requete ok
                }
            })
        })
        .catch((error) => {
            res.status(403).json(error) //forbidden
        })
}

//logique notation sous id
exports.rating = (req, res, next) => {
    const idBook = sanitize(req.params.id)
    const userId = sanitize(req.body.userId)
    const rating = req.body.rating

    Book.findOne({ _id: idBook })
        .then((book) => {
            if (book.ratings.find((rate) => rate.userId === userId)) {
                res.status(400).json({ message: 'L utilisateur a déjà voté' }) //bad request
            } else {
                //calcul de la moyenne des notes
                const avgRating =
                    book.ratings.reduce(
                        (acc, currentValue) => acc + currentValue.grade,
                        rating
                    ) /
                    (book.ratings.length + 1)

                return Book.findOneAndUpdate(
                    { _id: idBook },
                    {
                        $push: { ratings: { userId: userId, grade: rating } },
                        averageRating: Math.round(avgRating), //arrondissement de la moyenne
                    },
                    { new: true } // retourne la nouvelle valeur
                )
            }
        })
        .then((book) => res.status(200).json(book)) //requete ok
        .catch((error) => res.status(400).json({ error })) //bad request
}

//logique des livres les mieux notes
exports.bestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: 'desc' }) // trie de la plus grande a la plus petite note
        .limit(3) // limite à 3
        .then((books) => res.status(200).json(books)) // requete Ok
        .catch((error) => res.status(400).json({ error })) //bad requete
}
