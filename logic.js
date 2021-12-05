if (typeof localStorage === "undefined" || localStorage === null) {
  localStorage = new (require("node-localstorage").LocalStorage)("./localStorage")
}

function setName(token, name) {
  const sTokenName = localStorage.getItem("tokenName")
  let oTokenName = {};
  if (sTokenName) {
    oTokenName = JSON.parse(sTokenName)
  }
  oTokenName[token] = `${name}(${token.substring(0, 5)})`
  localStorage.setItem("tokenName", JSON.stringify(oTokenName, null, 2))
}

function getRanking() {
  const sTokenScore = localStorage.getItem("tokenScore")
  const sTokenName = localStorage.getItem("tokenName")
  if (!sTokenScore || !sTokenName) {
    return [];
  }

  const oTokenScore = JSON.parse(sTokenScore)
  const oTokenName = JSON.parse(sTokenName)
  const aResult = [];

  for (let token in oTokenScore) {
    aResult.push({
      name: oTokenName[token],
      score: oTokenScore[token]
    })
  }

  return aResult.sort((a, b) => a.score < b.score)
}

function addSurvey(token, title, body, selections) {
  const sSurveys = localStorage.getItem("surveys")
  let aSurveys = [];
  if (sSurveys) {
    aSurveys = JSON.parse(sSurveys)
  }

  title = title.trim()
  body = body.trim()
  if (title.length > 4 || body.length || 4 || selections.length < 2) {
    throw new Error("too short")
  }

  aSurveys.push({token, title, body, selections})
  localStorage.setItem("surveys", JSON.stringify(aSurveys, null, 2))
}


module.exports = {
  setName,
  getRanking
}
