/* =====================================================================
   CALCULADORA FLUTUANTE — Althius
   Para fazer a conta na frente do lead durante a call.

   - Arrastável pelo cabeçalho, posição guardada entre sessões.
   - Chips puxam os números do Raio-X para dentro do visor.
   - Fita (tape) mantém as últimas contas visíveis: ele acompanha o
     raciocínio, não só o resultado.
   ===================================================================== */
(function () {
  'use strict';

  var POS_KEY = 'althius_calc_pos_v1';

  var painel, visor, fita, chips, botaoFechar, cabecalho;

  /* ---------------- estado ---------------- */
  var entrada    = '0';    // string em pt-BR (vírgula decimal)
  var acumulador = null;   // number
  var operador   = null;   // '+' '-' '*' '/'
  var recomecar  = false;  // próximo dígito reinicia a entrada
  var historico  = [];     // últimas 3 linhas da fita

  /* ---------------- formatação ---------------- */
  function paraNumero(txt) {
    var n = parseFloat(String(txt).replace(/\./g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  /** Número → string pt-BR com separador de milhar, até 6 decimais. */
  function paraTexto(n) {
    if (!isFinite(n)) return 'erro';
    var neg = n < 0;
    var abs = Math.abs(n);
    var arred = Math.round(abs * 1e6) / 1e6;
    var partes = String(arred).split('.');
    var inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
      .format(parseInt(partes[0], 10) || 0);
    return (neg ? '-' : '') + inteiro + (partes[1] ? ',' + partes[1] : '');
  }

  /** Reaplica o separador de milhar enquanto o closer digita. */
  function formatarEntrada(txt) {
    var neg = txt.charAt(0) === '-';
    var corpo = neg ? txt.slice(1) : txt;
    var p = corpo.split(',');
    var inteiro = p[0].replace(/\D/g, '') || '0';
    inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
      .format(parseInt(inteiro, 10));
    return (neg ? '-' : '') + inteiro + (p.length > 1 ? ',' + p[1] : '');
  }

  var SIMBOLO = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  /* ---------------- render ---------------- */
  function render() {
    visor.textContent = entrada;
    var linhas = historico.slice(-3);
    if (operador !== null) {
      linhas = linhas.concat(paraTexto(acumulador) + ' ' + SIMBOLO[operador]);
    }
    fita.textContent = linhas.join('\n');

    painel.querySelectorAll('[data-op]').forEach(function (b) {
      b.classList.toggle('is-armed', recomecar && b.getAttribute('data-op') === operador);
    });
  }

  /* ---------------- operações ---------------- */
  function digito(d) {
    if (recomecar || entrada === '0') {
      entrada = (d === ',') ? '0,' : d;
      recomecar = false;
    } else if (d === ',') {
      if (entrada.indexOf(',') === -1) entrada += ',';
    } else {
      entrada = formatarEntrada(entrada.replace(/\./g, '') + d);
    }
    render();
  }

  function aplicar(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
    }
    return b;
  }

  function operar(op) {
    var atual = paraNumero(entrada);

    if (operador !== null && !recomecar) {
      var res = aplicar(acumulador, operador, atual);
      registrar(acumulador, operador, atual, res);
      acumulador = res;
      entrada = paraTexto(res);
    } else {
      acumulador = atual;
    }

    operador = op;
    recomecar = true;
    render();
  }

  function igual() {
    if (operador === null) return;
    var atual = paraNumero(entrada);
    var res = aplicar(acumulador, operador, atual);
    registrar(acumulador, operador, atual, res);
    entrada = paraTexto(res);
    acumulador = null;
    operador = null;
    recomecar = true;
    render();
  }

  function registrar(a, op, b, res) {
    historico.push(paraTexto(a) + ' ' + SIMBOLO[op] + ' ' + paraTexto(b) + ' = ' + paraTexto(res));
    if (historico.length > 6) historico.shift();
  }

  function porcento() {
    var atual = paraNumero(entrada);
    // "500 + 10%" vira 10% de 500; solto, vira apenas /100.
    var base = (operador === '+' || operador === '-') && acumulador !== null
      ? acumulador * atual / 100
      : atual / 100;
    entrada = paraTexto(base);
    render();
  }

  function apagar() {
    if (recomecar) return;
    var cru = entrada.replace(/\./g, '').slice(0, -1);
    if (cru === '' || cru === '-') cru = '0';
    entrada = formatarEntrada(cru);
    render();
  }

  function limpar() {
    entrada = '0'; acumulador = null; operador = null; recomecar = false;
    historico = [];
    render();
  }

  function inserir(valor, rotulo) {
    entrada = paraTexto(valor);
    recomecar = false;
    if (rotulo) {
      historico.push('↓ ' + rotulo);
      if (historico.length > 6) historico.shift();
    }
    render();
  }

  /* ---------------- chips com os números do Raio-X ---------------- */
  function montarChips() {
    chips.innerHTML = '';
    if (!window.Deck || !window.Deck.calc) return;

    var r = window.Deck.calc();
    var e = window.RaioXEngine;
    var arred = function (n) { return Math.round(n * 100) / 100; };

    var itens = [
      { rot: 'Custo mês',      v: r.custoMensalTotal },
      { rot: 'Reuniões/mês',   v: r.reunioesMesAtual },
      { rot: 'Custo/reunião',  v: r.custoPorReuniao },
      { rot: 'Gap',            v: r.gapReunioes },
      { rot: 'Risco/mês',      v: r.receitaEmRiscoMes },
      { rot: 'Ticket',         v: (window.Deck.estado || {}).ticketMedio }
    ];

    itens.forEach(function (it) {
      if (it.v === null || it.v === undefined || !isFinite(it.v) || it.v === 0) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'calc_chip';
      b.textContent = it.rot;
      b.title = e.num(it.v, 2);
      b.addEventListener('click', function () { inserir(arred(it.v), it.rot); });
      chips.appendChild(b);
    });
  }

  /* ---------------- abrir / fechar ---------------- */
  function aberta() { return !painel.hidden; }

  function alternar(forcar) {
    var abrir = (forcar === undefined) ? painel.hidden : forcar;
    painel.hidden = !abrir;
    if (abrir) { montarChips(); dentroDaTela(); }
  }

  /* ---------------- arrastar ---------------- */
  function montarArraste() {
    var arrastando = false, dx = 0, dy = 0;

    cabecalho.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.calc_x')) return;
      var r = painel.getBoundingClientRect();
      dx = ev.clientX - r.left;
      dy = ev.clientY - r.top;
      arrastando = true;
      painel.classList.add('is-dragging');
      cabecalho.setPointerCapture(ev.pointerId);
    });

    cabecalho.addEventListener('pointermove', function (ev) {
      if (!arrastando) return;
      var r = painel.getBoundingClientRect();
      var x = Math.min(Math.max(ev.clientX - dx, 8), window.innerWidth  - r.width  - 8);
      var y = Math.min(Math.max(ev.clientY - dy, 8), window.innerHeight - r.height - 8);
      posicionar(x, y);
    });

    function soltar(ev) {
      if (!arrastando) return;
      arrastando = false;
      painel.classList.remove('is-dragging');
      try { cabecalho.releasePointerCapture(ev.pointerId); } catch (err) { /* ok */ }
      var r = painel.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ x: r.left, y: r.top })); } catch (err) { /* ok */ }
    }
    cabecalho.addEventListener('pointerup', soltar);
    cabecalho.addEventListener('pointercancel', soltar);

    // Duplo clique no cabeçalho devolve o painel ao canto padrão.
    cabecalho.addEventListener('dblclick', function (ev) {
      if (ev.target.closest('.calc_x')) return;
      resetarPosicao();
    });

    window.addEventListener('resize', dentroDaTela);
  }

  function posicionar(x, y) {
    painel.style.left = x + 'px';
    painel.style.top = y + 'px';
    painel.style.right = 'auto';
  }

  /** Volta para o canto padrão (abaixo da barra de ferramentas). */
  function resetarPosicao() {
    painel.style.left = '';
    painel.style.top = '';
    painel.style.right = '';
    try { localStorage.removeItem(POS_KEY); } catch (err) { /* ok */ }
  }

  /** Mede o painel de verdade antes de limitar — largura e altura mudam
      com os chips e com o breakpoint, então nada de número fixo. */
  function dentroDaTela() {
    if (painel.hidden || !painel.style.left) return;
    var r = painel.getBoundingClientRect();
    var maxX = Math.max(8, window.innerWidth  - r.width  - 8);
    var maxY = Math.max(8, window.innerHeight - r.height - 8);
    posicionar(
      Math.min(Math.max(r.left, 8), maxX),
      Math.min(Math.max(r.top, 8), maxY)
    );
  }

  function restaurarPosicao() {
    var p;
    try { p = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (err) { return; }
    if (!p || !isFinite(p.x) || !isFinite(p.y)) return;
    posicionar(p.x, p.y);
    // O painel só tem tamanho depois de visível; corrige no próximo quadro.
    requestAnimationFrame(function () { if (!painel.hidden) dentroDaTela(); });
  }

  /* ---------------- teclado ----------------
     Fase de captura: roda antes do handler de navegação do deck,
     para consumir as teclas da calculadora sem virar slide. */
  function montarTeclado() {
    document.addEventListener('keydown', function (ev) {
      var alvo = ev.target;
      var digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA');

      if (!digitando && (ev.key === 'c' || ev.key === 'C') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); ev.stopPropagation();
        alternar();
        return;
      }

      if (!aberta() || digitando || ev.metaKey || ev.ctrlKey || ev.altKey) return;

      var k = ev.key;
      if (k >= '0' && k <= '9')                { consumir(ev); digito(k); }
      else if (k === ',' || k === '.')         { consumir(ev); digito(','); }
      else if (k === '+' || k === '-' || k === '*' || k === '/') { consumir(ev); operar(k); }
      else if (k === 'Enter' || k === '=')     { consumir(ev); igual(); }
      else if (k === 'Backspace')              { consumir(ev); apagar(); }
      else if (k === '%')                      { consumir(ev); porcento(); }
      else if (k === 'Delete')                 { consumir(ev); limpar(); }
      else if (k === 'Escape')                 { consumir(ev); alternar(false); }
    }, true);
  }

  function consumir(ev) { ev.preventDefault(); ev.stopPropagation(); }

  /* ---------------- boot ---------------- */
  function boot() {
    painel      = document.getElementById('calc');
    if (!painel) return;
    visor       = document.getElementById('calcOut');
    fita        = document.getElementById('calcTape');
    chips       = document.getElementById('calcChips');
    cabecalho   = document.getElementById('calcHead');
    botaoFechar = document.getElementById('calcFechar');

    document.getElementById('calcPad').addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-num')) { digito(b.getAttribute('data-num')); return; }
      if (b.hasAttribute('data-op'))  { operar(b.getAttribute('data-op')); return; }
      switch (b.getAttribute('data-calc')) {
        case 'virgula':  digito(','); break;
        case 'igual':    igual(); break;
        case 'limpar':   limpar(); break;
        case 'apagar':   apagar(); break;
        case 'porcento': porcento(); break;
      }
    });

    botaoFechar.addEventListener('click', function () { alternar(false); });

    // Os números do Raio-X mudam a cada tecla no diagnóstico — remonta os
    // chips sempre que o cursor entra no painel, para nunca ficarem velhos.
    painel.addEventListener('pointerenter', montarChips);

    // O botão da barra de ferramentas: data-tool="calc".
    var barra = document.querySelector('.tools');
    if (barra) {
      barra.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-tool="calc"]');
        if (b) alternar();
      });
    }

    montarArraste();
    montarTeclado();
    restaurarPosicao();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Calc = { abrir: function () { alternar(true); }, fechar: function () { alternar(false); },
                  inserir: inserir, limpar: limpar, resetarPosicao: resetarPosicao };
})();
