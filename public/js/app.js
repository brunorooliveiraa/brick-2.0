/**
 * BRIQUE PRO - LÓGICA E INTERAÇÕES DO FRONTEND (ESTILO QUIXOTIC FINTECH)
 */

let appState = {
  config: {},
  itens: [],
  transacoes: [],
  metricas: {}
};

let chartFluxoInstance = null;
let chartWaveInstance = null;
let chartMarcasInstance = null;

// Formatação Monetária Brasileira
function formatarMoeda(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// -------------------------------------------------------------------------
// CONTROLE DO TEMA (MODO ESCURO / CLARO)
// -------------------------------------------------------------------------
function aplicarTema(tema) {
  const isDark = tema === 'dark';
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-icon-sun')?.classList.remove('hidden');
    document.getElementById('theme-icon-moon')?.classList.add('hidden');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('theme-icon-sun')?.classList.add('hidden');
    document.getElementById('theme-icon-moon')?.classList.remove('hidden');
  }
  localStorage.setItem('brique_pro_theme', tema);
  setTimeout(atualizarGraficos, 50);
}

function alternarTema() {
  const atual = localStorage.getItem('brique_pro_theme') || 'light';
  const novo = atual === 'dark' ? 'light' : 'dark';
  aplicarTema(novo);
  showToast(novo === 'dark' ? 'Modo Escuro ativado 🌙' : 'Modo Claro ativado ☀️', 'info');
}

function inicializarTema() {
  const salvo = localStorage.getItem('brique_pro_theme') || 'dark'; // Padrão escuro agora que ele pediu!
  aplicarTema(salvo);
}

// Formatação de Data DD/MM/AAAA ou DD Mês AAAA
function formatarData(dataStr, estiloCurto = false) {
  if (!dataStr) return "-";
  const [ano, mes, dia] = dataStr.split('-');
  if (!ano || !mes || !dia) return dataStr;
  
  if (estiloCurto) {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const mesNum = parseInt(mes, 10) - 1;
    return `${dia} ${meses[mesNum] || mes}`;
  }
  return `${dia}/${mes}/${ano}`;
}

