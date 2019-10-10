/* eslint-disable */
const morgan = require('morgan')
const bodyParser = require('body-parser')
const todoService = require('../server/router')

module.exports = function(app) {
  // use logger
  app.use(bodyParser())
  app.use(morgan('dev'))
  app.use('/api/todo', todoService)

  // Error handler
  app.use((err, req, res, next) => {
    if (err && req.path.indexOf('/api/todo') >= 0) {
      console.log(err)
      res.status(500).send(err)
    }
    next()
  })
}