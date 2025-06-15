import React, { useState, useEffect, Fragment } from 'react';

import classnames from 'classnames';
import confetti from 'canvas-confetti';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { bancoPerguntas } from '../../data/perguntas';
import './Game.css';
import logo from './logo.png';
import UnclosableModal from '../../components/UnclosableModal';

const acertos_para_ganhar = 3;
const noPrizeOption = "Chupar o Dedo";
const recompensaPorNivel = Array(acertos_para_ganhar - 3 + 2).fill(noPrizeOption).concat(["Chocolatinho", "Chocolate", "Chocolatão"]);
const tempo_para_responder_pergunta = 30;


if (acertos_para_ganhar < 3) {
  throw new Error('acertos_para_ganhar deve ser maior ou igual a 3');
}
if (tempo_para_responder_pergunta < 1) {
  throw new Error('tempo_para_responder_pergunta deve ser maior ou igual a 1');
}

const Game = ({ setGameStarted }) => {
  // States
  const [perguntasFaceis, setPerguntasFaceis] = useState(null);
  const [perguntasMedias, setPerguntasMedias] = useState(null);
  const [perguntasDificeis, setPerguntasDificeis] = useState(null);

  const [currentPergunta, setCurrentPergunta] = useState(null);
  const [currentNivel, setCurrentNivel] = useState(0);
  const [counterInicio, setCounterInicio] = useState(1); // this guarantees that the questions are loaded before continueGame() is called

  const [timerPergunta, setTimerPergunta] = useState(null);
  const [counterPergunta, setCounterPergunta] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showNextQuestionPrompt, setShowNextQuestionPrompt] = useState(false);
  const [showCardsPrompt, setShowCardsPrompt] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [respostaCerta, setRespostaCerta] = useState(false);

  const [pularDisponiveis, setPularDisponiveis] = useState(3);
  
  const [cartasDisponiveis, setCartasDisponiveis] = useState(1);
  const [cartaValue, setCartaValue] = useState(null);
  const [cartaEnabled, setCartaEnabled] = useState(false);
  const [cardsToDisplay, setCardsToDisplay] = useState(new Set([0, 1, 2, 3]));

  const [ajudaDisponiveis, setAjudaDisponiveis] = useState(1);

  // Divide perguntas em faceis, medias e dificeis
  const dividePerguntas = () => {
    const perguntas = [...bancoPerguntas];
    setPerguntasFaceis(perguntas.splice(0, 8));
    setPerguntasMedias(perguntas.splice(0, 100));
    setPerguntasDificeis(perguntas.splice(0, 100));
  };

  // Seleciona pergunta aleatoria
  const getPerguntaAleatoria = (currentNivel) => {
    let perguntasArr, pergunta, randomIndex;
    if (currentNivel < 6) {
      perguntasArr = [...perguntasFaceis];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasFaceis(perguntasArr);
    } else if (currentNivel < 11) {
      perguntasArr = [...perguntasMedias];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasMedias(perguntasArr);
    } else if (currentNivel < 16) {
      perguntasArr = [...perguntasDificeis];
      randomIndex = Math.floor(Math.random() * perguntasArr.length);
      pergunta = perguntasArr.splice(randomIndex, 1)[0];
      setPerguntasDificeis(perguntasArr);
    }
    setCurrentPergunta(pergunta);
  };

  // Inicia o contador do tempo do usuário
  const iniciaTimerPergunta = () => {
    clearInterval(timerPergunta);
    setCounterPergunta(tempo_para_responder_pergunta);
    setTimerPergunta(
      setInterval(() => {
        setCounterPergunta((c) => c - 1);
      }, 1000)
    );
  };

  const pararJogo = () => {
    if (window.confirm(`Tem certeza de que deseja parar? Você ganhará ${recompensaPorNivel[currentNivel+1]}`))
      setGameStarted(false);
    }

  // Inicia o jogo
  useEffect(() => {
    dividePerguntas();
    setCurrentNivel(0); // start at 0 so that continueGame() will start at 1
    setCounterInicio(0);
    setCartaValue(Math.floor(Math.random() * 4));
    setCartaEnabled(false);
  }, []);

  // Para os timers se chegarem a zero
  useEffect(() => {
    if (counterInicio === 0) {
      continueGame();
    }
  }, [counterInicio]);

  useEffect(() => {
    if (counterPergunta === 0) {
      clearInterval(timerPergunta);
      setShowModal(true);
    }
  }, [counterPergunta]);

  // Passa de nivel
  const passaNivel = () => {
    if (currentNivel === acertos_para_ganhar) {
      setShowModal(true);
      setGameWon(true);
      confetti({
        particleCount: 200,
      });
    } else {
      clearInterval(timerPergunta);
      setShowNextQuestionPrompt(true);
    }
  };

  // Responde pergunta
  const responderPergunta = (resposta) => {
    clearInterval(timerPergunta);
    if (currentPergunta.resposta === resposta.toString()) {
      // pisca resposta certa
      const highlightInterval = setInterval(() => {
        setRespostaCerta((r) => !r);
      }, 80);
      // depois de 1.5s passa para proxima
      setTimeout(() => {
        clearInterval(highlightInterval);
        setRespostaCerta(false);
        passaNivel();
      }, 1500);
    } else {
      setGameOver(true);
      setShowModal(true);
    }
  };

  // Pula a pergunta
  const pularPergunta = () => {
    setPularDisponiveis((p) => p - 1);
    clearInterval(timerPergunta);
    setShowNextQuestionPrompt(true);
    setCurrentNivel((c) => c - 1);
    setCartaEnabled(false);
  };

  // Continue game when prompt is dismissed
  const continueGame = () => {
    setShowNextQuestionPrompt(false);
    setCurrentNivel((c) => c + 1);
    getPerguntaAleatoria(currentNivel + 1);
    iniciaTimerPergunta();
    setCartaEnabled(false);
  };

  const usarCartas = () => {
    setCartasDisponiveis((c) => c - 1);
    clearInterval(timerPergunta);
    setShowCardsPrompt(true);
    setCartaEnabled(true);
    const cartaValue = Math.floor(Math.random() * 4);
    const cardsToDisplay = new Set([]);
    cardsToDisplay.add(parseInt(currentPergunta.resposta) - 1);
    while (cardsToDisplay.size < 4 - cartaValue) {
      const randomIndex = Math.floor(Math.random() * currentPergunta.alternativas.length);
      cardsToDisplay.add(randomIndex);
    }
    setCartaValue(cartaValue);
    setCardsToDisplay(cardsToDisplay);
  };

  const usarAjuda = () => {
    window.confirm(`Peça ajuda. Depois que se decidir, clique em "Continuar".`)
    setAjudaDisponiveis((a) => a - 1);
  };

  const cartasResumeGame = () => {
    setShowCardsPrompt(false);
    iniciaTimerPergunta();
  };

  const perguntaJaRespondida = () => {
    const password = "sim";
    const input_password = window.prompt(`Essa pergunta realmente já foi respondida? (digite "${password}" para confirmar)`);
    if (input_password === password) {
      clearInterval(timerPergunta);
      setShowNextQuestionPrompt(true);
      setCurrentNivel((c) => c - 1);
      setCartaEnabled(false);
    }
  }

  // Render
  return (
    <section className='game background'>
      {showNextQuestionPrompt && (
        <div className="prompt-modal">
          <div className="prompt-content">
            <h3>Pronto para a próxima pergunta?</h3>
            <p>Clique em "Continuar" para passar para a próxima pergunta.</p>
            <Button
              className="btn btn-primary"
              onClick={continueGame}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
      {showCardsPrompt && (
        <div className="prompt-modal">
          <div className="prompt-content">
            <h3>Você escolheu Cartas</h3>
            <p>A sua carta contém o número {cartaValue}.</p>
            {cartaValue === 0 && <p>Nenhuma opção será eliminada.</p>}
            {cartaValue === 1 && <p>{cartaValue} opção será eliminada.</p>}
            {cartaValue === 2 && <p>{cartaValue} opções serão eliminadas.</p>}
            <p>Clique em "Continuar" para responder à pergunta.</p>
            <Button
              className="btn btn-primary"
              onClick={cartasResumeGame}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
      <UnclosableModal
        title={
          counterPergunta === 0
            ? 'Tempo esgotado'
            : gameOver
            ? 'Resposta errada'
            : gameWon
            ? 'Você ganhou!!'
            : ''
        }
        show={showModal}
        setShow={setShowModal}>
        <p>
          {counterPergunta === 0 &&
            `Sinto muito, o seu tempo acabou. A opção certa era ${
              currentPergunta.alternativas[parseInt(currentPergunta.resposta) - 1]
            }.\nVoce ganhou: ${noPrizeOption}`}
          {gameOver &&
            `A resposta está ERRADA. A opção certa era ${
              currentPergunta.alternativas[parseInt(currentPergunta.resposta) - 1]
            }.\nVoce ganhou: ${noPrizeOption}`}
          {gameWon && (
            <Fragment>
              Parabéns!!! Você ganhou {recompensaPorNivel[currentNivel + 1]}!
            </Fragment>
          )}
        </p>

        <div className='text-center mt-5'>
          <Button
            className='btn btn-primary'
            onClick={() => {
              setGameStarted(false);
            }}>
            Jogar novamente
          </Button>
        </div>
      </UnclosableModal>
      <div className='timer-pergunta'>{counterPergunta}</div>
      <Container className='py-4'>
        <Row>
          <Col>
            <div className='game-control text-center'>
              <img src={logo} alt='logo-show-do-milhao img-fluid' style={{ maxWidth: '240px' }} />
              {(
                <div className='contador-perguntas'>
                  {currentNivel !== acertos_para_ganhar ? (
                    <p className='text-light'>Pergunta Número {currentNivel} de {acertos_para_ganhar}</p>
                  ) : (
                    <p className='text-light'>Última Pergunta</p>
                  )}
                </div>
              )}
              <div className='pergunta'>
                <p className='m-0'>
                  {currentPergunta && currentPergunta.pergunta}
                </p>
              </div>

              {currentPergunta && (
                <Fragment>
                  <div className='alternativas text-center'>
                    {currentPergunta.alternativas.map((alternativa, i) => (
                      <div
                        onClick={() => {
                          responderPergunta(i + 1);
                        }}
                        className={classnames('alternativa', {
                          certa: i + 1 === parseInt(currentPergunta.resposta),
                          highlight: respostaCerta,
                        })}
                        style={{ visibility: !cartaEnabled || cardsToDisplay.has(i) ? 'visible' : 'hidden' }}
                        key={i}>
                        <span className='numero-alternativa'>{i + 1}</span>
                        {alternativa}
                      </div>
                    ))}
                  </div>

                  <Row className='mt-4'>
                    <Col xs='auto' className='mx-auto'>
                      <div className='text-center opcoes'>
                        {currentNivel < acertos_para_ganhar && pularDisponiveis > 0 && (
                          <div className='opcao' onClick={pularPergunta}>
                            PULAR ({pularDisponiveis})
                          </div>
                        )}
                        {currentNivel < acertos_para_ganhar && cartasDisponiveis > 0 && (
                          <div className='opcao' onClick={usarCartas}>
                            CARTAS ({cartasDisponiveis})
                          </div>
                        )}
                        {currentNivel < acertos_para_ganhar && ajudaDisponiveis > 0 && (
                          <div className='opcao' onClick={usarAjuda}>
                            AJUDA ({ajudaDisponiveis})
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row className='mt-4'>
                    <Col xs='auto' className='mx-auto'>
                      <div className='text-center opcoes'>
                        {(
                          <div className='opcao' onClick={() => {window.alert(`Jogo pausado. Clique para continuar.`)}}>
                            PAUSA
                          </div>
                        )}
                        {(
                          <div className='opcao' onClick={() => {perguntaJaRespondida()}}>
                            PERGUNTA JA RESPONDIDA
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>

                  <Row className='mt-5'>
                    <Col xs='auto' className='mx-auto'>
                      <div className='text-center projecoes'>
                        <div className='valor'>{noPrizeOption}</div>
                        <p className='opcao'>ERRAR</p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>{recompensaPorNivel[currentNivel]}</div>
                        <p
                          className='opcao'
                          onClick={pararJogo}>PARAR</p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>{recompensaPorNivel[currentNivel + 1]}</div>
                        <p className='opcao'>ACERTAR</p>
                      </div>
                    </Col>
                  </Row>
                </Fragment>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Game;
