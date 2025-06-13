import React, { useState, useEffect, Fragment } from 'react';

import classnames from 'classnames';
import confetti from 'canvas-confetti';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { bancoPerguntas } from '../../data/perguntas';
import { recompensaPorNivel } from '../../data/recompensas';
import './Game.css';
import logo from './logo.png';
import UnclosableModal from '../../components/UnclosableModal';

const acertos_para_ganhar = 3;

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
  const [showPrompt, setShowPrompt] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [respostaCerta, setRespostaCerta] = useState(false);

  const [pularDisponiveis, setPularDisponiveis] = useState(3);

  // Divide perguntas em faceis, medias e dificeis
  const dividePerguntas = () => {
    const perguntas = [...bancoPerguntas];
    setPerguntasFaceis(perguntas.splice(0, 100));
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
    setCounterPergunta(30);
    setTimerPergunta(
      setInterval(() => {
        setCounterPergunta((c) => c - 1);
      }, 1000)
    );
  };
  // Para o contador do tempo do usuário
  const paraTimerPergunta = () => {
    clearInterval(timerPergunta);
  };

  // Inicia o jogo
  useEffect(() => {
    dividePerguntas();
    setCurrentNivel(0); // start at 0 so that continueGame() will start at 1
    setCounterInicio(0);
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
      setShowPrompt(true);
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
    setShowPrompt(true);
    setCurrentNivel((c) => c - 1);
  };

  // Continue game when prompt is dismissed
  const continueGame = () => {
    setShowPrompt(false);
    setCurrentNivel((c) => c + 1);
    getPerguntaAleatoria(currentNivel + 1);
    iniciaTimerPergunta();
  };

  // Render
  return (
    <section className='game background'>
      {showPrompt && (
        <div className="prompt-modal">
          <div className="prompt-content">
            <h3>Pronto para a próxima pergunta?</h3>
            <p>Você respondeu à pergunta {currentNivel} corretamente.</p>
            <p>A próxima pergunta será a pergunta {currentNivel + 1} de um total de {acertos_para_ganhar}</p>
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
            }.`}
          {gameOver &&
            `A resposta está e... rrada. A opção certa era ${
              currentPergunta.alternativas[parseInt(currentPergunta.resposta) - 1]
            }.`}
          {gameWon && (
            <Fragment>
              Parabéns!!! Você ganhou <strong>1 MILHÃO DE REAIS</strong>!
            </Fragment>
          )}
        </p>
        {(counterPergunta === 0 || gameOver) && (
          <p>
            Você ganhou{' '}
            <strong>
              {currentNivel === 1
                ? '500'
                : `${(recompensaPorNivel[currentNivel] / 2).toString().slice(0, -3)} mil`}{' '}
              reais
            </strong>
            ! Ma oeee, senta lá!
          </p>
        )}

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
                    <p className='text-light'>Pergunta Número {currentNivel}</p>
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
                      </div>
                    </Col>
                  </Row>

                  <Row className='mt-5'>
                    <Col xs='auto' className='mx-auto'>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {recompensaPorNivel[currentNivel] / 2 === 500
                            ? '500'
                            : (recompensaPorNivel[currentNivel] / 2).toString().slice(0, -3) +
                              ' MIL'}
                        </div>
                        <p className='opcao'>ERRAR</p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {recompensaPorNivel[currentNivel].toString().slice(0, -3) + ' MIL'}
                        </div>
                        <p
                          className='opcao'
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza de que deseja parar?
                                Você ganhará ${recompensaPorNivel[currentNivel]
                                  .toString()
                                  .slice(0, -3)} mil reais.`
                              )
                            )
                              setGameStarted(false);
                          }}>
                          PARAR
                        </p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {currentNivel < 15
                            ? recompensaPorNivel[currentNivel + 1].toString().slice(0, -3) + ' MIL'
                            : '1 MILHÃO'}
                        </div>
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
