const express = require('express')
const router = express.Router()

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const bookCtrl = require('../controllers/book')

router.get('/', bookCtrl.bookList)
router.post('/:id/rating', auth, bookCtrl.rating, bookCtrl.findBook)
router.post(
    '/',
    auth,
    multer,
    bookCtrl.addBook,
    bookCtrl.rating,
    bookCtrl.created
)

router.get('/bestrating', bookCtrl.bestRating)
router.get('/:id', bookCtrl.findBook)
router.put('/:id', auth, multer, bookCtrl.updateBook)
router.delete('/:id', auth, bookCtrl.deleteBook)

module.exports = router
