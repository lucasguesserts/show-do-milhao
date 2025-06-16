# Show do Milhão

Basic React app simulating "Show do Milhão", a famous brazilian TV show similar to "Who Wants to Be a Millionaire".

## Play Game

The game is available on my GitHub pages, [here](https://igorschechtel.github.io/index.html).

## Local Installation

Use the package manager [npm](https://www.npmjs.com/) to install show-do-milhao.

```bash
git clone https://github.com/igorschechtel/show-do-milhao.git
cd show-do-milhao
npm install
NODE_OPTIONS=--openssl-legacy-provider npm start
```

## Components

### App

Keeps the state `gameStarted` - if false shows component `Home`, otherwise shows `Game`.

### Home

Just a home page with general information about the project and a button to start the game.

### Game

The game page, where the states and controls are and the game view is generated.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Similar

- https://github.com/MatheusPrudente/Jogo-do-Milhao/tree/main
- https://gist.github.com/camargogu1/710728caee57f41a417f8e45b70b0b38
- https://github.com/felcg/show_do_milhao/
- https://github.com/geeksilva97/app-show-do-milhao
- https://github.com/Montfel/Show-do-Milhao
- https://github.com/Computacao-Movel-PROJETOS/Jogo_do_Milhao
- https://github.com/Marceloknust/showdomilhao/

