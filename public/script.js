document.getElementById("btnResetarBanco")?.addEventListener("click", async () => {
  if (confirm("Tem certeza que deseja apagar todos os dados do banco?")) {
    const res = await fetch("/api/resetar", { method: "DELETE" });

    if (res.ok) {
      mostrarToast("Banco de dados resetado com sucesso.");
      carregarTextos();
    } else {
      mostrarToast("Erro ao resetar banco.", "error");
    }
  }
});


function toggleCategoria(header) {
  const categoriaDiv = header.parentElement;
  const conteudo = categoriaDiv.querySelector(".conteudo");

  if (categoriaDiv.classList.contains("ativa")) {
    conteudo.style.maxHeight = "0px";
    categoriaDiv.classList.remove("ativa");
  } else {
    conteudo.style.maxHeight = conteudo.scrollHeight + "px";
    categoriaDiv.classList.add("ativa");
  }
}

function atualizarAlturaCategoria(li) {
  const conteudo = li.closest(".conteudo");
  conteudo.style.maxHeight = conteudo.scrollHeight + "px";
}

function mostrarToast(mensagem, tipo = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast" + (tipo === "error" ? " error" : "");
  toast.innerHTML = `<i class="ph ph-check-circle"></i> ${mensagem}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
async function adicionarTexto() {
  const texto = document.getElementById("texto").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const dataLimite = document.getElementById("dataLimite").value.trim();
  const encarregadosInput = document.getElementById("encarregados")?.value?.trim();
  const descricao = document.getElementById("descricao")?.value?.trim();
  const acesso = document.getElementById("codigoAcesso")?.value.trim();

  // Verifica se os campos obrigatórios foram preenchidos
  if (!texto || !categoria || !dataLimite || !acesso) {
    mostrarToast("Preencha todos os campos obrigatórios!", "error");
    return;
  }

  // Validação de data (DD/MM/AAAA)
  const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regexData.test(dataLimite)) {
    mostrarToast("Formato de data inválido. Use: dia/mês/ano", "error");
    return;
  }

  const encarregados = encarregadosInput
    ? encarregadosInput.split(",").map(e => e.trim())
    : [];

  const response = await fetch("/api/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texto,
      categoria,
      descricao,
      dataLimite,
      encarregados,
      acesso
    }),
  });

  if (response.ok) {
    document.getElementById("texto").value = "";
    document.getElementById("dataLimite").value = "";
    if (document.getElementById("descricao")) document.getElementById("descricao").value = "";
    if (document.getElementById("encarregados")) document.getElementById("encarregados").value = "";
    if (document.getElementById("codigoAcesso")) document.getElementById("codigoAcesso").value = "";

    carregarTextos();
    mostrarToast("Item adicionado!");
  } else {
    const res = await response.json();
    const erro = res?.erro || "Erro ao adicionar item.";
    mostrarToast(erro, "error");
  }
}



function criarElementoAnotacao(anotacao, li) {
  const noteElement = document.createElement('div');
  noteElement.className = 'note';
  noteElement.innerHTML = `
    ${anotacao}
    <div class="note-actions">
      <button class="btn-remove-note"><i class="ph ph-trash"></i></button>
    </div>
  `;
  noteElement.querySelector('.btn-remove-note').addEventListener('click', async () => {
    mostrarToast("Anotação removida.");
    noteElement.remove();
    atualizarAlturaCategoria(li);
    await salvarItemAtualizado(li);
  });
  return noteElement;
}
function criarItemElemento(texto, descricao, id = null, anotacoes = [], concluido = false, dataLimite = null, encarregados = [], destaque = false) {
  const li = document.createElement(destaque ? "div" : "li");
  if (id) li.dataset.id = id;

  li.innerHTML = `
    <div class="item-header">
      <span class="item-text">
        ${destaque ? `📌 ${texto}` : texto}
      </span>
    </div>
    <div class="item-description">${descricao || "Sem descrição"}</div>
    <div class="item-notes"></div>
    ${dataLimite ? `<div class="item-date"><i class="ph ph-calendar-blank"></i> ${dataLimite}</div>` : ""}
    ${
      encarregados.length
        ? `<div class="item-encarregados"><i class="ph ph-user"></i> ${encarregados.join(", ")}</div>`
        : ""
    }
  `;

  // Anotações
  const notesContainer = li.querySelector('.item-notes');
  anotacoes.forEach(anotacao => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.innerHTML = `
      <span>${anotacao}</span>
      ${!destaque ? `
      <div class="note-actions">
        <button class="btn-remove-note"><i class="ph ph-trash"></i></button>
      </div>` : ""}
    `;

    if (!destaque) {
      noteElement.querySelector('.btn-remove-note').addEventListener('click', async () => {
        mostrarToast("Anotação removida.");
        noteElement.remove();
        atualizarAlturaCategoria(li);
        await salvarItemAtualizado(li);
      });
    } else {
      noteElement.style.backgroundColor = "#fff";
    }

    notesContainer.appendChild(noteElement);
    
  });

  if (!destaque) {
    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.innerHTML = `
      <button class="btn-edit"><i class="ph ph-pencil-simple"></i></button>
      <button class="btn-note"><i class="ph ph-note"></i></button>
      <button class="btn-done"><i class="ph ph-check-circle"></i></button>
    `;
    li.querySelector(".item-header").appendChild(actions);

    li.querySelector('.btn-edit').addEventListener('click', () => editarItem(li));
    li.querySelector('.btn-note').addEventListener('click', () => adicionarAnotacao(li));
    li.querySelector('.btn-done').addEventListener('click', () => concluirItem(li));
  }

  if (concluido === "expirado") {
    li.classList.add("item-expirado");
  } else if (concluido === true) {
    li.classList.add("item-concluido");

    const actions = li.querySelector('.item-actions');
    if (actions) {
      actions.innerHTML = `
        <button class="btn-undo"><i class="ph ph-arrow-counter-clockwise"></i></button>
        <button class="btn-delete"><i class="ph ph-trash"></i></button>
      `;

      actions.querySelector(".btn-undo").addEventListener("click", async () => {
        const res = await fetch(`/api/desfazer/${li.dataset.id}`, { method: "PUT" });
        if (res.ok) {
          mostrarToast("Item reativado!");
          carregarTextos();
        } else {
          mostrarToast("Erro ao reativar item", "error");
        }
      });
      
      actions.querySelector(".btn-delete").addEventListener("click", () => deletarItem(li));
    }
  }

  return li;
}


async function salvarItemAtualizado(li) {
  const id = li.dataset.id;
  if (!id) return;

  const texto = li.querySelector('.item-text').textContent;
  const descricao = li.querySelector('.item-description').textContent;
  const dataLimite = li.querySelector('.item-date')?.textContent?.trim();
  const encarregados = li.querySelector('.item-encarregados')?.textContent?.replace("👤", "").replace("\u{1F464}", "").replace(/\s+/g, " ").trim().split(',').map(e => e.trim()) || [];
  const anotacoes = Array.from(li.querySelectorAll('.note')).map(n => n.firstChild.textContent.trim());

  await fetch(`/api/atualizar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, descricao, anotacoes, dataLimite, encarregados })
  });

  mostrarToast("Item atualizado!");

}

