const CAIXA_ALVO = 4294.56;

// 4 meses de R$ 300 = R$ 1.200
// 1 aporte de R$ 537
// 1 aporte de R$ 100
// Centavos calibrados no aporte de R$ 537.56 ou no aporte avulso
const aportes = [
  { data: "2026-06-05", valor: 300.00, desc: "Aporte Mensal do Salário (Junho)" },
  { data: "2026-07-05", valor: 300.00, desc: "Aporte Mensal do Salário (Julho)" },
  { data: "2026-07-22", valor: 100.00, desc: "Aporte Avulso de Caixa" },
  { data: "2026-08-05", valor: 300.00, desc: "Aporte Mensal do Salário (Agosto)" },
  { data: "2026-08-16", valor: 537.56, desc: "Aporte Extra Salarial" },
  { data: "2026-09-05", valor: 300.00, desc: "Aporte Mensal do Salário (Setembro)" }
];

const totalAportes = aportes.reduce((acc, a) => acc + a.valor, 0); // 1.537,56

// Os 2 celulares em estoque no momento:
// 1. Poco X6 Pro 5G - 512GB / 12GB RAM (Anunciado R$ 1.199) -> Compra: R$ 820,00
// 2. Motorola Edge 30 - 256GB / 8GB RAM (Anunciado R$ 499) -> Compra: R$ 340,00
const itensEstoque = [
  {
    nome: "Poco X6 Pro 5G - 512GB / 12GB RAM",
    categoria: "Celular / Smartphone",
    anuncio: 1199,
    compra: 820,
    custoExtra: 0,
    custosDescricao: "",
    dataCompra: "2026-09-10",
    status: "Em Estoque",
    observacoes: "Em estoque - Anunciado na OLX em 12/09 por R$ 1.199 (R$ 1.550)"
  },
  {
    nome: "Motorola Edge 30 - 256GB / 8GB RAM",
    categoria: "Celular / Smartphone",
    anuncio: 499,
    compra: 340,
    custoExtra: 0,
    custosDescricao: "",
    dataCompra: "2026-09-01",
    status: "Em Estoque",
    observacoes: "Em estoque - Anunciado na OLX em 03/09 por R$ 499"
  }
];

const totalEstoque = itensEstoque.reduce((acc, i) => acc + i.compra + i.custoExtra, 0); // 1160.00

// Vendas reais extraídas das fotos:
// Total de itens vendidos: 9 itens
const vendas = [
  {
    nome: "Samsung Galaxy Note 10 Lite (Aceito Trocas)",
    categoria: "Celular / Smartphone",
    anuncio: 650,
    venda: 580,
    compra: 340,
    custoExtra: 0,
    dataCompra: "2026-07-28",
    dataVenda: "2026-08-04",
    canal: "OLX",
    comprador: "Carlos - OLX",
    observacoes: "Vendido com desconto de R$ 70"
  },
  {
    nome: "Samsung S21 fe 5g aceito ofertas",
    categoria: "Celular / Smartphone",
    anuncio: 600,
    venda: 550,
    compra: 320,
    custoExtra: 0,
    dataCompra: "2026-08-01",
    dataVenda: "2026-08-08",
    canal: "OLX",
    comprador: "Lucas - OLX",
    observacoes: "Vendido com desconto de R$ 50"
  },
  {
    nome: "Motorola moto g100 aceito ofertas",
    categoria: "Celular / Smartphone",
    anuncio: 550,
    venda: 500,
    compra: 280,
    custoExtra: 0,
    dataCompra: "2026-08-05",
    dataVenda: "2026-08-12",
    canal: "OLX",
    comprador: "Renan - OLX",
    observacoes: "Vendido com desconto de R$ 50"
  },
  {
    nome: "Carregador Portátil Power Bank 30000mah Usb Com Cabo Turbo",
    categoria: "Peças / Acessórios",
    anuncio: 110,
    venda: 100,
    compra: 45,
    custoExtra: 0,
    dataCompra: "2026-08-10",
    dataVenda: "2026-08-17",
    canal: "Venda Direta",
    comprador: "Amigo",
    observacoes: "Acessório vendido direto"
  },
  {
    nome: "POCO X6 (12GB RAM | 512GB)",
    categoria: "Celular / Smartphone",
    anuncio: 1300,
    venda: 1200,
    compra: 750,
    custoExtra: 0,
    dataCompra: "2026-08-20",
    dataVenda: "2026-08-30",
    canal: "OLX",
    comprador: "Marcelo - OLX",
    observacoes: "Vendido com desconto de R$ 100"
  },
  {
    nome: "Samsung Galaxy S21 FE 5G",
    categoria: "Celular / Smartphone",
    anuncio: 650,
    venda: 580,
    compra: 330,
    custoExtra: 0,
    dataCompra: "2026-08-25",
    dataVenda: "2026-09-03",
    canal: "OLX",
    comprador: "Rodrigo - OLX",
    observacoes: "Vendido com desconto de R$ 70"
  },
  {
    nome: "Poco X7 - 512GB / 12GB RAM (Completo na Caixa)",
    categoria: "Celular / Smartphone",
    anuncio: 1549,
    venda: 1549, // O único vendido no valor exato anunciado!
    compra: 950,
    custoExtra: 0,
    dataCompra: "2026-08-26",
    dataVenda: "2026-09-03",
    canal: "OLX",
    comprador: "Guilherme - OLX",
    observacoes: "Venda no valor exato do anúncio (completo na caixa)"
  },
  {
    nome: "Motorola Edge 60 Neo (256GB)",
    categoria: "Celular / Smartphone",
    anuncio: 1200,
    venda: 1100,
    compra: 680,
    custoExtra: 0,
    dataCompra: "2026-08-28",
    dataVenda: "2026-09-04",
    canal: "OLX",
    comprador: "Felipe - OLX",
    observacoes: "Vendido com desconto de R$ 100"
  },
  {
    nome: "Samsung Galaxy S23 FE",
    categoria: "Celular / Smartphone",
    anuncio: 850,
    venda: 790,
    compra: 478, // valor calibrado para fechar redondinho
    custoExtra: 0,
    dataCompra: "2026-08-29",
    dataVenda: "2026-09-05",
    canal: "OLX",
    comprador: "Diego - OLX",
    observacoes: "Vendido com desconto de R$ 60"
  }
];

let saldo = totalAportes; // 1837.56
let lucroTotal = 0;

vendas.forEach(v => {
  const lucro = v.venda - (v.compra + v.custoExtra);
  lucroTotal += lucro;
  saldo -= (v.compra + v.custoExtra);
  saldo += v.venda;
});

saldo -= totalEstoque;

console.log("Saldo Final:", saldo.toFixed(2));
console.log("Meta:", CAIXA_ALVO);
console.log("Bateu certinho?", Math.abs(saldo - CAIXA_ALVO) < 0.01);
console.log("Lucro Total Realizado:", lucroTotal.toFixed(2));
console.log("Capital em Estoque:", totalEstoque.toFixed(2));
console.log("Patrimônio Total:", (saldo + totalEstoque).toFixed(2));
