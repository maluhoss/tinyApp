//LIBRARIES
//utilizing express for get and post requests
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//set ejs as the view engine for the ejs templates
app.set("view engine", "ejs");

//utilize body parser library for getting post request body
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//generate shortURL
function generateRandomString() {
  let alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let numericString = '';
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * alphabet.length);
    numericString += alphabet[index];
  } return numericString;
}

//look through emails in users object by accessing the user object
function emailExists(email) {
  for (let userId in users) {
    let user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
}

/*Update your express server so that the shortURL-longURL
key-value pair are saved to the urlDatabase when it receives a
POST request to /urls*/

//VARIABLES AND FUNCTIONS
//all the users with email, id and password
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

//all the urls
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//Routes

//route to read homepage, printing Hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//route to read urls homepage and showing index.ejs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//route to read creating new url links page
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

//route to read login page
app.get("/login", (req, res) => {
  res.render("urls_login", { user_id: users[req.cookies["user_id"]] });
});

//route to handle get requests to register
app.get("/register", (req, res) => {
  res.render("urls_register", { user_id: users[req.cookies["user_id"]] });
});

//creating new url to add to homepage of urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//creating cookie when logging in
app.post("/login", (req, res) => {
  let email = req.body.email;
  let userEmailInDatabase = emailExists(email);
  let userPassword = req.body.password;

//if email is not in database, email is in database but wrong password, status code 403
//if everything matches, create cookie and redirect to /urls
  if (!userEmailInDatabase) {
    res.send(403);
  } else if (userEmailInDatabase && userPassword !== userEmailInDatabase.password) {
    res.send(403);
  } else {
    res.cookie("user_id", userEmailInDatabase.id);
    res.redirect("/urls");
  }
});

//route to clear cookie when logging out request
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//route to handle post requests from register page by adding user to user object and creating cookie
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password || emailExists(email)) {
    res.send(400)
  } else {
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

//---------generic routes----------//
//route to read specific url page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    user_id: users[req.cookies["user_id"]],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    // user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//route to redirect get requests to long urls
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//route to handle post requests to delete shorturls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//route to handle updates on short urls
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  // res.redirect("/urls");
});

//route to read urls in json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//route to read hello page with html elements
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//server listening for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
