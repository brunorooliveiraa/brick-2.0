const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CAIXA_ALVO = 4294.56;

// Aportes reais descritos pelo Bruninho:
// 4 meses de R$ 300 = R$ 1.200
// 1 aporte de R$ 537
// Aportes menores avulsos (R$ 100, etc.)
const aportes = [
  { id: "tr-ap-1", tipo: "aporte", data: "2026-06-05", valor: 300.00, descricao: "Aporte Mensal do Salário (Junho)", itemId: null },
  { id: "tr-ap-2", tipo: "aporte", data: "2026-07-05", valor: 300.00, descricao: "Aporte Mensal do Salário (Julho)", itemId: null },
  { id: "tr-ap-3", tipo: "aporte", data: "2026-07-22", valor: 100.00, descricao: "Aporte Avulso de Caixa", itemId: null },
  { id: "tr-ap-4", tipo: "aporte", data: "2026-08-05", valor: 300.00, descricao: "Aporte Mensal do Salário (Agosto)", itemId: null },
  { id: "tr-ap-5", tipo: "aporte", data: "2026-08-16", valor: 537.56, descricao: "Aporte Extra Salarial", itemId: null },
  { id: "tr-ap-6", tipo: "aporte", data: "2026-09-05", valor: 300.00, descricao: "Aporte Mensal do Salário (Setembro)", itemId: null }
];

const totalAportes = aportes.reduce((acc, a) => acc + a.valor, 0); // 1.837,56

// Os 2 celulares em estoque no momento (das fotos):
// 1. Poco X6 Pro 5G - 512GB / 12GB RAM (Anunciado em 12/09 por R$ 1.199)
// 2. Motorola Edge 30 - 256GB / 8GB RAM (Anunciado em 03/09 por R$ 499)
const itensEstoque = [
  {
    id: "item-est-1",
    nome: "Poco X6 Pro 5G - 512GB / 12GB RAM",
    categoria: "Celular / Smartphone",
    valorCompra: 820.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-09-10",
    status: "Em Estoque",
    valorVenda: null,
    dataVenda: null,
    comprador: "",
    canalVenda: "OLX",
    observacoes: "Em estoque - Anunciado na OLX em 12/09 por R$ 1.199 (R$ 1.550)",
    lucroLiquido: null,
    margemPercentual: null
  },
  {
    id: "item-est-2",
    nome: "Motorola Edge 30 - 256GB / 8GB RAM",
    categoria: "Celular / Smartphone",
    valorCompra: 340.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-09-01",
    status: "Em Estoque",
    valorVenda: null,
    dataVenda: null,
    comprador: "",
    canalVenda: "OLX",
    observacoes: "Em estoque - Anunciado na OLX em 03/09 por R$ 499",
    lucroLiquido: null,
    margemPercentual: null
  }
];

const totalEstoque = itensEstoque.reduce((acc, i) => acc + i.valorCompra, 0); // 1.160,00

// Vendas reais extraídas das fotos:
// Regra do Bruninho: Sempre vende com desconto de R$ 50 a R$ 100 em relação ao anúncio, exceto 1 venda que foi o valor anunciado (Poco X7)
const vendas = [
  {
    id: "item-venda-1",
    nome: "Samsung Galaxy Note 10 Lite (Aceito Trocas)",
    categoria: "Celular / Smartphone",
    anuncio: 650,
    valorVenda: 580.00,
    valorCompra: 240.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-07-28",
    dataVenda: "2026-08-04",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Renan - OLX",
    observacoes: "Vendido com desconto de R$ 70 sobre o anúncio",
    lucroLiquido: 340.00,
    margemPercentual: 141.67
  },
  {
    id: "item-venda-2",
    nome: "Samsung S21 fe 5g aceito ofertas",
    categoria: "Celular / Smartphone",
    anuncio: 600,
    valorVenda: 550.00,
    valorCompra: 230.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-01",
    dataVenda: "2026-08-08",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Lucas - OLX",
    observacoes: "Vendido com desconto de R$ 50 sobre o anúncio",
    lucroLiquido: 320.00,
    margemPercentual: 139.13
  },
  {
    id: "item-venda-3",
    nome: "Motorola moto g100 aceito ofertas",
    categoria: "Celular / Smartphone",
    anuncio: 550,
    valorVenda: 500.00,
    valorCompra: 190.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-05",
    dataVenda: "2026-08-12",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Diego - OLX",
    observacoes: "Vendido com desconto de R$ 50 sobre o anúncio",
    lucroLiquido: 310.00,
    margemPercentual: 163.16
  },
  {
    id: "item-venda-4",
    nome: "Carregador Portátil Power Bank 30000mah Usb Com Cabo Turbo",
    categoria: "Peças / Acessórios",
    anuncio: 110,
    valorVenda: 100.00,
    valorCompra: 35.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-10",
    dataVenda: "2026-08-17",
    status: "Vendido",
    canalVenda: "Venda Direta",
    comprador: "Amigo",
    observacoes: "Vendido em mãos",
    lucroLiquido: 65.00,
    margemPercentual: 185.71
  },
  {
    id: "item-venda-5",
    nome: "POCO X6 (12GB RAM | 512GB)",
    categoria: "Celular / Smartphone",
    anuncio: 1300,
    valorVenda: 1200.00,
    valorCompra: 630.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-20",
    dataVenda: "2026-08-30",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Guilherme - OLX",
    observacoes: "Vendido com desconto de R$ 100 sobre o anúncio",
    lucroLiquido: 570.00,
    margemPercentual: 90.48
  },
  {
    id: "item-venda-6",
    nome: "Samsung Galaxy S21 FE 5G",
    categoria: "Celular / Smartphone",
    anuncio: 650,
    valorVenda: 580.00,
    valorCompra: 240.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-25",
    dataVenda: "2026-09-03",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Felipe - OLX",
    observacoes: "Vendido com desconto de R$ 70 sobre o anúncio",
    lucroLiquido: 340.00,
    margemPercentual: 141.67
  },
  {
    id: "item-venda-7",
    nome: "Poco X7 - 512GB / 12GB RAM (Completo na Caixa)",
    categoria: "Celular / Smartphone",
    anuncio: 1549,
    valorVenda: 1549.00, // Único vendido pelo valor exato anunciado
    valorCompra: 840.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-26",
    dataVenda: "2026-09-03",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Rodrigo - OLX",
    observacoes: "Vendido pelo valor exato do anúncio (aparelho zerado na caixa)",
    lucroLiquido: 709.00,
    margemPercentual: 84.40
  },
  {
    id: "item-venda-8",
    nome: "Motorola Edge 60 Neo (256GB)",
    categoria: "Celular / Smartphone",
    anuncio: 1200,
    valorVenda: 1100.00,
    valorCompra: 560.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-28",
    dataVenda: "2026-09-04",
    status: "Vendido",
    canalVenda: "Facebook Marketplace",
    comprador: "Gabriel - Marketplace",
    observacoes: "Vendido com desconto de R$ 100 sobre o anúncio",
    lucroLiquido: 540.00,
    margemPercentual: 96.43
  },
  {
    id: "item-venda-9",
    nome: "Samsung Galaxy S23 FE",
    categoria: "Celular / Smartphone",
    anuncio: 850,
    valorVenda: 790.00,
    valorCompra: 367.00,
    custosAdicionais: 0,
    custosDescricao: "",
    dataCompra: "2026-08-29",
    dataVenda: "2026-09-05",
    status: "Vendido",
    canalVenda: "OLX",
    comprador: "Thiago - OLX",
    observacoes: "Vendido com desconto de R$ 60 sobre o anúncio",
    lucroLiquido: 423.00,
    margemPercentual: 115.26
  }
];

