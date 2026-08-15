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
    kickoffDia: '', kickoffHora: '',
    // Print do sinal, subido no pré-call (data URL já redimensionada).
    sinalImagem: '', sinalMeta: '',
    // Taxa veio do benchmark de mercado em vez da boca do lead.
    taxaDoMercado: false,
    // Campos cujo valor foi estimado junto, e não declarado por ele.
    estimados: [],
    // Funil de mercado (deck 4) — editável na call.
    somTam: null, somSam: null, somSom: null, somSinal: null,
    motions: []
  };

  var TEXTO = { empresa: 1, dataDeteccao: 1, dataLigacao: 1, dorLiteral: 1, fraseGap: 1,
                mapaOrigem: 1, mapaAbordagem: 1, mapaReuniao: 1, mapaProposta: 1, mapaContrato: 1,
                kickoffDia: 1, kickoffHora: 1 };

  /* As 14 motions de Go-to-Market do documento Revenue OS. */
  var MOTIONS = [
    'Outbound Sales', 'Inbound Marketing', 'Tráfego Pago', 'SEO',
    'Newsletter', 'PLG — Product-Led Growth', 'Comunidade', 'ABM',
    'Parcerias e Channel', 'Eventos e Webinars', 'Conteúdo de fundo de funil',
    'Social Selling', 'Customer Marketing', 'Demand Generation'
  ];

  /* A imagem do sinal vive numa chave à parte: ela pesa centenas de KB e
     `salvar()` roda a cada tecla do diagnóstico — serializar o data URL
     junto travaria a digitação. */
  var SINAL_KEY = 'althius_deck_sinal_v1';

  function salvar() {
    try {
      var copia = {};
      Object.keys(estado).forEach(function (k) {
        if (k !== 'sinalImagem') copia[k] = estado[k];
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copia));
    } catch (err) { /* ok */ }
  }

  function salvarSinal() {
    try {
      if (estado.sinalImagem) localStorage.setItem(SINAL_KEY, estado.sinalImagem);
      else localStorage.removeItem(SINAL_KEY);
    } catch (err) {
      // Cota estourada: mantém em memória para esta call e avisa no console.
      console.warn('Sinal não coube no localStorage — vale só nesta aba.');
    }
  }

  function carregar() {
    try {
      var bruto = localStorage.getItem(STORAGE_KEY);
      if (bruto) {
        var d = JSON.parse(bruto);
        Object.keys(estado).forEach(function (k) {
          if (d[k] !== undefined && d[k] !== null) estado[k] = d[k];
        });
      }
    } catch (err) { /* ok */ }
    try {
      estado.sinalImagem = localStorage.getItem(SINAL_KEY) || '';
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

    // Funil de mercado (deck 4)
    v.somSinalEco  = estado.somSinal !== null ? E.num(estado.somSinal, 0) : '650';
    var som = estado.somSom, sinal = estado.somSinal;
    v.somRestante = (som !== null && sinal !== null && som > sinal)
      ? E.num(som - sinal, 0)
      : '7.350';

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

    sincronizarTaxa();
    atualizarMercado();
    sincronizarEstimados();
    atualizarConfianca();

    var eco = document.getElementById('escopoEmpresa');
    if (eco) eco.textContent = estado.empresa || 'sua empresa';

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

  // O apresentador pode ser aberto a qualquer momento (inclusive numa aba
  // separada). Ao carregar, ele pede o estado — senão ficaria em branco até
  // a próxima troca de slide.
  if (canal) {
    canal.onmessage = function (ev) {
      if (ev.data && ev.data.pedido) render();
    };
  }

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

  /* -----------------------------------------------------------------
     ESTIMADORES — o caminho quando ele não sabe o número
     ----------------------------------------------------------------- */
  var CAMPOS_DIAGNOSTICO = ['metaTrimestre', 'ticketMedio', 'reunioesSemana', 'vendasMes',
                            'taxaConversao', 'folhaBruta', 'ferramentasMes'];
  var campoAberto = null;

  function abrirEstimador(chave) {
    var cfg = window.Estimadores && window.Estimadores.MAPA[chave];
    if (!cfg) return;
    campoAberto = chave;

    document.getElementById('estTitulo').textContent = cfg.titulo;
    var corpo = document.getElementById('estCorpo');
    corpo.innerHTML = '';

    cfg.caminhos.forEach(function (caminho, i) {
      corpo.appendChild(montarCaminho(caminho, i, chave));
    });

    document.getElementById('est').hidden = false;
    var primeiro = corpo.querySelector('.est_caminho');
    if (primeiro) primeiro.classList.add('is-aberto');
  }

  function fecharEstimador() {
    document.getElementById('est').hidden = true;
    campoAberto = null;
  }

  function montarCaminho(caminho, indice, chaveCampo) {
    var box = document.createElement('div');
    box.className = 'est_caminho';

    var cab = document.createElement('button');
    cab.type = 'button';
    cab.className = 'est_cab';
    cab.innerHTML = '<span>' + caminho.rotulo + '</span>';
    cab.addEventListener('click', function () {
      var jaAberto = box.classList.contains('is-aberto');
      box.parentNode.querySelectorAll('.est_caminho').forEach(function (o) {
        o.classList.remove('is-aberto');
      });
      if (!jaAberto) box.classList.add('is-aberto');
    });
    box.appendChild(cab);

    var painel = document.createElement('div');
    painel.className = 'est_painel';

    if (caminho.modo === 'escada') {
      painel.appendChild(montarEscada(caminho, chaveCampo));
    } else if (caminho.modo === 'composicao') {
      painel.appendChild(montarComposicao(caminho, chaveCampo));
    } else {
      painel.appendChild(montarDerivar(caminho, chaveCampo));
    }

    box.appendChild(painel);
    return box;
  }

  function montarEscada(caminho, chaveCampo) {
    var frag = document.createDocumentFragment();
    if (caminho.pergunta) {
      var p = document.createElement('p');
      p.className = 'est_pergunta';
      p.textContent = caminho.pergunta;
      frag.appendChild(p);
    }
    var linha = document.createElement('div');
    linha.className = 'est_opcoes';
    caminho.opcoes.forEach(function (op) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'est_op';
      b.textContent = op.rotulo;
      b.addEventListener('click', function () { aplicarEstimativa(chaveCampo, op.valor); });
      linha.appendChild(b);
    });
    frag.appendChild(linha);
    return frag;
  }

  function montarComposicao(caminho, chaveCampo) {
    var frag = document.createDocumentFragment();
    var p = document.createElement('p');
    p.className = 'est_pergunta';
    p.textContent = caminho.pergunta;
    frag.appendChild(p);

    var grade = document.createElement('div');
    grade.className = 'est_comp';
    var quantidades = [];

    caminho.linhas.forEach(function (perfil, i) {
      quantidades[i] = 0;
      var linha = document.createElement('div');
      linha.className = 'est_linha';
      linha.innerHTML = '<span class="nome">' + perfil.rotulo + '</span>'
        + '<span class="val">' + E.moeda(perfil.valor) + '</span>';
      var input = document.createElement('input');
      input.className = 'f is-num';
      input.type = 'text';
      input.style.width = '60px';
      input.placeholder = '0';
      input.addEventListener('input', function () {
        input.value = E.mascaraNumero(input.value);
        quantidades[i] = E.parseBR(input.value) || 0;
        atualizar();
      });
      linha.appendChild(input);
      grade.appendChild(linha);
    });
    frag.appendChild(grade);

    var previa = document.createElement('div');
    previa.className = 'est_previa';
    var res = document.createElement('span');
    res.className = 'est_res';
    res.textContent = '—';
    var exp = document.createElement('span');
    exp.className = 'est_exp';
    var usar = document.createElement('button');
    usar.type = 'button';
    usar.className = 'button is-primary';
    usar.innerHTML = '<div class="label">usar este número</div>';
    usar.disabled = true;
    previa.appendChild(res); previa.appendChild(exp); previa.appendChild(usar);
    frag.appendChild(previa);

    var total = 0;
    function atualizar() {
      total = caminho.linhas.reduce(function (soma, perfil, i) {
        return soma + perfil.valor * (quantidades[i] || 0);
      }, 0);
      var pessoas = quantidades.reduce(function (a, b) { return a + b; }, 0);
      res.textContent = total > 0 ? E.moeda(total) : '—';
      exp.textContent = total > 0
        ? pessoas + ' pessoa(s) somando ' + E.moeda(total) + ' de folha bruta por mês.'
        : '';
      usar.disabled = total <= 0;
    }
    usar.addEventListener('click', function () { aplicarEstimativa(chaveCampo, total); });

    return frag;
  }

  function montarDerivar(caminho, chaveCampo) {
    var frag = document.createDocumentFragment();
    var grade = document.createElement('div');
    grade.className = 'est_campos';
    var valores = {};

    caminho.campos.forEach(function (campo) {
      // Se o número já está no diagnóstico, pré-preenche.
      if (campo.de && estado[campo.de] !== null && estado[campo.de] !== undefined) {
        valores[campo.k] = estado[campo.de];
      } else if (campo.padrao !== undefined) {
        valores[campo.k] = campo.padrao;
      }

      var wrap = document.createElement('div');
      wrap.className = 'est_campo';
      var lab = document.createElement('label');
      lab.textContent = campo.rotulo;
      var input = document.createElement('input');
      input.className = 'f';
      input.type = 'text';
      input.placeholder = campo.mask === 'currency' ? 'R$ 0' : '0';
      if (valores[campo.k] !== undefined) {
        input.value = campo.mask === 'currency'
          ? E.mascaraMoeda(String(Math.round(valores[campo.k])))
          : E.num(valores[campo.k], 2);
      }
      input.addEventListener('input', function () {
        input.value = campo.mask === 'currency'
          ? E.mascaraMoeda(input.value) : E.mascaraNumero(input.value);
        valores[campo.k] = E.parseBR(input.value);
        atualizar();
      });
      wrap.appendChild(lab); wrap.appendChild(input);
      grade.appendChild(wrap);
    });
    frag.appendChild(grade);

    var previa = document.createElement('div');
    previa.className = 'est_previa';
    var res = document.createElement('span'); res.className = 'est_res'; res.textContent = '—';
    var exp = document.createElement('span'); exp.className = 'est_exp';
    var usar = document.createElement('button');
    usar.type = 'button';
    usar.className = 'button is-primary';
    usar.innerHTML = '<div class="label">usar este número</div>';
    usar.disabled = true;
    previa.appendChild(res); previa.appendChild(exp); previa.appendChild(usar);
    frag.appendChild(previa);

    var resultado = null;
    function atualizar() {
      resultado = caminho.calcular(valores);
      var ok = resultado !== null && isFinite(resultado) && resultado > 0;
      res.textContent = ok
        ? (chaveCampo === 'reunioesSemana' || chaveCampo === 'vendasMes'
            ? E.num(resultado, 1) : E.moeda(resultado))
        : '—';
      exp.textContent = ok && caminho.explicar ? caminho.explicar(valores, resultado) : '';
      usar.disabled = !ok;
    }
    usar.addEventListener('click', function () {
      if (resultado !== null) aplicarEstimativa(chaveCampo, resultado);
    });
    atualizar();

    return frag;
  }

  function aplicarEstimativa(chave, valor) {
    estado[chave] = Math.round(valor * 100) / 100;
    if (estado.estimados.indexOf(chave) < 0) estado.estimados.push(chave);
    fecharEstimador();
    render();
  }

  function sincronizarEstimados() {
    document.querySelectorAll('[data-campo]').forEach(function (linha) {
      var k = linha.getAttribute('data-campo');
      var estimado = estado.estimados.indexOf(k) >= 0;
      linha.classList.toggle('is-estimada', estimado);
      var input = linha.querySelector('[data-k]');
      if (input) input.classList.toggle('is-estimado', estimado);
    });
  }

  /** Quantos números são dele, quantos a gente estimou. */
  function atualizarConfianca() {
    var caixa = document.getElementById('confianca');
    if (!caixa) return;

    var preenchidos = 0, estimados = 0;
    CAMPOS_DIAGNOSTICO.forEach(function (k) {
      var v = estado[k];
      var temValor = v !== null && v !== undefined && v !== '';
      if (k === 'taxaConversao' && estado.taxaDoMercado) { preenchidos++; estimados++; return; }
      if (!temValor) return;
      preenchidos++;
      if (estado.estimados.indexOf(k) >= 0) estimados++;
    });

    var proprios = preenchidos - estimados;
    var pct = preenchidos > 0 ? Math.round(proprios / CAMPOS_DIAGNOSTICO.length * 100) : 0;

    document.getElementById('confiancaFill').style.width = pct + '%';
    document.getElementById('confiancaN').textContent =
      proprios + '/' + CAMPOS_DIAGNOSTICO.length;

    var texto;
    if (preenchidos === 0) {
      texto = 'Números que vieram de você, contra os que a gente estimou junto.';
    } else if (estimados === 0) {
      texto = 'Todos os números do diagnóstico vieram de você. O gap acima é a sua conta, '
            + 'não a minha.';
    } else {
      texto = estimados + ' de ' + preenchidos + ' números a gente estimou junto porque '
            + 'não estavam na ponta da língua. Isso não invalida a conta — mas já é parte '
            + 'do diagnóstico: o que não é medido não é gerenciado.';
    }
    document.getElementById('confiancaT').textContent = texto;
    caixa.classList.toggle('is-baixa', preenchidos > 0 && estimados >= preenchidos / 2);
  }

  function montarEstimadores() {
    document.querySelectorAll('[data-nsei]').forEach(function (b) {
      b.addEventListener('click', function () { abrirEstimador(b.getAttribute('data-nsei')); });
    });
    document.getElementById('estFechar').addEventListener('click', fecharEstimador);
    document.getElementById('est').addEventListener('click', function (ev) {
      if (ev.target.id === 'est') fecharEstimador();
    });
  }

  /* -----------------------------------------------------------------
     OS NOVE PROCESSOS (deck 10)
     ----------------------------------------------------------------- */
  var PROCESSOS = [
    { t: 'Pipeline',
      cria: 'Etapas, critérios de avanço, campos obrigatórios e métricas por fase.',
      otimiza: 'Mapeamos as fases atuais, achamos onde o negócio trava e refazemos os critérios.' },
    { t: 'Prospecção',
      cria: 'Canais, segmentação, pesquisa de conta, scripts, qualificação e cadência multicanal.',
      otimiza: 'Auditamos canais e scripts, achamos o que não converte e reescrevemos.' },
    { t: 'Fechamento',
      cria: 'Playbook de fechamento, gatilhos de aceleração e handoff para o pós-venda.',
      otimiza: 'Mapeamos onde o negócio morre no fim e instalamos os gatilhos que faltam.' },
    { t: 'SLA',
      cria: 'Responsabilidades, prazos, critérios de qualidade e regras de passagem entre times.',
      otimiza: 'Achamos o atrito entre marketing, SDR, closer e CS e formalizamos o acordo.' },
    { t: 'Cadência',
      cria: 'Fluxo por conta e persona, multicanal, com regra de adaptação por resposta.',
      otimiza: 'Medimos toque a toque, cortamos o que não engaja e tornamos o fluxo vivo.' },
    { t: 'Framework de venda',
      cria: 'Metodologia consultiva escolhida pelo seu ICP e treinada com o time.',
      otimiza: 'Avaliamos o que vocês usam hoje e ajustamos ou trocamos por outro.' },
    { t: 'Manual de objeções',
      cria: 'Objeções por categoria — preço, timing, risco, concorrência, autoridade — com resposta.',
      otimiza: 'Comparamos o manual com o que aparece nas calls reais e preenchemos os buracos.' },
    { t: 'Negociação',
      cria: 'Alçadas de desconto, tratamento de negócio parado e proteção de margem.',
      otimiza: 'Achamos onde a margem vaza e reescrevemos as alçadas.' },
    { t: 'Apresentação e demo',
      cria: 'Roteiro de descoberta, demonstração orientada a valor e próximo passo claro.',
      otimiza: 'Achamos onde a demo perde atenção e reordenamos em cima da dor.' }
  ];

  function montarProcessos() {
    var grid = document.getElementById('processosGrid');
    var toggle = document.getElementById('toggleModo');
    if (!grid || !toggle) return;

    function pintar(modo) {
      grid.innerHTML = PROCESSOS.map(function (p) {
        return '<div class="processo"><p class="processo_t">' + p.t + '</p>'
          + '<p class="processo_d">' + p[modo] + '</p></div>';
      }).join('');
    }
    pintar('cria');

    toggle.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-modo]');
      if (!b) return;
      toggle.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      pintar(b.getAttribute('data-modo'));
    });
  }

  /* -----------------------------------------------------------------
     ÍNDICE DE TELAS (tecla I)
     ----------------------------------------------------------------- */
  function montarIndice() {
    var caixa = document.getElementById('indice');
    var lista = document.getElementById('indiceLista');
    if (!caixa || !lista) return;

    lista.innerHTML = slides.map(function (s, i) {
      var opcional = s.hasAttribute('data-opcional');
      return '<button type="button" class="indice_item' + (opcional ? ' is-opcional' : '')
        + '" data-ir="' + i + '">'
        + '<span class="num">' + String(i + 1).padStart(2, '0') + '</span>'
        + '<span>' + (s.getAttribute('data-nome') || s.getAttribute('data-slide')) + '</span>'
        + '<span class="cap">' + (opcional ? 'opcional' : '') + '</span></button>';
    }).join('');

    lista.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ir]');
      if (!b) return;
      irPara(parseInt(b.getAttribute('data-ir'), 10));
      caixa.hidden = true;
    });
    caixa.addEventListener('click', function (ev) {
      if (ev.target === caixa) caixa.hidden = true;
    });
  }

  function alternarIndice() {
    var caixa = document.getElementById('indice');
    if (!caixa) return;
    caixa.hidden = !caixa.hidden;
    if (!caixa.hidden) {
      caixa.querySelectorAll('.indice_item').forEach(function (b, i) {
        b.classList.toggle('is-atual', i === indiceAtual);
      });
    }
  }

  /* -----------------------------------------------------------------
     BENCHMARK DE MERCADO
     O sócio quase nunca sabe a própria taxa de conversão. Em vez de
     inventar 30%, aplica a referência de mercado — com a fonte na tela.
     ----------------------------------------------------------------- */
  function montarNaoSei() {
    var botao = document.getElementById('btnNaoSei');
    if (!botao || !window.Benchmarks) return;

    botao.addEventListener('click', function () {
      if (estado.taxaDoMercado) {
        estado.taxaDoMercado = false;
        estado.taxaConversao = null;
      } else {
        estado.taxaDoMercado = true;
        estado.taxaConversao = window.Benchmarks.TAXA_REFERENCIA;
      }
      render();
    });
  }

  function sincronizarTaxa() {
    var botao = document.getElementById('btnNaoSei');
    var credito = document.getElementById('taxaCredito');
    if (!botao || !window.Benchmarks) return;

    botao.classList.toggle('is-on', estado.taxaDoMercado);
    if (credito) {
      credito.textContent = estado.taxaDoMercado
        ? 'referência de mercado · ' + window.Benchmarks.credito('reuniaoVenda')
        : '';
    }
  }

  /** Os cards do banho de mercado (deck 2). */
  function montarMercado() {
    var grid = document.getElementById('mercadoGrid');
    if (!grid || !window.Benchmarks) return;
    var B = window.Benchmarks;

    var ordem = ['winRate', 'metaPerdida', 'cicloCurto', 'decisorCedo', 'rampagem', 'quotaSdr'];

    grid.innerHTML = ordem.map(function (chave) {
      var d = B.DADOS[chave];
      if (!d) return '';
      // O detalhe da amostra vai no title, não numa linha extra: em 900px
      // de altura cada linha de crédito empurra o grid para o scroll.
      var link = d.ref.url
        ? '<a href="' + d.ref.url + '" target="_blank" rel="noopener" title="'
          + (d.ref.detalhe || '') + '">' + d.ref.fonte + '</a>'
        : '<span title="' + (d.ref.detalhe || '') + '">' + d.ref.fonte + '</span>';
      return '<div class="mercado_card">'
        + '<div class="mercado_k">' + d.rotulo + '</div>'
        + '<div class="mercado_v">' + d.faixa + '</div>'
        + '<p class="mercado_l">' + d.leitura + '</p>'
        + (d.validado ? '' : '<span class="mercado_pendente">fonte a confirmar</span>')
        + '<span class="fonte">' + link + ' · ' + d.ref.ano + '</span>'
        + '</div>';
    }).join('');
  }

  /** Marca no card o número DELE, quando existe, para o contraste. */
  function atualizarMercado() {
    var grid = document.getElementById('mercadoGrid');
    if (!grid || !window.Benchmarks) return;

    var antigo = grid.querySelector('.is-dele');
    if (antigo) antigo.remove();

    if (estado.taxaConversao === null || estado.taxaDoMercado) return;

    var B = window.Benchmarks;
    var ref = B.DADOS.winRate.valor;
    var dele = estado.taxaConversao;
    var diff = dele - ref;
    var card = document.createElement('div');
    card.className = 'mercado_card is-dele';
    card.innerHTML =
      '<div class="mercado_k">A sua conversão declarada</div>'
      + '<div class="mercado_v">' + E.num(dele, 1) + '%</div>'
      + '<p class="mercado_l">'
      + (Math.abs(diff) < 2
          ? 'Praticamente colada na média do mercado. O gargalo não está na conversão — está no volume de conta certa chegando na frente do time.'
          : diff > 0
            ? 'Acima da média de mercado em ' + E.num(diff, 1) + ' pontos. Cada reunião que falta na sua agenda vale mais do que valeria na média — o que torna o gap mais caro, não menos.'
            : 'Abaixo da média de mercado em ' + E.num(Math.abs(diff), 1) + ' pontos. Aqui existem duas frentes: mais reunião e melhor reunião.')
      + '</p><span class="fonte">Número declarado por você nesta reunião</span>';
    grid.insertBefore(card, grid.firstChild);
  }

  /** As 14 motions de GTM (deck 5). */
  function montarMotions() {
    var grid = document.getElementById('motionsGrid');
    if (!grid) return;

    grid.innerHTML = MOTIONS.map(function (nome, i) {
      return '<div class="motion" data-motion="' + i + '">'
        + '<div class="motion_n">' + String(i + 1).padStart(2, '0') + '</div>'
        + '<p class="motion_t">' + nome + '</p></div>';
    }).join('');

    grid.addEventListener('click', function (ev) {
      var m = ev.target.closest('[data-motion]');
      if (!m) return;
      var i = parseInt(m.getAttribute('data-motion'), 10);
      var pos = estado.motions.indexOf(i);
      if (pos >= 0) estado.motions.splice(pos, 1); else estado.motions.push(i);
      sincronizarMotions();
      salvar();
    });
  }

  function sincronizarMotions() {
    document.querySelectorAll('[data-motion]').forEach(function (m) {
      var i = parseInt(m.getAttribute('data-motion'), 10);
      m.classList.toggle('is-on', estado.motions.indexOf(i) >= 0);
    });
  }

  /* -----------------------------------------------------------------
     PRINT DO SINAL — subido no pré-call, exibido no deck 8
     Redimensiona no canvas antes de guardar: um print de tela cru
     estoura a cota do localStorage.
     ----------------------------------------------------------------- */
  var LARGURA_MAX = 1280;
  var PROPORCAO_ALVO = 1.6;   // 16:10

  function montarUploadSinal() {
    var zona = document.getElementById('sinalDrop');
    var input = document.getElementById('sinalInput');
    var remover = document.getElementById('sinalRemover');
    if (!zona || !input) return;

    input.addEventListener('change', function () {
      if (input.files && input.files[0]) processarSinal(input.files[0]);
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) {
        e.preventDefault(); zona.classList.add('is-over');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zona.addEventListener(ev, function (e) {
        e.preventDefault(); zona.classList.remove('is-over');
      });
    });
    zona.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) processarSinal(f);
    });

    if (remover) {
      remover.addEventListener('click', function (ev) {
        ev.preventDefault();
        estado.sinalImagem = '';
        estado.sinalMeta = '';
        input.value = '';
        sincronizarSinal();
        salvarSinal();
        salvar();
      });
    }
  }

  function processarSinal(arquivo) {
    if (!/^image\//.test(arquivo.type)) return;

    var leitor = new FileReader();
    leitor.onload = function () {
      var img = new Image();
      img.onload = function () {
        var escala = Math.min(1, LARGURA_MAX / img.naturalWidth);
        var w = Math.round(img.naturalWidth * escala);
        var h = Math.round(img.naturalHeight * escala);

        var tela = document.createElement('canvas');
        tela.width = w; tela.height = h;
        var ctx = tela.getContext('2d');
        ctx.fillStyle = '#0c0d0f';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        estado.sinalImagem = tela.toDataURL('image/jpeg', 0.85);

        var proporcao = img.naturalWidth / img.naturalHeight;
        var kb = Math.round(estado.sinalImagem.length * 0.75 / 1024);
        var perto = Math.abs(proporcao - PROPORCAO_ALVO) <= 0.35;
        estado.sinalMeta = JSON.stringify({
          txt: img.naturalWidth + ' × ' + img.naturalHeight + ' px · ' + kb + ' KB'
             + (perto ? '' : ' · proporção ' + proporcao.toFixed(2) + ':1, o ideal é 1,60:1'),
          ok: perto
        });

        sincronizarSinal();
        salvarSinal();
        salvar();
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  }

  function sincronizarSinal() {
    var previa = document.getElementById('sinalPrevia');
    var img = document.getElementById('sinalImg');
    var meta = document.getElementById('sinalMeta');
    var zona = document.getElementById('sinalDrop');
    var quadro = document.getElementById('printFrame');

    var tem = !!estado.sinalImagem;
    if (previa) previa.classList.toggle('is-on', tem);
    if (zona) zona.hidden = tem;
    if (img && tem) img.src = estado.sinalImagem;

    if (meta) {
      var m = { txt: '', ok: true };
      try { m = JSON.parse(estado.sinalMeta || '{}'); } catch (err) { /* ok */ }
      meta.textContent = m.txt || '';
      meta.classList.toggle('is-ok', !!m.ok);
      meta.classList.toggle('is-alerta', m.ok === false);
    }

    // Espelha no deck 8
    if (quadro) {
      if (tem) {
        quadro.innerHTML = '';
        var grande = new Image();
        grande.src = estado.sinalImagem;
        grande.alt = 'Sinal detectado';
        quadro.appendChild(grande);
      } else {
        quadro.innerHTML = '<p class="text-small text-color-secondary" '
          + 'style="text-align:center;padding:24px">Print do sinal — suba no pré-call '
          + '(<b>P</b>)</p>';
      }
    }
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
          // Digitou a taxa na mão: o número passa a ser dele, não do mercado.
          if (k === 'taxaConversao') estado.taxaDoMercado = false;
        } else {
          estado[k] = el.value;
        }
        // Digitou por cima de uma estimativa: o número volta a ser dele.
        var pos = estado.estimados.indexOf(k);
        if (pos >= 0) estado.estimados.splice(pos, 1);
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
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SINAL_KEY);
      } catch (err) { /* ok */ }
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

      // Escape fecha o que estiver aberto por cima do deck.
      if (ev.key === 'Escape') {
        if (!document.getElementById('est').hidden) { fecharEstimador(); return; }
        if (!document.getElementById('indice').hidden) {
          document.getElementById('indice').hidden = true; return;
        }
        if (digitando) { alvo.blur(); return; }
      }
      if (digitando) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      // Com um modal aberto, as setas não devem trocar de slide por baixo.
      if (!document.getElementById('est').hidden) return;

      switch (ev.key) {
        case 'ArrowRight': case 'PageDown': case ' ':
          ev.preventDefault(); irPara(indiceAtual + 1); break;
        case 'ArrowLeft': case 'PageUp':
          ev.preventDefault(); irPara(indiceAtual - 1); break;
        case 'n': case 'N': abrirPresenter(); break;
        case 'i': case 'I': ev.preventDefault(); alternarIndice(); break;
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
    montarUploadSinal();
    montarNaoSei();
    montarMercado();
    montarMotions();
    montarEstimadores();
    montarProcessos();
    montarIndice();
    montarFerramentas();
    montarTeclado();

    sincronizarDial();
    sincronizarMapa();
    sincronizarDegraus();
    sincronizarSinal();
    sincronizarMotions();
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
