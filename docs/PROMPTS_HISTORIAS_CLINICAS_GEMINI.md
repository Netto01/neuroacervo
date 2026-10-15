# Guia Mestre de Prompts para o Gemini: 50 Histórias Clínicas do NeuroAcervo

Este documento foi elaborado para guiar a geração das **50 ilustrações** das Histórias Clínicas do **NeuroAcervo** utilizando o **Google Gemini** (Gemini Advanced / Google AI Studio com Imagen 3).

---

## 1. Diretrizes Mestras de Estilo (Style Anchor)

Para garantir **máxima consistência artística** entre todas as 50 ilustrações, cada prompt foi construído sobre uma base estética unificada:

* **Estilo Artístico**: Ilustração editorial 2D contemporânea com textura sutil e orgânica (estilo livro ilustrado e terapêutico moderno). Traço limpo, elegante e acolhedor, sem excesso de ruído visual.
* **Paleta de Cores**: Tons terrosos, acolhedores e equilibrados (bege suave, verde musgo, azul acinzentado, terracota, mostarda e ameixa suave). Evitar cores fluorescentes ou neon.
* **Proporção**: **16:9** (Widescreen paisagem), ideal para visualização em tablets, monitores de consultório e para o Modo Paciente em tela cheia da plataforma.
* **Foco da Cena**: **Momento do gatilho emocional com pistas corporais claras**. O paciente e o terapeuta devem conseguir observar no desenho a expressão facial (olhos, boca, sobrancelhas), postura corporal (ombros tensos, punhos cerrados, mãos inquietas) e o contexto ambiental da história.
* **Progressão Etária**: A mesma técnica de pintura editorial é mantida em todas as faixas, mas o design dos personagens amadurece progressivamente (do lúdico e infantil aos 6-8 anos até a maturidade realista e elegante dos 16-19 anos).
* **Restrições Absolutas (Negative Rules)**:
  * Sem textos, números, palavras ou letras na imagem.
  * Sem balões de fala, quadrinhos ou onomatopeias.
  * Sem traços de mangá/anime estereotipado e sem render 3D hiper-realista.
  * Mãos e rostos anatomicamente corretos e proporções equilibradas.

---

## 2. Como usar no Gemini / Google AI Studio

1. **No Gemini Advanced**: Copie o prompt em inglês da história desejada e cole no chat. Se necessário, inclua o comando de aspect ratio: `--aspect_ratio 16:9` ou instrua: *"Gere esta imagem na proporção 16:9 widescreen"*.
2. **Salvamento do Arquivo**: Salve a imagem gerada no formato `.jpg` ou `.webp` dentro da pasta pública do projeto:
   `public/assets/cards/[nome_do_arquivo].jpg`
   *(exemplo: `f1_h1.jpg`)*.

---

## 3. Catálogo dos 50 Prompts Prontos para Cópia

---

### FAIXA 1: Infantil I (6 a 8 anos)
*Cenários acolhedores da infância: parquinho, sala de aula infantil, brinquedos, casa.*

#### História 1 — O Jogo de Tabuleiro
* **Arquivo**: `f1_h1.jpg`
* **Tema**: Controle inibitório / Raiva
* **Cena**: Léo perdeu no jogo de tabuleiro após 3 rodadas ruins. Rosto vermelho de raiva, punhos cerrados sobre a mesa de madeira, olhando furioso para os dados, enquanto seu amigo Davi do outro lado comemora pulando alegremente.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A 7-year-old boy sitting at a wooden table in a cozy playroom, showing intense frustration and anger: his cheeks are flushed red, his eyebrows furrowed, teeth gritted, and both fists clenched tightly on the table next to a colorful board game with scattered dice. Across the table, another young boy is standing up celebrating with raised arms and a joyful smile. Warm cozy lighting, soft muted color palette with soft purple and amber tones, rich paper texture, expressive character body language, clean composition, 16:9 widescreen, no text, no speech bubbles, high quality.
```

#### História 2 — O Lanche da Escola
* **Arquivo**: `f1_h2.jpg`
* **Tema**: Controle inibitório / Frustração
* **Cena**: Hora do lanche na escola. Ana abriu sua lancheira colorida e encontrou cenouras baby em vez de biscoitos. Ela empurra a lancheira para longe com os dois braços esticados, olhos cheios de lágrimas e boca aberta reclamando, em meio a outras crianças lanchando.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A 7-year-old girl sitting at a school cafeteria table during snack time, displaying intense disappointment and frustration. She pushes her open lunchbox away with both outstretched hands; inside the lunchbox are baby carrots instead of cookies. Her eyes are glistening with tears, her lower lip trembling in an open pout of complaint. School environment with soft background blur. Soft warm palette with muted yellow, orange and cream tones, textured digital art style, clear emotional body language, 16:9 widescreen, no text, no speech bubbles.
```

