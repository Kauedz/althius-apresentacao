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

## Quando ele não sabe o número — e ele quase nunca sabe

Cada campo do Raio-X tem um **`?`** ao lado. Clicar abre os caminhos para chegar num
número defensável na frente dele, em três modos:

| Modo | Como funciona | Exemplo |
|---|---|---|
| **Escada** | Faixas para ele escolher — a escada de ancoragem do playbook | Ticket: *até 5 mil · 5 a 15 · 15 a 50 · 50 a 150 · acima* |
| **Derivar** | Calcula a partir do que ele já respondeu, com a explicação em texto | *4 pessoas × 3 reuniões/semana = 12 no time* |
| **Composição** | Monta somando perfis | *2 SDR júnior + 2 closers = R$ 15.000 de folha* |

Os campos de derivação **se pré-preenchem** com o que já está no diagnóstico. Reuniões
por semana tem três caminhos, incluindo o reverso (a partir das vendas) e o chute
assistido — porque esse é o número que mais falta.

Todo valor que sai daí marca o campo em **laranja tracejado**. Digitar por cima devolve
o número para ele.

### O medidor de confiança

No rodapé do Raio-X: quantos números vieram dele contra quantos foram estimados juntos.

> *"3 de 3 números a gente estimou junto porque não estavam na ponta da língua. Isso não
> invalida a conta — mas já é parte do diagnóstico: o que não é medido não é gerenciado."*

O medidor fica âmbar quando metade ou mais é estimativa. **É argumento, não deboche** — a
nota do apresentador traz a frase pronta e o aviso de tom.

---

## Espaçamento

Todo o ritmo vertical sai de **uma escala só**, no topo de `apresentacao.css`:

```css
--s1: 8px    --s2: 12px    --s3: 16px    --s4: 24px    --s5: 34px
```

O cabeçalho de toda tela segue a mesma regra: `tag` → 16px → `título` → 12px →
`subtítulo` → 24px → conteúdo. Sem subtítulo, o título assume os 24px.

Rótulos de subseção usam `.secao` (34px acima, 12px abaixo). A nota final de tela usa
`.nota-tela`. **Nada de margem solta no HTML** — se precisar de espaço, é `.mt-3`,
`.mt-4`, `.mb-3` ou `.mb-4`.

---

## O funil de mercado (tela 8)

TAM, SAM, SOM e as contas com sinal desenhados como **anéis concêntricos** em SVG, com a
hierarquia visual invertida de propósito: o anel externo (TAM) é o mais apagado, e o peso
cresce para dentro — o SOM ganha contorno laranja e o núcleo de sinal vem preenchido.
Quem olha vai direto ao que importa.

Do SOM saem os dois ramos: as contas com sinal (prospecção ativa agora) e o restante
(geração de demanda). Os quatro números são editáveis na linha abaixo do diagrama e o
SVG recalcula ao vivo, inclusive o restante (SOM − sinal).

---

## Índice para saltar telas (tecla `I`)

São 21 telas. Nem toda call comporta todas. O índice lista tudo, marca as **opcionais**
em âmbar e salta com um clique. As cinco telas de aprofundamento do método (escopo, ICP,
personas, processo de compra e processos) são as puláveis quando a reunião está curta ou
o lead já está quente.

---

## A sequência (21 telas)

Três atos: **diagnóstico** (1–5) · **predisposição** (6) · **Pit 02** (7–21).

| # | Tela | Origem | O que o lead vê |
|---|---|---|---|
| 1 | Abertura | playbook 40 | Nome da conta. O acordo de resposta clara você **fala**. |
| 2 | **Raio-X ao vivo** | 36, 41–44 | Entradas que você digita, saídas que calculam sozinhas. |
| 3 | **Mapa da Máquina** | 38 | 5 colunas. Cada vazamento vira laranja com um clique. |
| 4 | **O gap** | 43, 49 | Número gigante laranja, fundo preto. Fecha o diagnóstico. |
| 5 | **O que o mercado faz** | benchmarks | Os números do setor, com fonte em cada um. |
| 6 | **Pit 01** | 45–46 | Só a pergunta e o dial de 0 a 10. |
| 7 | Por que o gap existe — deck 1 | 49 | Uma frase, editável. Abre o Pit 02. |
| 8 | **A máquina** — 2 | 47, 49 | ICP → Sinais → Cadência + empilhamento com as palavras dele. |
| 9 | O que é a Althius — 3 | Revenue OS | A definição e os 12 itens do modelo que combatemos. |
| 10 | O que construímos ᵒᵖᶜ — 4 | Revenue OS | 40 variáveis · 5 personas · 9 processos · 14 motions. |
| 11 | Construção do ICP ᵒᵖᶜ — 5 | Revenue OS | Quem compra e por que compraria, em 27 variáveis. |
| 12 | Personas e matriz de dor ᵒᵖᶜ — 6 | Revenue OS | Os 5 papéis + urgência/consciência/gravidade/frequência. |
| 13 | O processo de compra ᵒᵖᶜ — 7 | Revenue OS | Objeções, alternativas, riscos percebidos, posicionamento. |
| 14 | Os 9 processos ᵒᵖᶜ — 8 | Revenue OS | Com alternador *construímos* / *otimizamos*. |
| 15 | TAM · SAM · SOM — 9 | Revenue OS | Anéis concêntricos + as duas frentes saindo do SOM. |
| 16 | Dado × orquestração — 10 | Revenue OS | Comparativo com ferramenta de dados + as 14 motions. |
| 17 | O vídeo — 11 | 48, 49 | Vídeo da plataforma, 2–3 min. |
| 18 | Você viveu isso — 12 | 48, 49 | Detecção → decisores → ligação → hoje, com o print do sinal. |
| 19 | Plano de 14 dias — 13 | 49 | Kickoff → ICP → sinais → primeiras reuniões. |
| 20 | Investimento — 14 | 50, 55, 57 | Degraus **ao lado dos números dele**. |
| 21 | Fechamento | 50 | Kickoff, dia e hora. |