// Toast Notificações Moderno
function showToast(mensagem, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  
  let icone = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  if (tipo === 'error') {
    icone = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  }

  toast.innerHTML = `${icone}<span>${mensagem}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Data atual YYYY-MM-DD
function getDataHoje() {
  return new Date().toISOString().split('T')[0];
}

// -------------------------------------------------------------------------
// CARREGAR DADOS DO BACKEND
// -------------------------------------------------------------------------
async function carregarDados() {
  try {
    const res = await fetch('/api/dados');
    if (!res.ok) throw new Error("Erro ao carregar dados do servidor");
    appState = await res.json();
    
    atualizarKPIs();
    renderizarDashboard();
    renderizarEstoque();
    renderizarVendas();
    renderizarCaixa();
    renderizarEstatisticas();
    atualizarGraficos();
  } catch (err) {
    console.error(err);
    showToast("Erro ao conectar com o servidor local.", "error");
  }
}

// -------------------------------------------------------------------------
// ATUALIZAR KPIS NO TOPO E NOS CARDS
// -------------------------------------------------------------------------
function atualizarKPIs() {
  const m = appState.metricas || {};

  // Caixa Cartão Verde
  document.getElementById('kpi-saldo-caixa').innerText = formatarMoeda(m.saldoCaixa);
  document.getElementById('kpi-lucro-realizado').innerText = `+${formatarMoeda(m.lucroLiquidoRealizado)}`;
  document.getElementById('kpi-roi').innerText = `+${m.roiTotal || 0}% ROI`;

  // Patrimônio & Estoque
  document.getElementById('kpi-patrimonio').innerText = formatarMoeda(m.patrimonioTotal);
  document.getElementById('kpi-capital-estoque').innerText = formatarMoeda(m.capitalEmEstoque);
  document.getElementById('kpi-qtd-estoque').innerText = `${m.qtdEstoque || 0} aparelhos guardados`;
  document.getElementById('kpi-total-aportes').innerText = formatarMoeda(m.totalAportes);

  // Contadores nas Abas
  document.getElementById('nav-count-estoque').innerText = m.qtdEstoque || 0;
  document.getElementById('nav-count-vendas').innerText = m.qtdVendidos || 0;
}

// -------------------------------------------------------------------------
// DASHBOARD (VISÃO GERAL NO ESTILO QUIXOTIC)
// -------------------------------------------------------------------------
function renderizarDashboard() {
  // 1. Histórico de Transações Recentes (Payment History da imagem)
  const historyTbody = document.getElementById('dashboard-history-tbody');
  const ultimasTransacoes = appState.transacoes.slice(0, 4);

  if (ultimasTransacoes.length === 0) {
    historyTbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Nenhuma movimentação recente.</td></tr>`;
  } else {
    historyTbody.innerHTML = ultimasTransacoes.map((t, idx) => {
      const isPositivo = t.tipo === 'aporte' || t.tipo === 'venda';
      const sinal = isPositivo ? '+' : '-';
      const corClass = isPositivo ? 'text-green' : 'text-danger';

      // Cores para os círculos de ícone tipo a imagem
      const iconColors = [
        { bg: '#fee2e2', text: '#ef4444', label: 'DP' },
        { bg: '#e0e7ff', text: '#4f46e5', label: 'GP' },
        { bg: '#fef3c7', text: '#d97706', label: 'AZ' },
        { bg: '#dcfce7', text: '#15803d', label: 'BQ' }
      ];
      const colorScheme = iconColors[idx % iconColors.length];

      return `
        <tr>
          <td>
            <div class="table-item-cell">
              <div class="item-circle-badge" style="background:${colorScheme.bg}; color:${colorScheme.text};">
                ${t.tipo === 'venda' ? '💰' : (t.tipo === 'aporte' ? '📥' : '📦')}
              </div>
              <div>
                <div class="table-item-title">${t.descricao}</div>
                <div class="table-item-sub">${isPositivo ? 'Entrada no Caixa' : 'Saída Operacional'}</div>
              </div>
            </div>
          </td>
          <td>${formatarData(t.data, true)}</td>
          <td><span class="status-dot-green">Concluído</span></td>
          <td class="text-right ${corClass}">
            ${sinal} ${formatarMoeda(t.valor)}
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Aparelhos Ativos no Estoque (Lista Rápida Central)
  const estoqueEl = document.getElementById('dashboard-estoque-rapido');
  const itensAtivos = appState.itens.filter(i => i.status !== 'Vendido').slice(0, 3);

  if (itensAtivos.length === 0) {
    estoqueEl.innerHTML = `<div class="empty-state-clean"><p>Nenhum item em estoque no momento.</p></div>`;
  } else {
    estoqueEl.innerHTML = `
      <table class="table-clean">
        <thead>
          <tr>
            <th>Item / Modelo</th>
            <th>Custo</th>
            <th>Status</th>
            <th class="text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          ${itensAtivos.map(item => {
            const custoTotal = (Number(item.valorCompra) || 0) + (Number(item.custosAdicionais) || 0);
            return `
              <tr>
                <td>
                  <div class="table-item-title">${item.nome}</div>
                  <div class="table-item-sub">${item.categoria}</div>
                </td>
                <td><strong>${formatarMoeda(custoTotal)}</strong></td>
                <td><span class="status-dot-amber">${item.status}</span></td>
                <td class="text-right">
                  <button class="btn-green-solid btn-sm" onclick="abrirModalVenda('${item.id}')">Vender</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }
}

// -------------------------------------------------------------------------
// ESTATÍSTICAS & PROSPECÇÃO DE LUCRO
// -------------------------------------------------------------------------
function renderizarEstatisticas() {
  const m = appState.metricas || {};

  // Valores dos 4 pilares
  const totalAportadoEl = document.getElementById('stat-total-aportado');
  if (totalAportadoEl) totalAportadoEl.innerText = formatarMoeda(m.totalAportes);

  const lucroRealizadoEl = document.getElementById('stat-lucro-realizado');
  if (lucroRealizadoEl) lucroRealizadoEl.innerText = `+${formatarMoeda(m.lucroLiquidoRealizado)}`;

  const roiEl = document.getElementById('stat-roi-percentual');
  if (roiEl) roiEl.innerText = `+${m.roiTotal || 0}%`;

  const margemEl = document.getElementById('stat-margem-media');
  if (margemEl) margemEl.innerText = `${m.margemMedia || 0}%`;

  // Progresso da meta de R$ 10.000
  const metaAlvo = 10000;
  const saldoAtual = m.saldoCaixa || 0;
  const percentMeta = Math.min(100, Math.max(0, (saldoAtual / metaAlvo) * 100));
  const statMetaPercent = document.getElementById('stat-meta-percent');
  if (statMetaPercent) statMetaPercent.innerText = `${percentMeta.toFixed(1)}%`;

  // Atualizar Gráfico de Marcas
  atualizarGraficoMarcas();
}

function atualizarGraficoMarcas() {
  if (typeof Chart === 'undefined') return;

  const ctxMarcas = document.getElementById('chart-marcas')?.getContext('2d');
  if (!ctxMarcas) return;

  if (chartMarcasInstance) chartMarcasInstance.destroy();

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const corTexto = isDark ? '#94a3b8' : '#8c9ba5';
  const corGrid = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  // Agrupa lucros por marca dos itens vendidos
  const marcasLucro = {
    'Xiaomi / Poco': 0,
    'Samsung': 0,
    'Motorola': 0,
    'Acessórios': 0
  };

  appState.itens.filter(i => i.status === 'Vendido').forEach(v => {
    const nome = (v.nome || '').toLowerCase();
    const lucro = Number(v.lucroLiquido) || 0;
    if (nome.includes('poco') || nome.includes('xiaomi') || nome.includes('redmi')) {
      marcasLucro['Xiaomi / Poco'] += lucro;
    } else if (nome.includes('samsung') || nome.includes('galaxy')) {
      marcasLucro['Samsung'] += lucro;
    } else if (nome.includes('motorola') || nome.includes('moto') || nome.includes('edge')) {
      marcasLucro['Motorola'] += lucro;
    } else {
      marcasLucro['Acessórios'] += lucro;
    }
  });

  const labels = Object.keys(marcasLucro);
  const data = Object.values(marcasLucro);

  chartMarcasInstance = new Chart(ctxMarcas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lucro Líquido (R$)',
        data: data,
        backgroundColor: [
          '#f59e0b', // Poco/Xiaomi Dourado/Laranja
          '#2563eb', // Samsung Azul
          '#0a703d', // Motorola Verde Floresta
          '#8b5cf6'  // Acessórios Roxo
        ],
        borderRadius: 14,
        barThickness: 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` Lucro: R$ ${Number(item.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        y: {
          grid: { color: corGrid, drawBorder: false },
          ticks: { color: corTexto, font: { family: 'Plus Jakarta Sans', size: 10 }, callback: (v) => 'R$' + v }
        },
        x: {
          grid: { display: false },
          ticks: { color: corTexto, font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 } }
        }
      }
    }
  });
}

