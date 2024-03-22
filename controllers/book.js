const Book = require('../models/Book')

exports.bookList = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(500).json({ error }))
}

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
        averageRating: 0,
        ratings: [],
    })

    book.save()
        .then((book) => {
            req.params.id = book._id
            req.body.userId = req.auth.userId
            req.body.rating = bookObject.ratings[0].grade

            next()
        })
        .catch((error) => {
            res.status(400).json({ error })
        })
}
//logique de recherche de livre sous id
exports.findBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }))
}

//logique modif d'un livre sous id
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
        : { ...req.body, _id: req.params.id }
    Book.updateOne({ _id: req.params.id }, bookObject)
        .then(() => res.status(200).json({ message: 'Livre modifié!' }))
        .catch((error) => res.status(400).json({ error }))
}

//logique suppresion de livre sous id
exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé!' }))
        .catch((error) => res.status(400).json({ error }))
}
//logique finalisation de création
exports.created = (req, res, next) =>
    res.status(201).json({ message: 'Livre enregistré!' })

//logique notation sous id
exports.rating = (req, res, next) => {
    const idBook = req.params.id
    const userId = req.body.userId
    const rating = req.body.rating

    Book.findOne({ _id: idBook })
        .then((book) => {
            if (book.ratings.find((rate) => rate.userId === userId)) {
                res.status(400).json({ message: 'user already exit' })
            } else {
                const avgRating =
                    book.ratings.reduce(
                        (acc, currentValue) => acc + currentValue.grade,
                        rating
                    ) /
                    (book.ratings.length + 1)

                Book.updateOne(
                    { _id: idBook },
                    {
                        $push: { ratings: { userId: userId, grade: rating } },
                        averageRating: Math.round(avgRating),
                    }
                )
                    .then(() => next())
                    .catch((error) => res.status(400).json({ error }))
            }
        })
        .catch((error) => res.status(400).json({ error }))
}

//logique des livres les mieux notes
exports.bestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: 'desc' })
        .limit(3)
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }))
}