#### História 3 — A Vez de Falar
* **Arquivo**: `f1_h3.jpg`
* **Tema**: Leitura social / Esperar a vez
* **Cena**: Roda de conversa no chão da sala de aula com tapete colorido. João está de pé impulsivo, inclinado para a frente com a boca aberta gritando a resposta antes da professora terminar a pergunta. A professora faz um gesto calmo com a palma aberta pedindo paciência, e dois coleguinhas ao lado olham para João com expressões de surpresa e estranhamento.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A circle time scene on a colorful carpet in an elementary school classroom. An energetic 7-year-old boy jumps forward impulsively, mouth wide open speaking out of turn with excited wide eyes. A kind female teacher gently raises a flat hand in a calm gesture asking him to wait. Two nearby children seated on the rug look at him with puzzled and surprised expressions. Warm soft green and teal tones, tactile storybook texture, expressive social dynamics, 16:9 widescreen, no text, no speech bubbles.
```

#### História 4 — O Brinquedo do Amigo
* **Arquivo**: `f1_h4.jpg`
* **Tema**: Habilidades sociais / Compartilhar
* **Cena**: Dois meninos na brinquedoteca. Pedro com expressão tensa e decidida arranca um carrinho vermelho novo diretamente das mãos de Mateus. Mateus fica com os olhos marejados, ombros caídos e expressão de tristeza e choque ao ter seu brinquedo puxado.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. Two 7-year-old boys in a bright preschool playroom. One boy with an impatient, determined frown is snatching a shiny red toy car right out of another boy's hands. The second boy stands with slumped shoulders, wide sorrowful eyes brimming with tears and hands left empty in shock. Gentle ambient lighting, muted warm palette with olive green and soft terracotta accents, gentle paper grain texture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 5 — A Tarefa Difícil
* **Arquivo**: `f1_h5.jpg`
* **Tema**: Pensamentos automáticos / Frustração
* **Cena**: Sofia sentada em sua carteira escolar com uma folha de exercícios de matemática rasgada ao meio. Ela apoia a testa nos braços cruzados sobre a carteira em sinal de derrota total e desespero, com lápis jogado no chão.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A 8-year-old girl sitting alone at her wooden school desk, overwhelmed by a difficult math worksheet. The paper sheet is crumpled and torn on the desk, with a pencil rolling on the floor. The girl buries her face into her folded arms in defeat, her posture conveying exhaustion and self-doubt. Soft classroom morning light, muted color palette with soft grey-blue and creamy parchment tones, emotional depth, 16:9 widescreen, no text, no speech bubbles.
```

#### História 6 — O Convite
* **Arquivo**: `f1_h6.jpg`
* **Tema**: Leitura social / Inclusão
* **Cena**: No pátio do recreio, Bia está encolhida sozinha em um banco de madeira no canto, com braços cruzados e olhar magoado/emburrado voltado para o chão, enquanto a alguns metros um grupo de colegas brinca em roda. Um menino do grupo se aproxima para chamá-la, mas ela vira o rosto de lado.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A school courtyard during recess. A 7-year-old girl sits alone on a wooden bench in the corner, arms tightly crossed over her chest, looking down at the pavement with a sullen, hurt expression. A few meters away, a cheerful group of children plays a game. One boy walks toward her gesturing an invitation, but she turns her head away defensively. Gentle sunlight, soft pastel tones with muted lilac and beige, nuanced emotional atmosphere, 16:9 widescreen, no text, no speech bubbles.
```

#### História 7 — A Vez no Balanço
* **Arquivo**: `f1_h7.jpg`
* **Tema**: Controle inibitório / Esperar
* **Cena**: No parquinho ao ar livre com chão de grama e areia. Caio com os punhos cerrados e sobrancelhas franzidas de impaciência, empurrando as costas de uma menina que está balançando para tomar o lugar dela.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. A sunny outdoor playground setting. A 7-year-old boy with a tense, impatient posture and furrowed brow pushes the shoulders of a girl who is happily swinging on a swing set, trying to force her off to take her turn. The girl looks back startled. Soft golden hour outdoor light, lush greenery, muted earthy palette with warm ochre and moss green, textured editorial style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 8 — O Trabalho em Grupo
* **Arquivo**: `f1_h8.jpg`
* **Tema**: Habilidades sociais / Colaboração
* **Cena**: Três crianças ao redor de uma cartolina grande no chão. Lucas segura todos os gizes de cera contra o peito com um braço e desenha sozinho com a outra mão, ignorando os dois colegas que estão de braços cruzados e cabeças baixas, desanimados e chateados.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. Three 8-year-old children working around a large white poster paper on the classroom floor. One dominant boy clutches all the colorful crayons protectively against his chest with one arm while drawing alone, refusing to share. The other two children sit with crossed arms and dejected, disappointed expressions, pushed away from the drawing. Warm classroom setting, soft balanced palette of sand, sage green and clay, 16:9 widescreen, no text, no speech bubbles.
```

