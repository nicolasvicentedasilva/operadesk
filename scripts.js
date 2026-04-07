
const currentPage = window.location.pathname.split("/").pop() || "index.html";

const protectedPages = [
  "index.html",
  "chamados.html",
  "ativos.html",
  "role-selector.html"

];

const bodyEl = document.body;
if (bodyEl && protectedPages.includes(currentPage)) {
  bodyEl.classList.add("loading");
}

function showApp() {
  if (bodyEl) {
    bodyEl.classList.remove("loading");
    bodyEl.classList.add("loaded");
  }
}

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("logoutBtn");
const loginForm = document.getElementById("loginForm");


function isLoggedIn() {
  return localStorage.getItem("infra_logged") === "true";
}

function protectPage() {
  if (protectedPages.includes(currentPage) && !isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function setupLogin() {
  if (!loginForm) return;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const user = document.getElementById("loginUser");
    const password = document.getElementById("loginPassword");

    if (!user || !password) return;

    if (user.value === "admin" && password.value === "1234") {
      localStorage.setItem("infra_logged", "true");
      localStorage.setItem("nomeUsuarioLogado", user.value);
      window.location.href = "role-selector.html";
    } else {
      alert("Usuário ou senha inválidos.");
    }
  });
}

function setupLogout() {

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const confirmar = confirm("Deseja realmente sair do sistema?");
    if (!confirmar) return;

    localStorage.removeItem("infra_logged");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("nomeUsuarioLogado");

    window.location.href = "login.html";
  });
}

