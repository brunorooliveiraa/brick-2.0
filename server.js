const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'database_backup.json');

// Garante que o diretório data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Estrutura padrão inicial do banco de dados
const defaultDb = {
  config: {
    nomeNegocio: "Brique Pro - Gestão & Lucro",
    aportePadrao: 300,
    moeda: "BRL"
  },
  itens: [
    // Exemplos iniciais para o Bruninho ver a mágica funcionando na primeira vez
    {
      id: "ex-1",
      nome: "iPhone 11 64GB Preto (Bateria 85%)",
      categoria: "Celular / Smartphone",
      valorCompra: 1100,
      custosAdicionais: 80, // Ex: película nova e limpeza
      custosDescricao: "Limpeza interna + película 3D",
      dataCompra: "2026-09-10",
      status: "Vendido", // "Em Estoque", "Em Manutenção", "Anunciado", "Vendido"
      valorVenda: 1550,
      dataVenda: "2026-09-18",
      comprador: "Lucas - OLX",
      canalVenda: "OLX",
      observacoes: "Aparelho impecável, vendido rápido",
      lucroLiquido: 370,
      margemPercentual: 31.36
    },
    {
      id: "ex-2",
      nome: "Notebook Dell Inspiron i5 8GB SSD 256GB",
      categoria: "Notebook / PC",
      valorCompra: 850,
      custosAdicionais: 120, // Ex: carregador original novo
      custosDescricao: "Fonte original Dell adquirida",
      dataCompra: "2026-09-20",
      status: "Em Estoque",
      valorVenda: null,
      dataVenda: null,
      comprador: "",
      canalVenda: "",
      observacoes: "Em excelente estado, formatado com Windows 11",
      lucroLiquido: null,
      margemPercentual: null
    }
  ],
  transacoes: [
    {
      id: "tr-1",
      tipo: "aporte", // "aporte", "compra", "custo_extra", "venda", "retirada"
      descricao: "Aporte Mensal do Salário (Setembro)",
      valor: 300,
      data: "2026-09-01",
      itemId: null
    },
    {
      id: "tr-2",
      tipo: "aporte",
      descricao: "Aporte Inicial de Caixa",
      valor: 1500,
      data: "2026-09-05",
      itemId: null
    },
    {
      id: "tr-3",
      tipo: "compra",
      descricao: "Compra: iPhone 11 64GB Preto",
      valor: 1100,
      data: "2026-09-10",
      itemId: "ex-1"
    },
    {
      id: "tr-4",
      tipo: "custo_extra",
      descricao: "Custo Extra: Limpeza interna + película 3D (iPhone 11)",
      valor: 80,
      data: "2026-09-11",
      itemId: "ex-1"
    },
    {
      id: "tr-5",
      tipo: "venda",
      descricao: "Venda: iPhone 11 64GB Preto (OLX)",
      valor: 1550,
      data: "2026-09-18",
      itemId: "ex-1"
    },
    {
      id: "tr-6",
      tipo: "compra",
      descricao: "Compra: Notebook Dell Inspiron i5 8GB SSD 256GB",
      valor: 850,
      data: "2026-09-20",
      itemId: "ex-2"
    },
    {
      id: "tr-7",
      tipo: "custo_extra",
      descricao: "Custo Extra: Fonte original Dell adquirida (Dell Inspiron)",
      valor: 120,
      data: "2026-09-21",
      itemId: "ex-2"
    }
  ]
};

// Funções de I/O Seguras
function carregarBanco() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      salvarBanco(defaultDb);
      return JSON.parse(JSON.stringify(defaultDb));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler banco de dados. Tentando restaurar do backup:", err);
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
        return JSON.parse(backupData);
      } catch (backupErr) {
        console.error("Erro crítico no backup:", backupErr);
      }
    }
    return defaultDb;
  }
}

function salvarBanco(db) {
  try {
    const data = JSON.stringify(db, null, 2);
    fs.writeFileSync(DB_FILE, data, 'utf8');
    // Salva backup de segurança
    fs.writeFileSync(BACKUP_FILE, data, 'utf8');
    return true;
  } catch (err) {
    console.error("Erro ao salvar banco de dados:", err);
    return false;
  }
}