async function adicionarAnotacao(li) {
  const anotacao = prompt("Adicionar anotação:");
  if (anotacao) {
    const notesContainer = li.querySelector('.item-notes');
    const noteElement = criarElementoAnotacao(anotacao, li);
    notesContainer.appendChild(noteElement);
    atualizarAlturaCategoria(li);
    await salvarItemAtualizado(li);
    mostrarToast("Anotação salva!");

  }
}

function editarItem(li) {
  const textoElement = li.querySelector('.item-text');
  const descricaoElement = li.querySelector('.item-description');

  const novoTexto = prompt("Editar texto:", textoElement.textContent);
  if (novoTexto !== null) textoElement.textContent = novoTexto;

  const novaDescricao = prompt("Editar descrição:", descricaoElement.textContent);
  if (novaDescricao !== null) descricaoElement.textContent = novaDescricao || "Sem descrição";

  atualizarAlturaCategoria(li);
  salvarItemAtualizado(li);
}

async function concluirItem(li) {
  if (!li.dataset.id) return;

  if (confirm("Marcar este item como concluído?")) {
    const id = li.dataset.id;

    await fetch(`/api/concluir/${id}`, { method: "PUT" });

    li.classList.add("item-concluido");
    li.classList.remove("item-expirado"); 
    li.querySelector('.item-actions').innerHTML = `
      <button class="btn-undo"><i class="ph ph-arrow-counter-clockwise"></i></button>
      <button class="btn-delete"><i class="ph ph-trash"></i></button>
    `;
    

    li.querySelector('.btn-undo').addEventListener('click', () => carregarTextos());
    li.querySelector('.btn-delete').addEventListener('click', () => deletarItem(li));

    mostrarToast("Item concluído!");

    const res = await fetch("/api/listar");
    const data = await res.json();
    const proximos = [];
    
    Object.values(data).forEach(lista => {
      lista.forEach(item => {
        if (item.dataLimite && !item.concluido) {
          proximos.push(item);
        }
      });
    });
    
    atualizarProximoPlanejamento(proximos);

  }
}