function setupSidebarToggle() {
  if (!menuToggle || !sidebar) return;

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

function setupRoleSelector() {
  const btnFuncionario = document.getElementById("btnFuncionario");
  const btnTecnico = document.getElementById("btnTecnico");

  if (btnFuncionario) {
    btnFuncionario.addEventListener("click", () => {
      localStorage.setItem("activeRole", "user");
      localStorage.setItem("usuarioLogado", "Funcionario");
      window.location.href = "index.html";
    });
  }

  if (btnTecnico) {
    btnTecnico.addEventListener("click", () => {
      localStorage.setItem("activeRole", "admin");
      localStorage.setItem("usuarioLogado", "Tecnico");
      window.location.href = "index.html";
    });
  }
}

function renderUserDashboard() {
  const usuarioLogadoNome = localStorage.getItem("nomeUsuarioLogado") || "";
  const meusChamados = chamados.filter((c) => c.usuario_origem === usuarioLogadoNome);
  const meusAtivos = ativos.filter((a) => a.usuario_origem === usuarioLogadoNome);

  const summaryCard = document.getElementById("user-open-requests");
  if (summaryCard) {
    summaryCard.textContent = `${meusChamados.length + meusAtivos.length} solicitações em aberto`;
  }

  const requestsList = document.getElementById("user-requests-list");
  if (!requestsList) return;

  const todasSolicitacoes = [
    ...meusChamados.map((c) => ({ ...c, tipo: "Suporte" })),
    ...meusAtivos.map((a) => ({ ...a, tipo: "Hardware", problema: a.nome, status: a.status })),
  ];

  if (todasSolicitacoes.length === 0) {
    requestsList.innerHTML = `
      <div style="padding:20px;color:#fff;background:#181818;border-radius:8px;">
        <p>Nenhuma solicitação encontrada.</p>
      </div>
    `;
    return;
  }

  requestsList.innerHTML = todasSolicitacoes
    .map(
      (s) =>
        `<div style="padding:12px;border:1px solid #333;border-radius:8px;margin-bottom:10px;background:#101010;color:#fff;">` +
        `<strong>${s.id}</strong> - ${s.problema} (${s.status})` +
        `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">` +
        `<span style="font-size:0.85rem;color:#bbb;">Tipo: ${s.tipo}</span>` +
        `<button class="btn btn-ghost btn-sm" onclick="excluirSolicitacao('${s.id}', '${s.tipo === "Hardware" ? "ativo" : "chamado"}')">Excluir</button>` +
        `</div>` +
        `</div>`
    )
    .join("");
}

function excluirSolicitacao(id, tipo) {
  const confirmar = confirm("Deseja realmente excluir esta solicitação?");
  if (!confirmar) return;

  if (tipo === "ativo") {
    ativos = ativos.filter((item) => item.id !== id);
    saveAtivos();
  } else {
    chamados = chamados.filter((item) => item.id !== id);
    saveChamados();
  }

  renderUserDashboard();
  refreshAllViews();
}

function setupUserForms() {
  const btnOpenSupport = document.getElementById("btn-open-support");
  const btnRequestHardware = document.getElementById("btn-request-hardware");
  const supportForm = document.getElementById("user-support-form");
  const hardwareForm = document.getElementById("user-hardware-form");
  const supportSection = document.getElementById("support-form-section");
  const hardwareSection = document.getElementById("hardware-form-section");
  const cancelSupport = document.getElementById("cancel-support");
  const cancelHardware = document.getElementById("cancel-hardware");
  const usuarioLogadoNome = localStorage.getItem("nomeUsuarioLogado") || "Funcionário";

  if (btnOpenSupport) {
    btnOpenSupport.addEventListener("click", () => {
      if (supportSection) supportSection.style.display = "block";
      if (hardwareSection) hardwareSection.style.display = "none";
      const supportNameField = document.getElementById("user-support-name");
      if (supportNameField) supportNameField.value = usuarioLogadoNome;
    });
  }

  if (btnRequestHardware) {
    btnRequestHardware.addEventListener("click", () => {
      if (hardwareSection) hardwareSection.style.display = "block";
      if (supportSection) supportSection.style.display = "none";
      const hardwareNameField = document.getElementById("user-hardware-employee-name");
      if (hardwareNameField) hardwareNameField.value = usuarioLogadoNome;
    });
  }

  if (cancelSupport) {
    cancelSupport.addEventListener("click", () => {
      if (supportSection) supportSection.style.display = "none";
      supportForm.reset();
    });
  }

  if (cancelHardware) {
    cancelHardware.addEventListener("click", () => {
      if (hardwareSection) hardwareSection.style.display = "none";
      hardwareForm.reset();
    });
  }

  if (supportForm) {
    supportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const novoChamado = {
        id: `#${new Date().getTime().toString().slice(-5)}`,
        usuario: usuarioLogadoNome,
        usuario_origem: usuarioLogadoNome,
        problema: document.getElementById("user-support-problem").value,
        prioridade: document.getElementById("user-support-priority").value,
        status: "Aberto",
      };
      chamados.push(novoChamado);
      saveChamados();
      supportForm.reset();
      if (supportSection) supportSection.style.display = "none";
      renderUserDashboard();
      refreshAllViews();
    });
  }

  if (hardwareForm) {
    hardwareForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const equipamento = document.getElementById("user-hardware-name").value;
      const categoria = document.getElementById("user-hardware-category").value;

      const novoAtivo = {
        id: `#A${new Date().getTime().toString().slice(-5)}`,
        nome: equipamento,
        categoria: categoria,
        local: "Solicitado",
        status: "Solicitado",
        usuario_origem: usuarioLogadoNome,
      };

      const novoChamado = {
        id: `#${new Date().getTime().toString().slice(-5)}`,
        usuario: usuarioLogadoNome,
        usuario_origem: usuarioLogadoNome,
        problema: `Solicitação de hardware: ${equipamento}`,
        prioridade: "Média",
        status: "Aberto",
      };

      ativos.push(novoAtivo);
      chamados.push(novoChamado);
      saveAtivos();
      saveChamados();
      hardwareForm.reset();
      if (hardwareSection) hardwareSection.style.display = "none";
      renderUserDashboard();
      refreshAllViews();
    });
  }
}

function ajustarVisao() {
  const activeRole = localStorage.getItem("activeRole");

  const dashboardLink = document.querySelector('.menu a[href="index.html"]');
  const chamadosLink = document.querySelector('.menu a[href="chamados.html"]');
  const ativosLink = document.querySelector('.menu a[href="ativos.html"]');

  if (activeRole === "user") {
    if (dashboardLink) dashboardLink.textContent = "Minhas Solicitações";
    if (chamadosLink) chamadosLink.style.display = "none";
    if (ativosLink) ativosLink.style.display = "none";

    if (currentPage === "index.html") {

      const adminContent = document.querySelector('.main-content > header');
      if (adminContent) adminContent.style.display = "none";
      const cards = document.querySelector(".cards");
      if (cards) cards.style.display = "none";
      const dashboardPanels = document.querySelector(".dashboard-panels");
      if (dashboardPanels) dashboardPanels.style.display = "none";

      const userDashboard = document.getElementById("user-dashboard");
      if (userDashboard) userDashboard.style.display = "block";

      renderUserDashboard();
      setupUserForms();
    }
  } else {

    if (dashboardLink) dashboardLink.style.display = "block";
    if (chamadosLink) chamadosLink.textContent = "Chamados";
    if (ativosLink) ativosLink.textContent = "Equipamentos";
  }

  showApp();
}