// Utilitário de cálculo de Métricas
function calcularMetricas(db) {
  let saldoCaixa = 0;
  let totalAportes = 0;
  let totalRetiradas = 0;
  let totalVendas = 0;
  let totalCompras = 0;
  let totalCustosExtras = 0;

  db.transacoes.forEach(t => {
    const v = Number(t.valor) || 0;
    if (t.tipo === 'aporte' || t.tipo === 'venda') {
      saldoCaixa += v;
    } else if (t.tipo === 'compra' || t.tipo === 'custo_extra' || t.tipo === 'retirada') {
      saldoCaixa -= v;
    }

    if (t.tipo === 'aporte') totalAportes += v;
    if (t.tipo === 'retirada') totalRetiradas += v;
    if (t.tipo === 'venda') totalVendas += v;
    if (t.tipo === 'compra') totalCompras += v;
    if (t.tipo === 'custo_extra') totalCustosExtras += v;
  });

  // Itens em estoque ativo
  const itensEmEstoque = db.itens.filter(i => i.status !== 'Vendido');
  const itensVendidos = db.itens.filter(i => i.status === 'Vendido');

  // Capital alocado em estoque (preço de compra + custos adicionais de itens não vendidos)
  const capitalEmEstoque = itensEmEstoque.reduce((acc, i) => {
    return acc + (Number(i.valorCompra) || 0) + (Number(i.custosAdicionais) || 0);
  }, 0);

  // Lucro líquido total realizado
  const lucroLiquidoRealizado = itensVendidos.reduce((acc, i) => {
    return acc + (Number(i.lucroLiquido) || 0);
  }, 0);

  // Patrimônio total do negócio = Caixa Líquido + Itens em Estoque
  const patrimonioTotal = saldoCaixa + capitalEmEstoque;

  // ROI total em cima dos aportes (se aportes > 0)
  const roiTotal = totalAportes > 0 ? ((lucroLiquidoRealizado / totalAportes) * 100) : 0;

  // Média de margem percentual das vendas
  const margemMedia = itensVendidos.length > 0 
    ? (itensVendidos.reduce((acc, i) => acc + (Number(i.margemPercentual) || 0), 0) / itensVendidos.length)
    : 0;

  return {
    saldoCaixa: Math.round(saldoCaixa * 100) / 100,
    capitalEmEstoque: Math.round(capitalEmEstoque * 100) / 100,
    patrimonioTotal: Math.round(patrimonioTotal * 100) / 100,
    lucroLiquidoRealizado: Math.round(lucroLiquidoRealizado * 100) / 100,
    totalAportes: Math.round(totalAportes * 100) / 100,
    totalRetiradas: Math.round(totalRetiradas * 100) / 100,
    totalVendas: Math.round(totalVendas * 100) / 100,
    totalCompras: Math.round(totalCompras * 100) / 100,
    totalCustosExtras: Math.round(totalCustosExtras * 100) / 100,
    qtdEstoque: itensEmEstoque.length,
    qtdVendidos: itensVendidos.length,
    roiTotal: Math.round(roiTotal * 10) / 10,
    margemMedia: Math.round(margemMedia * 10) / 10
  };
}

// ROTAS DA API

// 1. Obter todos os dados do dashboard
app.get('/api/dados', (req, res) => {
  const db = carregarBanco();
  const metricas = calcularMetricas(db);
  res.json({
    config: db.config,
    itens: db.itens,
    transacoes: db.transacoes,
    metricas
  });
});

// 2. Registrar Aporte (ex: R$ 300 do salário mensal)
app.post('/api/aportes', (req, res) => {
  const { valor, descricao, data } = req.body;
  const numValor = Number(valor);

  if (isNaN(numValor) || numValor <= 0) {
    return res.status(400).json({ error: "Valor do aporte deve ser um número positivo." });
  }

  const db = carregarBanco();
  const novaTransacao = {
    id: 'tr-' + crypto.randomUUID(),
    tipo: 'aporte',
    descricao: descricao || `Aporte Mensal do Salário (R$ ${numValor.toFixed(2)})`,
    valor: numValor,
    data: data || new Date().toISOString().split('T')[0],
    itemId: null
  };

  db.transacoes.unshift(novaTransacao);
  salvarBanco(db);

  res.status(201).json({
    message: "Aporte registrado com sucesso!",
    transacao: novaTransacao,
    metricas: calcularMetricas(db)
  });
});

