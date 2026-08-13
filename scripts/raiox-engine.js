/* =====================================================================
   RAIO-X — motor de cálculo compartilhado
   Fonte única das fórmulas. Usado pela apresentação (apresentacao.html)
   e pelo Raio-X de follow-up (resultado.html).

   Fórmulas: Playbook Comercial da Althius, slide 36
   ("2.1 Raio-X · O que entra e o que sai").
   ===================================================================== */
(function () {
  'use strict';

  var ENCARGOS_CLT    = 1.7;   // encargos CLT sobre a folha bruta
  var SEMANAS_POR_MES = 4.33;  // média de semanas por mês
  var TAXA_PADRAO     = 30;    // % — estimativa quando o lead não sabe
  var MESES_RAMPAGEM  = 3;     // meses até o novo contratado produzir

  /* ---------------- formatação ---------------- */
  var _brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  var _int = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

  function moeda(v) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return _brl.format(Math.round(v));
  }

  function num(v, casas) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: casas === undefined ? 1 : casas
    }).format(v);
  }

  /** Arredonda para o múltiplo de 0,5 mais próximo (regra de exibição do gap). */
  function meioEmMeio(v) { return Math.round(v * 2) / 2; }

  function mascaraMoeda(valor) {
    var d = String(valor).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    return d ? 'R$ ' + _int.format(parseInt(d, 10)) : '';
  }

  function mascaraNumero(valor) {
    var limpo = String(valor).replace(/[^\d,]/g, '');
    var p = limpo.split(',');
    return p.length > 2 ? p[0] + ',' + p.slice(1).join('') : limpo;
  }

  /** "R$ 1.234,50" / "12,5" → 1234.5 / 12.5 · null se vazio. */
  function parseBR(texto) {
    if (texto === null || texto === undefined) return null;
    var s = String(texto).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    if (s === '') return null;
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
  }

  /* ---------------- cálculo ---------------- */
  function calcular(e) {
    var folha       = e.folhaBruta || 0;
    var ferramentas = e.ferramentasMes || 0;
    var taxaPct     = (e.taxaConversao === null || e.taxaConversao === undefined)
      ? TAXA_PADRAO : e.taxaConversao;
    var taxa = taxaPct / 100;

    var custoMensalTotal = folha * ENCARGOS_CLT + ferramentas;
    var reunioesMesAtual = (e.reunioesSemana || 0) * SEMANAS_POR_MES;

    var custoPorReuniao = reunioesMesAtual > 0 ? custoMensalTotal / reunioesMesAtual : null;
    var custoPorVenda   = e.vendasMes > 0      ? custoMensalTotal / e.vendasMes      : null;

    var vendasNecessariasMes = e.ticketMedio > 0
      ? (e.metaTrimestre || 0) / 3 / e.ticketMedio
      : null;

    var reunioesNecessariasMes = (vendasNecessariasMes !== null && taxa > 0)
      ? vendasNecessariasMes / taxa
      : null;

    var gapReunioes = reunioesNecessariasMes !== null
      ? reunioesNecessariasMes - reunioesMesAtual
      : null;

    var receitaEmRiscoMes = (gapReunioes !== null && e.ticketMedio > 0)
      ? gapReunioes * taxa * e.ticketMedio
      : null;

    // Slide 36, última linha: custo de rampagem do novo contratado.
    var custoRampagem = (e.salarioNovo && e.salarioNovo > 0)
      ? (e.salarioNovo * ENCARGOS_CLT + ferramentas) * MESES_RAMPAGEM
      : null;

    // A taxa que os números DELE dizem, contra a taxa que ele declarou.
    // Divergência aqui é a melhor pergunta da call — ver `incoerencia`.
    var taxaImplicita = (reunioesMesAtual > 0 && e.vendasMes > 0)
      ? (e.vendasMes / reunioesMesAtual) * 100
      : null;

    var incoerencia = null;
    if (taxaImplicita !== null && taxaPct > 0) {
      var razao = taxaPct / taxaImplicita;
      if (razao >= 1.25 || razao <= 0.8) {
        var taxaR = taxaImplicita / 100;
        var reunioesNecR = vendasNecessariasMes !== null ? vendasNecessariasMes / taxaR : null;
        incoerencia = {
          declarada: taxaPct,
          implicita: taxaImplicita,
          reunioesNecessariasMes: reunioesNecR,
          gapReunioes: reunioesNecR !== null ? reunioesNecR - reunioesMesAtual : null,
          receitaEmRiscoMes: reunioesNecR !== null
            ? (reunioesNecR - reunioesMesAtual) * taxaR * e.ticketMedio
            : null
        };
      }
    }

    var saudavel = gapReunioes !== null && gapReunioes <= 0;

    return {
      taxaAplicada:           taxaPct,
      custoMensalTotal:       custoMensalTotal,
      reunioesMesAtual:       reunioesMesAtual,
      custoPorReuniao:        custoPorReuniao,
      custoPorVenda:          custoPorVenda,
      vendasNecessariasMes:   vendasNecessariasMes,
      reunioesNecessariasMes: reunioesNecessariasMes,
      gapReunioes:            gapReunioes,
      gapExibicao:            gapReunioes !== null ? meioEmMeio(Math.max(gapReunioes, 0)) : null,
      receitaEmRiscoMes:      receitaEmRiscoMes,
      receitaExibicao:        receitaEmRiscoMes !== null ? Math.max(receitaEmRiscoMes, 0) : null,
      custoRampagem:          custoRampagem,
      mesesRampagem:          MESES_RAMPAGEM,
      taxaImplicita:          taxaImplicita,
      incoerencia:            incoerencia,
      saudavel:               saudavel
    };
  }

  window.RaioXEngine = {
    ENCARGOS_CLT: ENCARGOS_CLT,
    SEMANAS_POR_MES: SEMANAS_POR_MES,
    TAXA_PADRAO: TAXA_PADRAO,
    MESES_RAMPAGEM: MESES_RAMPAGEM,
    calcular: calcular,
    moeda: moeda,
    num: num,
    meioEmMeio: meioEmMeio,
    parseBR: parseBR,
    mascaraMoeda: mascaraMoeda,
    mascaraNumero: mascaraNumero
  };
})();
