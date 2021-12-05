const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const logic = require("./logic")

app.post("/setName", (req, res) => {
  const {token, name} = req.body;
  if (token.length < 5 || name.length < 5) {
    throw new Error("too short")
  }

  logic.setName(token, name)
  ok(res)
})

app.post("/getRanking", (req, res) => {
  res.send(logic.getRanking())
})

app.use(function (err, req, res, _) {
  res.json({result: "error", error: err.message})
})

app.listen(3333, "localhost", () => {
  console.log("Listen")
})


function ok(res) {
  res.status(200)
  res.send({result: "ok"})
}