async function deletarItem(li) {
  const id = li.dataset.id;
  if (confirm("Excluir permanentemente este item?")) {
    const res = await fetch(`/api/deletar/${id}`, { method: "DELETE" });
    if (res.ok) {
      const ul = li.parentElement;
      li.remove();
      mostrarToast("Item removido!");
      setTimeout(() => verificarCategoriaVazia(ul), 0);
    } else {
      alert("Erro ao excluir item");
    }
  }

  const resListar = await fetch("/api/listar");
  const data = await resListar.json();
  const proximos = [];
  
  Object.values(data).forEach(lista => {
    lista.forEach(item => {
      if (item.dataLimite && !item.concluido) {
        proximos.push(item);
      }
    });
  });
  
  atualizarProximoPlanejamento(proximos);

  
}

function verificarCategoriaVazia(ul) {
  const categoriaDiv = ul.closest('.categoria');
  const conteudo = categoriaDiv.querySelector('.conteudo');

  if (!ul.children.length) {
    categoriaDiv.classList.add('vazia');
    categoriaDiv.classList.remove('ativa');
    conteudo.style.maxHeight = "0px";
    categoriaDiv.querySelector('h2').style.pointerEvents = 'none';
  } else {
    categoriaDiv.classList.remove('vazia');
    categoriaDiv.querySelector('h2').style.pointerEvents = 'auto';
  }
}


function atualizarProximoPlanejamento(lista) {
  const container = document.getElementById("proximo");
  if (!container) return;

  if (!lista.length) {
    container.innerHTML = "<p>Nenhum planejamento pendente.</p>";
    return;
  }

  lista.sort((a, b) => {
    const [da, ma, aa] = a.dataLimite.split("/").map(Number);
    const [db, mb, ab] = b.dataLimite.split("/").map(Number);
    return new Date(aa, ma - 1, da) - new Date(ab, mb - 1, db);
  });

  const proximo = lista[0];

  const itemElement = criarItemElemento(
    proximo.texto,
    proximo.descricao || "",
    proximo._id,
    proximo.anotacoes || [],
    proximo.concluido ? true : false,
    proximo.dataLimite,
    proximo.encarregados || [],
    true 
  );

  container.innerHTML = "";
  container.appendChild(itemElement);
}



