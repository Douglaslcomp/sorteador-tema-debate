const campoTema = document.getElementById("campoTema");
const formTema = document.getElementById("formTema");
const mensagem = document.getElementById("mensagem");
const listaGerenciamento = document.getElementById("listaGerenciamento");
const listaTemas = document.getElementById("listaTemas");
const totalTemas = document.getElementById("totalTemas");
const resultado = document.getElementById("resultado");
const avisoResultado = document.getElementById("avisoResultado");
const contagem = document.getElementById("contagem");
const botaoSortear = document.getElementById("botaoSortear");

const CHAVE = "temas_debate_escolar";
let temas = carregarTemas();
let ultimoTemaId = null;

function carregarTemas() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
        if (!Array.isArray(dados)) return [];
        return dados.filter(t => t && typeof t.id === "string" && typeof t.nome === "string")
                    .map(t => ({ id: t.id, nome: t.nome, sorteado: Boolean(t.sorteado) }));
    } catch {
        return [];
    }
}

function salvarTemas() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(temas));
    } catch {
        mensagem.textContent = "Não foi possível salvar os temas neste navegador.";
    }
}

function atualizarTela() {
    listaGerenciamento.replaceChildren();
    listaTemas.replaceChildren();
    totalTemas.textContent = temas.length;

    for (const tema of temas) {
        const item = document.createElement("li");
        item.className = `item-tema${tema.sorteado ? " sorteado" : ""}`;

        const nome = document.createElement("span");
        nome.className = "nome-tema";
        nome.textContent = tema.nome;

        const remover = document.createElement("button");
        remover.className = "remover";
        remover.type = "button";
        remover.textContent = "Remover";
        remover.setAttribute("aria-label", `Remover ${tema.nome}`);
        remover.addEventListener("click", () => removerTema(tema.id));

        item.append(nome, remover);
        listaGerenciamento.appendChild(item);

        const etiqueta = document.createElement("span");
        etiqueta.className = `etiqueta-tema${tema.sorteado ? " sorteado" : ""}`;
        etiqueta.textContent = tema.nome;
        listaTemas.appendChild(etiqueta);
    }

    if (temas.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.textContent = "Nenhum tema cadastrado. Adicione temas no menu à esquerda.";
        listaTemas.appendChild(vazio);
    }

    const disponiveis = temas.filter(t => !t.sorteado).length;
    contagem.textContent = `${disponiveis} ${disponiveis === 1 ? "tema disponível" : "temas disponíveis"}`;
    botaoSortear.disabled = disponiveis === 0;

    if (ultimoTemaId && !temas.some(t => t.id === ultimoTemaId)) {
        ultimoTemaId = null;
        resultado.textContent = "Pronto para sortear";
        avisoResultado.textContent = "Escolha um tema ao clicar no botão abaixo.";
    }
}

formTema.addEventListener("submit", evento => {
    evento.preventDefault();
    const nome = campoTema.value.trim();
    if (!nome) return;

    if (temas.some(t => t.nome.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"))) {
        mensagem.textContent = "Este tema já está cadastrado.";
        return;
    }

    const id = (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    temas.push({ id, nome, sorteado: false });
    campoTema.value = "";
    mensagem.textContent = "";
    salvarTemas();
    atualizarTela();
    campoTema.focus();
});

function removerTema(id) {
    temas = temas.filter(t => t.id !== id);
    salvarTemas();
    atualizarTela();
}

botaoSortear.addEventListener("click", () => {
    const disponiveis = temas.filter(t => !t.sorteado);
    if (disponiveis.length === 0) return;

    const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    sorteado.sorteado = true;
    ultimoTemaId = sorteado.id;
    resultado.textContent = sorteado.nome;
    resultado.classList.remove("aparecer");
    void resultado.offsetWidth;
    resultado.classList.add("aparecer");
    avisoResultado.textContent = "Tema selecionado para o debate";
    mensagem.textContent = "";
    salvarTemas();
    atualizarTela();
});

document.getElementById("botaoReiniciar").addEventListener("click", () => {
    temas.forEach(t => { t.sorteado = false; });
    ultimoTemaId = null;
    resultado.textContent = "Pronto para sortear";
    avisoResultado.textContent = "Escolha um tema ao clicar no botão abaixo.";
    mensagem.textContent = "";
    salvarTemas();
    atualizarTela();
});

document.getElementById("botaoTelaCheia").addEventListener("click", () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen?.();
    }
});

atualizarTela();