#### História 9 — O Erro na Apresentação
* **Arquivo**: `f1_h9.jpg`
* **Tema**: Pensamentos automáticos / Autocrítica
* **Cena**: Mariana de pé na frente da lousa da sala de aula para uma apresentação oral. Ela travou, cabeça baixa, bochechas ardendo de vergonha, segurando uma cartolina com as duas mãos trêmulas na frente do corpo como um escudo, enquanto duas crianças na primeira fila dão risadinhas.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. An 8-year-old girl standing in front of the chalkboard in front of her class giving a presentation. She has frozen in place, head bowed in deep embarrassment, bright red blushing cheeks, holding her cardboard presentation poster tightly in front of her chest like a protective shield. In the soft-focus foreground, two classmates chuckle. Gentle diffuse light, muted violet, cream and warm wood tones, delicate textured style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 10 — A Disputa pelo Lápis
* **Arquivo**: `f1_h10.jpg`
* **Tema**: Controle inibitório / Conflito
* **Cena**: Dois meninos sentados lado a lado puxando com força um lápis vermelho de cor ao mesmo tempo, até que o lápis se quebra ao meio com um estalo. Rafael com o rosto vermelho de fúria e dentes trincados, jogando sua metade no chão.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial storybook illustration. Two 7-year-old boys sitting at a shared school desk in intense conflict. A single red colored pencil has just snapped in half between them. One boy, with wide angry eyes and clenched jaw, throws his broken wooden half toward the floor in a fit of rage. The other boy pulls back in defensive shock. Dynamic composition, warm muted palette with bold burnt orange and navy accents, rich textured brushwork, 16:9 widescreen, no text, no speech bubbles.
```

---

### FAIXA 2: Infantil II (8 a 11 anos)
*Cenários: pátio do colégio, refeitório, feira de ciências, jogos escolares, grupos de mensagens.*

#### História 1 — O Grupinho da Sala
* **Arquivo**: `f2_h1.jpg`
* **Tema**: Leitura social / Exclusão
* **Cena**: Lucas de pé no meio do refeitório da escola segurando sua bandeja de almoço com as duas mãos, olhando paralisado e triste para uma mesa onde seus três amigos de sempre estão sentados juntos rindo, sem terem deixado lugar para ele.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 10-year-old boy standing frozen in the middle of a bustling school cafeteria, holding his lunch tray with both hands. His expression is heavy with sadness, loneliness and self-doubt. In the midground, a table of three familiar classmates is chatting and laughing together with no empty seat left for him. Depth of field effect, soft warm interior lighting, subdued color scheme with dusty blue, cream and amber, painterly texture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 2 — A Nota Baixa
* **Arquivo**: `f2_h2.jpg`
* **Tema**: Pensamentos automáticos / Autocrítica
* **Cena**: Isabela de pé ao lado da sua carteira na sala de aula vazia após a aula, amassando com raiva uma folha de prova com a nota 6 escrita em vermelho e enfiando-a no fundo da mochila sem nem olhar para os erros, com olhar sombrio e ombros curvados.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 10-year-old girl standing by her desk in an emptying classroom, shoving a crumpled test paper into the bottom of her backpack with an angry, disheartened motion. Her shoulders are slumped, her eyes dark with severe self-criticism and shame. Afternoon window light casting gentle shadows across wooden desks, muted earthy tones with terracotta and charcoal accents, sophisticated storybook texture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 3 — O Apelido
* **Arquivo**: `f2_h3.jpg`
* **Tema**: Controle inibitório / Provocação
* **Cena**: Corredor da escola durante a troca de aulas. Carlos de costas contra os armários, com o rosto vermelho, sobrancelhas cerradas e punhos levantados pronto para explodir, enquanto dois colegas no corredor apontam e riem provocando com um apelido.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 10-year-old boy standing against metal lockers in a school hallway, visibly agitated and overwhelmed. His face is crimson red with anger, hands clenched into fists, body coiled to react impulsively to provocation. In the background, two classmates smile mockingly and point toward him. Rich atmospheric perspective, warm olive, rust and denim blue tones, soft granular texture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 4 — A Mensagem no Grupo
* **Arquivo**: `f2_h4.jpg`
* **Tema**: Leitura social / Rejeição
* **Cena**: Quarto escuro à noite. Fernanda deitada na cama iluminada apenas pelo brilho azulado da tela do celular, com expressão de angústia, olhos arregalados e lábios trêmulos, rolando sem parar mensagens de um grupo onde suas amigas combinaram um passeio sem ela.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 10-year-old girl sitting up in bed in a dim bedroom at night, illuminated solely by the cold glow of her smartphone screen. Her face shows deep distress, rejection and sleepless anxiety, staring intensely at group chat messages where she wasn't invited. Cozy bedroom details in soft shadows, sophisticated palette of deep navy, indigo and warm bedside ambient glow, emotive textured style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 5 — O Projeto da Feira de Ciências
* **Arquivo**: `f2_h5.jpg`
* **Tema**: Habilidades sociais / Colaboração
* **Cena**: Bancada de ciências da escola com cartolina, maquete e tintas. Camila segura o pincel e decide tudo animada, enquanto Rodrigo está sentado ao lado de braços cruzados, calado, com o olhar ressentido e lábios apertados, sentindo-se invisível e engolindo a própria frustração.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. Two 11-year-old students working on a science fair project at a school lab bench. A girl enthusiastically takes over all the painting and poster layout, holding the supplies. Beside her, a boy sits silent with arms crossed tightly, biting his lip with suppressed resentment and feeling completely left out of his own project. Warm natural laboratory lighting, balanced palette of sage green, ochre and muted teal, 16:9 widescreen, no text, no speech bubbles.
```

#### História 6 — O Comentário do Professor
* **Arquivo**: `f2_h6.jpg`
* **Tema**: Pensamentos automáticos / Feedback
* **Cena**: Sala de aula. O professor em pé ao lado da mesa de Beatriz devolve um texto corrigido com anotações e faz um comentário crítico. O rosto de Beatriz queima de vergonha, ela encolhe o pescoço e desvia o olhar para baixo, como se quisesse desaparecer.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. An 11-year-old girl seated at her school desk as a male teacher gently hands back an essay paper with red pen corrections and feedback. The girl’s face is burning hot red with humiliation, her neck tucked into her collar, gaze averted downward in acute shame, misinterpreting constructive feedback as personal failure. Soft daylight streaming through classroom windows, warm sepia, cream and muted navy palette, 16:9 widescreen, no text, no speech bubbles.
```

#### História 7 — A Briga com o Irmão
* **Arquivo**: `f2_h7.jpg`
* **Tema**: Controle inibitório / Limites
* **Cena**: Sala de estar de casa. Tomás inclinado para a frente aos berros com o irmãozinho mais novo, que está no chão chorando com brinquedos espalhados. Na porta da sala, os pais entram com expressões severas olhando diretamente para Tomás com reprovação pelo excesso.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A home living room setting. An 11-year-old boy leaning forward aggressively shouting at his younger 5-year-old brother, who is sitting on the rug crying amidst scattered toys. In the doorway, the parents have just arrived, looking sternly and disapprovingly at the older boy for his explosive reaction. Dynamic domestic drama, warm wood and beige tones contrasted with emotional tension, textured editorial brushwork, 16:9 widescreen, no text, no speech bubbles.
```

