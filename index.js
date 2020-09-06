const express = require("express");
const cors = require("cors");
const axios = require("axios");
const portinuse = process.env.PORT || 8080;

/////////////////////////////////////////////////////////////////////////
// tini-tiny proxy server enabling CORS and random comic data via XKCD //
/////////////////////////////////////////////////////////////////////////

// setting up middelwares (router and cors)
var app = express();
app.use(cors());


// health check uri
app.get("/", (req, res) => {
  res.send("Hi from tini tiny", 200);
});


// get request handler9 unique comic strips with with fix range between 1-500
// it can be configured to provide details on frontend
app.get("/tini/comics", async (req, res) => {
  await getRandomComic(1, 500, 9, req, res);
});



// making sure all routes are covered
app.get('*', function(req, res){
  res.status(404).send('I dont have what you want');
});
app.post('*', function(req, res){
  res.status(404).send('Nope still nothing');
});


// function to fetch "number" amount of comic strips via axios
async function getRandomComic(start, end, number, req, res) {
  var comics = [];
  const gen = await rangen(start, end, number);
  for (const item of gen) {
    await axios.get(`https://xkcd.com/${item}/info.0.json`).then((result) => {
      if(result.status === 200){
        comics.push(result.data);
      }else if (result.status === 404){
        console.log("I just got a 404 from XKCD, this will reduce comic data on request") 
      }
      else{
        console.log("I just got an error from XKCD this will reduce comic data on request")
      }
    }).catch(err=>{
      console.log('caught error on axios, it states ',err);
    })
  }
  res.status(200).json({
    data: comics,
  });
}

// function to generate whole number between a range, making sure all numbers are unique
// because who likes to read a comic strip over and over again.
async function rangen(start, end, number) {
  let arr = [];
  while (arr.length < number) {
    let r = Math.floor(Math.random() * (end - start + 1)) + start;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

// Listening on port "portinuse", technically I should have a .env file here
// but its 11:30 on a sunday night, I will let it pass.
app.listen(portinuse, () => console.log(`Tini proxy running on ${portinuse}`));
