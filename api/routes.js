const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  texto: String,
  categoria: String,
});
const Item = mongoose.model("Item", ItemSchema);

router.post("/adicionar", async (req, res) => {
  const { texto, categoria } = req.body;
  try {
    const novo = new Item({ texto, categoria });
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao salvar no banco" });
  }
});

router.get("/listar", async (req, res) => {
  try {
    const itens = await Item.find();
    const categoriasSeparadas = {};

    for (const item of itens) {
      if (!categoriasSeparadas[item.categoria]) {
        categoriasSeparadas[item.categoria] = [];
      }
      categoriasSeparadas[item.categoria].push(item);
    }

    res.json(categoriasSeparadas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar itens" });
  }
});

module.exports = router;
