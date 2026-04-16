# 🚀 Semester-Blaster

![Gameplay do jogo](./gameshow.png)

---

## 🎓 Sobre o Projeto

O **Semester-Blaster** é um jogo 2D feito em **JavaScript usando Canvas**, criado como projeto da disciplina de **Computação Gráfica**.

A ideia foi transformar a vida acadêmica em um jogo: cada inimigo representa uma matéria, e você precisa ir sobrevivendo aos semestres até chegar no final.

E como todo mundo já sabe…

💀 **o chefe final é o TCC.**

---

## 🎮 Como funciona

* Você controla uma nave
* Vai enfrentando “matérias”
* Ganha moedas ao derrotar inimigos
* Pode evoluir a nave
* E no final encara o boss

---

## 🎯 Controles

| Ação   | Tecla  |
| ------ | ------ |
| Mover  | ← →    |
| Atirar | Espaço |

---

## ⚙️ O que tem no jogo

* Progressão por fases
* Boss com barra de vida
* Sistema de upgrade
* Escolha de dificuldade (fácil, médio, difícil)
* Minimap
* Menu inicial com loja e informações
* Sistema de moedas

---

## 🧠 Conceitos de Computação Gráfica usados

Esse projeto não é só um joguinho — ele aplica vários conceitos da disciplina:

* ✔️ **Set Pixel** (manipulação direta com `ImageData`)
* ✔️ **Rasterização de linhas** (desenho manual tipo Bresenham)
* ✔️ **Flood Fill** (preenchimento de região)
* ✔️ **Transformações** (`translate` e `scale`)
* ✔️ **Animação 2D** (`requestAnimationFrame`)
* ✔️ **Viewport / Window** (conversão de coordenadas)
* ✔️ **Clipping** (Cohen-Sutherland)
* ✔️ **Textura** (fundo com imagem `space.png`)
* ✔️ **Input por teclado**
* ✔️ **Interface gráfica (menu, loja, HUD)**

> Alguns itens mais avançados (tipo círculo/elipse e rotação) não foram implementados.

---

## 🧩 Estrutura

### `index.html`

Interface geral (menu, layout, canvas)

### `script.js`

Onde está toda a lógica do jogo:

* renderização
* movimentação
* colisão
* inimigos
* sistema de fases

---

## 🎨 Assets

* `gameshow.png` → imagem do jogo (README)
* `space.png` → fundo
* `Thanos.png` → boss final
* `nave*.png` → sprites das naves

---

## 🚀 Tecnologias

* HTML
* CSS
* JavaScript (sem framework)
* Canvas API

---

## 📈 Ideias de melhoria

* Adicionar rotação nas naves
* Implementar círculo/elipse na mão
* Melhorar efeitos visuais (partículas, glow, etc)
* Adicionar som
* Salvar progresso

---

## 👨‍💻 Autores

* **Hyan Victor** — desenvolvimento principal
* **Yasmin** — apoio, ideias e testes

---

## 🏁 Final

O projeto foi feito como parte da disciplina, mas acabou virando um jogo completo, aplicando na prática vários conceitos de computação gráfica.

---
