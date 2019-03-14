var express = require("express");
var app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//generate shortURL
function generateRandomString() {
  let alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let numericString = '';
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphabet.length);
    numericString += alphabet[index];
  } return numericString;
}

/*Update your express server so that the shortURL-longURL
key-value pair are saved to the urlDatabase when it receives a
POST request to /urls*/

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

//homepage of all urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    email: req.cookies["email"]
  };
  res.render("urls_index", templateVars);
});

//creating new url to add to homepage of urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

//creating cookie when logging in
app.post("/login", (req, res) => {
  let email = req.body.email;
  res.cookie("email", email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("email");
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  let templateVars = { email: req.cookies["email"]}
  res.render("urls_new", templateVars);
});


app.get("/register", (req, res) => {
  res.render("urls_register");
});

//adding user to user object and creating cookie
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  };
  console.log(req.body)
  res.cookie("user_id", user_id);
  console.log(req.cookies);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    email: req.cookies["email"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
