const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();

const ItemSchema = new mongoose.Schema({
  texto: String,
  categoria: String,
  descricao: String,
  dataLimite: String,
  anotacoes: [String],
  encarregados: [String],
  concluido: { type: Boolean, default: false }
});

const Item = mongoose.model("Item", ItemSchema);

router.post("/adicionar", async (req, res) => {
  const { texto, categoria, descricao, dataLimite, encarregados, acesso } = req.body;

  const codigosPermitidos = process.env.CODIGOS_ACESSO?.split(",") || [];

  if (!codigosPermitidos.includes(acesso)) {
    return res.status(403).json({ erro: "Código de acesso inválido." });
  }

  try {
    const novo = new Item({
      texto,
      categoria,
      descricao,
      dataLimite,
      encarregados,
      anotacoes: []
    });
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

router.put("/desfazer/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { concluido: false },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao desfazer conclusão do item" });
  }
});

router.put("/atualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, descricao, anotacoes, dataLimite, encarregados } = req.body;

  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { texto, descricao, anotacoes, dataLimite, encarregados },
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
    const item = await Item.findByIdAndUpdate(
      id,
      { concluido: true },
      { new: true }
    );
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

router.delete("/resetar", async (req, res) => {
  try {
    await Item.deleteMany({});
    res.status(200).json({ mensagem: "Banco de dados resetado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao resetar banco de dados." });
  }
});

module.exports = router;