#### História 8 — O Jogo de Futebol
* **Arquivo**: `f2_h8.jpg`
* **Tema**: Pensamentos automáticos / Autocrítica
* **Cena**: Campo de futebol da escola no final do recreio. Henrique caminha sozinho para fora do gramado de cabeça baixa e chuteiras arrastando, enquanto ao fundo um companheiro de time gesticula com raiva após perderem o jogo. Henrique tem lágrimas contidas nos olhos, sentindo-se o único culpado.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. An elementary school soccer field at the end of recess. A 10-year-old boy in a sports jersey walks alone off the grassy pitch, head bowed low and cleats dragging, holding back tears with overwhelming feelings of inadequacy. In the blurred background, a frustrated teammate gestures blamingly. Golden afternoon sunlight, soft grass textures, muted palette with athletic green, dusty yellow and warm earth tones, 16:9 widescreen, no text, no speech bubbles.
```

#### História 9 — A Mentira Pequena
* **Arquivo**: `f2_h9.jpg`
* **Tema**: Habilidades sociais / Honestidade
* **Cena**: Cozinha de casa. No chão há cacos de um vaso de cerâmica quebrado. A mãe varre os cacos acreditando que foi o cachorro da família, enquanto Júlia está encostada na pia, de braços cruzados, roendo as unhas e com olhar pesado de culpa e angústia por ter mentido.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A bright kitchen interior where broken ceramic vase pieces lie on the tiled floor. A mother is sweeping up the mess, having believed an excuse about the family dog. In the foreground, a 10-year-old girl leans against the counter, biting her nails with a guilty, troubled expression, tormented by the weight of her lie. Soft realistic domestic lighting, elegant muted color scheme of terracotta, soft mint and warm white, 16:9 widescreen, no text, no speech bubbles.
```

#### História 10 — A Exclusão no Jogo Online
* **Arquivo**: `f2_h10.jpg`
* **Tema**: Controle inibitório / Insistência
* **Cena**: Victor sentado no seu quarto com fones de ouvido gamer no pescoço, jogando sozinho no computador enquanto segura o celular na outra mão, mandando dezenas de mensagens seguidas implorando para entrar na partida dos amigos que já disseram que o time estava cheio. Rosto tenso e obcecado.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 11-year-old boy in his bedroom sitting at a desk with a gaming computer monitor, gaming headset around his neck. He plays alone on the screen while compulsively clutching his smartphone with his other hand, frantically sending repeated messages to friends who declined his request to join. Tense, anxious expression with hyper-focused eyes. Ambient LED strip backlight mixed with warm lamp light, teal, violet and charcoal palette, 16:9 widescreen, no text, no speech bubbles.
```

---

### FAIXA 3: Transição (11 a 13 anos)
*Cenários: início da adolescência, grupos de amigos, dinâmica com celulares, comparações familiares e escolares.*

#### História 1 — O Silêncio dos Amigos
* **Arquivo**: `f3_h1.jpg`
* **Tema**: Pensamentos automáticos / Catastrofização
* **Cena**: Giovana no sofá da sala, segurando o celular na altura dos olhos com as duas mãos trêmulas de ansiedade, checando as notificações pela décima vez sem nenhuma resposta dos amigos, com respiração presa e olhar apavorado de que todos a abandonaram.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 12-year-old girl sitting on a living room couch, clutching her smartphone with both hands close to her chest. Her eyes are wide with catastrophic anxiety, biting her lip as she compulsively refreshes a silent messaging app with zero replies. The atmospheric lighting reflects her internal spiral of overthinking. Elegant muted palette with teal, slate gray and warm wood, refined editorial texture, expressive posture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 2 — A Opinião não Pedida
* **Arquivo**: `f3_h2.jpg`
* **Tema**: Leitura social / Autonomia
* **Cena**: Sala de aula de artes. Pedro debruçado sobre a carteira de um colega, apontando com o dedo para o desenho dele e dando instruções detalhadas sem ter sido chamado. O colega fecha a postura, recua a cadeira e o encara com o rosto avermelhado de irritação, dizendo que não pediu ajuda.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A middle school art classroom. A 12-year-old boy leans intrusively over a classmate's desk, pointing decisively at the other's artwork to tell him how to fix it. The classmate pulls his drawing closer defensively, frowning with red flushed cheeks and irritated posture, rebuffing the unsolicited advice. Expressive body language, soft ambient art studio light, muted olive green, terracotta and charcoal tones, 16:9 widescreen, no text, no speech bubbles.
```

#### História 3 — A Comparação com a Irmã
* **Arquivo**: `f3_h3.jpg`
* **Tema**: Pensamentos automáticos / Comparação
* **Cena**: Mesa de jantar familiar. Os pais elogiam a irmã mais velha que mostra um boletim brilhante. No canto da mesa, Letícia afunda na cadeira, olhando para o próprio prato com o garfo imóvel, sentindo-se insignificante, invisível e com os olhos marejados de inferioridade.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A family dining table scene. Parents in the background are warmly congratulating an older teenage sister who holds up an academic certificate. In the foreground, a 12-year-old girl slumps down in her dining chair, staring down into her untouched plate, feeling small, invisible and inadequate under the weight of comparison. Warm domestic evening light casting subtle melancholic shadows, rich palette of burgundy, mustard and deep navy, 16:9 widescreen, no text, no speech bubbles.
```

#### História 4 — A Fofoca
* **Arquivo**: `f3_h4.jpg`
* **Tema**: Controle inibitório / Impulsividade
* **Cena**: Pátio da escola durante o intervalo. Marina enfurecida, marchando em direção a uma colega com passos largos e dedos apontados, pronta para confrontá-la na frente de uma roda de alunos curiosos, baseada apenas num boato que ouviu sem checar.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A bustling middle school courtyard during recess. A 13-year-old girl storms forward impulsively with clenched jaw and pointing finger to publicly confront a classmate based on an unverified rumor. Surrounding students pause and watch in startled anticipation. High emotional tension, dynamic framing, muted color palette with burnt amber, slate and dusty rose accents, textured digital painting, 16:9 widescreen, no text, no speech bubbles.
```

