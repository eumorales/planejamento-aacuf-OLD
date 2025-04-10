const mongoose = require("mongoose");

module.exports = async function conectarBanco() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Conectado ao banco de dados!");
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados!", error);
  }
};
