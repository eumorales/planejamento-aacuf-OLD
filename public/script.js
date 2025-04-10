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


async function adicionarTexto() {
  const texto = document.getElementById("texto").value.trim();
  const categoria = document.getElementById("categoria").value;

  if (!texto || !categoria) {
    return alert("Preencha o texto e escolha uma categoria.");
  }

  const response = await fetch("/api/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto, categoria }),
  });

  if (response.ok) {
    const ul = document.getElementById(`lista-${categoria}`);
    const li = document.createElement("li");
    li.textContent = texto;
    ul.appendChild(li);
    document.getElementById("texto").value = "";
  } else {
    alert("Erro ao adicionar.");
  }
  

  categoriaDiv = document.querySelector(`[data-categoria="${categoria}"]`);
  categoriaDiv.classList.remove("vazia");
  categoriaDiv.querySelector("h2").style.pointerEvents = "auto";

}

async function carregarTextos() {
  const res = await fetch("/api/listar");
  const data = await res.json();

  document.querySelectorAll(".categoria").forEach((categoriaDiv) => {
    const categoria = categoriaDiv.dataset.categoria;
    const ul = document.getElementById(`lista-${categoria}`);
    ul.innerHTML = "";

    if (data[categoria] && data[categoria].length > 0) {
      data[categoria].forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.texto;
        ul.appendChild(li);
      });
      categoriaDiv.classList.remove("vazia");
      categoriaDiv.querySelector("h2").style.pointerEvents = "auto";
    } else {
      categoriaDiv.classList.add("vazia");
      categoriaDiv.querySelector("h2").style.pointerEvents = "none";
    }
  });
}

function atualizarEstiloCategorias() {
  document.querySelectorAll('.categoria').forEach(categoria => {
    const ul = categoria.querySelector('ul');
    if (ul.children.length === 0) {
      categoria.classList.add('vazia');
    } else {
      categoria.classList.remove('vazia');
    }
  });
}

carregarTextos();
