/* =====================================================================
   BENCHMARKS DE MERCADO — Althius
   Referências para o diagnóstico quando o lead não sabe os próprios
   números — e para o "banho de mercado" da tela 6.

   REGRA DESTE ARQUIVO: nenhum número entra aqui sem `fonte`, `ano` e
   `url`. O deck exibe a fonte na tela junto do número. Se você não
   consegue citar de onde veio, não coloca.

   `validado: false` = número convergente entre publicações do setor,
   mas SEM confirmação na fonte primária. Confirme antes de usar numa
   call — ou troque por dado da própria carteira da Althius.
   ===================================================================== */
(function () {
  'use strict';

  var EBSTA = {
    fonte: 'Ebsta × Pavilion · 2025 GTM Benchmarks',
    detalhe: '655.000 oportunidades · US$ 48 bi de pipeline · 349 empresas',
    ano: 2025,
    url: 'https://benchmarks.ebsta.com/2025-gtm-benchmarks'
  };

  var BRIDGE = {
    fonte: 'The Bridge Group · SDR Models, Motions & Metrics 2025',
    detalhe: '350+ empresas B2B · 10ª edição da série',
    ano: 2025,
    url: 'https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group'
  };

  /* -----------------------------------------------------------------
     OS NÚMEROS
     `valor` é o ponto usado no cálculo. `faixa` é o que se mostra.
     ----------------------------------------------------------------- */
  var DADOS = {

    winRate: {
      rotulo: 'Oportunidade → venda',
      valor: 19,
      unidade: '%',
      faixa: '19%',
      leitura: 'Uma em cada cinco oportunidades vira contrato. Em 2024 eram 29%.',
      ref: EBSTA,
      validado: true
    },

    metaPerdida: {
      rotulo: 'Vendedores que não bateram a meta',
      valor: 78,
      unidade: '%',
      faixa: '78%',
      leitura: 'Em 2024 eram 69%. A conta está ficando mais difícil, não mais fácil.',
      ref: EBSTA,
      validado: true
    },

    cicloCurto: {
      rotulo: 'Negócio fechado em até 50 dias',
      valor: 47,
      unidade: '%',
      faixa: '47% × 20%',
      leitura: 'Quem fecha em até 50 dias ganha ~47%. Quem passa disso cai para ~20%. '
             + 'Negócio parado não amadurece — apodrece.',
      ref: EBSTA,
      validado: true
    },

    decisorCedo: {
      rotulo: 'Decisor envolvido desde o início',
      valor: 55,
      unidade: '%',
      faixa: '+55%',
      leitura: 'Envolver quem assina desde o começo aumenta a taxa de ganho em 55%. '
             + 'É exatamente o que o mapeamento de múltiplos decisores resolve.',
      ref: EBSTA,
      validado: true
    },

    rampagem: {
      rotulo: 'Meses até o vendedor novo chegar a 80% da meta',
      valor: 3.9,
      unidade: ' meses',
      faixa: '3,9 meses',
      leitura: 'Mediana de mercado. Sobe para ~6 meses em venda complexa 100% outbound '
             + 'e cai ~0,8 mês quando existe onboarding formal.',
      ref: BRIDGE,
      validado: true
    },

    quotaSdr: {
      rotulo: 'SDRs já rampados que batem a meta',
      valor: 68,
      unidade: '%',
      faixa: '68%',
      leitura: 'Um a cada três não bate — mesmo depois de rampado.',
      ref: BRIDGE,
      validado: true
    },

    /* ---- faixas convergentes, fonte primária ainda não confirmada ---- */

    reuniaoVenda: {
      rotulo: 'Reunião realizada → venda',
      valor: 20,
      unidade: '%',
      faixa: '15% a 25%',
      leitura: 'Faixa usada como referência quando o lead não tem o número. '
             + 'Ancorada no win rate de oportunidade da Ebsta × Pavilion (19%).',
      ref: EBSTA,
      validado: false
    },

    coldCallReuniao: {
      rotulo: 'Ligação fria → reunião',
      valor: 2.5,
      unidade: '%',
      faixa: '~2,5%',
      leitura: 'Cerca de 1 reunião a cada 40 discagens em lista fria. '
             + 'Conta com sinal e decisor certo muda essa matemática.',
      ref: { fonte: 'Convergência de publicações do setor', detalhe: 'confirmar fonte primária',
             ano: 2025, url: '' },
      validado: false
    },

    noShow: {
      rotulo: 'No-show em reunião agendada',
      valor: 30,
      unidade: '%',
      faixa: '20% a 40%',
      leitura: 'Um terço da agenda evapora. Reunião marcada para daqui a duas semanas '
             + 'cai para menos de 35% de comparecimento.',
      ref: { fonte: 'Convergência de publicações do setor', detalhe: 'confirmar fonte primária',
             ano: 2025, url: '' },
      validado: false
    }
  };

  /* -----------------------------------------------------------------
     O BANHO DE MERCADO — o que entra na tela 6
     Cada linha compara o número DELE com a referência.
     ----------------------------------------------------------------- */
  var COMPARATIVO = [
    { chave: 'reuniaoVenda',
      titulo: 'A sua conversão',
      dele: function (e) { return e.taxaConversao; },
      formato: 'pct',
      melhorQuando: 'maior' },

    { chave: 'winRate',
      titulo: 'O mercado inteiro',
      dele: null,
      formato: 'pct' },

    { chave: 'metaPerdida',
      titulo: 'Quem não bate meta',
      dele: null,
      formato: 'pct' },

    { chave: 'rampagem',
      titulo: 'Rampagem do vendedor novo',
      dele: null,
      formato: 'meses' }
  ];

  /** Devolve o número de referência para uma chave, ou null. */
  function valor(chave) {
    return DADOS[chave] ? DADOS[chave].valor : null;
  }

  /** Fonte formatada para exibir na tela, junto do número. */
  function credito(chave) {
    var d = DADOS[chave];
    if (!d) return '';
    return d.ref.fonte + (d.ref.ano ? ' · ' + d.ref.ano : '');
  }

  window.Benchmarks = {
    DADOS: DADOS,
    COMPARATIVO: COMPARATIVO,
    valor: valor,
    credito: credito,
    /** Taxa reunião→venda de referência, usada quando o lead não sabe. */
    TAXA_REFERENCIA: DADOS.reuniaoVenda.valor
  };
})();
