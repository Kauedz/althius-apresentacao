/* =====================================================================
   RELATÓRIO DO RAIO-X — Althius
   Renderiza a tela de follow-up (resultado.html) a partir dos números
   coletados na reunião. É aqui que chega o botão "Exportar Raio-X" da
   apresentação — Playbook, slide 52, Desfecho 2: devolver em 24h o
   Raio-X dele, "seus números, seu desenho".

   Tudo client-side. As fórmulas vivem em raiox-engine.js.
   ===================================================================== */
(function () {
  'use strict';

  var E = window.RaioXEngine;

  var STORAGE_KEY = 'althius_raiox_v1';

  var moeda    = E.moeda;
  var num      = E.num;
  var calcular = E.calcular;

  /** Lê os números da querystring (?d=) ou do sessionStorage. */
  function carregar() {
    var qs = new URLSearchParams(location.search).get('d');
    if (qs) {
      try { return JSON.parse(decodeURIComponent(escape(atob(qs)))); } catch (err) { /* segue */ }
    }
    try {
      var bruto = sessionStorage.getItem(STORAGE_KEY);
      if (bruto) return JSON.parse(bruto);
    } catch (err) { /* segue */ }
    return null;
  }

  function iniciarResultado() {
    var raiz = document.getElementById('resultado');
    if (!raiz) return;

    var entradas = carregar();
    var vazio    = document.getElementById('semDados');

    if (!entradas || entradas.metaTrimestre === null || entradas.metaTrimestre === undefined) {
      if (vazio) vazio.hidden = false;
      raiz.hidden = true;
      encerrarProcessamento(true);
      return;
    }

    var r = calcular(entradas);

    // ---------- Bloco 1 · o gap ----------
    var blocoGap = document.getElementById('blocoGap');
    var valorGap = document.getElementById('valorGap');
    var unidadeGap = document.getElementById('unidadeGap');
    var tituloGap = document.getElementById('tituloGap');
    var notaGap = document.getElementById('notaGap');
    var rodapeGap = document.getElementById('rodapeGap');

    if (r.saudavel) {
      blocoGap.classList.add('is-healthy');
      tituloGap.textContent = 'Operação dentro da meta';
      valorGap.removeAttribute('data-count');   // texto, não número: sem count-up
      valorGap.textContent = 'No alvo';
      valorGap.classList.remove('is-orange');
      unidadeGap.textContent = 'sem gap de reuniões';
      notaGap.textContent = 'Pelos seus números, a máquina atual já entrega o volume de reuniões que a '
        + 'meta exige — sua operação gera ' + num(r.reunioesMesAtual, 1) + ' reuniões/mês contra as '
        + num(r.reunioesNecessariasMes, 1) + ' necessárias. O trabalho aqui deixa de ser tapar buraco '
        + 'e passa a ser sustentar e escalar o resultado sem depender de sorte.';
      rodapeGap.textContent = 'Folga de ' + num(Math.abs(r.gapReunioes), 1) + ' reuniões/mês';
    } else {
      tituloGap.textContent = 'Seu gap comercial';
      valorGap.setAttribute('data-count', String(r.gapExibicao));
      valorGap.setAttribute('data-count-decimals', r.gapExibicao % 1 === 0 ? '0' : '1');
      valorGap.setAttribute('data-count-prefix', '≈ ');
      valorGap.textContent = '≈ ' + num(r.gapExibicao, 1);
      unidadeGap.textContent = 'reuniões/mês faltando';
      notaGap.textContent = 'É a distância entre o que sua máquina gera hoje e o que sua meta exige. '
        + 'Para faturar ' + moeda(entradas.metaTrimestre) + ' no trimestre com ticket de '
        + moeda(entradas.ticketMedio) + ', você precisa de ' + num(r.reunioesNecessariasMes, 1)
        + ' reuniões/mês. Sua operação gera ' + num(r.reunioesMesAtual, 1) + '.';
      rodapeGap.textContent = 'Valor exato: ' + num(r.gapReunioes, 2)
        + ' reuniões/mês · exibido arredondado em múltiplos de 0,5';
    }

    // ---------- Bloco 2 · receita em risco ----------
    var valorRisco = document.getElementById('valorRisco');
    var tituloRisco = document.getElementById('tituloRisco');
    var notaRisco = document.getElementById('notaRisco');
    var blocoRisco = document.getElementById('blocoRisco');

    if (r.saudavel) {
      blocoRisco.classList.add('is-healthy');
      tituloRisco.textContent = 'Receita protegida por mês';
      valorRisco.setAttribute('data-count', '0');
      valorRisco.textContent = moeda(0);
      notaRisco.textContent = 'Nenhuma receita está sendo perdida por falta de agenda hoje. '
        + 'O risco muda de lugar: passa a ser a meta subir e a máquina não acompanhar.';
    } else {
      valorRisco.setAttribute('data-count', String(Math.round(r.receitaExibicao)));
      valorRisco.setAttribute('data-count-format', 'brl');
      valorRisco.textContent = moeda(r.receitaExibicao);
      notaRisco.textContent = 'É o valor que deixa de entrar todo mês enquanto esse gap não é resolvido. '
        + 'Na média da sua operação, cada reunião vale '
        + moeda(entradas.taxaConversao / 100 * entradas.ticketMedio)
        + ' (' + num(entradas.taxaConversao, 1) + '% de conversão × '
        + moeda(entradas.ticketMedio) + ' de ticket) — multiplicado pelo gap, dá o número acima.';
    }

    // ---------- Bloco 3 · custo por reunião ----------
    var valorCusto = document.getElementById('valorCusto');
    var notaCusto = document.getElementById('notaCusto');
    valorCusto.setAttribute('data-count', String(Math.round(r.custoPorReuniao || 0)));
    valorCusto.setAttribute('data-count-format', 'brl');
    valorCusto.textContent = moeda(r.custoPorReuniao);
    notaCusto.textContent = 'Este é o número que a maioria das operações nunca calculou. '
      + 'Com ' + num(entradas.pessoasComercial, 0) + ' pessoa(s) no comercial, folha de '
      + moeda(entradas.folhaBruta) + ' e ' + moeda(entradas.ferramentasMes) + ' em ferramentas, '
      + 'o custo mensal do comercial é ' + moeda(r.custoMensalTotal)
      + ' (folha × 1,7 de encargos CLT + ferramentas). Dividido pelas '
      + num(r.reunioesMesAtual, 1) + ' reuniões que acontecem por mês, é o que sai do caixa '
      + 'cada vez que alguém do time senta numa call.';

    // ---------- Apoio ----------
    setTexto('apoioCustoVenda', moeda(r.custoPorVenda));
    setTexto('apoioCustoMensal', moeda(r.custoMensalTotal));
    setTexto('apoioReunioesNec', num(r.reunioesNecessariasMes, 1) + '/mês');
    setTexto('apoioVendasNec', num(r.vendasNecessariasMes, 1) + '/mês');

    var celulaRampagem = document.getElementById('celulaRampagem');
    if (r.custoRampagem !== null && celulaRampagem) {
      celulaRampagem.hidden = false;
      setTexto('apoioRampagem', moeda(r.custoRampagem));
      setTexto('rotuloRampagem', 'Rampagem sem máquina (' + r.mesesRampagem + ' meses)');
    }

    // ---------- Bloco 4 · diagnóstico textual dinâmico ----------
    renderDiagnostico(entradas, r);

    // ---------- Recap das entradas ----------
    renderRecap(entradas);

    // ---------- Selo de estimativa ----------
    if (entradas.taxaEstimada) {
      var selo = document.getElementById('seloEstimativa');
      if (selo) selo.hidden = false;
    }

    raiz.hidden = false;
    encerrarProcessamento(false);
  }

  function setTexto(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  /** Texto condicional a partir do Bloco 4 do formulário. */
  function renderDiagnostico(e, r) {
    var alvo = document.getElementById('diagnosticoTexto');
    if (!alvo) return;

    var paragrafos = [];

    // Abertura — o vilão é o buraco, não o time.
    if (r.saudavel) {
      paragrafos.push(
        'Seus números não apontam um buraco de agenda: a máquina atual cobre o volume de reuniões '
        + 'que a meta do trimestre exige. Isso significa que o gargalo, se existir, está depois da '
        + 'reunião — conversão, ticket ou ciclo — e não antes dela.'
      );
    } else {
      paragrafos.push(
        'O vilão aqui não é o seu time: é o buraco. Faltam <strong>' + num(r.gapExibicao, 1)
        + ' reuniões por mês</strong> para a meta fechar, e cada mês que passa com esse gap aberto '
        + 'custa <strong>' + moeda(r.receitaExibicao) + '</strong> em receita que não entra. '
        + 'Não é opinião — é a sua própria conta.'
      );
    }

    // Condicional 1 — "vai ter que se virar"
    if (e.processoDefinido === 'nao') {
      paragrafos.push(
        'Você marcou que o novo contratado <strong>vai ter que se virar</strong>. Esse é o ponto mais '
        + 'caro do cenário: contratar sem estrutura de geração de agenda transfere para uma pessoa '
        + 'um problema que é de sistema. Ela vai passar os primeiros meses construindo lista em vez '
        + 'de conversar com quem compra'
        + (r.custoRampagem !== null
            ? ', e a rampagem sozinha custa ' + moeda(r.custoRampagem) + ' em ' + r.mesesRampagem + ' meses'
            : '')
        + '. Mais gente sem máquina não fecha gap — só aumenta o custo por reunião.'
      );
    } else if (e.processoDefinido === 'sim') {
      paragrafos.push(
        'Você já tem processo definido para quem entra — isso muda o jogo. Com estrutura pronta, o '
        + 'que falta não é gente: é volume de conta certa chegando na frente do time. '
        + (r.saudavel
            ? 'Hoje isso está coberto; o teste real é a próxima meta, quando o volume exigido subir.'
            : 'O gap acima é um problema de origem de demanda, não de execução.')
      );
    }

    // Condicional 2 — já tentaram outbound antes
    if (e.outboundAntes === 'sim') {
      var citacao = e.outboundDetalhe
        ? ' Você registrou: “' + e.outboundDetalhe.replace(/"/g, '”') + '”.'
        : '';
      paragrafos.push(
        'Vocês já tentaram outbound estruturado antes e não virou máquina.' + citacao
        + ' Isso não desqualifica o canal — na maioria dos casos o que falhou foi o critério de '
        + 'entrada: lista comprada e volume genérico tratam todas as contas como iguais. A abordagem '
        + 'por <strong>sinais</strong> inverte isso — só entra na cadência a conta que se mexeu '
        + '(abriu vaga comercial, trocou de stack, captou, expandiu). Menos contas, tocadas na semana '
        + 'em que o problema está vivo.'
      );
    } else if (e.outboundAntes === 'nao') {
      paragrafos.push(
        'Vocês nunca rodaram outbound estruturado — hoje a agenda depende do que chega, não do que '
        + 'vocês provocam. '
        + (r.saudavel
            ? 'Enquanto a demanda entrante der conta, isso não aparece como problema; no dia em que '
              + 'ela oscilar, aparece de uma vez. Previsibilidade é o que falta, não volume.'
            : 'É a explicação mais provável para o gap.')
        + ' A primeira versão disso não precisa de time novo — precisa de critério de entrada e cadência.'
      );
    }

    // Fechamento — âncora do custo por reunião
    if (r.custoPorReuniao !== null) {
      paragrafos.push(
        'Guarde o número do bloco 3: <strong>' + moeda(r.custoPorReuniao) + ' por reunião realizada</strong>. '
        + 'Ele é a régua. Qualquer investimento em geração de agenda se avalia contra ele — se o custo '
        + 'de trazer uma reunião nova ficar abaixo disso, a conta fecha sozinha.'
      );
    }

    alvo.innerHTML = paragrafos.map(function (p) { return '<p>' + p + '</p>'; }).join('');
  }

  function renderRecap(e) {
    var alvo = document.getElementById('recapGrid');
    if (!alvo) return;

    var linhas = [
      ['Meta do trimestre',       moeda(e.metaTrimestre)],
      ['Ticket médio',            moeda(e.ticketMedio)],
      ['Reuniões/semana',         num(e.reunioesSemana, 1)],
      ['Vendas/mês',              num(e.vendasMes, 1)],
      ['Conversão reunião→venda', num(e.taxaConversao, 1) + '%' + (e.taxaEstimada ? ' (estimativa)' : '')],
      ['Pessoas no comercial',    num(e.pessoasComercial, 0)],
      ['Folha bruta mensal',      moeda(e.folhaBruta)],
      ['Ferramentas/mês',         moeda(e.ferramentasMes)]
    ];
    if (e.salarioNovo) linhas.push(['Salário da vaga aberta', moeda(e.salarioNovo)]);

    alvo.innerHTML = linhas.map(function (l) {
      return '<div><dt>' + l[0] + '</dt><dd>' + l[1] + '</dd></div>';
    }).join('');
  }

  function encerrarProcessamento(imediato) {
    var overlay = document.getElementById('processing');
    if (!overlay) return;
    var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var espera = (imediato || reduzido) ? 0 : 1600;
    setTimeout(function () {
      overlay.classList.add('is-done');
      document.dispatchEvent(new CustomEvent('raiox:revelado'));
    }, espera);
  }

  /* -----------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------- */
  function boot() {
    iniciarResultado();

    var voltar = document.getElementById('btnRefazer');
    if (voltar) {
      voltar.addEventListener('click', function (ev) {
        ev.preventDefault();
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (err) { /* ok */ }
        window.location.href = 'apresentacao.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Exposto para testes manuais no console (ver README).
  window.RaioX = E;
})();
