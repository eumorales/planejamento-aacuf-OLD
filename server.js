const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const conectarBanco = require("./conectarBanco");
const routes = require("./api/routes");

dotenv.config();
conectarBanco();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
