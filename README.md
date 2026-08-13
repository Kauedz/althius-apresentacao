# Apresentação de reunião — Althius

A tela que o closer compartilha na call. Diagnóstico ao vivo → Pit 01 → deck de 7 slides
→ preço, na sequência do **Playbook Comercial da Althius**.

Identidade visual herdada de `althius.com.br/servicos`. Sem back-end: tudo roda no
navegador, nenhum dado sai da máquina.

> Material comercial interno. O `presenter.html` carrega o método inteiro — scripts
> literais, antecipação de objeção, técnicas — e o deck traz a tabela de preços.
> Repositório privado por isso.

---

## Rodar

```bash
python .dev-server.py 5177
```

| Página | Para quê |
|---|---|
| `apresentacao.html` | **A apresentação.** É esta que você compartilha. |
| `presenter.html` | Suas notas. Abre em janela separada com `N` — **nunca compartilhe**. |
| `resultado.html` | O follow-up. Gerado pelo botão *Exportar Raio-X*, pronto para virar PDF. |

`.dev-server.py` é o `http.server` da biblioteca padrão com `Cache-Control: no-store` —
sem isso o Chrome guarda CSS e JS por heurística e você edita sem ver a mudança.
Os `<link>` e `<script>` também carregam `?v=`: **suba o número ao mexer em CSS ou JS**
se for publicar atrás de um servidor que cacheia.

---

## A sequência (12 telas)

| # | Tela | Playbook | O que o lead vê |
|---|---|---|---|
| 1 | Abertura | slide 40 | Nome da conta. O acordo sim-ou-não você **fala**. |
| 2 | **Raio-X ao vivo** | 36, 41–44 | Entradas que você digita, saídas que calculam sozinhas. |
| 3 | **Mapa da Máquina** | 38 | 5 colunas. Cada vazamento vira laranja com um clique. |
| 4 | Pit 01 | 45–46 | Só a pergunta e o dial de 0 a 10. |
| 5 | O gap — deck 1/7 | 49 | Número gigante laranja, fundo preto. |
| 6 | Por que o gap existe — 2/7 | 49 | Uma frase, editável. |
| 7 | A máquina — 3/7 | 47, 49 | ICP → Sinais → Cadência + empilhamento com as palavras dele. |
| 8 | O vídeo — 4/7 | 48, 49 | Vídeo da plataforma, 2–3 min. |
| 9 | Você viveu isso — 5/7 | 48, 49 | Detecção → decisores → ligação → hoje. |
| 10 | Plano de 14 dias — 6/7 | 49 | Kickoff → ICP → sinais → primeiras reuniões. |
| 11 | Investimento — 7/7 | 50, 55, 57 | Degraus **ao lado dos números dele**. |
| 12 | Fechamento | 50 | Kickoff, dia e hora. |