let chamados = JSON.parse(localStorage.getItem("chamados")) || [
  {
    id: "#1051",
    usuario: "Maria",
    problema: "Falha no Wi-Fi",
    prioridade: "Alta",
    status: "Aberto"
  },
  {
    id: "#1052",
    usuario: "Nikolas",
    problema: "Erro de login",
    prioridade: "Média",
    status: "Em andamento"
  },
  {
    id: "#1053",
    usuario: "João",
    problema: "Monitor sem vídeo",
    prioridade: "Alta",
    status: "Resolvido"
  }
];

let ativos = JSON.parse(localStorage.getItem("ativos")) || [
  {
    id: "#A101",
    nome: "Notebook Lenovo ThinkPad",
    categoria: "Notebook",
    status: "Em uso",
    local: "Escritório"
  },
  {
    id: "#A102",
    nome: "Scanner Zebra DS2208",
    categoria: "Scanner",
    status: "Operacional",
    local: "Expedição"
  },
  {
    id: "#A103",
    nome: "Desktop Dell OptiPlex",
    categoria: "Desktop",
    status: "Manutenção",
    local: "Recebimento"
  },
  {
    id: "#A104",
    nome: "Impressora HP LaserJet",
    categoria: "Impressora",
    status: "Disponível",
    local: "Administrativo"
  }
];

function saveChamados() {
  localStorage.setItem("chamados", JSON.stringify(chamados));
}

function saveAtivos() {
  localStorage.setItem("ativos", JSON.stringify(ativos));
}

function getPriorityClass(prioridade) {
  if (prioridade === "Alta") return "alta";
  if (prioridade === "Média") return "media";
  return "baixa";
}

function getStatusClass(status) {
  if (status === "Aberto") return "aberto";
  if (status === "Em andamento") return "andamento";
  if (status === "Resolvido") return "resolvido";
  if (status === "Operacional") return "operacional";
  if (status === "Em uso") return "em-uso";
  if (status === "Manutenção") return "manutencao";
  return "disponivel";
}

function getTicketFilterStatus(status) {
  if (status === "Aberto") return "aberto";
  if (status === "Em andamento") return "andamento";
  return "resolvido";
}

function getAssetFilterStatus(status) {

  return status.toLowerCase();
}

