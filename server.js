if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let userName = "";
let imageName = "aqeerw";
// Importing Libraies that we installed using npm
const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // Importing bcrypt package
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const { exec } = require("child_process");
const path = require("path");

const fileUpload = require("express-fileupload");
// app.use(express.static("./views"));

// product router
const productRouter = require("./routes/productRoutes");

// error handler
// const notFoundMiddleware = require("./middleware/not-found");
// const errorHandlerMiddleware = require("./middleware/error-handler");

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

app.use(fileUpload());
app.use("/api/v1/products", productRouter);

const users = [];

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    // We wont resave the session variable if nothing is changed
    saveUninitialized: false,
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//jupiter ka maal
app.use(express.static("public"));

// middleware
// app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);

// Configuring the register post functionality
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    userName = req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users);
    // Display newly registered in the console
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

// Routes
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name, imageName: imageName });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/run-notebook/:id", (req, res) => {
  console.log(req.params.id);
  let x = req.params.id;
  let indexValue = x.indexOf("-");

  console.log("index is: ", indexValue);

  res.render("result.ejs", { name: userName, check: x[indexValue + 1] });
});

// End Routes
app.delete("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

///jupiter route
// app.post("/run-notebook", (req, res) => {
//   const notebookPath = path.resolve(__dirname, "./app.ipynb");
//   const command = `jupyter nbconvert --execute ${notebookPath}`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing notebook: ${error}`);
//       res.status(500).send("An error occurred while executing the notebook.");
//     } else {
//       console.log("Notebook executed successfully");
//       // Handle the result or any other logic here
//       res.send("Notebook executed successfully");
//     }
//   });
// });

// app.post("/run-notebook", (req, res) => {
//   console.log("check");
//   // const notebookPath = path.resolve(__dirname, "./app.ipynb"); // Replace with the actual path to your Jupyter Notebook
//   // console.log("path is: ", notebookPath);

//   // open(notebookPath)
//   //   .then(() => {
//   //     res.send("Notebook opened successfully");
//   //   })
//   //   .catch((error) => {
//   //     console.error(`Error opening notebook: ${error}`);
//   //     res.status(500).send("An error occurred while opening the notebook");
//   //   });
// });

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `The applicatin started successfully on port http://127.0.0.1:${port}`
  );
});
