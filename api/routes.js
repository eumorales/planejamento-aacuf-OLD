const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Atualizado com campo dataLimite
const ItemSchema = new mongoose.Schema({
  texto: String,
  categoria: String,
  descricao: String,
  anotacoes: [String],
  dataLimite: String, // formato dd/mm/aaaa
  concluido: { type: Boolean, default: false },
});

const Item = mongoose.model("Item", ItemSchema);

// Converte "dd/mm/aaaa" para objeto Date
function stringParaData(dataStr) {
  const [dia, mes, ano] = dataStr.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

router.post("/adicionar", async (req, res) => {
  const { texto, categoria, descricao, dataLimite } = req.body;
  try {
    const novo = new Item({
      texto,
      categoria,
      descricao,
      dataLimite,
      anotacoes: [],
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
    const hoje = new Date();

    // Atualiza status de vencidos
    for (const item of itens) {
      if (!item.concluido && item.dataLimite) {
        const data = stringParaData(item.dataLimite);
        if (data < hoje) {
          item.concluido = true;
          await item.save();
        }
      }
    }

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
  const { texto, descricao, anotacoes, dataLimite } = req.body;

  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { texto, descricao, anotacoes, dataLimite },
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