const ticketForm = document.getElementById("ticketForm");
const usuarioInput = document.getElementById("usuario");
const problemaInput = document.getElementById("problema");
const prioridadeInput = document.getElementById("prioridade");
const statusInput = document.getElementById("status");
const chamadosTable = document.getElementById("chamadosTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const editIndexInput = document.getElementById("editIndex");
const submitButton = document.getElementById("submitButton");
const openTicketFormBtn = document.getElementById("openTicketFormBtn");
const closeTicketFormBtn = document.getElementById("closeTicketFormBtn");
const resetTicketFormBtn = document.getElementById("resetTicketFormBtn");
const ticketFormPanel = document.getElementById("ticketFormPanel");
const formPanel = document.querySelector(".form-panel");

const sideFilaAtiva = document.getElementById("sideFilaAtiva");
const sideCriticos = document.getElementById("sideCriticos");
const sideResolvidosHoje = document.getElementById("sideResolvidosHoje");

function resetTicketForm() {
  if (ticketForm) ticketForm.reset();
  if (editIndexInput) editIndexInput.value = "";
  if (submitButton) submitButton.textContent = "Cadastrar Chamado";
  if (formPanel) formPanel.classList.remove("editing");
}

function preencherFormularioEdicao(index) {
  const chamado = chamados[index];
  if (!chamado) return;

  if (usuarioInput) usuarioInput.value = chamado.usuario;
  if (problemaInput) problemaInput.value = chamado.problema;
  if (prioridadeInput) prioridadeInput.value = chamado.prioridade;
  if (statusInput) statusInput.value = chamado.status;
  if (editIndexInput) editIndexInput.value = index;
  if (submitButton) submitButton.textContent = "Salvar Alterações";
  if (formPanel) formPanel.classList.add("editing");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirChamado(id) {
  const confirmar = confirm("Deseja realmente excluir este chamado?");
  if (!confirmar) return;

  chamados = chamados.filter((item) => item.id !== id);
  saveChamados();
  refreshAllViews();
}

function renderChamados() {
  if (!chamadosTable) return;

  chamadosTable.innerHTML = "";

  const termoBusca = searchInput ? searchInput.value.toLowerCase() : "";
  const filtroSelecionado = statusFilter ? statusFilter.value : "todos";
  const activeRole = localStorage.getItem("activeRole");
  const usuarioLogadoNome = localStorage.getItem("nomeUsuarioLogado") || "";

  let chamadosFiltrados = chamados;
  if (activeRole === "user") {
    chamadosFiltrados = chamados.filter(c => c.usuario_origem === usuarioLogadoNome);
  }

  chamadosFiltrados.forEach((chamado, index) => {
    const textoLinha = `
      ${chamado.id}
      ${chamado.usuario}
      ${chamado.problema}
      ${chamado.prioridade}
      ${chamado.status}
    `.toLowerCase();

    const atendeBusca = textoLinha.includes(termoBusca);
    const atendeStatus =
      filtroSelecionado === "todos" ||
      getTicketFilterStatus(chamado.status) === filtroSelecionado;

    if (!atendeBusca || !atendeStatus) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${chamado.id}</td>
      <td>${chamado.usuario}</td>
      <td>${chamado.problema}</td>
      <td><span class="priority ${getPriorityClass(chamado.prioridade)}">${chamado.prioridade}</span></td>
      <td><span class="status ${getStatusClass(chamado.status)}">${chamado.status}</span></td>
      <td class="actions-cell">
        <button class="edit-btn" onclick="preencherFormularioEdicao(${index})">Editar</button>
        <button class="delete-btn" onclick="excluirChamado('${chamado.id}')">Excluir</button>
      </td>
    `;
    chamadosTable.appendChild(tr);
  });
}

function setupTicketForm() {
  if (!ticketForm) return;

  const activeRole = localStorage.getItem("activeRole");

  if (openTicketFormBtn) {
    if (activeRole !== "user") {
      openTicketFormBtn.style.display = "none";
      if (ticketFormPanel) ticketFormPanel.style.display = "none";
    } else {
      openTicketFormBtn.addEventListener("click", () => {
        if (ticketFormPanel) ticketFormPanel.style.display = "block";
      });
    }
  }

  if (closeTicketFormBtn) {
    closeTicketFormBtn.addEventListener("click", () => {
      if (ticketFormPanel) ticketFormPanel.style.display = "none";
      resetTicketForm();
    });
  }

  if (resetTicketFormBtn) {
    resetTicketFormBtn.addEventListener("click", resetTicketForm);
  }

  ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const indiceEdicao = editIndexInput ? editIndexInput.value : "";

    const usuarioLogado = localStorage.getItem("usuarioLogado") || usuarioInput.value;
    const usuarioLogadoNome =
      localStorage.getItem("usuarioLogadoNome") || usuarioInput.value || localStorage.getItem("usuarioLogado") || "";

    if (localStorage.getItem("activeRole") === "user" && usuarioInput.value) {
      localStorage.setItem("usuarioLogadoNome", usuarioInput.value);
    }

    const novoChamado = {
      id:
        indiceEdicao !== ""
          ? chamados[indiceEdicao].id
          : `#${new Date().getTime().toString().slice(-5)}`,
      usuario: usuarioInput.value || usuarioLogadoNome,
      usuario_origem: usuarioLogadoNome,
      problema: problemaInput.value,
      prioridade: prioridadeInput.value || "Média",
      status: statusInput.value || "Aberto"
    };

    if (indiceEdicao !== "") {
      chamados[indiceEdicao] = novoChamado;
    } else {
      chamados.push(novoChamado);
    }

    saveChamados();
    resetTicketForm();
    refreshAllViews();
  });
}

function setupTicketFilters() {
  if (searchInput) searchInput.addEventListener("keyup", renderChamados);
  if (statusFilter) statusFilter.addEventListener("change", renderChamados);
}

function updateTicketCards() {
  const abertos = chamados.filter((item) => item.status === "Aberto").length;

  const cardAbertos = document.getElementById("cardAbertos");

  if (cardAbertos) cardAbertos.textContent = abertos;
}

function updateTicketSideKpis() {
  const filaAtiva = chamados.filter(
    (item) => item.status === "Aberto" || item.status === "Em andamento"
  ).length;

  const criticos = chamados.filter(
    (item) => item.prioridade === "Alta"
  ).length;

  const resolvidos = chamados.filter(
    (item) => item.status === "Resolvido"
  ).length;

  if (sideFilaAtiva) sideFilaAtiva.textContent = filaAtiva;
  if (sideCriticos) sideCriticos.textContent = criticos;
  if (sideResolvidosHoje) sideResolvidosHoje.textContent = resolvidos;
}

const assetFormPanel = document.getElementById("assetFormPanel");
const openAssetFormBtn = document.getElementById("openAssetFormBtn");
const closeAssetFormBtn = document.getElementById("closeAssetFormBtn");
const resetAssetFormBtn = document.getElementById("resetAssetFormBtn");
const assetForm = document.getElementById("assetForm");
const assetNome = document.getElementById("assetNome");
const assetLocal = document.getElementById("assetLocal");
const assetStatus = document.getElementById("assetStatus");
const assetCategoria = document.getElementById("assetCategoria");
const ativosTable = document.getElementById("ativosTable");
const assetSearchInput = document.getElementById("assetSearchInput");
const assetStatusFilter = document.getElementById("assetStatusFilter");
const assetEditIndex = document.getElementById("assetEditIndex");
const assetSubmitButton = document.getElementById("assetSubmitButton");

function resetAssetForm() {
  if (assetForm) assetForm.reset();
  if (assetEditIndex) assetEditIndex.value = "";
  if (assetSubmitButton) assetSubmitButton.textContent = "Cadastrar Ativo";
}

function openAssetForm() {
  if (assetFormPanel) assetFormPanel.style.display = "block";
  resetAssetForm();
}

function closeAssetForm() {
  if (assetFormPanel) assetFormPanel.style.display = "none";
  resetAssetForm();
}

function preencherFormularioAtivo(index) {
  const ativo = ativos[index];
  if (!ativo) return;

  if (assetNome) assetNome.value = ativo.nome;
  if (assetLocal) assetLocal.value = ativo.local;
  if (assetStatus) assetStatus.value = ativo.status;
  if (assetCategoria) assetCategoria.value = ativo.categoria;
  if (assetEditIndex) assetEditIndex.value = index;
  if (assetSubmitButton) assetSubmitButton.textContent = "Salvar Alterações";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirAtivo(id) {
  const confirmar = confirm("Deseja realmente excluir este ativo?");
  if (!confirmar) return;

  ativos = ativos.filter((item) => item.id !== id);
  saveAtivos();
  refreshAllViews();
}

function renderAtivos() {
  if (!ativosTable) return;

  ativosTable.innerHTML = "";

  const termoBusca = assetSearchInput ? assetSearchInput.value.toLowerCase() : "";
  const filtroSelecionado = assetStatusFilter ? assetStatusFilter.value : "todos";

  ativos.forEach((ativo, index) => {
    const textoLinha = `
      ${ativo.id}
      ${ativo.nome}
      ${ativo.categoria}
      ${ativo.status}
      ${ativo.local}
    `.toLowerCase();

    const atendeBusca = textoLinha.includes(termoBusca);
    const atendeStatus =
      filtroSelecionado === "todos" ||
      getAssetFilterStatus(ativo.status) === filtroSelecionado;

    if (!atendeBusca || !atendeStatus) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ativo.id}</td>
      <td>${ativo.nome}</td>
      <td>${ativo.categoria}</td>
      <td><span class="status ${getStatusClass(ativo.status)}">${ativo.status}</span></td>
      <td>${ativo.local}</td>
      <td class="actions-cell">
        <button class="edit-btn" onclick="preencherFormularioAtivo(${index})">Editar</button>
        <button class="delete-btn" onclick="excluirAtivo('${ativo.id}')">Excluir</button>
      </td>
    `;
    ativosTable.appendChild(tr);
  });
}

function setupAssetForm() {
  if (!assetForm) return;

  if (openAssetFormBtn) {
    openAssetFormBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (assetFormPanel) assetFormPanel.style.display = "block";
      resetAssetForm();
    });
  }

  if (closeAssetFormBtn) {
    closeAssetFormBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (assetFormPanel) assetFormPanel.style.display = "none";
      resetAssetForm();
    });
  }

  if (resetAssetFormBtn) {
    resetAssetFormBtn.addEventListener("click", (event) => {
      event.preventDefault();
      resetAssetForm();
    });
  }

  assetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const indiceEdicao = assetEditIndex ? assetEditIndex.value : "";

    const novoAtivo = {
      id:
        indiceEdicao !== ""
          ? ativos[indiceEdicao].id
          : `#A${new Date().getTime().toString().slice(-4)}`,
      nome: assetNome.value,
      categoria: assetCategoria.value,
      status: assetStatus.value,
      local: assetLocal.value
    };

    if (indiceEdicao !== "") {
      ativos[indiceEdicao] = novoAtivo;
    } else {
      ativos.push(novoAtivo);
    }

    saveAtivos();
    resetAssetForm();
    if (assetFormPanel) assetFormPanel.style.display = "none";
    refreshAllViews();
  });
}