// 3. Cadastrar Novo Item no Brique (Compra)
app.post('/api/itens', (req, res) => {
  const {
    nome,
    categoria,
    valorCompra,
    custosAdicionais,
    custosDescricao,
    dataCompra,
    status,
    observacoes,
    descontarDoCaixa
  } = req.body;

  if (!nome || !valorCompra) {
    return res.status(400).json({ error: "Nome e Valor de Compra são obrigatórios." });
  }

  const numCompra = Number(valorCompra);
  const numCustos = Number(custosAdicionais) || 0;
  const dataHoje = dataCompra || new Date().toISOString().split('T')[0];

  const db = carregarBanco();
  const itemId = 'item-' + crypto.randomUUID();

  const novoItem = {
    id: itemId,
    nome,
    categoria: categoria || "Outros",
    valorCompra: numCompra,
    custosAdicionais: numCustos,
    custosDescricao: custosDescricao || "",
    dataCompra: dataHoje,
    status: status || "Em Estoque",
    valorVenda: null,
    dataVenda: null,
    comprador: "",
    canalVenda: "",
    observacoes: observacoes || "",
    lucroLiquido: null,
    margemPercentual: null
  };

  db.itens.unshift(novoItem);

  // Se marcado para movimentar o caixa (padrão true)
  if (descontarDoCaixa !== false) {
    db.transacoes.unshift({
      id: 'tr-' + crypto.randomUUID(),
      tipo: 'compra',
      descricao: `Compra: ${nome}`,
      valor: numCompra,
      data: dataHoje,
      itemId: itemId
    });

    if (numCustos > 0) {
      db.transacoes.unshift({
        id: 'tr-' + crypto.randomUUID(),
        tipo: 'custo_extra',
        descricao: `Custo Extra (${custosDescricao || 'Manutenção'}): ${nome}`,
        valor: numCustos,
        data: dataHoje,
        itemId: itemId
      });
    }
  }

  salvarBanco(db);
  res.status(201).json({
    message: "Item cadastrado com sucesso!",
    item: novoItem,
    metricas: calcularMetricas(db)
  });
});

// 4. Concluir Venda de um Item (Reinvestimento / Lucro)
app.post('/api/itens/:id/vender', (req, res) => {
  const { id } = req.params;
  const { valorVenda, dataVenda, comprador, canalVenda, observacoes, custosFinais } = req.body;

  const numVenda = Number(valorVenda);
  if (isNaN(numVenda) || numVenda <= 0) {
    return res.status(400).json({ error: "Valor de venda inválido." });
  }

  const db = carregarBanco();
  const index = db.itens.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item não encontrado." });
  }

  const item = db.itens[index];
  const dataHoje = dataVenda || new Date().toISOString().split('T')[0];

  // Se houver ajuste de custos adicionais de última hora
  if (custosFinais !== undefined && !isNaN(Number(custosFinais))) {
    const diff = Number(custosFinais) - (item.custosAdicionais || 0);
    item.custosAdicionais = Number(custosFinais);
    if (diff > 0) {
      db.transacoes.unshift({
        id: 'tr-' + crypto.randomUUID(),
        tipo: 'custo_extra',
        descricao: `Custo Adicional Final: ${item.nome}`,
        valor: diff,
        data: dataHoje,
        itemId: item.id
      });
    }
  }

  const custoTotal = Number(item.valorCompra) + Number(item.custosAdicionais || 0);
  const lucroLiquido = Math.round((numVenda - custoTotal) * 100) / 100;
  const margem = custoTotal > 0 ? Math.round(((lucroLiquido / custoTotal) * 100) * 100) / 100 : 100;

  item.status = "Vendido";
  item.valorVenda = numVenda;
  item.dataVenda = dataHoje;
  item.comprador = comprador || "";
  item.canalVenda = canalVenda || "Direto";
  if (observacoes) item.observacoes = (item.observacoes ? item.observacoes + "\n" : "") + observacoes;
  item.lucroLiquido = lucroLiquido;
  item.margemPercentual = margem;

  // Adiciona transação de entrada de caixa com a venda
  db.transacoes.unshift({
    id: 'tr-' + crypto.randomUUID(),
    tipo: 'venda',
    descricao: `Venda: ${item.nome} (${canalVenda || 'Venda Direta'})`,
    valor: numVenda,
    data: dataHoje,
    itemId: item.id
  });

  salvarBanco(db);
  res.json({
    message: "Venda registrada com sucesso! Lucro de R$ " + lucroLiquido.toFixed(2),
    item,
    metricas: calcularMetricas(db)
  });
});

