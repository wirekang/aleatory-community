if (typeof localStorage === "undefined" || localStorage === null){
  localStorage = new (require("node-localstorage").LocalStorage)("./localStorage")
}

const app =  require("express")()

app.get("/",(req,res)=>{
  res.send("asdf")
})

app.listen(3333, ()=>{
  console.log("Listen")
})