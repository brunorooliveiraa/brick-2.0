# 🚀 Brique Pro - Gestão de Compra, Venda & Caixa Local

Sistema moderno e 100% local desenvolvido sob medida para o seu negócio de **briques (compra e venda de celulares, notebooks e eletrônicos)**.

---

## ⚡ Como Usar no Dia a Dia

Para abrir o sistema a qualquer momento:
1. Dê **dois cliques** no arquivo **`iniciar.bat`**.
2. O sistema iniciará o servidor local e abrirá automaticamente no seu navegador padrão:
   👉 **`http://localhost:3000`**
3. Todos os seus dados ficam salvos de forma segura no seu notebook no arquivo `data/database.json`.

---

## 💼 Funcionalidades Principais

### 1. 💰 Gestão do Saldo em Caixa & Aporte Salarial Mensal
- **Aporte Rápido de R$ 300,00**: Botão de 1 clique no topo para injetar os R$ 300 do seu salário direto no caixa do negócio.
- **Aportes Customizados**: Adicione qualquer valor extra quando quiser.
- **Retiradas de Lucro**: Registre quando retirar dinheiro do caixa para uso pessoal ou cobrir despesas de frete/gasolina.
- **Saldo Sempre Atualizado**: O sistema calcula automaticamente: `Aportes + Vendas - Compras - Peças - Retiradas`.

### 2. 📱 Controle de Estoque & Briques Ativos
- **Cadastro Completo**: Nome do aparelho, categoria (celular, notebook, tablet, console...), valor pago na compra, data e detalhes do aparelho.
- **Controle de Gastos com Peças / Revisão**: Registre o que gastou a mais (ex: tela nova, bateria, carregador) para saber o custo real exato do item.
- **Status do Aparelho**: `Em Estoque`, `Em Manutenção/Revisão` ou `Anunciado`.
- **Filtros e Busca Instantânea**: Encontre qualquer aparelho pelo nome ou categoria em segundos.

### 3. 🎉 Fechamento de Venda & Cálculo Automático de Lucro
- Na aba de Estoque, clique no botão verde **"Vender"**:
  - Digite o valor que vendeu na OLX, Marketplace ou para conhecido.
  - O sistema calcula **em tempo real** o seu **Lucro Líquido (R$)** e a sua **Margem de Lucro (%)**.
  - O dinheiro da venda entra imediatamente no seu **Saldo em Caixa** para você reinvestir e comprar novos aparelhos.

### 4. 🧮 Simulador de Brique (Comprar ou Não?)
- Está negociando com um vendedor na rua ou na OLX?
- Abra a aba do **Simulador de Brique**, digite o valor que o vendedor está pedindo, quanto vai gastar de peça e o preço que pretende vender.
- O simulador informa na hora:
  - Lucro estimado em R$ e margem %.
  - Veredito da negociação (se a margem é excelente ou arriscada).
  - Se você tem saldo em caixa suficiente para comprar agora.
  - Botão de atalho para já transformar a simulação em um brique cadastrado!

### 5. 📊 Dashboard com Gráficos e Indicadores (KPIs)
- **Saldo em Caixa Livre**: Dinheiro em mãos pronto para novas oportunidades.
- **Capital em Estoque**: Dinheiro investido em aparelhos guardados.
- **Patrimônio Total**: Soma do caixa livre + estoque ativo.
- **Lucro Líquido Realizado**: Total de dinheiro líquido que o negócio já colocou no seu bolso.
- **ROI Geral**: Rentabilidade acumulada sobre o total aportado.
- Gráficos comparativos de Compras vs Vendas vs Lucro e divisão por categoria.

### 6. 💾 Backup & Segurança
- Baixe cópias de segurança em JSON quando quiser pela aba **Backup & Dados**.
- Seus dados não dependem de internet nem de nuvem: ficam 100% no seu notebook.