#### História 5 — O Grupo de Trabalho
* **Arquivo**: `f3_h5.jpg`
* **Tema**: Habilidades sociais / Liderança
* **Cena**: Biblioteca da escola ao redor de uma mesa redonda. Felipe, eleito líder, de pé com as mãos apoiadas na mesa falando de forma autoritária e ríspida, distribuindo tarefas sem ouvir ninguém, enquanto dois colegas pegam suas mochilas decididos a sair do grupo.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A middle school library study area. A 13-year-old boy stands stiffly at the head of a study table, speaking with an overly rigid and commanding posture, dictating tasks without listening. Across the table, two teammates pack up their notebooks and zip their backpacks with frustrated expressions, preparing to abandon his group. Bookshelves and quiet library ambiance, calm teal and oak palette, textured editorial style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 6 — A Mentira Social
* **Arquivo**: `f3_h6.jpg`
* **Tema**: Pensamentos automáticos / Vergonha
* **Cena**: Sala de aula. O professor pergunta se alguém tem dúvidas sobre uma fórmula complexa no quadro. Camila está perdida, com a testa franzida de incompreensão, mas olha para os lados, vê que ninguém levantou a mão e força um sorriso acenando que entendeu tudo por puro medo do julgamento.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A classroom lecture scene. A teacher points to a chalkboard filled with complex diagrams asking if anyone has questions. A 12-year-old girl sits frozen at her desk, deeply confused with anxious eyes, but glances sideways to see other peers quiet, so she forcefully fakes a confident nod while hiding her hands under the desk, terrified of appearing foolish. Soft diffuse classroom lighting, refined muted tones, 16:9 widescreen, no text, no speech bubbles.
```

#### História 7 — O Limite que Ninguém Ouviu
* **Arquivo**: `f3_h7.jpg`
* **Tema**: Habilidades sociais / Limites
* **Cena**: Banco do pátio escolar. Gabriel sentado cercado por colegas que fazem piadas sobre o jeito dele falar. Ele força uma risadinha amarela desconfortável para não parecer fraco, mas suas mãos estão apertando o tecido da calça com tanta força que os nós dos dedos estão brancos de humilhação e raiva reprimida.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 12-year-old boy seated on an outdoor school bench surrounded by chatting classmates who mock his voice. He forces an awkward, painful smile to fit in, but his hands grip his jeans tightly with white knuckles beneath the table, betraying deep internal distress, shame, and suppressed boundaries. Nuanced emotional character design, soft daylight, palette of desaturated olive, beige and indigo, 16:9 widescreen, no text, no speech bubbles.
```

#### História 8 — O Celular à Mesa
* **Arquivo**: `f3_h8.jpg`
* **Tema**: Leitura social / Presença
* **Cena**: Jantar de família em casa. Laís com o queixo erguido e rosto emburrado/desafiador segurando o celular depois de o pai ter pedido para guardar o aparelho. Os pais estão do outro lado da mesa em silêncio magoado, com pratos servidos e a conversa interrompida.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A family dinner table with warm plates of food. A 13-year-old girl with a defiant, defensive posture holds her glowing smartphone tightly after being told to put it away, her face hardened with irritation. Across the table, her parents sit in hurt, weary silence, their evening meal derailed by digital distraction. Intimate warm chandelier lighting, rich domestic color palette with burgundy, warm oak and cream, 16:9 widescreen, no text, no speech bubbles.
```

#### História 9 — A Decisão do Grupo
* **Arquivo**: `f3_h9.jpg`
* **Tema**: Controle inibitório / Flexibilidade
* **Cena**: Piquenique escolar no parque ao ar livre. Todos os colegas estão sentados no gramado se divertindo, mas Ana está de costas, sentada isolada num toco de árvore com cara fechada e queixo afundado no cachecol, recusando-se a participar porque queria ir ao shopping e seu voto perdeu.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A sunny outdoor park during a school outing. In the sunny background, classmates enjoy a picnic on the grass laughing together. In the foreground, a 13-year-old girl sits sullenly on a wooden park bench with arms folded and face buried into her jacket, sulking and actively boycotting the fun because the group voted against her preference. Lush greenery, dappled sunlight, harmonious nature tones with moss green and earthy brown, 16:9 widescreen, no text, no speech bubbles.
```

#### História 10 — A Postagem e o Like
* **Arquivo**: `f3_h10.jpg`
* **Tema**: Pensamentos automáticos / Aprovação digital
* **Cena**: Lucas deitado de bruços na cama do quarto, olhando fixamente para a foto que acabou de postar em seu perfil. Ao ver que um amigo popular não curtiu, ele aperta o botão de deletar com olhar arrasado e expressão de vazio e autodesvalorização.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 13-year-old boy lying on his bed in his room, staring intently at a newly posted photo on his smartphone. Noticing that a popular peer hasn't liked it, his finger hovers over the delete option with a crestfallen, defeated expression, his self-worth instantly deflated. Soft bedroom window twilight, delicate color harmony of slate blue, mauve and soft amber, textured editorial storytelling, 16:9 widescreen, no text, no speech bubbles.
```

---

### FAIXA 4: Adolescência (14 a 16 anos)
*Cenários: ensino médio, paquera, redes sociais, festas, conflito com autoridade, dilemas vocacionais.*

#### História 1 — A Rejeição na Paquera
* **Arquivo**: `f4_h1.jpg`
* **Tema**: Pensamentos automáticos / Rejeição
* **Cena**: Corredor do colégio ao fim da tarde. Gabriel acabou de se declarar para Júlia, que coloca a mão gentilmente no ombro dele dizendo que o vê apenas como amigo. Gabriel recua o corpo com o rosto sombrio de orgulho ferido e raiva contida, desviando o olhar com amargura.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A high school hallway bathed in late afternoon golden light. A 15-year-old teenage boy stands across from a teenage girl who gently places a reassuring hand on his arm, explaining she only sees him as a friend. The boy pulls back defensively, his posture rigid with wounded pride, clenched jaw and bitter eyes, unable to process the polite rejection. Mature teenage proportions, sophisticated palette of terracotta, warm amber and charcoal, 16:9 widescreen, no text, no speech bubbles.
```

