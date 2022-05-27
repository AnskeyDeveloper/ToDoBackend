const connectToMongo = require('./db');
const express = require('express');

connectToMongo(); // Run connectToMongo() here

const app = express()
const port = 8088

// pass the Json
app.use(express.json()) // without this you can not send req.body (json)

// Avaible Routes is here-
app.use('/api/cont', require('./routes/cont')) // Link the API to the Routes
app.use('/api/notes', require('./routes/notes')) // Link the API to the Routes


app.get('/api/json', (req, res) => {
  res.send({
      name:"bvs",
      chennele: "bvscode"
  })
})

app.get('/rest/api', (req, res) => {
    res.send("hello Rest API !")
})

app.get('/api/call', (req, res) => {
  res.send("Wait calling to Rest API !")
})

app.get('/api', (req, res) => {
    res.send("hello I'm Don 😎 Don se bachna muskel hi nahi na munkin hai !")
})

app.listen(port, () => {
  console.log(`BVS-To-Do-book app listening on port ${port}`)
})