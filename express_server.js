//LIBRARIES
//utilizing express for get and post requests
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//utilizing bcrypt to hash password
const bcrypt = require('bcrypt');

//set ejs as the view engine for the ejs templates
app.set("view engine", "ejs");

//utilize body parser library for getting post request body
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')

app.use(bodyParser.urlencoded({extended: true}));

//use CookieSession to encrypt cookie with secret keys
app.use(cookieSession({
  name: 'session',
  keys: ['fh28ds'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
};

function urlsForUser(id) {
  let urls = {};
  for (let shortURL in urlDatabase) {
    let userIdInDatabase = urlDatabase[shortURL].user_id;
    if (id === userIdInDatabase) {
      urls[shortURL] = { longURL: urlDatabase[shortURL].longURL };
    }
  } return urls;
}

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
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};


//Routes

//route to read homepage, printing Hello
app.get("/", (req, res) => {
  const loggedInUser = req.session.user_id;

  if (loggedInUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//route to read urls homepage and showing index.ejs
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user_id: users[req.session.user_id]
  };
  let loggedInUser = req.session.user_id

  if (loggedInUser) {
   res.render("urls_index", templateVars);
 } else {
  res.redirect("/login");
 }
});

//route to read creating new url links page
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: users[req.session.user_id] };
  let loggedInUser = req.session.user_id;

  if (loggedInUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//route to read login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", { user_id: users[req.session.user_id] });
  }
});

//route to handle get requests to register
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", { user_id: users[req.session.user_id] });
  }
});

//creating new url to add to homepage of urls - only for registered users
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, user_id: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/login");
  }
});

//route for logging in, creating cookie when logging in;
//if email is not in database, email is in database but wrong password, status code 403
//if everything matches, create cookie and redirect to /urls
app.post("/login", (req, res) => {
  let email = req.body.email;
  // console.log(email);
  let userEmailInDatabase = emailExists(email);
  // console.log(userEmailInDatabase);

  if(!userEmailInDatabase) {
    res.send("This email does not exist. Please register or try again.");
  } else {
    const userPasswordInDatabase = userEmailInDatabase.password;
    // console.log(userPasswordInDatabase);
    const userPassword = req.body.password;
    // console.log(userPassword);
    let hashedVsUserPassword = bcrypt.compareSync(userPassword, userPasswordInDatabase);
    // console.log(hashedVsUserPassword);
    if (hashedVsUserPassword === false) {
      res.send("The email or password is incorrect. Please try again.")
    } else {
      req.session.user_id = userEmailInDatabase.id;
      console.log(req.session.user_id)
      res.redirect("/urls");
    }
  }
});

//route to clear cookie when logging out request
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//route to handle post requests from register page by adding user to user object and creating cookie
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password || emailExists(email)) {
    res.send("An email and password is required. If an email and password has been typed in, this email has already been registered.")
  } else {
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

//---------generic routes----------//
//route to read specific url page
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;

  function checkUrlExists(shortURL) {
    for (let url in urlDatabase) {
      if (shortURL === url) {
        return url;
      }
    }
  }

  if (checkUrlExists(shortURL) === undefined) {
    res.send("This URL does not exist.");
  } else {
    let userID = req.session.user_id;
    if (userID === undefined) {
      res.send("You are not logged in. Please go to http://localhost:8080/login");
    } else {
      let ownerID = urlDatabase[shortURL].user_id;
      if (userID !== ownerID) {
        res.send("This is not your URL. Please go to http://localhost:8080/urls to see your URLS");
      } else {
        let templateVars = {
          ownerId: urlDatabase[shortURL].user_id,
          user_id: users[req.session.user_id],
          shortURL: shortURL,
          longURL: urlDatabase[shortURL].longURL,
        };
        res.render("urls_show", templateVars);
      }
    }
  }
});

//route to redirect get requests to long urls
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

//route to handle post requests to delete shorturls
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id]){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
      res.redirect("/login");
    }
  });


//route to handle updates on short urls
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
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