#### História 2 — A Pressão do Grupo
* **Arquivo**: `f4_h2.jpg`
* **Tema**: Controle inibitório / Conformidade
* **Cena**: Entrada de uma festa barulhenta à noite com luzes de neon distantes. Marcos está encostado em um muro do lado de fora, de braços cruzados, olhar culpado e inquieto, checando o relógio enquanto dois amigos o puxam pelo braço para entrar, sabendo que ele mentiu para os pais para não ser chamado de covarde.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. Outside an evening teenage party on a suburban street. A 15-year-old boy stands uneasy against a brick wall, arms folded tightly and looking nervously at his wristwatch with profound internal conflict, having lied to his parents to avoid peer mockery. Two friends by the entrance gesture impatiently for him to come inside. Nocturnal cinematic lighting with deep navy shadows and warm streetlamp glow, moody texture, 16:9 widescreen, no text, no speech bubbles.
```

#### História 3 — O Comentário nas Redes
* **Arquivo**: `f4_h3.jpg`
* **Tema**: Pensamentos automáticos / Autocrítica
* **Cena**: Quarto com mesa de desenho, cadernos de esboço e tintas. Beatriz sentada na cadeira diante de sua arte recém-terminada, olhando para o celular com olhos arrasados após ler um comentário anônimo cruel, com a mão pronta para rasgar o desenho da mesa.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A creative teenage girl’s bedroom studio filled with sketchbooks, watercolors and artwork. A 15-year-old girl sits frozen at her art desk holding her phone, devastated after reading an anonymous cruel comment on her art. Her posture is fragile and crushed, one hand trembling near her finished canvas as if contemplating destroying it. Soft moody studio lighting, artistic palette of raw umber, dusty rose and indigo, 16:9 widescreen, no text, no speech bubbles.
```

#### História 4 — O Conflito com o Professor
* **Arquivo**: `f4_h4.jpg`
* **Tema**: Habilidades sociais / Assertividade
* **Cena**: Sala de aula do ensino médio. O professor aponta firmemente para a porta da sala mandando Rodrigo sair. Rodrigo está de pé com a mochila em um ombro só, postura desafiadora e sorriso irônico nos lábios, escalando um conflito desnecessário na frente de toda a classe em silêncio.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A high school classroom scene charged with confrontation. An authoritative teacher points firmly toward the exit door, ordering a student out. The 16-year-old teenage boy stands with one backpack strap over his shoulder, wearing a defiant, sarcastic smirk and tense posture, escalating the conflict rather than de-escalating. The rest of the class watches in stunned silence. Crisp architectural lines, muted collegiate palette of navy, chalkboard green and warm wood, 16:9 widescreen, no text, no speech bubbles.
```

#### História 5 — A Amizade Tóxica
* **Arquivo**: `f4_h5.jpg`
* **Tema**: Leitura social / Limites
* **Cena**: Praça de alimentação do shopping. Camila sentada em frente a uma amiga que a abraça de forma efusiva e bajuladora após dias de desprezo e cancelamento. O rosto de Camila revela cansaço, confusão emocional e a sensação de estar presa em um ciclo manipulador sem conseguir dizer basta.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A modern cafe setting. A 15-year-old girl is embraced over the cafe table by an overbearing friend who feigns affection after weeks of hot-and-cold exclusion. The girl’s face shows clear exhaustion, emotional disorientation and trapped hesitation, unable to set healthy boundaries. Soft urban interior lighting, stylish muted palette of warm cream, sage and plum, subtle textured brushstrokes, 16:9 widescreen, no text, no speech bubbles.
```

#### História 6 — O Primeiro Emprego
* **Arquivo**: `f4_h6.jpg`
* **Tema**: Pensamentos automáticos / Aprendizado
* **Cena**: Caixa de uma livraria ou cafeteria. O gerente de braços cruzados aponta com calma uma discrepância na tela do caixa. Felipe, com uniforme de jovem aprendiz, está paralisado de pavor, mãos tremendo no teclado e convicto de que será demitido no primeiro erro, com vontade de sumir.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. Inside a cozy bookstore-cafe. A 16-year-old boy in a trainee staff apron stands behind the register, paralyzed with acute panic and trembling hands over the keyboard as his store manager points out a small mistake on the screen. The teen misinterprets normal learning guidance as an impending dismissal, his posture shrunken in catastrophic fear. Warm ambient shop lighting, walnut wood and dark olive tones, 16:9 widescreen, no text, no speech bubbles.
```

#### História 7 — O Ciúme no Relacionamento
* **Arquivo**: `f4_h7.jpg`
* **Tema**: Controle inibitório / Insegurança
* **Cena**: Calçada do lado de fora de um evento social. Ana apareceu de surpresa e confronta o namorado que estava conversando com colegas. O namorado está com os braços abertos constrangido e surpreso, enquanto Ana o encara com olhos marejados de suspeita, celular na mão e postura rígida de desconfiança.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. An outdoor evening scene outside a teen community event. A 16-year-old girl has shown up uninvited to confront her boyfriend after he delayed replying to her constant texts. She clutches her phone with suspicious, hurt eyes and rigid accusation. The teenage boy steps back with hands raised in embarrassment and dismay before his friends. Evocative twilight urban atmosphere, streetlamp shadows, deep blues and warm amber accents, 16:9 widescreen, no text, no speech bubbles.
```

