/* =====================================================================
   APRESENTAÇÃO DE REUNIÃO — Althius
   Runtime da tela que o closer compartilha na call.

   Sequência (Playbook Comercial, seção 2):
     capa → Raio-X ao vivo → Mapa da Máquina → Pit 01 →
     deck 1..7 (gap · por que · máquina · vídeo · prova · plano · preço) → fecho

   O que o closer FALA não vive aqui: vive em presenter.html.
   ===================================================================== */
(function () {
  'use strict';

  var E = window.RaioXEngine;
  var STORAGE_KEY = 'althius_deck_v1';
  var CANAL = 'althius-deck';

  /* -----------------------------------------------------------------
     ESTADO
     ----------------------------------------------------------------- */
  var STACK_PADRAO = [
    { dor: 'SDR entra sem lista pronta',
      faz: 'Detecção de sinal + conta certa entregue',
      dia: 'Ele senta na segunda e a semana já está desenhada' },
    { dor: 'Já compramos lista e veio lixo',
      faz: 'Ativação só com movimento real da conta',
      dia: 'Foi exatamente assim que eu cheguei em você' },
    { dor: 'A gente não chega no decisor',
      faz: 'Sócios e decisores mapeados, com contato direto',
      dia: 'Sem recepção, sem caixa postal, sem torcida' },
    { dor: 'Follow-up depende da memória de alguém',
      faz: 'Cadência organizada com revisão humana',
      dia: 'Nenhuma conta esfria por esquecimento' }
  ];

  var estado = {
    empresa: '', custoCitado: null, dataDeteccao: '', dataLigacao: '',
    metaTrimestre: null, ticketMedio: null,
    reunioesSemana: null, vendasMes: null, taxaConversao: null,
    pessoasComercial: null, folhaBruta: null, ferramentasMes: null, salarioNovo: null,
    dorLiteral: '',
    mapaOrigem: '', mapaAbordagem: '', mapaReuniao: '', mapaProposta: '', mapaContrato: '',
    vazamentos: [],
    notaPit: null,
    fraseGap: '',
    stack: JSON.parse(JSON.stringify(STACK_PADRAO)),
    degrau: null,
    kickoffDia: '', kickoffHora: ''
  };

  var TEXTO = { empresa: 1, dataDeteccao: 1, dataLigacao: 1, dorLiteral: 1, fraseGap: 1,
                mapaOrigem: 1, mapaAbordagem: 1, mapaReuniao: 1, mapaProposta: 1, mapaContrato: 1,
                kickoffDia: 1, kickoffHora: 1 };

  function salvar() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); } catch (err) { /* ok */ }
  }

  function carregar() {
    try {
      var bruto = localStorage.getItem(STORAGE_KEY);
      if (!bruto) return;
      var d = JSON.parse(bruto);
      Object.keys(estado).forEach(function (k) {
        if (d[k] !== undefined && d[k] !== null) estado[k] = d[k];
      });
    } catch (err) { /* ok */ }
  }

  /* -----------------------------------------------------------------
     VALORES DE SAÍDA — mapa chave → texto já formatado
     ----------------------------------------------------------------- */
  function calc() {
    return E.calcular({
      metaTrimestre: estado.metaTrimestre, ticketMedio: estado.ticketMedio,
      reunioesSemana: estado.reunioesSemana, vendasMes: estado.vendasMes,
      taxaConversao: estado.taxaConversao,
      folhaBruta: estado.folhaBruta, ferramentasMes: estado.ferramentasMes,
      salarioNovo: estado.salarioNovo
    });
  }

  function valores(r) {
    var v = {
      empresaTitulo:          estado.empresa || 'Sua operação',
      dataDeteccao:           estado.dataDeteccao || '—',
      dataLigacao:            estado.dataLigacao || '—',
      custoCitado:            estado.custoCitado ? E.moeda(estado.custoCitado) : '—',
      custoMensalTotal:       E.moeda(r.custoMensalTotal),
      reunioesMesAtual:       E.num(r.reunioesMesAtual, 1),
      custoPorReuniao:        E.moeda(r.custoPorReuniao),
      custoPorVenda:          E.moeda(r.custoPorVenda),
      vendasNecessariasMes:   E.num(r.vendasNecessariasMes, 1),
      reunioesNecessariasMes: E.num(r.reunioesNecessariasMes, 1),
      receitaExibicao:        E.moeda(r.receitaExibicao),
      custoRampagem:          E.moeda(r.custoRampagem),
      notaPit:                estado.notaPit === null ? '—' : String(estado.notaPit),
      notaFalta:             (estado.notaPit !== null && estado.notaPit < 10)
                                ? ' · faltam ' + (10 - estado.notaPit) + ' pontos'
                                : ''
    };

    if (r.gapReunioes === null) {
      v.gapExibicao = '—'; v.gapBig = '—'; v.gapUnidade = 'reuniões/mês faltando';
    } else if (r.saudavel) {
      v.gapExibicao = 'No alvo'; v.gapBig = 'No alvo';
      v.gapUnidade = 'operação dentro da meta';
    } else {
      v.gapExibicao = '≈ ' + E.num(r.gapExibicao, 1);
      v.gapBig = E.num(r.gapExibicao, 1);
      v.gapUnidade = 'reuniões/mês faltando';
    }

    var i = r.incoerencia;
    v.incDeclarada = i ? E.num(i.declarada, 1) + '%' : '—';
    v.incImplicita = i ? E.num(i.implicita, 1) + '%' : '—';
    v.incGap       = i ? E.num(Math.max(i.gapReunioes, 0), 1) : '—';
    v.incRisco     = i ? E.moeda(Math.max(i.receitaEmRiscoMes, 0)) : '—';

    return v;
  }

  /* -----------------------------------------------------------------
     RENDER
     ----------------------------------------------------------------- */
  var elsOut, elsIn, hud, invWrap, alerta, brandEmpresa;

  function render(origem) {
    var r = calc();
    var v = valores(r);

    elsOut.forEach(function (el) {
      var k = el.getAttribute('data-out');
      if (v[k] !== undefined) el.textContent = v[k];
    });

    // Campos: reflete o estado em todos os inputs com a mesma chave,
    // menos naquele que está sendo digitado agora.
    elsIn.forEach(function (el) {
      if (el === origem) return;
      var k = el.getAttribute('data-k');
      var val = estado[k];
      var texto;
      if (TEXTO[k]) {
        texto = val || '';
      } else if (val === null || val === undefined) {
        texto = '';
      } else {
        texto = el.getAttribute('data-mask') === 'currency'
          ? E.mascaraMoeda(String(Math.round(val)))
          : E.num(val, 2);
      }
      if (el.value !== texto) el.value = texto;
    });

    // Linhas que só existem se houver valor
    document.querySelectorAll('[data-show]').forEach(function (el) {
      el.hidden = !estado[el.getAttribute('data-show')];
    });

    alerta.classList.toggle('is-on', !!r.incoerencia);
    invWrap.classList.toggle('is-locked', estado.notaPit === null);
    brandEmpresa.textContent = estado.empresa || '';

    // O HUD só entra depois do Raio-X: ali os números já estão na tela em
    // tamanho grande, e a barra cobriria a coluna de entradas.
    var temNumeros = r.custoPorReuniao !== null || r.gapReunioes !== null;
    hud.classList.toggle('is-on', temNumeros && indiceAtual >= 2);

    document.getElementById('pitNote').classList.toggle('is-on', estado.notaPit !== null);

    salvar();
    transmitir(v);
  }

  /* -----------------------------------------------------------------
     NAVEGAÇÃO
     ----------------------------------------------------------------- */
  var slides, indiceAtual = 0;

  function irPara(i) {
    if (i < 0 || i >= slides.length || i === indiceAtual) return;
    slides[indiceAtual].classList.remove('is-active');
    indiceAtual = i;
    slides[indiceAtual].classList.add('is-active');
    slides[indiceAtual].scrollTop = 0;
    atualizarChrome();
    render();
  }

  function atualizarChrome() {
    document.getElementById('deckCount').textContent = (indiceAtual + 1) + ' / ' + slides.length;
    document.getElementById('railFill').style.width =
      ((indiceAtual + 1) / slides.length) * 100 + '%';
    document.getElementById('navPrev').disabled = indiceAtual === 0;
    document.getElementById('navNext').disabled = indiceAtual === slides.length - 1;
  }

  /* -----------------------------------------------------------------
     JANELA DO APRESENTADOR
     ----------------------------------------------------------------- */
  var canal = ('BroadcastChannel' in window) ? new BroadcastChannel(CANAL) : null;
  var janelaPresenter = null;

  function transmitir(v) {
    if (!canal) return;
    canal.postMessage({
      slide: slides[indiceAtual].getAttribute('data-slide'),
      nome:  slides[indiceAtual].getAttribute('data-nome'),
      idx:   indiceAtual + 1,
      total: slides.length,
      valores: v,
      estado: { empresa: estado.empresa, notaPit: estado.notaPit, dorLiteral: estado.dorLiteral }
    });
  }

  function abrirPresenter() {
    if (janelaPresenter && !janelaPresenter.closed) { janelaPresenter.focus(); return; }
    janelaPresenter = window.open('presenter.html', 'althius-presenter',
      'width=520,height=760,menubar=no,toolbar=no');
    // Dá tempo da janela assinar o canal antes do primeiro envio.
    setTimeout(function () { render(); }, 600);
  }

  /* -----------------------------------------------------------------
     MONTAGEM
     ----------------------------------------------------------------- */
  function montarDial() {
    var dial = document.getElementById('dial');
    for (var n = 0; n <= 10; n++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(n);
      b.setAttribute('data-nota', String(n));
      dial.appendChild(b);
    }
    dial.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-nota]');
      if (!b) return;
      estado.notaPit = parseInt(b.getAttribute('data-nota'), 10);
      dial.querySelectorAll('button').forEach(function (x) {
        x.classList.toggle('is-on', x === b);
      });
      render();
    });
  }

  function sincronizarDial() {
    document.querySelectorAll('#dial button').forEach(function (b) {
      b.classList.toggle('is-on', parseInt(b.getAttribute('data-nota'), 10) === estado.notaPit);
    });
  }

  function montarStack() {
    var tabela = document.getElementById('stackTable');

    estado.stack.forEach(function (linha, i) {
      var row = document.createElement('div');
      row.className = 'stack-row';
      row.innerHTML =
        '<div class="stack-cell is-dor"><input class="f is-full" data-stack="' + i + '.dor"></div>' +
        '<div class="stack-cell"><input class="f is-full" data-stack="' + i + '.faz"></div>' +
        '<div class="stack-cell"><input class="f is-full" data-stack="' + i + '.dia"></div>';
      tabela.appendChild(row);
    });

    tabela.querySelectorAll('[data-stack]').forEach(function (el) {
      var p = el.getAttribute('data-stack').split('.');
      el.value = estado.stack[p[0]][p[1]];
      el.addEventListener('input', function () {
        estado.stack[p[0]][p[1]] = el.value;
        salvar();
      });
    });

    // Puxa as dores do Mapa: só as colunas marcadas como vazamento.
    var puxar = document.createElement('button');
    puxar.type = 'button';
    puxar.className = 'tool';
    puxar.style.marginTop = '16px';
    puxar.textContent = 'Puxar dores do Mapa';
    puxar.addEventListener('click', function () {
      var mapa = { origem: 'mapaOrigem', abordagem: 'mapaAbordagem', reuniao: 'mapaReuniao',
                   proposta: 'mapaProposta', contrato: 'mapaContrato' };
      var dores = estado.vazamentos
        .map(function (c) { return (estado[mapa[c]] || '').trim(); })
        .filter(Boolean);
      if (estado.dorLiteral) dores.unshift(estado.dorLiteral.trim());
      dores.slice(0, estado.stack.length).forEach(function (texto, i) {
        estado.stack[i].dor = texto;
        var campo = tabela.querySelector('[data-stack="' + i + '.dor"]');
        if (campo) campo.value = texto;
      });
      salvar();
    });
    tabela.parentNode.appendChild(puxar);
  }

  function montarMapa() {
    document.getElementById('mapa').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-leak]');
      if (!b) return;
      var col = b.getAttribute('data-leak');
      var i = estado.vazamentos.indexOf(col);
      if (i >= 0) estado.vazamentos.splice(i, 1); else estado.vazamentos.push(col);
      sincronizarMapa();
      salvar();
    });
  }

  function sincronizarMapa() {
    document.querySelectorAll('.mapa_col').forEach(function (c) {
      c.classList.toggle('is-leak', estado.vazamentos.indexOf(c.getAttribute('data-col')) >= 0);
    });
  }

  function montarDegraus() {
    var box = document.getElementById('degraus');
    box.addEventListener('click', function (ev) {
      var d = ev.target.closest('[data-degrau]');
      if (!d) return;
      var nome = d.getAttribute('data-degrau');
      estado.degrau = (estado.degrau === nome) ? null : nome;
      sincronizarDegraus();
      salvar();
    });
  }

  function sincronizarDegraus() {
    document.querySelectorAll('[data-degrau]').forEach(function (d) {
      d.classList.toggle('is-on', d.getAttribute('data-degrau') === estado.degrau);
    });
  }

  function montarVideo() {
    var url = new URLSearchParams(location.search).get('video') || 'assets/video/plataforma.mp4';
    var frame = document.getElementById('videoFrame');
    var faltando = document.getElementById('videoMissing');

    var video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.src = url;
    video.hidden = true;

    video.addEventListener('loadedmetadata', function () {
      video.hidden = false;
      faltando.hidden = true;
    });
    video.addEventListener('error', function () { video.remove(); });

    frame.appendChild(video);
  }

  function montarPrintSinal() {
    var frame = document.getElementById('printFrame');
    var img = new Image();
    img.onload = function () { frame.innerHTML = ''; frame.appendChild(img); };
    img.alt = 'Sinal detectado';
    img.src = 'assets/img/sinal.png';
  }

  /* -----------------------------------------------------------------
     CAMPOS
     ----------------------------------------------------------------- */
  function montarCampos() {
    elsIn.forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-k');
        var mask = el.getAttribute('data-mask');
        if (mask === 'currency') {
          el.value = E.mascaraMoeda(el.value);
          estado[k] = E.parseBR(el.value);
        } else if (mask === 'number') {
          el.value = E.mascaraNumero(el.value);
          estado[k] = E.parseBR(el.value);
        } else {
          estado[k] = el.value;
        }
        render(el);
      });
    });
  }

  /* -----------------------------------------------------------------
     FERRAMENTAS
     ----------------------------------------------------------------- */
  function exportarRaioX() {
    var payload = {
      metaTrimestre: estado.metaTrimestre, ticketMedio: estado.ticketMedio,
      reunioesSemana: estado.reunioesSemana, vendasMes: estado.vendasMes,
      taxaConversao: estado.taxaConversao === null ? E.TAXA_PADRAO : estado.taxaConversao,
      taxaEstimada: estado.taxaConversao === null,
      pessoasComercial: estado.pessoasComercial, folhaBruta: estado.folhaBruta,
      ferramentasMes: estado.ferramentasMes || 0, salarioNovo: estado.salarioNovo,
      outboundAntes: null, outboundDetalhe: estado.dorLiteral || '',
      processoDefinido: null,
      geradoEm: new Date().toISOString()
    };
    var json = JSON.stringify(payload);
    var d = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    window.open('resultado.html?d=' + d, '_blank');
  }

  function montarFerramentas() {
    document.querySelector('.tools').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tool]');
      if (!b) return;
      switch (b.getAttribute('data-tool')) {
        case 'presenter':  abrirPresenter(); break;
        case 'export':     exportarRaioX(); break;
        case 'precall':    document.getElementById('precall').classList.remove('is-done'); break;
        case 'fullscreen':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
      }
    });

    document.getElementById('navPrev').addEventListener('click', function () { irPara(indiceAtual - 1); });
    document.getElementById('navNext').addEventListener('click', function () { irPara(indiceAtual + 1); });

    document.getElementById('pcAbrir').addEventListener('click', function () {
      document.getElementById('precall').classList.add('is-done');
    });
    document.getElementById('pcLimpar').addEventListener('click', function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ok */ }
      location.reload();
    });

    alerta.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-inc]');
      if (!b) return;
      if (b.getAttribute('data-inc') === 'usar') {
        var r = calc();
        if (r.taxaImplicita !== null) estado.taxaConversao = Math.round(r.taxaImplicita * 10) / 10;
      } else {
        alerta.classList.remove('is-on');
        return;
      }
      render();
    });
  }

  function montarTeclado() {
    document.addEventListener('keydown', function (ev) {
      var alvo = ev.target;
      var digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA');

      if (ev.key === 'Escape' && digitando) { alvo.blur(); return; }
      if (digitando) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

      switch (ev.key) {
        case 'ArrowRight': case 'PageDown': case ' ':
          ev.preventDefault(); irPara(indiceAtual + 1); break;
        case 'ArrowLeft': case 'PageUp':
          ev.preventDefault(); irPara(indiceAtual - 1); break;
        case 'n': case 'N': abrirPresenter(); break;
        case 'h': case 'H': document.body.classList.toggle('is-clean'); break;
        case 'p': case 'P': document.getElementById('precall').classList.remove('is-done'); break;
        case 'f': case 'F':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
      }
    });
  }

  /* -----------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------- */
  function boot() {
    slides       = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    elsOut       = Array.prototype.slice.call(document.querySelectorAll('[data-out]'));
    elsIn        = Array.prototype.slice.call(document.querySelectorAll('[data-k]'));
    hud          = document.getElementById('hud');
    invWrap      = document.getElementById('invWrap');
    alerta       = document.getElementById('xrAlerta');
    brandEmpresa = document.getElementById('brandEmpresa');

    carregar();

    // A frase do deck 2 já vem escrita no HTML — só sobrescreve se houver
    // versão salva desta conta.
    var campoFrase = document.querySelector('[data-k="fraseGap"]');
    if (campoFrase && !estado.fraseGap) estado.fraseGap = campoFrase.value.trim();

    montarCampos();
    montarDial();
    montarStack();
    montarMapa();
    montarDegraus();
    montarVideo();
    montarPrintSinal();
    montarFerramentas();
    montarTeclado();

    sincronizarDial();
    sincronizarMapa();
    sincronizarDegraus();
    atualizarChrome();
    render();

    // Se já existe sessão desta conta, pula o pré-call.
    if (estado.empresa) document.getElementById('precall').classList.add('is-done');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Deck = { estado: estado, calc: calc, irPara: function (i) { irPara(i); } };
})();