Pit 01 vem **antes** do deck porque o deck só existe no Pit 02 (slide 49: *"da abertura
ao Pit 01, a tela é o Raio-X e o Mapa"*).

### O que a tela não mostra

Nada do que você fala. Sem script, sem técnica, sem "quem é o decisor", sem antecipação
de objeção. Isso vive no `presenter.html`, em **janela separada** — compartilhe só a
janela da apresentação.

Fora também, por regra do slide 49: slide de "quem somos", linha do tempo institucional,
logos de tecnologia. A autoridade é provada na tela 9, pelo produto.

### Regras do método que a ferramenta força

1. **Preço nunca antes da predisposição** (slide 57) — a tela de investimento fica
   **travada** até a nota do Pit 01 ser registrada.
2. **O preço nunca aparece pelado** — a coluna esquerda traz custo por reunião, receita
   em risco e rampagem antes dos degraus.
3. **Frase-âncora antes do número** — *"é justo que muito custe aquilo que muito vale"*
   fica acima dos degraus.
4. **O número fica visível o resto da reunião** (slide 42) — a barra HUD acompanha todas
   as telas depois do Raio-X.
5. **Diagnóstico com ferramenta na tela** (slide 35) — tudo recalcula a cada tecla.

---

## Pré-call (slide 39)

Ao abrir, a primeira tela pede o que já veio da ligação: empresa, reuniões/semana, custo
mensal citado, data da detecção da vaga e data da ligação. Os dois primeiros alimentam o
Raio-X; os dois últimos, a linha do tempo da tela 9.

O custo citado aparece ao lado do calculado, para reconciliar ao vivo — *"você me falou
70 mil, a planilha deu 71.500, bate?"*

O estado inteiro fica em `localStorage`: dá para preparar a conta 10 minutos antes e
fechar a aba. "Limpar sessão anterior" zera para a próxima call.

---

## O alerta de incoerência

Se a taxa que o lead **declara** divergir mais de 25% da taxa que os números dele
**dizem** (`vendas/mês ÷ reuniões/mês`), a tela acende um alerta com as duas contas.

Exemplo: ele declara 30%, mas 6 vendas em 52 reuniões dão **11,5%**. O gap vai de 14,7
para 121,2 reuniões/mês — receita em risco de R$ 110.300 para **R$ 350.000**. A pergunta
que nasce daí (*"qual dos dois a gente usa?"*) é o melhor momento do diagnóstico. Dois
botões: usar a taxa real ou manter a declarada.

---

## Calculadora flutuante

Botão **Calculadora** ou tecla `C`. Para fazer a conta na frente dele em vez de anunciar
o resultado pronto.

- Arrastável pelo cabeçalho, posição guardada entre sessões, sempre limitada à área
  visível. **Duplo clique no cabeçalho** devolve ao canto padrão.
- Continua visível com `H`, que esconde só a barra de ferramentas.
- **Fita de histórico**: as últimas contas ficam acima do visor.
- **Chips do Raio-X**: custo mês · reuniões/mês · custo/reunião · gap · risco/mês ·
  ticket. Um clique joga o número no visor e registra de onde veio.
- Teclado completo; digitar não vira slide, e as setas continuam navegando.

> **Numa demonstração ao vivo:** o chip *Gap* insere `14,71`, não o exato `14,706666…`.
> Recalcular na mão (`14,71 × 7.500 = 110.325`) não bate com o `R$ 110.300` do slide.
> Para mostrar esse número, use o chip **Risco/mês** direto.

---

## Atalhos

| Tecla | Ação |
|---|---|
| `→` `←` `Espaço` | Navega (desativado enquanto digita num campo) |
| `C` | Abre/fecha a calculadora |
| `N` | Abre a janela do apresentador |
| `F` | Tela cheia |
| `H` | Esconde a barra de ferramentas (antes de compartilhar) |
| `P` | Volta ao pré-call |
| `Esc` | Sai do campo · fecha a calculadora |

---

## Assets que faltam

| O quê | Onde | Estado |
|---|---|---|
| Vídeo da plataforma (2–3 min, cortado) | `assets/video/plataforma.mp4` | **pendente** — a tela 8 mostra um placeholder. Alternativa: abrir com `?video=URL`. |
| Print do sinal (a vaga + datas) | `assets/img/sinal.png` | **pendente** — troque a cada conta. |

Nenhum dos dois quebra a apresentação. Se o mp4 passar de 100 MB, o GitHub recusa —
use Git LFS ou hospede o vídeo e passe `?video=`.

---

## Fórmulas

Fonte única: [`scripts/raiox-engine.js`](scripts/raiox-engine.js), função `calcular()`.
Constantes: `ENCARGOS_CLT = 1.7` · `SEMANAS_POR_MES = 4.33` · `TAXA_PADRAO = 30` ·
`MESES_RAMPAGEM = 3`. Playbook, slide 36.

```js
custo_mensal_total       = folha_bruta * 1.7 + ferramentas_mes
custo_por_reuniao        = custo_mensal_total / (reunioes_semana * 4.33)
custo_por_venda          = custo_mensal_total / vendas_mes            // CAC comercial
vendas_necessarias_mes   = meta_faturamento_trimestre / 3 / ticket_medio
reunioes_necessarias_mes = vendas_necessarias_mes / (taxa_conversao / 100)
gap_reunioes             = reunioes_necessarias_mes - (reunioes_semana * 4.33)
receita_em_risco_mes     = gap_reunioes * (taxa_conversao / 100) * ticket_medio
custo_rampagem           = (salario_novo * 1.7 + ferramentas_mes) * 3
taxa_implicita           = vendas_mes / (reunioes_semana * 4.33) * 100
```

### Regras de exibição

| Regra | Implementação |
|---|---|
| Gap ≤ 0 | Não exibe negativo: vira **"Operação dentro da meta"**, risco `R$ 0`. |
| Moeda | `Intl.NumberFormat('pt-BR', BRL, maximumFractionDigits: 0)`. |
| Gap | Exibido em múltiplos de **0,5** com `≈`; o exato aparece abaixo. **A receita em risco usa o gap exato.** |
| Divisão por zero | Retorna `null` e exibe `—`, nunca `Infinity`. |

### Caso de referência (conferido)

Meta `1500000` · ticket `25000` · reuniões/sem `12` · vendas/mês `6` · taxa `30` ·
pessoas `4` · folha `40000` · ferramentas `3500` · vaga `4000`.

| Saída | Exato | Exibido |
|---|---|---|
| Custo mensal total | `71.500` | `R$ 71.500` |
| Reuniões/mês atuais | `51,96` | `52` |
| **Custo por reunião** | `1.376,0585…` | **`R$ 1.376`** |
| Custo por venda (CAC) | `11.916,66…` | `R$ 11.917` |
| Reuniões necessárias/mês | `66,6667` | `66,7` |
| **Gap** | `14,7067` | **`≈ 14,5`** |
| **Receita em risco/mês** | `110.300` | **`R$ 110.300`** |
| Rampagem (3 meses) | `30.900` | `R$ 30.900` |

No console: `RaioXEngine.calcular({...})`. Na apresentação, `window.Deck` expõe
`estado`, `calc()` e `irPara(i)`; `window.Calc` controla a calculadora.

---

## Estrutura

```
apresentacao.html       a tela da reunião
presenter.html          notas do closer (janela separada)
resultado.html          follow-up · gerado por "Exportar Raio-X"
.dev-server.py          servidor local sem cache
styles/
  main.css              sistema visual herdado de /servicos
  apresentacao.css      layout de deck + calculadora
scripts/
  raiox-engine.js       FONTE ÚNICA das fórmulas
  apresentacao.js       runtime do deck
  calculadora.js        calculadora flutuante
  diagnostico.js        renderização do relatório de follow-up
  animations.js         reveal, count-up, nav
assets/img/             logo e marca
assets/video/           coloque plataforma.mp4 aqui
```

---

## Onde mexer

| O quê | Onde |
|---|---|
| Degraus e mensalidade | `apresentacao.html` → `#degraus`, `.mensalidade` |
| Módulos da plataforma | `apresentacao.html` → `.modulos` |
| Empilhamento padrão | `scripts/apresentacao.js` → `STACK_PADRAO` |
| Notas do closer | `presenter.html` → objeto `NOTAS` |
| Chips da calculadora | `scripts/calculadora.js` → `montarChips()` |
| Constantes do modelo | `scripts/raiox-engine.js` → topo |
| Limiar do alerta | `raiox-engine.js` → `razao >= 1.25 \|\| razao <= 0.8` |

As faixas de Growth e Scale são as do slide 55, marcadas ali como **hipótese**: calibrem
pelo custo real de entrega antes da primeira call com o degrau novo (slide 58 — margem
mínima de 60–70%).