function setupAssetFilters() {
  if (assetSearchInput) assetSearchInput.addEventListener("keyup", renderAtivos);
  if (assetStatusFilter) assetStatusFilter.addEventListener("change", renderAtivos);
}


function updateDashboard() {
  const cardAbertos = document.getElementById("cardAbertos");
  const dashboardResumo = document.getElementById("dashboardResumo");
  const ultimosChamadosDashboard = document.getElementById("ultimosChamadosDashboard");

  const abertos = chamados.filter((item) => item.status === "Aberto").length;

  if (cardAbertos) cardAbertos.textContent = abertos;

  if (dashboardResumo) {
    dashboardResumo.textContent =
      `O sistema possui ${chamados.length} solicitações registradas no momento.`;
  }




  if (ultimosChamadosDashboard) {
    ultimosChamadosDashboard.innerHTML = "";

    chamados.slice(-5).reverse().forEach((chamado) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${chamado.id}</td>
        <td>${chamado.usuario}</td>
        <td>${chamado.problema}</td>
        <td><span class="priority ${getPriorityClass(chamado.prioridade)}">${chamado.prioridade}</span></td>
        <td><span class="status ${getStatusClass(chamado.status)}">${chamado.status}</span></td>
      `;
      ultimosChamadosDashboard.appendChild(tr);
    });
  }
}

function updateCharts() {
  const total = chamados.length || 1;
  const abertos = chamados.filter((item) => item.status === "Aberto").length;
  const andamento = chamados.filter((item) => item.status === "Em andamento").length;
  const resolvidos = chamados.filter((item) => item.status === "Resolvido").length;

  const pctAbertos = (abertos / total) * 100;
  const pctAndamento = (andamento / total) * 100;
  const pctResolvidos = (resolvidos / total) * 100;

  const relatorioBarAbertos = document.getElementById("relatorioBarAbertos");
  const relatorioBarAndamento = document.getElementById("relatorioBarAndamento");
  const relatorioBarResolvidos = document.getElementById("relatorioBarResolvidos");
  const relatorioAbertosGrafico = document.getElementById("relatorioAbertosGrafico");
  const relatorioAndamentoGrafico = document.getElementById("relatorioAndamentoGrafico");
  const relatorioResolvidosGrafico = document.getElementById("relatorioResolvidosGrafico");

  if (relatorioBarAbertos) relatorioBarAbertos.style.width = `${pctAbertos}%`;
  if (relatorioBarAndamento) relatorioBarAndamento.style.width = `${pctAndamento}%`;
  if (relatorioBarResolvidos) relatorioBarResolvidos.style.width = `${pctResolvidos}%`;

  if (relatorioAbertosGrafico) relatorioAbertosGrafico.textContent = abertos;
  if (relatorioAndamentoGrafico) relatorioAndamentoGrafico.textContent = andamento;
  if (relatorioResolvidosGrafico) relatorioResolvidosGrafico.textContent = resolvidos;
}

function refreshAllViews() {
  renderChamados();
  renderAtivos();
  updateTicketCards();
  updateTicketSideKpis();
  updateDashboard();

  updateCharts();
}

protectPage();
setupLogin();
setupLogout();

setupSidebarToggle();
setupTicketForm();
setupTicketFilters();
setupAssetForm();
setupAssetFilters();
setupRoleSelector();
ajustarVisao();
refreshAllViews();

window.preencherFormularioEdicao = preencherFormularioEdicao;
window.excluirChamado = excluirChamado;
window.preencherFormularioAtivo = preencherFormularioAtivo;
window.excluirAtivo = excluirAtivo;
window.excluirSolicitacao = excluirSolicitacao;
window.alternarStatus = alternarStatus;
window.removerTecnico = removerTecnico;