// 5. Editar Item
app.put('/api/itens/:id', (req, res) => {
  const { id } = req.params;
  const db = carregarBanco();
  const index = db.itens.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item não encontrado." });
  }

  const item = db.itens[index];
  const {
    nome,
    categoria,
    status,
    observacoes,
    custosDescricao,
    comprador,
    canalVenda
  } = req.body;

  if (nome) item.nome = nome;
  if (categoria) item.categoria = categoria;
  if (status) item.status = status;
  if (observacoes !== undefined) item.observacoes = observacoes;
  if (custosDescricao !== undefined) item.custosDescricao = custosDescricao;
  if (comprador !== undefined) item.comprador = comprador;
  if (canalVenda !== undefined) item.canalVenda = canalVenda;

  salvarBanco(db);
  res.json({ message: "Item atualizado!", item, metricas: calcularMetricas(db) });
});

// 6. Excluir Item
app.delete('/api/itens/:id', (req, res) => {
  const { id } = req.params;
  const db = carregarBanco();
  
  const itemIndex = db.itens.findIndex(i => i.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item não encontrado." });
  }

  // Remove também as transações vinculadas ao item para manter consistência contábil
  db.itens.splice(itemIndex, 1);
  db.transacoes = db.transacoes.filter(t => t.itemId !== id);

  salvarBanco(db);
  res.json({ message: "Item e histórico financeiro associado removidos!", metricas: calcularMetricas(db) });
});

// 7. Retirada de Caixa ou Despesa Avulsa
app.post('/api/retiradas', (req, res) => {
  const { valor, descricao, data, tipo } = req.body;
  const numValor = Number(valor);

  if (isNaN(numValor) || numValor <= 0) {
    return res.status(400).json({ error: "Valor inválido." });
  }

  const db = carregarBanco();
  const novaTransacao = {
    id: 'tr-' + crypto.randomUUID(),
    tipo: tipo === 'retirada' ? 'retirada' : 'custo_extra',
    descricao: descricao || (tipo === 'retirada' ? "Retirada de Lucro / Pro-Labore" : "Despesa Operacional"),
    valor: numValor,
    data: data || new Date().toISOString().split('T')[0],
    itemId: null
  };

  db.transacoes.unshift(novaTransacao);
  salvarBanco(db);

  res.status(201).json({
    message: "Operação financeira registrada!",
    transacao: novaTransacao,
    metricas: calcularMetricas(db)
  });
});

// 8. Excluir Transação Avulsa
app.delete('/api/transacoes/:id', (req, res) => {
  const { id } = req.params;
  const db = carregarBanco();
  const trIndex = db.transacoes.findIndex(t => t.id === id);

  if (trIndex === -1) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  db.transacoes.splice(trIndex, 1);
  salvarBanco(db);
  res.json({ message: "Transação removida!", metricas: calcularMetricas(db) });
});

// 9. Exportar / Baixar Backup do Banco de Dados
app.get('/api/backup/exportar', (req, res) => {
  const db = carregarBanco();
  res.setHeader('Content-disposition', 'attachment; filename=brique_pro_backup.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

// 10. Restaurar Backup
app.post('/api/backup/restaurar', (req, res) => {
  try {
    const dados = req.body;
    if (!dados || !Array.isArray(dados.itens) || !Array.isArray(dados.transacoes)) {
      return res.status(400).json({ error: "Formato de arquivo inválido para restauração." });
    }
    salvarBanco(dados);
    res.json({ message: "Backup restaurado com sucesso!", metricas: calcularMetricas(dados) });
  } catch (err) {
    res.status(500).json({ error: "Falha ao restaurar: " + err.message });
  }
});

// 11. Limpar e reiniciar com dados zerados
app.post('/api/sistema/zerar', (req, res) => {
  const dbLimpo = {
    config: {
      nomeNegocio: "Brique Pro - Gestão & Lucro",
      aportePadrao: 300,
      moeda: "BRL"
    },
    itens: [],
    transacoes: []
  };
  salvarBanco(dbLimpo);
  res.json({ message: "Sistema zerado para você começar do zero!", metricas: calcularMetricas(dbLimpo) });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 BRIQUE PRO RODANDO COM SUCESSO!`);
  console.log(`📱 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`💾 Banco de dados local: ${DB_FILE}`);
  console.log(`======================================================\n`);
});
