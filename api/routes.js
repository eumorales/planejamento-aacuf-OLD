const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  texto: String,
  categoria: String,
  descricao: String,
  anotacoes: [String],
  concluido: { type: Boolean, default: false },
});

const Item = mongoose.model("Item", ItemSchema);

router.post("/adicionar", async (req, res) => {
  const { texto, categoria, descricao } = req.body;
  try {
    const novo = new Item({ texto, categoria, descricao, anotacoes: [] });
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

router.put("/atualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, descricao, anotacoes } = req.body;

  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { texto, descricao, anotacoes },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar o item" });
  }
});

router.put("/concluir/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findByIdAndUpdate(id, { concluido: true }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao concluir item" });
  }
});

router.delete("/deletar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Item.findByIdAndDelete(id);
    res.status(200).json({ mensagem: "Item deletado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar item" });
  }
});

module.exports = router;
