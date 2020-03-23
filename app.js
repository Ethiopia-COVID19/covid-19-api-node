'use strict'
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const router = express.Router()

// Import sample data
const community = require('./data/community')
const communityInspections = require('./data/community-inspections')
const travelers = require('./data/travelers')

app.set('view engine', 'pug')

if (process.env.NODE_ENV === 'test') {
  // NOTE: aws-serverless-express uses this app for its integration tests
  // and only applies compression to the /sam endpoint during testing.
  router.use('/sam', compression())
} else {
  router.use(compression())
}

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(awsServerlessExpressMiddleware.eventContext())

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

router.get('/', (req, res) => {
  res.render('index', {
    apiUrl: req.apiGateway
      ? `https://${req.apiGateway.event.headers.Host}/${req.apiGateway.event.requestContext.stage}`
      : 'http://localhost:3000'
  })
})

router.get('/covid19et', (req, res) => {
  res.sendFile(`${__dirname}/covid19et-logo.png`)
})

// API Abstraction
router.get('/v1/:type/:id?', (req, res) => {
  const type = req.params.type
  if (!type) return res.status(404).json({})

  let data = ''

  switch (type) {
    case 'community':
      data = community
      break

    case 'community-inspections':
      data = communityInspections
      break

    case 'travelers':
      data = travelers
      break

    default:
      data = []
      break
  }

  // Get the Id
  const id = req.params.id

  if (id && data) {
    console.log(id)
    const getRecord = id => data.find(r => r.id === parseInt(id))

    data = getRecord(id)
  }

  return res.json(data)
})

router.post('/users', (req, res) => {
  const user = {
    id: ++userIdCounter,
    name: req.body.name
  }
  users.push(user)
  res.status(201).json(user)
})

router.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  user.name = req.body.name
  res.json(user)
})

router.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId)

  if (userIndex === -1) return res.status(404).json({})

  users.splice(userIndex, 1)
  res.json(users)
})

//

const getRecord = id => users.find(u => u.id === parseInt(userId))
const getUserIndex = userId => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [
  {
    id: 1,
    name: 'Joe'
  },
  {
    id: 2,
    name: 'Jane'
  }
]
let userIdCounter = users.length

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