#### História 8 — A Decisão de Carreira
* **Arquivo**: `f4_h8.jpg`
* **Tema**: Pensamentos automáticos / Autenticidade
* **Cena**: Mesa de estudos repleta de livros pesados de cálculo e engenharia com notas de reprovação. Lucas está sentado com as mãos cobrindo o rosto em profunda angústia, e através da gaveta entreaberta da mesa vê-se um caderno de roteiros e textos de teatro guardado em segredo.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A late-night study desk cluttered with heavy engineering textbooks and marked exam papers. A 16-year-old boy sits with his face buried in his hands in existential dread, failing subjects he never wanted to take. In a slightly open desk drawer beside him, a secret notebook filled with theater scripts lies hidden. Poignant atmospheric lighting, desaturated color palette of slate, midnight blue and soft warm lamp glow, 16:9 widescreen, no text, no speech bubbles.
```

#### História 9 — A Fofoca Viral
* **Arquivo**: `f4_h9.jpg`
* **Tema**: Habilidades sociais / Responsabilidade
* **Cena**: Vestiário ou canto da escola. Uma colega de olhos vermelhos e lágrimas confronta Mariana por ter espalhado um segredo pessoal dela para a escola inteira. Mariana recua com as mãos levantadas na defensiva, desviando o olhar e justificando que "não foi ela quem contou para todo mundo".
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A quiet school locker alcove. A tearful teenage girl with red-rimmed eyes confronts another 15-year-old girl for leaking a private secret that went viral across school group chats. The responsible girl pulls back with raised defensive hands, shifting blame and avoiding eye contact rather than taking accountability. High dramatic tension, muted palette of charcoal, dusty lilac and cool gray, painterly editorial style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 10 — A Comparação nas Redes Sociais
* **Arquivo**: `f4_h10.jpg`
* **Tema**: Pensamentos automáticos / Autoestima
* **Cena**: Sofia sentada no chão do quarto encostada no espelho de corpo inteiro, olhando para o feed do celular repleto de fotos glamorosas de influenciadoras. Ela olha para o próprio reflexo no espelho com desgosto e tristeza, sentindo que seu corpo e sua vida são totalmente insuficientes.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 15-year-old girl sitting on the floor of her bedroom beside a full-length mirror. She gazes at a glamorous social media feed on her phone, then looks into her own mirror reflection with profound melancholy, body dissatisfaction and perceived inadequacy. Soft intimate bedroom daylight, sophisticated emotional storytelling, muted earth tones, soft ochre and desaturated teal, 16:9 widescreen, no text, no speech bubbles.
```

---

### FAIXA 5: Jovem Adulto (16 a 19 anos)
*Cenários: faculdade, vestibular, primeiro apartamento, debates acadêmicos, independência, luto amoroso e limites saudáveis.*

#### História 1 — O Fim do Relacionamento
* **Arquivo**: `f5_h1.jpg`
* **Tema**: Pensamentos automáticos / Luto emocional
* **Cena**: Quarto no início da noite. Diego sentado no chão ao lado da cama, envolto em um cobertor, com o olhar perdido e fixo no celular aberto em fotos antigas de um relacionamento recém-terminado. Xícara de chá intocada esfriando na mesinha, postura de desamparo e ruminação profunda.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 18-year-old young man sitting on the floor leaning against his bed in a dimly lit bedroom at dusk. He clutches a blanket around his shoulders, his eyes hollow and haunted by emotional grief as he scrolls through old relationship photos on his phone. An untouched mug of cold tea sits on the nightstand. Subtle melancholic shadows, sophisticated palette of deep indigo, dusty charcoal and faint warm bedside glow, textured painterly style, 16:9 widescreen, no text, no speech bubbles.
```

#### História 2 — A Discordância Política
* **Arquivo**: `f5_h2.jpg`
* **Tema**: Habilidades sociais / Diálogo
* **Cena**: Sala de aula de cursinho ou auditório universitário. Isabela está de pé no meio das fileiras, gesticulando agressivamente e falando alto após interromper a fala do professor. A professora observa com serenidade e os colegas de sala olham desconfortáveis com a hostilidade da interrupção.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A college lecture hall or prep school amphitheater. An 18-year-old young woman stands up abruptly between rows of desks, gesturing with aggressive intensity and raised voice during a political disagreement with the instructor. The female professor remains poised at the lectern, while surrounding university students look on with uncomfortable tension. Clean architectural perspective, refined color palette with forest green, cream and warm wood, 16:9 widescreen, no text, no speech bubbles.
```

#### História 3 — A Síndrome do Impostor
* **Arquivo**: `f5_h3.jpg`
* **Tema**: Pensamentos automáticos / Autoeficácia
* **Cena**: Pedro sentado diante do computador no quarto, com a carta oficial de aprovação para um concorrido programa de jovens líderes aberta na tela. Em vez de alegria, suas mãos seguram a cabeça com pavor de ser desmascarado, convicto de que foi um engano da banca avaliadora.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 18-year-old young man sitting at his desk at night, illuminated by his computer monitor displaying a prestigious leadership program acceptance letter. Rather than celebrating, he grips his temples with an expression of acute impostor syndrome, paralyzed by the irrational conviction that an error was made and he will soon be exposed. Moody cinematic lighting, refined palette of deep navy, slate and warm amber screen glow, 16:9 widescreen, no text, no speech bubbles.
```

#### História 4 — O Cuidado com os Limites
* **Arquivo**: `f5_h4.jpg`
* **Tema**: Controle inibitório / Limites
* **Cena**: Mesa de uma cafeteria universitária. Fernanda cercada por três pilhas de cadernos e notebooks de colegas que ela aceitou revisar, além do seu próprio trabalho. O celular vibra na mesa com mais um pedido de ajuda. Ela segura a caneta com a mão trêmula, olheiras profundas e postura de exaustão absoluta e ressentimento.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. Inside a campus coffee shop. A 19-year-old young woman is overwhelmed at a small table buried beneath stacks of classmates' assignments and notebooks she couldn't say no to. Her phone buzzes with yet another favor request. She holds a pen with an exhausted, trembling grip, dark circles beneath her eyes and slumped posture of compulsive self-sacrifice. Soft natural cafe light, palette of latte foam, warm terracotta and sage green, 16:9 widescreen, no text, no speech bubbles.
```