ᵒᵖᶜ = marcada como opcional no índice.

### Por que a ordem é esta

**O Pit 01 fica antes de qualquer coisa sobre a Althius.** Nota alta dada *antes* da
solução é declaração sobre a dor dele — e trava a objeção no fechamento. Nota alta dada
*depois* é elogio a vocês, e elogio não segura preço. Além disso é válvula: se a nota vier
baixa, você não gastou 20 minutos de aula com quem não ia avançar (slide 57, regra 1).

**Mas o gap gigante e o banho de mercado vêm antes dele.** Nenhum dos dois fala da
Althius — um é o número dele em tamanho de impacto, o outro mostra que o buraco é
estrutural do setor. Os dois aumentam a consciência da dor, que é o que a nota do Pit 01
deveria estar medindo. Sem eles, ele dá a nota tendo visto o gap só como uma linha na
coluna de saídas da planilha.

**O Pit 02 abre pelo empilhamento, não pelo institucional.** Você acabou de virar a
energia; a próxima coisa que ele ouve tem que ser as próprias palavras de volta. A aula
vem depois, apoiada nessa reconexão — e é ela que pode ser pulada, não o contrário.

> **Tensão com o playbook, declarada:** o slide 49 pede *"7 slides, nem um a mais"*. O
> deck tem 14. O aprofundamento ganha o lead que não conhece o próprio mercado nem o
> próprio processo, mas alonga o Pit 02. Use o índice (`I`) para montar a versão da
> reunião: o caminho enxuto é pular as cinco opcionais (telas 10 a 14).

### Uma escolha de tom que fiz de propósito

O pedido era deixar o lead sem chão. As telas entregam a profundidade inteira, mas a
carga é o **tamanho do escopo**, não o insulto — o playbook é explícito no slide 43:
*o vilão é o gap, não o time dele*. As notas do apresentador reforçam isso em cada tela
nova ("quem diz que não conseguiria fazer é ele; se você disser, ele defende"). Ele chega
à conclusão sozinho, e chega sem estar na defensiva.

### O que a tela não mostra

Nada do que você fala. Sem script, sem técnica, sem "quem é o decisor", sem antecipação
de objeção. Isso vive no `presenter.html`, em **janela separada** — compartilhe só a
janela da apresentação.

### O roteiro do apresentador

As 21 telas têm roteiro completo, com tempo estimado e sete tipos de bloco:

| Bloco | Para quê |
|---|---|
| **Você fala** | Texto literal — pode ler assim, trocando nome e número |
| **◆ A pergunta** | A pergunta que carrega a tela |
| **Pausa** | Onde calar e deixar o silêncio trabalhar |
| **Por que funciona** | O mecanismo por trás |
| **Se ele disser** | Objeção prevista e a resposta |
| **Ponte** | Como emendar na próxima tela |
| **Cuidado** | O que derruba a etapa |

A estrutura é o Método Closer Faixa Preta; a **linguagem é a dos sócios**: incisiva pelo
critério, neutra no tom. A régua completa fica no topo da janela do apresentador, num
bloco recolhível. Em resumo:

- **Firmeza vem de ter critério e dizer não quando é não** — nunca de falar grosso.
- **Confronte o número, nunca a pessoa.** *"Esses dois números não fecham entre si"*
  funciona; *"você não está entendendo"* perde a reunião.
- **Enquadre antes de apertar.** Toda pergunta dura vem depois do motivo dela.
- **Saída digna sempre aberta** — reduz a pressão e aumenta a decisão.
- **Somos dois e entregamos junto**: a agenda é curta de verdade, então vocês também
  escolhem. Dito como fato, não como ameaça.

Exemplos do que mudou em relação ao registro original do método:

| Antes | Agora |
|---|---|
| *"'Vou pensar' não ajuda nem você nem eu"* | *"Se for não, tudo bem — prefiro saber hoje do que ficar te procurando"* |
| *"Você não entendeu a pergunta"* | *"A minha pergunta era outra e eu não fui claro"* |
| *"Me convence"* | *"Me ajuda a entender o que faz de vocês uma conta que vale essa agenda"* |
| *"Odeio o cara que tenta se burlar no fim"* | *"Já aconteceu da gente travar no fim por algo que dava pra resolver no começo"* |
| *"Desconto não existe"* | *"Desconto eu não faço, e vou te explicar o porquê…"* |

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
mensal citado, data da detecção da vaga, data da ligação — e o **print do sinal**.