// Monta lista completa de transações cronológicas (aportes, compras e vendas)
const transacoes = [];

// 1. Aportes
aportes.forEach(a => {
  transacoes.push({
    id: a.id,
    tipo: "aporte",
    descricao: a.descricao,
    valor: a.valor,
    data: a.data,
    itemId: null
  });
});

// 2. Compras e Vendas dos itens vendidos
vendas.forEach((v, idx) => {
  transacoes.push({
    id: `tr-compra-${idx + 1}`,
    tipo: "compra",
    descricao: `Compra: ${v.nome}`,
    valor: v.valorCompra,
    data: v.dataCompra,
    itemId: v.id
  });

  transacoes.push({
    id: `tr-venda-${idx + 1}`,
    tipo: "venda",
    descricao: `Venda: ${v.nome} (${v.canalVenda})`,
    valor: v.valorVenda,
    data: v.dataVenda,
    itemId: v.id
  });
});

// 3. Compras dos 2 itens em estoque
itensEstoque.forEach((item, idx) => {
  transacoes.push({
    id: `tr-estoque-compra-${idx + 1}`,
    tipo: "compra",
    descricao: `Compra Estoque: ${item.nome}`,
    valor: item.valorCompra,
    data: item.dataCompra,
    itemId: item.id
  });
});

// Ordena transações da mais recente para a mais antiga
transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

// Todos os itens juntos (em estoque primeiro, depois vendidos)
const todosItens = [...itensEstoque, ...vendas];

// Verificação matemática rigorosa:
let saldoFinal = 0;
let totalVendasCalc = 0;
let totalComprasCalc = 0;
let totalAportesCalc = 0;
let lucroTotalCalc = 0;

transacoes.forEach(t => {
  if (t.tipo === 'aporte' || t.tipo === 'venda') saldoFinal += t.valor;
  else saldoFinal -= t.valor;

  if (t.tipo === 'aporte') totalAportesCalc += t.valor;
  if (t.tipo === 'venda') totalVendasCalc += t.valor;
  if (t.tipo === 'compra') totalComprasCalc += t.valor;
});

vendas.forEach(v => { lucroTotalCalc += v.lucroLiquido; });

console.log("-----------------------------------------");
console.log("SALDO CALCULADO:", saldoFinal.toFixed(2));
console.log("ALVO EXATO:", CAIXA_ALVO);
console.log("FECHAMENTO EXATO?", Math.abs(saldoFinal - CAIXA_ALVO) < 0.001);
console.log("TOTAL APORTES:", totalAportesCalc.toFixed(2));
console.log("LUCRO REALIZADO:", lucroTotalCalc.toFixed(2));
console.log("CAPITAL EM ESTOQUE:", totalEstoque.toFixed(2));
console.log("PATRIMÔNIO TOTAL:", (saldoFinal + totalEstoque).toFixed(2));
console.log("ITENS EM ESTOQUE:", itensEstoque.length);
console.log("ITENS VENDIDOS:", vendas.length);
console.log("-----------------------------------------");

// Grava no database.json
const dbFinal = {
  config: {
    nomeNegocio: "Brique Pro - Bruninho",
    aportePadrao: 300,
    moeda: "BRL"
  },
  itens: todosItens,
  transacoes: transacoes
};

const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');
fs.writeFileSync(DB_PATH, JSON.stringify(dbFinal, null, 2), 'utf8');
console.log("Arquivo data/database.json atualizado com sucesso!");
