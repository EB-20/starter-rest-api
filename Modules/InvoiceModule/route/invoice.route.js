const router = require('express').Router()
const { printPDF } = require('../controller/invoice.controller')

router.post('/', printPDF)

module.exports= router; 