#### História 5 — A Ansiedade do Vestibular
* **Arquivo**: `f5_h5.jpg`
* **Tema**: Pensamentos automáticos / Ansiedade
* **Cena**: Quarto no meio da noite com relógio marcando 03:40. Lucas sentado na cama com a cabeça entre os joelhos, respirando com dificuldade pelo ataque de ansiedade e pânico do vestibular. Livros e simulados espalhados pelo chão sem conseguir assimilar nada.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 18-year-old student sitting on the edge of his bed in the middle of the night, head between his knees, gripping his hair in a severe anxiety freeze before major entrance exams. Around his room, stacks of mock exam papers, flashcards and study guides are strewn in chaotic perfectionism. Cool moonlight cutting through blinds into a dark room, palette of midnight blue, muted cyan and warm lamplight, high emotional resonance, 16:9 widescreen, no text, no speech bubbles.
```

#### História 6 — A Amizade com Propósito
* **Arquivo**: `f5_h6.jpg`
* **Tema**: Leitura social / Reciprocidade
* **Cena**: Ponto de ônibus no campus. Giovana sentada no banco olhando para Rafael, que se afasta digitando no celular após conseguir a carona e o resumo das aulas que precisava, sem sequer perguntar como ela estava passando por um momento difícil. Giovana observa com olhar de desilusão e cansaço.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A university campus bus stop in late afternoon. An 18-year-old young woman sits on the bench watching a male friend walk away absorbed in his own phone, having just extracted favors from her without even asking how she was doing during her personal crisis. Her expression is a calm but heartbreaking realization of one-sided reciprocity. Autumn leaves, soft wind, muted warm palette with rust, ochre and slate, 16:9 widescreen, no text, no speech bubbles.
```

#### História 7 — A Pressão da Identidade
* **Arquivo**: `f5_h7.jpg`
* **Tema**: Pensamentos automáticos / Autenticidade
* **Cena**: Quarto de Mateus. Ele está em frente ao espelho vestindo uma roupa formal sem graça e genérica escolhida para agradar a família, enquanto sobre a cama estão suas roupas estilosas de moda e seus cadernos de design gráfico que ele esconde por medo de piadas e rejeição.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 19-year-old young man standing before a mirror in his bedroom, wearing a generic, stifling formal outfit chosen solely to placate familial expectations. Across his bed lie vibrant, expressive fashion sketches and colorful tailored garments he loves but hides away in fear of mockery. Poignant contrast between conformity and authentic passion, soft warm room lighting, palette of beige, mustard and deep plum, 16:9 widescreen, no text, no speech bubbles.
```

#### História 8 — A Gestão do Fracasso
* **Arquivo**: `f5_h8.jpg`
* **Tema**: Pensamentos automáticos / Resiliência
* **Cena**: Laura trancada em seu quarto escuro, sentada encostada na porta fechada com a carta de reprovação da universidade dos sonhos caída no chão ao lado de sua mala de viagem não desfeita. Ela recusa abrir a porta para a mãe que bate do lado de fora, sentindo que seu futuro acabou.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. A 18-year-old young woman sitting on the floor leaning back against her locked bedroom door in near darkness. A university rejection letter lies discarded on the floor beside an unpacked travel suitcase. Her face is buried in her hands in catastrophic despair, refusing to open the door for her concerned mother outside. Cinematic doorway shadow, palette of desaturated charcoal, cold twilight blue and warm amber slit of light beneath the door, 16:9 widescreen, no text, no speech bubbles.
```

#### História 9 — O Conflito de Valores
* **Arquivo**: `f5_h9.jpg`
* **Tema**: Controle inibitório / Valores
* **Cena**: Estacionamento noturno. Três amigos rindo e planejando uma ação antiética e arriscada encostados em um carro. Thiago está a dois passos de distância, parado de braços cruzados, olhar culpado e perturbado, dilacerado entre pertencer ao grupo e trair seus próprios princípios morais.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. An empty suburban parking lot at night under buzzing vapor streetlamps. Three young men lean against a car laughing and plotting an unethical prank. Two paces away stands an 18-year-old young man with arms folded, face furrowed with intense moral dilemma and self-betrayal, torn between peer belonging and personal integrity. Atmospheric nocturnal shadows, muted amber and deep teal palette, strong narrative tension, 16:9 widescreen, no text, no speech bubbles.
```

#### História 10 — A Busca por Sentido
* **Arquivo**: `f5_h10.jpg`
* **Tema**: Pensamentos automáticos / Propósito
* **Cena**: Carla sentada na janela do seu quarto olhando para a rua onde antigos colegas passam animados com uniformes de faculdade e mochilas. Carla está com roupas de casa simples, olhar distante e melancólico de quem se sente a única pessoa do mundo que não sabe que rumo tomar na vida.
* **Prompt para o Gemini**:
```text
Contemporary 2D editorial illustration. An 18-year-old young woman sitting on the wide sill of her bedroom window, looking down at the street below where former classmates walk past enthusiastically carrying university bags. She wears simple loungewear, her eyes distant, contemplative and melancholy with the quiet existential disorientation of transitioning into adulthood without a set map. Soft morning breeze in the curtains, delicate palette of soft cream, sage green and morning mist, 16:9 widescreen, no text, no speech bubbles.
```

---

## 4. Checklist para Inserção no NeuroAcervo

Ao gerar cada imagem no Gemini:
1. Faça o download da imagem em alta resolução.
2. Salve com o nome correspondente (`f1_h1.jpg`, `f1_h2.jpg` ... `f5_h10.jpg`).
3. Coloque os arquivos no diretório: `public/assets/cards/`.
4. Uma vez que as imagens estejam nessa pasta, elas serão automaticamente carregadas pela aplicação em:
   * **Cards do catálogo** (`src/app/recursos-interativos/historias/page.tsx`)
   * **Visualizador guiado da sessão clínica**
   * **Modo Paciente em tela cheia**