async function carregarTextos() {
  try {
    const res = await fetch("/api/listar");
    const data = await res.json();
    const proximos = [];

    document.querySelectorAll(".categoria").forEach((categoriaDiv) => {
      const categoria = categoriaDiv.dataset.categoria;
      const ul = document.getElementById(`lista-${categoria}`);
      ul.innerHTML = "";

      if (data[categoria] && data[categoria].length > 0) {
        data[categoria].forEach((item) => {
          let status = false;
          let vencido = false;

          if (item.dataLimite) {
            const [d, m, a] = item.dataLimite.split("/").map(Number);
            const dataItem = new Date(a, m - 1, d);
            const hoje = new Date();

            if (dataItem < hoje && !item.concluido) {
              vencido = true;
              status = "expirado";
            } else if (!item.concluido) {
              proximos.push(item);
            }
          }

          if (item.concluido) {
            status = true;
          }

          const li = criarItemElemento(
            item.texto,
            item.descricao || "",
            item._id,
            item.anotacoes || [],
            status,
            item.dataLimite,
            item.encarregados || []
          );

          ul.appendChild(li);
        });

        categoriaDiv.classList.remove("vazia");
        categoriaDiv.querySelector("h2").style.pointerEvents = "auto";
      } else {
        categoriaDiv.classList.add("vazia");
        categoriaDiv.querySelector("h2").style.pointerEvents = "none";
      }
    });

    const exportarBtn = document.getElementById("btnExportarPDF");

    if (exportarBtn) {
      const temPendentes = Object.values(data).some(lista =>
        lista.some(item => !item.concluido)
      );
    
      exportarBtn.disabled = !temPendentes;
      exportarBtn.style.opacity = temPendentes ? "1" : "0.5";
      exportarBtn.style.cursor = temPendentes ? "pointer" : "not-allowed";
    }
    atualizarProximoPlanejamento(proximos);
  } catch (error) {
    console.error("Erro ao carregar textos:", error);
    mostrarToast("Ocorreu um erro!", error);

  }
}


document.addEventListener('DOMContentLoaded', () => {
  carregarTextos();
});

document.addEventListener("DOMContentLoaded", () => {
  carregarTextos();

  const exportarBtn = document.getElementById("btnExportarPDF");
  if (exportarBtn) {
    exportarBtn.addEventListener("click", exportarParaPDF);
  }
});

function exportarParaPDF() {
  fetch("/api/listar")
    .then(res => res.json())
    .then(data => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 20;

      const pendentesExistem = Object.values(data).some(lista =>
        lista.some(item => !item.concluido)
      );
      
      if (!pendentesExistem) {
        alert("Não há tarefas pendentes.");
        return;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      const title = "AACUF";
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - textWidth) / 2, y);
      y += 12;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Tarefas Pendentes", 10, y);
      y += 10;

      const categoriaCores = {
        Esportes: [23, 162, 184],
        Eventos: [255, 152, 0],
        Financeiro: [46, 125, 50],
        Marketing: [156, 39, 176],
        Produtos: [33, 150, 243],
        Outros: [204, 204, 204]
      };

      Object.entries(data).forEach(([categoria, tarefas]) => {
        const pendentes = tarefas.filter(t => !t.concluido);
        if (pendentes.length === 0) return;

        const categoriaFormatada = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        const cor = categoriaCores[categoriaFormatada] || [0, 0, 0];

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...cor);
        doc.text(categoriaFormatada, 10, y);
        y += 6;

        pendentes.forEach(item => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${item.texto}`, 14, y);
          y += 5;

          if (item.dataLimite) {
            doc.setFontSize(10);
            doc.text(`Data limite: ${item.dataLimite}`, 18, y);
            y += 4;
          }

          if (item.encarregados?.length) {
            doc.text(`Encarregado(s): ${item.encarregados.join(", ")}`, 18, y);
            y += 4;
          }

          y += 4;
        });

        y += 6;
      });

      doc.save("tarefas_pendentes_aacuf.pdf");
      mostrarToast("Documento salvo!");

    });
}
