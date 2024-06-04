require("dotenv").config();

const app = require("./app");
const axios = require("axios");
const clientID = process.env.GITHUB_APP_CLIENTID;
const clientSecret = process.env.GITHUB_APP_SECRET;
app.listen(app.get("port"));

// GitHub Auth
// Declare the callback route
app.get("/api/github/user/auth-callback", async (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;
  let access_token = "";

  await axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  }).then(async (response) => {
    console.log(response.data);
    access_token = response.data.access_token;
  });

  if (access_token) {
    let result;
    await axios
      .get(`${req.protocol}://${req.get("host")}/success`, {
        params: {
          access_token: access_token,
        },
      })
      .then((response) => {
        result = response.data;
      });
    return res.status(200).json(result);
  }

  return res.status(400).json({ error: "Invalid request." });
});

app.get("/success", async function (req, res) {
  const access_token = req.body.access_token;

  let user_login = await axios({
    method: "get",
    url: `https://api.github.com/user`,
    headers: {
      Authorization: "token " + access_token,
    },
  }).then((response) => {
    if (!response.data.login) return false;
    return response.data.login;

    //res.render("pages/success", { userData: response.data });
  });

  if (user_login) {
    // Get repositories for the user
    await axios({
      method: "get",
      url: `https://api.github.com/users/${user_login}/repos`,
      headers: {
        Authorization: "token " + access_token,
      },
    }).then((response) => {
      return res.status(200).json(response.data);
      //res.render("pages/success", { userData: response.data });
    });
  }
});

app.get("/api/github/user/auth", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=Iv23lims3UPYisKl43YI`
  );
});

console.log("Servidor na porta", app.get("port"));