O custo citado aparece ao lado do calculado, para reconciliar ao vivo — *"você me falou
70 mil, a planilha deu 71.500, bate?"*

### O print do sinal

É a prova viva da tela 12: a vaga que ele abriu, com as datas. Sem ela, o slide vira
promessa em vez de prova.

- **Tamanho ideal: 1280 × 800 px, proporção 16:10.** Fora disso ainda entra — só fica
  mais alto ou mais baixo no quadro.
- Arraste na área ou clique para escolher. PNG, JPG ou WebP.
- A imagem é **redimensionada no navegador** para 1280 px de largura e recomprimida antes
  de guardar; um print de tela cru estouraria a cota do `localStorage`.
- A prévia mostra as dimensões originais, o peso final e avisa em laranja se a proporção
  estiver longe de 16:10.
- Fica numa chave separada (`althius_deck_sinal_v1`), fora do JSON principal — senão o
  data URL seria reserializado a cada tecla do diagnóstico e travaria a digitação.

O estado inteiro fica em `localStorage`: dá para preparar a conta 10 minutos antes e
fechar a aba. "Limpar sessão anterior" zera tudo, imagem inclusive.

---

## Quando o lead não sabe os próprios números

A maioria dos sócios não tem a taxa de conversão na cabeça. Em vez de chutar 30%, o campo
tem o botão **"Não sei · usar mercado"**: aplica a referência de mercado, recalcula o gap
na hora e escreve a fonte ao lado do campo. Digitar por cima desliga o botão — o número
volta a ser dele.

E a tela 6 é o banho de mercado: seis números do setor com a fonte visível em cada card,
mais um sétimo card com a conversão que ELE declarou, comparada com a média.

Os dados vivem em [`scripts/benchmarks.js`](scripts/benchmarks.js). **Regra do arquivo:
nenhum número entra sem `fonte`, `ano` e `url`.** Quem aparece hoje:

| Número | Valor | Fonte |
|---|---|---|
| Oportunidade → venda | 19% | Ebsta × Pavilion · 2025 GTM Benchmarks |
| Vendedores que não bateram meta | 78% | Ebsta × Pavilion · 2025 |
| Fechado em até 50 dias | 47% × 20% | Ebsta × Pavilion · 2025 |
| Decisor envolvido desde o início | +55% de win rate | Ebsta × Pavilion · 2025 |
| Rampagem até 80% da meta | 3,9 meses | The Bridge Group · 2025 |
| SDRs rampados que batem meta | 68% | The Bridge Group · 2025 |

Três entradas do arquivo estão marcadas `validado: false` — reunião→venda, ligação fria →
reunião e no-show. São faixas convergentes entre publicações do setor, **sem confirmação
na fonte primária**. Elas não entram no grid da tela 6; a de reunião→venda é usada só como
referência do botão "não sei". Confirme a fonte ou troque por dado da própria carteira da
Althius antes de tratá-las como fato numa call. Um card marcado `validado: false` que
chegue à tela exibe o selo laranja *"fonte a confirmar"*.

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
| `I` | Índice das 21 telas — salta para qualquer uma |
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
| Vídeo da plataforma (2–3 min, cortado) | `assets/video/plataforma.mp4` | **pendente** — a tela 11 mostra um placeholder. Alternativa: abrir com `?video=URL`. |
| Print do sinal (a vaga + datas) | subido no pré-call | por conta — troque a cada call. |

O vídeo não quebra a apresentação se faltar. Se o mp4 passar de 100 MB, o GitHub recusa —
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
  benchmarks.js         dados de mercado + fontes
  estimadores.js        caminhos para quando ele não sabe o número
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
| Dados de mercado e fontes | `scripts/benchmarks.js` → `DADOS` |
| Faixas e fórmulas dos estimadores | `scripts/estimadores.js` → `ESTIMADORES` |
| Salários de referência por perfil | `scripts/estimadores.js` → `SALARIO` |
| Os 9 processos | `scripts/apresentacao.js` → `PROCESSOS` |
| As 14 motions de GTM | `scripts/apresentacao.js` → `MOTIONS` |
| Tamanho recomendado do print | `scripts/apresentacao.js` → `LARGURA_MAX`, `PROPORCAO_ALVO` |
| Empilhamento padrão | `scripts/apresentacao.js` → `STACK_PADRAO` |
| Roteiro do closer | `presenter.html` → objeto `ROTEIRO` |
| Régua de tom | `presenter.html` → bloco `.pv_tom` |
| Chips da calculadora | `scripts/calculadora.js` → `montarChips()` |
| Constantes do modelo | `scripts/raiox-engine.js` → topo |
| Limiar do alerta | `raiox-engine.js` → `razao >= 1.25 \|\| razao <= 0.8` |

As faixas de Growth e Scale são as do slide 55, marcadas ali como **hipótese**: calibrem
pelo custo real de entrega antes da primeira call com o degrau novo (slide 58 — margem
mínima de 60–70%).
