const {v4: uuid} = require("uuid")
const escape = require("escape-html")
if (typeof localStorage === "undefined" || localStorage === null) {
  localStorage = new (require("node-localstorage").LocalStorage)("./localStorage")
}


function getUUID() {
  return uuid()
}

function setName(token, name) {
  if (token.length < 5 || name.length < 3) {
    throw new Error("too short")
  }
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
      name: escape(oTokenName[token]),
      score: escape(oTokenScore[token])
    })
  }

  return aResult.sort((a, b) => b.score - a.score)
}

function addSurvey(token, title, body, selections) {
  const sSurveys = localStorage.getItem("surveys")
  let aSurveys = [];
  if (sSurveys) {
    aSurveys = JSON.parse(sSurveys)
  }

  title = title.trim()
  body = body.trim()
  if (title.length < 3 || body.length < 3 || typeof selections === "string" || selections.length < 2) {
    throw new Error("too short")
  }

  aSurveys.push({
    id: uuid(),
    token,
    title,
    body,
    selections,
    expires: new Date().getTime() + 1000 * 60 * 60 * 5
  })
  localStorage.setItem("surveys", JSON.stringify(aSurveys, null, 2))
}

function getSurveys() {
  const sSurvey = localStorage.getItem("surveys")
  if (!sSurvey) {
    return [];
  }

  const aSurveys = JSON.parse(sSurvey);
  const oTokenName = JSON.parse(localStorage.getItem("tokenName"))
  const aRes = [];

  aSurveys.forEach((s) => {
    aRes.push({
      id: s.id,
      name: escape(oTokenName[s.token]),
      title: escape(s.title),
      body: escape(s.body),
      selections: s.selections.map((s) => escape(s)),
      expires: s.expires,
    })
  })

  return aRes;
}

function vote(token, id, selectionIndex) {
  const aSurveys = JSON.parse(localStorage.getItem("surveys"))
  const survey = aSurveys.find((s) => s.id === id)
  if (!survey) {
    throw new Error("wrong survey id")
  }

  if (!survey.selections[selectionIndex]) {
    throw new Error("wrong selection")
  }

  const sVotes = localStorage.getItem("votes")
  let aVotes = [];
  if (sVotes) {
    aVotes = JSON.parse(sVotes)
  }

  const sTokenScore = localStorage.getItem("tokenScore")
  if (!sTokenScore) {
    localStorage.setItem("tokenScore", JSON.stringify({
      [token]: -1,
    }, null, 2))
  } else {
    const oTokenScore = JSON.parse(sTokenScore)
    if (!oTokenScore[token]) {
      oTokenScore[token] = -1;
    } else {
      oTokenScore[token]--;
    }
    localStorage.setItem("tokenScore", JSON.stringify(oTokenScore, null, 2))
  }

  aVotes.push({id, token, selectionIndex})
  localStorage.setItem("votes", JSON.stringify(aVotes, null, 2))
}

function addPost(token, body) {
  const sPosts = localStorage.getItem("posts")
  let aPosts = [];
  if (sPosts) {
    aPosts = JSON.parse(sPosts)
  }

  aPosts.push({
    token,
    body,
  })
  localStorage.setItem("posts", JSON.stringify(aPosts, null, 2))
}

function getPosts() {
  const sPosts = localStorage.getItem("posts")
  if (!sPosts) {
    return [];
  }

  const oTokenName = JSON.parse(localStorage.getItem("tokenName"))
  const oTokenScore = JSON.parse(localStorage.getItem("tokenScore"))
  const aPosts = JSON.parse(sPosts)
  const aRst = []

  aPosts.forEach((p) => {
    aRst.push({
      name: escape(oTokenName[p.token]),
      score: escape(oTokenScore[p.token]),
      body: escape(p.body),
    })
  })

  return aRst
}

function voteLoop() {
  try {
    const sSurveys = localStorage.getItem("surveys")
    if (!sSurveys) {
      return
    }

    const aSurveys = JSON.parse(sSurveys)
    aSurveys.forEach((survey) => {
      if (survey.expires > new Date().getTime()) {
        return
      }

      console.log(`${JSON.stringify(survey, null, 2)} expired.`)

      const sVotes = localStorage.getItem("votes")
      if (!sVotes) {
        console.log("no votes")
        return
      }

      const aVotes = JSON.parse(sVotes)
      let tokenCount = 0;
      const oSelectionCount = {}
      const oSelectionTokens = {}
      aVotes.forEach((vote, index) => {
        if (vote.id !== survey.id) {
          return
        }
        tokenCount++;

        if (!oSelectionCount[vote.selectionIndex]) {
          oSelectionCount[vote.selectionIndex] = 1
        } else {
          oSelectionCount[vote.selectionIndex]++;
        }

        if (!oSelectionTokens[vote.selectionIndex]) {
          oSelectionTokens[vote.selectionIndex] = [survey.token]
        } else {
          oSelectionTokens[vote.selectionIndex].push(survey.token)
        }

        delete aVotes[index]
      })

      let maxSelection;
      let maxCount = 0;
      for (let sIndex in oSelectionCount) {
        const c = oSelectionCount[sIndex];
        if (c > maxCount) {
          maxSelection = sIndex;
          maxCount = c;
        }
      }

      if (!maxSelection) {
        console.log("no max selection")
        return
      }

      const winTokens = oSelectionTokens[maxSelection]
      const looseTokenCount = tokenCount - winTokens.length
      const prize = Math.round(looseTokenCount / winTokens.length)
      const sTokenScore = localStorage.getItem("tokenScore")
      let oTokenScore = {};
      if (sTokenScore) {
        oTokenScore = JSON.parse(sTokenScore)
      }

      winTokens.forEach((t) => {
        oTokenScore[t] += prize
      })

      localStorage.setItem("tokenScore", JSON.stringify(oTokenScore, null, 2))
    })
  } catch (e) {
    console.log(":::ERROR IN VOTE LOOP:::")
    console.log(e)
  }
}

setInterval(voteLoop, 1000)// 1000 * 60)

module.exports = {
  getUUID,
  setName,
  getRanking,
  addSurvey,
  getSurveys,
  vote,
  addPost,
  getPosts,
}
