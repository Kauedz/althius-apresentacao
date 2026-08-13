/* =====================================================================
   RAIO-X COMERCIAL — Althius
   Camada de movimento: nav, reveal on scroll, count-up e ticker de
   processamento. Tudo desligado sob prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var REDUZIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     NAV — fundo aparece ao rolar (igual ao site institucional)
     ----------------------------------------------------------------- */
  function nav() {
    var el = document.getElementById('nav');
    if (!el) return;
    var atualizar = function () {
      el.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
  }

  /* -----------------------------------------------------------------
     REVEAL ON SCROLL
     ----------------------------------------------------------------- */
  function reveal() {
    var alvos = document.querySelectorAll('[data-anim="reveal"]');
    if (!alvos.length) return;

    if (REDUZIDO || !('IntersectionObserver' in window)) {
      alvos.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada, i) {
        if (!entrada.isIntersecting) return;
        var atraso = Math.min(i * 90, 270);
        setTimeout(function () { entrada.target.classList.add('is-visible'); }, atraso);
        obs.unobserve(entrada.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    alvos.forEach(function (el) { obs.observe(el); });
  }

  /* -----------------------------------------------------------------
     ÂNCORAS COM SCROLL SUAVE
     ----------------------------------------------------------------- */
  function ancoras() {
    document.querySelectorAll('a[data-scroll]').forEach(function (link) {
      link.addEventListener('click', function (ev) {
        var alvo = document.querySelector(link.getAttribute('href'));
        if (!alvo) return;
        ev.preventDefault();
        alvo.scrollIntoView({ behavior: REDUZIDO ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* -----------------------------------------------------------------
     COUNT-UP
     Lê data-count (número final) e formata conforme:
       data-count-format="brl"      → moeda BRL sem centavos
       data-count-decimals="0|1|2"  → casas decimais (pt-BR)
       data-count-prefix / -suffix  → texto colado no valor
     ----------------------------------------------------------------- */
  var fmtBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });

  function formatar(el, valor) {
    var prefixo = el.getAttribute('data-count-prefix') || '';
    var sufixo  = el.getAttribute('data-count-suffix') || '';
    var texto;

    if (el.getAttribute('data-count-format') === 'brl') {
      texto = fmtBRL.format(Math.round(valor));
    } else {
      var casas = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      texto = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casas, maximumFractionDigits: casas
      }).format(valor);
    }
    return prefixo + texto + sufixo;
  }

  function contarAte(el) {
    var destino = parseFloat(el.getAttribute('data-count'));
    if (!isFinite(destino)) return;

    if (REDUZIDO) { el.textContent = formatar(el, destino); return; }

    var duracao = 1200;
    var inicio  = null;

    function passo(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / duracao, 1);
      var eased = 1 - Math.pow(1 - t, 3);          // easeOutCubic
      el.textContent = formatar(el, destino * eased);
      if (t < 1) requestAnimationFrame(passo);
      else el.textContent = formatar(el, destino);
    }
    requestAnimationFrame(passo);
  }

  function countUp() {
    var alvos = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!alvos.length) return;

    if (!('IntersectionObserver' in window)) {
      alvos.forEach(contarAte);
      return;
    }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        contarAte(entrada.target);
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.4 });

    alvos.forEach(function (el) { obs.observe(el); });
  }

  /* -----------------------------------------------------------------
     TICKER DO OVERLAY DE PROCESSAMENTO
     ----------------------------------------------------------------- */
  function ticker() {
    var log = document.getElementById('processingLog');
    if (!log) return;

    var linhas = [
      'Lendo os números da operação…',
      'Aplicando encargos sobre a folha…',
      'Calculando custo por reunião…',
      'Fechando o gap contra a meta…'
    ];

    if (REDUZIDO) { log.textContent = linhas[linhas.length - 1]; return; }

    var i = 0;
    log.textContent = linhas[0];
    var id = setInterval(function () {
      i += 1;
      if (i >= linhas.length) { clearInterval(id); return; }
      log.textContent = linhas[i];
    }, 400);

    document.addEventListener('raiox:revelado', function () { clearInterval(id); });
  }

  /* -----------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------- */
  function boot() {
    nav();
    reveal();
    ancoras();
    ticker();
    // Na tela de resultado, o count-up só arranca depois que os valores
    // foram escritos pelo motor de cálculo.
    if (document.getElementById('resultado')) {
      document.addEventListener('raiox:revelado', countUp);
    } else {
      countUp();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
