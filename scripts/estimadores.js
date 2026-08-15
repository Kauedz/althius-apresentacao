/* =====================================================================
   ESTIMADORES — Althius
   O sócio quase nunca tem os números na cabeça. "Não sei" não pode
   travar o diagnóstico: cada campo do Raio-X tem um caminho para
   chegar num número defensável na frente dele.

   Dois modos:
     escada  — faixas para ele escolher (a escada de ancoragem do
               playbook: "30 mil? … 20? … 10?")
     derivar — calcula a partir do que ele JÁ respondeu

   Todo número que sai daqui fica marcado como estimado. O medidor de
   confiança conta quantos são — e isso vira argumento: não ter os
   próprios números já é parte do diagnóstico.
   ===================================================================== */
(function () {
  'use strict';

  var E = window.RaioXEngine;

  /** Faixas de salário mensal bruto por perfil, para estimar folha. */
  var SALARIO = [
    { rotulo: 'SDR / BDR júnior',        valor: 2500 },
    { rotulo: 'SDR / BDR pleno',         valor: 3500 },
    { rotulo: 'Closer / executivo',      valor: 5000 },
    { rotulo: 'Closer sênior',           valor: 8000 },
    { rotulo: 'Coordenação / gerência',  valor: 12000 }
  ];

  var ESTIMADORES = {

    metaTrimestre: {
      titulo: 'Meta do trimestre',
      caminhos: [
        {
          rotulo: 'Sei o faturamento de hoje e quanto quero crescer',
          modo: 'derivar',
          campos: [
            { k: 'faturaMes', rotulo: 'Faturamento por mês hoje', mask: 'currency' },
            { k: 'crescer', rotulo: 'Quer crescer quanto? (%)', mask: 'number', padrao: 30 }
          ],
          calcular: function (v) {
            if (!v.faturaMes) return null;
            return v.faturaMes * (1 + (v.crescer || 0) / 100) * 3;
          },
          explicar: function (v, r) {
            return 'Faturando ' + E.moeda(v.faturaMes) + '/mês e crescendo '
              + E.num(v.crescer, 0) + '%, o trimestre fecha em ' + E.moeda(r) + '.';
          }
        },
        {
          rotulo: 'Sei só a meta do ano',
          modo: 'derivar',
          campos: [{ k: 'ano', rotulo: 'Meta do ano', mask: 'currency' }],
          calcular: function (v) { return v.ano ? v.ano / 4 : null; },
          explicar: function (v, r) {
            return 'Meta do ano dividida por quatro trimestres: ' + E.moeda(r) + '.';
          }
        }
      ]
    },

    ticketMedio: {
      titulo: 'Ticket médio',
      caminhos: [
        {
          rotulo: 'Não sei o valor exato — sei a faixa',
          modo: 'escada',
          pergunta: 'Um contrato típico de vocês cai em qual faixa?',
          opcoes: [
            { rotulo: 'Até R$ 5 mil',        valor: 3000 },
            { rotulo: 'R$ 5 a 15 mil',       valor: 10000 },
            { rotulo: 'R$ 15 a 50 mil',      valor: 30000 },
            { rotulo: 'R$ 50 a 150 mil',     valor: 90000 },
            { rotulo: 'Acima de R$ 150 mil', valor: 200000 }
          ]
        },
        {
          rotulo: 'Sei o faturamento e quantos clientes fecho',
          modo: 'derivar',
          campos: [
            { k: 'faturaMes', rotulo: 'Faturamento por mês', mask: 'currency' },
            { k: 'clientes', rotulo: 'Clientes novos por mês', mask: 'number' }
          ],
          calcular: function (v) {
            return (v.faturaMes && v.clientes) ? v.faturaMes / v.clientes : null;
          },
          explicar: function (v, r) {
            return E.moeda(v.faturaMes) + ' dividido por ' + E.num(v.clientes, 0)
              + ' clientes dá ' + E.moeda(r) + ' por contrato.';
          }
        }
      ]
    },

    reunioesSemana: {
      titulo: 'Reuniões por semana',
      caminhos: [
        {
          rotulo: 'Sei quantas cada vendedor faz',
          modo: 'derivar',
          campos: [
            { k: 'pessoas', rotulo: 'Pessoas que fazem reunião', mask: 'number', de: 'pessoasComercial' },
            { k: 'porPessoa', rotulo: 'Reuniões por pessoa/semana', mask: 'number', padrao: 3 }
          ],
          calcular: function (v) {
            return (v.pessoas && v.porPessoa) ? v.pessoas * v.porPessoa : null;
          },
          explicar: function (v, r) {
            return E.num(v.pessoas, 0) + ' pessoa(s) × ' + E.num(v.porPessoa, 1)
              + ' reuniões por semana = ' + E.num(r, 1) + ' reuniões/semana no time.';
          }
        },
        {
          rotulo: 'Sei quantas vendas fecho — calcula de trás pra frente',
          modo: 'derivar',
          campos: [
            { k: 'vendas', rotulo: 'Vendas por mês', mask: 'number', de: 'vendasMes' },
            { k: 'taxa', rotulo: 'De cada 10 reuniões, quantas fecham?', mask: 'number', padrao: 2 }
          ],
          calcular: function (v) {
            if (!v.vendas || !v.taxa) return null;
            return (v.vendas / (v.taxa / 10)) / E.SEMANAS_POR_MES;
          },
          explicar: function (v, r) {
            return 'Se ' + E.num(v.taxa, 0) + ' em cada 10 reuniões fecham, '
              + E.num(v.vendas, 0) + ' vendas/mês exigem '
              + E.num(v.vendas / (v.taxa / 10), 0) + ' reuniões/mês — ou '
              + E.num(r, 1) + ' por semana.';
          }
        },
        {
          rotulo: 'Não faço ideia — chuta comigo',
          modo: 'escada',
          pergunta: 'No time todo, mais perto de quanto por semana?',
          opcoes: [
            { rotulo: 'Menos de 5',  valor: 3 },
            { rotulo: '5 a 10',      valor: 7 },
            { rotulo: '10 a 20',     valor: 15 },
            { rotulo: '20 a 40',     valor: 30 },
            { rotulo: 'Mais de 40',  valor: 50 }
          ]
        }
      ]
    },

    vendasMes: {
      titulo: 'Vendas por mês',
      caminhos: [
        {
          rotulo: 'Sei o faturamento e o ticket',
          modo: 'derivar',
          campos: [
            { k: 'faturaMes', rotulo: 'Faturamento por mês', mask: 'currency' },
            { k: 'ticket', rotulo: 'Ticket médio', mask: 'currency', de: 'ticketMedio' }
          ],
          calcular: function (v) {
            return (v.faturaMes && v.ticket) ? v.faturaMes / v.ticket : null;
          },
          explicar: function (v, r) {
            return E.moeda(v.faturaMes) + ' ÷ ' + E.moeda(v.ticket) + ' = '
              + E.num(r, 1) + ' vendas por mês.';
          }
        },
        {
          rotulo: 'Sei mais ou menos o volume',
          modo: 'escada',
          pergunta: 'Quantos contratos novos entram por mês?',
          opcoes: [
            { rotulo: '1 ou 2',      valor: 1.5 },
            { rotulo: '3 a 5',       valor: 4 },
            { rotulo: '6 a 10',      valor: 8 },
            { rotulo: '11 a 20',     valor: 15 },
            { rotulo: 'Mais de 20',  valor: 30 }
          ]
        }
      ]
    },

    folhaBruta: {
      titulo: 'Folha bruta do comercial',
      caminhos: [
        {
          rotulo: 'Monta comigo por perfil',
          modo: 'composicao',
          pergunta: 'Quantas pessoas de cada perfil no comercial?',
          linhas: SALARIO
        },
        {
          rotulo: 'Sei o custo total que citei na ligação',
          modo: 'derivar',
          campos: [
            { k: 'total', rotulo: 'Custo total do comercial/mês', mask: 'currency', de: 'custoCitado' },
            { k: 'ferr', rotulo: 'Quanto disso é ferramenta', mask: 'currency', de: 'ferramentasMes' }
          ],
          calcular: function (v) {
            if (!v.total) return null;
            var liquido = v.total - (v.ferr || 0);
            return liquido > 0 ? liquido / E.ENCARGOS_CLT : null;
          },
          explicar: function (v, r) {
            return 'Tirando ' + E.moeda(v.ferr || 0) + ' de ferramentas e desfazendo os '
              + 'encargos (÷ 1,7), a folha bruta fica em ' + E.moeda(r) + '.';
          }
        }
      ]
    },

    ferramentasMes: {
      titulo: 'Ferramentas por mês',
      caminhos: [
        {
          rotulo: 'Não sei somar — escolhe a faixa',
          modo: 'escada',
          pergunta: 'CRM, base de dados, telefonia, automação. Mais perto de quanto?',
          opcoes: [
            { rotulo: 'Quase nada / planilha', valor: 0 },
            { rotulo: 'Até R$ 1.000',          valor: 700 },
            { rotulo: 'R$ 1.000 a 3.000',      valor: 2000 },
            { rotulo: 'R$ 3.000 a 8.000',      valor: 5000 },
            { rotulo: 'Acima de R$ 8.000',     valor: 12000 }
          ]
        }
      ]
    },

    salarioNovo: {
      titulo: 'Salário da vaga aberta',
      caminhos: [
        {
          rotulo: 'Escolhe o perfil da vaga',
          modo: 'escada',
          pergunta: 'Que perfil vocês estão contratando?',
          opcoes: SALARIO.map(function (s) {
            return { rotulo: s.rotulo + ' · ' + E.moeda(s.valor), valor: s.valor };
          })
        }
      ]
    }
  };

  window.Estimadores = { MAPA: ESTIMADORES, SALARIO: SALARIO };
})();
