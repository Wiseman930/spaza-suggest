const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
let app = express();
const pgp = require("pg-promise")();

let shortCode = require('short-unique-id')
let uid = new shortCode({length: 6})

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
  useSSL = true;
}
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:pg1999@localhost:5432/spaza_suggest";

const config = {
  connectionString: DATABASE_URL,
 /* ssl: {
    rejectUnauthorized: false,
  },*/
};

const facotoryFunction = require('./spaza-suggest')
const db = pgp(config);
const myFunction = facotoryFunction(db);
module.exports = db

const mySpaza = require('./routes/routes')
const theSuggestion = mySpaza(db, myFunction)





app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.use(
    session({
      secret: "string for session in http",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(flash());
  app.set("view engine", "handlebars");
  app.use(express.static("public"));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());


app.get('/', theSuggestion.home);

app.post('/register', theSuggestion.postRegisterCode)
app.get('/index', theSuggestion.login)
app.post('/client', theSuggestion.userRoute);
app.get('/client/:username', theSuggestion.dynamicClent);
app.post('/client/:username', theSuggestion.dynamicClentPost);
app.get('/spaza_login', theSuggestion.ownerLogin);


  let PORT = process.env.PORT || 3007;

  app.listen(PORT, function(){
    console.log('App starting on port', PORT);
  });