// -------------------------------------------------------------------------
// ESTOQUE ATIVO
// -------------------------------------------------------------------------
function renderizarEstoque() {
  const busca = (document.getElementById('filtro-estoque-busca')?.value || '').toLowerCase();
  const categoria = document.getElementById('filtro-estoque-categoria')?.value || '';
  const statusFiltro = document.getElementById('filtro-estoque-status')?.value || '';

  const corpoTabela = document.getElementById('lista-estoque-corpo');
  const emptyState = document.getElementById('empty-estoque');

  let itens = appState.itens.filter(i => i.status !== 'Vendido');

  if (busca) {
    itens = itens.filter(i => i.nome.toLowerCase().includes(busca) || (i.observacoes && i.observacoes.toLowerCase().includes(busca)));
  }
  if (categoria) {
    itens = itens.filter(i => i.categoria === categoria);
  }
  if (statusFiltro) {
    itens = itens.filter(i => i.status === statusFiltro);
  }

  if (itens.length === 0) {
    corpoTabela.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  corpoTabela.innerHTML = itens.map(item => {
    const custoCompra = Number(item.valorCompra) || 0;
    const custosExtras = Number(item.custosAdicionais) || 0;
    const custoTotal = custoCompra + custosExtras;

    return `
      <tr>
        <td>
          <div class="table-item-title">${item.nome}</div>
          ${item.observacoes ? `<div class="table-item-sub">${item.observacoes}</div>` : ''}
        </td>
        <td><span class="text-muted">${item.categoria}</span></td>
        <td>${formatarData(item.dataCompra)}</td>
        <td>${formatarMoeda(custoCompra)}</td>
        <td>
          ${custosExtras > 0 
            ? `<span class="text-danger">+ ${formatarMoeda(custosExtras)}</span>` 
            : `<span class="text-muted">R$ 0,00</span>`
          }
        </td>
        <td><strong class="text-dark">${formatarMoeda(custoTotal)}</strong></td>
        <td><span class="status-dot-amber">${item.status}</span></td>
        <td class="text-right">
          <button class="btn-green-solid btn-sm" onclick="abrirModalVenda('${item.id}')" title="Registrar Venda">
            Vender
          </button>
          <button class="btn-clean-white btn-sm" onclick="abrirModalDetalhes('${item.id}')" title="Editar">
            ✏️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------------------
// VENDAS & LUCROS
// -------------------------------------------------------------------------
function renderizarVendas() {
  const busca = (document.getElementById('filtro-vendas-busca')?.value || '').toLowerCase();
  const corpoTabela = document.getElementById('lista-vendas-corpo');
  const emptyState = document.getElementById('empty-vendas');

  let vendas = appState.itens.filter(i => i.status === 'Vendido');

  if (busca) {
    vendas = vendas.filter(i => 
      i.nome.toLowerCase().includes(busca) || 
      (i.comprador && i.comprador.toLowerCase().includes(busca)) ||
      (i.canalVenda && i.canalVenda.toLowerCase().includes(busca))
    );
  }

  const totalFaturado = vendas.reduce((acc, v) => acc + (Number(v.valorVenda) || 0), 0);
  const totalLucro = vendas.reduce((acc, v) => acc + (Number(v.lucroLiquido) || 0), 0);
  const margemMedia = vendas.length > 0 ? (vendas.reduce((acc, v) => acc + (Number(v.margemPercentual) || 0), 0) / vendas.length) : 0;

  document.getElementById('sum-faturado').innerText = formatarMoeda(totalFaturado);
  document.getElementById('sum-lucro').innerText = `+${formatarMoeda(totalLucro)}`;
  document.getElementById('sum-margem').innerText = `${margemMedia.toFixed(1)}%`;

  if (vendas.length === 0) {
    corpoTabela.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  corpoTabela.innerHTML = vendas.map(item => {
    const custoTotal = (Number(item.valorCompra) || 0) + (Number(item.custosAdicionais) || 0);
    const valorVenda = Number(item.valorVenda) || 0;
    const lucro = Number(item.lucroLiquido) || 0;
    const margem = Number(item.margemPercentual) || 0;

    return `
      <tr>
        <td>
          <div class="table-item-title">${item.nome}</div>
          <div class="table-item-sub">Comprado em ${formatarData(item.dataCompra)}</div>
        </td>
        <td>
          <div class="table-item-title">${item.canalVenda || 'Venda Direta'}</div>
          <div class="table-item-sub">${item.comprador || '-'}</div>
        </td>
        <td>${formatarData(item.dataVenda)}</td>
        <td>${formatarMoeda(custoTotal)}</td>
        <td><strong>${formatarMoeda(valorVenda)}</strong></td>
        <td><strong class="text-green">+ ${formatarMoeda(lucro)}</strong></td>
        <td><span class="badge-percent-green">${margem.toFixed(1)}%</span></td>
        <td class="text-right">
          <button class="btn-clean-white btn-sm" onclick="abrirModalDetalhes('${item.id}')" title="Ver Detalhes">
            👁️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------------------
// FLUXO DE CAIXA
// -------------------------------------------------------------------------
function renderizarCaixa() {
  const m = appState.metricas || {};
  document.getElementById('caixa-stat-aportes').innerText = formatarMoeda(m.totalAportes);
  document.getElementById('caixa-stat-compras').innerText = formatarMoeda(m.totalCompras);
  document.getElementById('caixa-stat-vendas').innerText = formatarMoeda(m.totalVendas);
  document.getElementById('caixa-stat-custos').innerText = formatarMoeda(m.totalCustosExtras);
  document.getElementById('caixa-stat-saldo').innerText = formatarMoeda(m.saldoCaixa);

  const tipoFiltro = document.getElementById('filtro-extrato-tipo')?.value || '';
  const corpoTabela = document.getElementById('lista-extrato-corpo');

  let transacoes = [...appState.transacoes];
  if (tipoFiltro) {
    transacoes = transacoes.filter(t => t.tipo === tipoFiltro);
  }

  if (transacoes.length === 0) {
    corpoTabela.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Nenhuma transação encontrada.</td></tr>`;
    return;
  }

  corpoTabela.innerHTML = transacoes.map(t => {
    const isPositivo = t.tipo === 'aporte' || t.tipo === 'venda';
    const corClass = isPositivo ? 'text-green' : 'text-danger';
    const sinal = isPositivo ? '+' : '-';

    return `
      <tr>
        <td>${formatarData(t.data)}</td>
        <td><span class="badge-percent-green">${t.tipo.toUpperCase()}</span></td>
        <td>${t.descricao}</td>
        <td class="text-right ${corClass} font-bold">${sinal} ${formatarMoeda(t.valor)}</td>
        <td class="text-right">
          <button class="btn-clean-white btn-sm" onclick="excluirTransacao('${t.id}')" title="Excluir">
            &times;
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------------------------
// GRÁFICOS (CHART.JS - ESTILO DA REFERÊNCIA)
// -------------------------------------------------------------------------
function atualizarGraficos() {
  if (typeof Chart === 'undefined') return;

  const m = appState.metricas || {};
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const corTexto = isDark ? '#94a3b8' : '#8c9ba5';
  const corGrid = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

  // 1. Gráfico de Barras Cápsula (Engagement Rate da imagem)
  const ctxFluxo = document.getElementById('chart-fluxo')?.getContext('2d');
  if (ctxFluxo) {
    if (chartFluxoInstance) chartFluxoInstance.destroy();

    chartFluxoInstance = new Chart(ctxFluxo, {
      type: 'bar',
      data: {
        labels: ['Compras', 'Custos Extras', 'Vendas', 'Lucro Líquido', 'Caixa Atual'],
        datasets: [{
          data: [
            m.totalCompras || 0,
            m.totalCustosExtras || 0,
            m.totalVendas || 0,
            m.lucroLiquidoRealizado || 0,
            m.saldoCaixa || 0
          ],
          backgroundColor: isDark ? [
            '#059669', // Verde esmeralda escuro
            '#0d9488', // Teal
            '#10b981', // Verde esmeralda destaque
            '#34d399', // Verde claro
            '#6ee7b7'  // Menta
          ] : [
            '#a7f3d0', // Menta
            '#c6e7d1', // Menta claro
            '#0a703d', // Verde floresta escuro (em destaque como o mês de Abril na imagem)
            '#10b981', // Verde vibrante
            '#6ee7b7'  // Menta
          ],
          borderRadius: 24, // Borda cápsula arredondada como no design
          borderSkipped: false,
          barThickness: 34
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` R$ ${Number(item.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          y: {
            grid: { color: corGrid, drawBorder: false },
            ticks: { color: corTexto, font: { family: 'Plus Jakarta Sans', size: 11 }, callback: (v) => 'R$' + v }
          },
          x: {
            grid: { display: false },
            ticks: { color: corTexto, font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // 2. Gráfico de Onda Suave (Wave Chart do Total Balance da imagem)
  const ctxWave = document.getElementById('chart-wave')?.getContext('2d');
  if (ctxWave) {
    if (chartWaveInstance) chartWaveInstance.destroy();

    const gradient = ctxWave.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(10, 112, 61, 0.2)');
    gradient.addColorStop(1, 'rgba(10, 112, 61, 0.0)');

    chartWaveInstance = new Chart(ctxWave, {
      type: 'line',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [{
          data: [1200, 1400, 1350, 1600, 1500, 1850, 1720, 2050, 1980, (m.patrimonioTotal || 2170)],
          borderColor: isDark ? '#10b981' : '#0a703d',
          borderWidth: 2.2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45, // Linha suave orgânica
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
}

// -------------------------------------------------------------------------
// SIMULADOR DE BRIQUE
// -------------------------------------------------------------------------
function calcularSimulador() {
  const compra = Number(document.getElementById('sim-compra')?.value) || 0;
  const custo = Number(document.getElementById('sim-custo')?.value) || 0;
  const venda = Number(document.getElementById('sim-venda')?.value) || 0;
  const saldoCaixa = appState.metricas?.saldoCaixa || 0;

  const custoTotal = compra + custo;
  const lucroEstimado = venda - custoTotal;
  const margem = custoTotal > 0 ? (lucroEstimado / custoTotal) * 100 : 0;

  document.getElementById('sim-custo-total').innerText = formatarMoeda(custoTotal);
  document.getElementById('sim-lucro-estimado').innerText = `+${formatarMoeda(lucroEstimado)}`;
  document.getElementById('sim-margem-estimada').innerText = `${margem.toFixed(1)}%`;

  const impactEl = document.getElementById('sim-impacto-caixa');
  if (compra > saldoCaixa) {
    impactEl.innerHTML = `<span class="text-danger">Faltam R$ ${(compra - saldoCaixa).toFixed(2)} no caixa</span>`;
  } else {
    impactEl.innerHTML = `<span class="text-green">Caixa suficiente! (Resta R$ ${(saldoCaixa - compra).toFixed(2)})</span>`;
  }

  const vereditoEl = document.getElementById('sim-veredito');
  const btnConverter = document.getElementById('btn-converter-em-brique');

  if (compra > 0 && venda > 0) {
    btnConverter.classList.remove('hidden');
    if (lucroEstimado <= 0) {
      vereditoEl.className = 'clean-verdict ruim mt-16';
      vereditoEl.innerText = "❌ Alerta: Prejuízo ou empate na negociação. Não compre!";
    } else if (margem >= 30) {
      vereditoEl.className = 'clean-verdict bom mt-16';
      vereditoEl.innerText = `🔥 Excelente negócio! Margem de ${margem.toFixed(1)}% com lucro de R$ ${lucroEstimado.toFixed(2)}`;
    } else {
      vereditoEl.className = 'clean-verdict mt-16';
      vereditoEl.innerText = `👍 Margem de ${margem.toFixed(1)}%. Vale a pena se o giro for rápido!`;
    }
  } else {
    btnConverter.classList.add('hidden');
    vereditoEl.className = 'clean-verdict mt-16';
    vereditoEl.innerText = "Preencha os valores para simular";
  }
}

// -------------------------------------------------------------------------
// GESTÃO DE MODAIS
// -------------------------------------------------------------------------
function fecharModais() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
}

function abrirModalNovoBrique(prefill = {}) {
  document.getElementById('form-novo-brique').reset();
  document.getElementById('item-data-compra').value = getDataHoje();
  document.getElementById('item-descontar-caixa').checked = true;

  if (prefill.nome) document.getElementById('item-nome').value = prefill.nome;
  if (prefill.compra) document.getElementById('item-valor-compra').value = prefill.compra;
  if (prefill.custo) document.getElementById('item-custos-adicionais').value = prefill.custo;

  document.getElementById('modal-novo-brique').classList.remove('hidden');
}

function abrirModalVenda(itemId) {
  const item = appState.itens.find(i => i.id === itemId);
  if (!item) return;

  const custoTotal = (Number(item.valorCompra) || 0) + (Number(item.custosAdicionais) || 0);

  document.getElementById('form-vender-item').reset();
  document.getElementById('venda-item-id').value = item.id;
  document.getElementById('venda-item-custo-total').value = custoTotal;
  document.getElementById('venda-item-nome-display').innerText = item.nome;
  document.getElementById('venda-custo-display').innerText = formatarMoeda(custoTotal);
  document.getElementById('venda-data').value = getDataHoje();

  document.getElementById('venda-preview-lucro').innerText = "+R$ 0,00";
  document.getElementById('venda-preview-margem').innerText = "0%";

  document.getElementById('modal-vender-item').classList.remove('hidden');
}

function atualizarPreviewVenda() {
  const custoTotal = Number(document.getElementById('venda-item-custo-total').value) || 0;
  const valorVenda = Number(document.getElementById('venda-valor').value) || 0;

  const lucro = valorVenda - custoTotal;
  const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;

  const lucroEl = document.getElementById('venda-preview-lucro');
  lucroEl.innerText = `${lucro >= 0 ? '+' : ''}${formatarMoeda(lucro)}`;
  lucroEl.className = lucro >= 0 ? 'text-green text-lg' : 'text-danger text-lg';

  document.getElementById('venda-preview-margem').innerText = `${margem.toFixed(1)}%`;
}

function abrirModalDetalhes(itemId) {
  const item = appState.itens.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('edit-item-id').value = item.id;
  document.getElementById('edit-nome').value = item.nome;
  document.getElementById('edit-categoria').value = item.categoria;
  document.getElementById('edit-status').value = item.status;
  document.getElementById('edit-custos-desc').value = item.custosDescricao || '';
  document.getElementById('edit-observacoes').value = item.observacoes || '';

  document.getElementById('btn-excluir-item-modal').onclick = () => excluirItem(item.id);
  document.getElementById('modal-detalhes-item').classList.remove('hidden');
}

async function realizarAporte300() {
  if (!confirm("Confirmar entrada do Aporte Salarial Mensal de R$ 300,00 no caixa do negócio?")) return;

  try {
    const res = await fetch('/api/aportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: 300,
        descricao: "Aporte Mensal do Salário (R$ 300,00)",
        data: getDataHoje()
      })
    });
    if (!res.ok) throw new Error("Falha ao registrar aporte");
    
    showToast("🎉 Aporte de R$ 300,00 adicionado ao Caixa!");
    await carregarDados();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function excluirItem(itemId) {
  if (!confirm("Tem certeza que deseja excluir este brique e suas transações associadas?")) return;

  try {
    const res = await fetch(`/api/itens/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erro ao excluir item");
    fecharModais();
    showToast("Item removido do estoque.");
    await carregarDados();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function excluirTransacao(trId) {
  if (!confirm("Remover esta movimentação do caixa?")) return;

  try {
    const res = await fetch(`/api/transacoes/${trId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erro ao remover transação");
    showToast("Transação removida.");
    await carregarDados();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// -------------------------------------------------------------------------
// SINCRONIZAÇÃO DAS ABAS (NAV PÍLULA SUPERIOR + SIDEBAR FLUTUANTE)
// -------------------------------------------------------------------------
function mudarAba(targetId) {
  // Sincroniza botões superiores
  document.querySelectorAll('.pill-nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === targetId);
  });
  // Sincroniza botões laterais
  document.querySelectorAll('.sidebar-icon-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === targetId);
  });
  // Exibe o painel
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === targetId);
  });

  if (targetId === 'tab-dashboard') {
    setTimeout(atualizarGraficos, 40);
  } else if (targetId === 'tab-estatisticas') {
    setTimeout(renderizarEstatisticas, 40);
  }
}

// -------------------------------------------------------------------------
// INICIALIZAÇÃO
// -------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  inicializarTema();
  carregarDados();

  // Alternador de Modo Escuro / Claro
  document.getElementById('btn-theme-toggle')?.addEventListener('click', alternarTema);

  // Listeners das Abas (Superior e Lateral)
  document.querySelectorAll('.pill-nav-item, .sidebar-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) mudarAba(tab);
    });
  });

  // Ações Rápidas
  document.getElementById('btn-quick-aporte')?.addEventListener('click', realizarAporte300);
  document.getElementById('btn-fazer-aporte-300')?.addEventListener('click', realizarAporte300);
  document.getElementById('btn-open-novo-brique')?.addEventListener('click', () => abrirModalNovoBrique());
  document.getElementById('btn-novo-brique-tab')?.addEventListener('click', () => abrirModalNovoBrique());

  // Aporte customizado
  document.getElementById('btn-custom-aporte')?.addEventListener('click', () => {
    document.getElementById('form-aporte').reset();
    document.getElementById('aporte-data').value = getDataHoje();
    document.getElementById('modal-aporte').classList.remove('hidden');
  });

  // Retirada
  document.getElementById('btn-retirada-lucro')?.addEventListener('click', () => {
    document.getElementById('form-retirada').reset();
    document.getElementById('retirada-data').value = getDataHoje();
    document.getElementById('modal-retirada').classList.remove('hidden');
  });

  // Form: Novo Brique
  document.getElementById('form-novo-brique')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('item-nome').value;
    const categoria = document.getElementById('item-categoria').value;
    const status = document.getElementById('item-status').value;
    const valorCompra = document.getElementById('item-valor-compra').value;
    const dataCompra = document.getElementById('item-data-compra').value;
    const custosAdicionais = document.getElementById('item-custos-adicionais').value;
    const custosDescricao = document.getElementById('item-custos-descricao').value;
    const observacoes = document.getElementById('item-observacoes').value;
    const descontarDoCaixa = document.getElementById('item-descontar-caixa').checked;

    try {
      const res = await fetch('/api/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, categoria, status, valorCompra, dataCompra,
          custosAdicionais, custosDescricao, observacoes, descontarDoCaixa
        })
      });
      if (!res.ok) throw new Error("Erro ao salvar novo item");

      fecharModais();
      showToast("📱 Brique salvo no estoque com sucesso!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Form: Vender Item
  document.getElementById('form-vender-item')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemId = document.getElementById('venda-item-id').value;
    const valorVenda = document.getElementById('venda-valor').value;
    const dataVenda = document.getElementById('venda-data').value;
    const canalVenda = document.getElementById('venda-canal').value;
    const comprador = document.getElementById('venda-comprador').value;
    const observacoes = document.getElementById('venda-observacoes').value;

    try {
      const res = await fetch(`/api/itens/${itemId}/vender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valorVenda, dataVenda, canalVenda, comprador, observacoes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar venda");

      fecharModais();
      showToast(`💰 Venda registrada! Lucro de R$ ${Number(data.item.lucroLiquido).toFixed(2)}`);
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById('venda-valor')?.addEventListener('input', atualizarPreviewVenda);

  // Form: Aporte Customizado
  document.getElementById('form-aporte')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valor = document.getElementById('aporte-valor').value;
    const descricao = document.getElementById('aporte-desc').value;
    const data = document.getElementById('aporte-data').value;

    try {
      const res = await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, descricao, data })
      });
      if (!res.ok) throw new Error("Erro ao realizar aporte");

      fecharModais();
      showToast("Valor creditado no caixa!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Form: Retirada de Caixa
  document.getElementById('form-retirada')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valor = document.getElementById('retirada-valor').value;
    const tipo = document.getElementById('retirada-tipo').value;
    const descricao = document.getElementById('retirada-desc').value;
    const data = document.getElementById('retirada-data').value;

    try {
      const res = await fetch('/api/retiradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, tipo, descricao, data })
      });
      if (!res.ok) throw new Error("Erro ao realizar retirada");

      fecharModais();
      showToast("Saída registrada no caixa!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Form: Editar Item
  document.getElementById('form-editar-item')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemId = document.getElementById('edit-item-id').value;
    const nome = document.getElementById('edit-nome').value;
    const categoria = document.getElementById('edit-categoria').value;
    const status = document.getElementById('edit-status').value;
    const custosDescricao = document.getElementById('edit-custos-desc').value;
    const observacoes = document.getElementById('edit-observacoes').value;

    try {
      const res = await fetch(`/api/itens/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, categoria, status, custosDescricao, observacoes })
      });
      if (!res.ok) throw new Error("Erro ao atualizar item");

      fecharModais();
      showToast("Item atualizado!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Simulador
  ['sim-compra', 'sim-custo', 'sim-venda'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calcularSimulador);
  });

  document.getElementById('btn-converter-em-brique')?.addEventListener('click', () => {
    const nome = document.getElementById('sim-nome').value || 'Aparelho Negociado';
    const compra = document.getElementById('sim-compra').value;
    const custo = document.getElementById('sim-custo').value;
    abrirModalNovoBrique({ nome, compra, custo });
  });

  // Filtros
  document.getElementById('filtro-estoque-busca')?.addEventListener('input', renderizarEstoque);
  document.getElementById('filtro-estoque-categoria')?.addEventListener('change', renderizarEstoque);
  document.getElementById('filtro-estoque-status')?.addEventListener('change', renderizarEstoque);
  document.getElementById('filtro-vendas-busca')?.addEventListener('input', renderizarVendas);
  document.getElementById('filtro-extrato-tipo')?.addEventListener('change', renderizarCaixa);

  // Backup
  document.getElementById('input-restore-backup')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const res = await fetch('/api/backup/restaurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });
      if (!res.ok) throw new Error("Arquivo de backup inválido.");

      showToast("Backup restaurado com sucesso!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById('btn-zerar-dados')?.addEventListener('click', async () => {
    if (!confirm("⚠️ ATENÇÃO: Isso irá apagar todos os itens e transações de teste e deixar o sistema 100% limpo. Deseja continuar?")) return;

    try {
      const res = await fetch('/api/sistema/zerar', { method: 'POST' });
      if (!res.ok) throw new Error("Erro ao zerar dados");

      showToast("Sistema reiniciado!");
      await carregarDados();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModais();
  });
});
