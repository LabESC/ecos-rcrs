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
    return res.redirect(
      `${req.protocol}://${req.get("host")}/api/github/user/auth/success`
    );
    /*await axios
      .get(`${req.protocol}://${req.get("host")}/success`, {
        params: {
          access_token: access_token,
        },
      })
      .then((response) => {
        result = response.data;
      });
    return res.status(200).json(result);*/
  }

  return res.status(400).json({ error: "Invalid request." });
});

app.get("/api/github/user/auth-callback-installation", async (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const installation_id = req.query.installation_id;
  //Obtendo access token
  let access_token = "";
  await axios({
    method: "post",
    url: `https://api.github.com/app/installations/${installation_id}/access_tokens`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + process.env.GITHUB_APP_BEARER,
    },
  }).then(async (response) => {
    console.log(response.data);
    access_token = response.data.token;
  });

  if (!access_token) return res.status(400).json({ error: "Invalid request." });

  await axios({
    method: "get",
    url: `https://api.github.com/installation/repositories`,
    //url: `https://api.github.com/user/repos?per_page=100`,
    headers: {
      Authorization: "Bearer " + access_token,
    },
  }).then((response) => {
    return res.status(200).json(response.data);
    //res.render("pages/success", { userData: response.data });
  });

  return res.status(400).json({ error: "Invalid request." });
});

app.get("/api/github/user/auth/success", async function (req, res) {
  console.log(req.method, req.url);
  const access_token = req.query.access_token; //req.body.access_token;

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
      url: `https://api.github.com/installation/repositories`,
      //url: `https://api.github.com/user/repos?per_page=100`,
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
    `https://github.com/apps/seco-rcr/installations/new`
    //`https://github.com/login/oauth/authorize?client_id=${clientID}`
  );
});

console.log("Servidor na porta", app.get("port"));
