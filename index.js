const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(__dirname + "/public"))

const logic = require("./logic")

app.post("/getUUID", (req, res) => {
  ok(res, logic.getUUID())
})

app.post("/setName", (req, res) => {
  const {token, name} = req.body;
  logic.setName(token, name)
  ok(res)
})

app.post("/getRanking", (req, res) => {
  ok(res, logic.getRanking())
})

app.post("/addSurvey", (req, res) => {
  const {token, title, body, selections} = req.body;
  logic.addSurvey(token, title, body, selections)
  ok(res)
})

app.post("/getSurveys", (req, res) => {
  ok(res, logic.getSurveys())
})

app.post("/vote", (req, res) => {
  const {token, id, selection} = req.body;
  logic.vote(token, id, selection)
  ok(res)
})

app.post("/addPost", (req, res) => {
  const {token, body} = req.body
  logic.addPost(token, body)
  ok(res)
})

app.post("/getPosts", (req, res) => {
  ok(res, logic.getPosts())
})

app.use(function (err, req, res, _) {
  res.json({result: "error", error: err.message})
})


app.listen(3333, "localhost", () => {
  console.log("Listen")
})


function ok(res, body) {
  res.status(200)
  if (body) {
    res.send({result: "ok", body})
  } else {
    res.send({result: "ok"})
  }
}