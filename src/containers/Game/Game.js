import React, { useState, useEffect, Fragment } from 'react';

import classnames from 'classnames';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import confetti from 'canvas-confetti';

import './Game.css';
import logo from './logo.png';
import { bancoPerguntas } from '../../data/perguntas';

const Game = (props) => {
  // States
  const [perguntasFaceis, setPerguntasFaceis] = useState(null);
  const [perguntasMedias, setPerguntasMedias] = useState(null);
  const [perguntasDificeis, setPerguntasDificeis] = useState(null);

  const [currentPergunta, setCurrentPergunta] = useState(null);
  const [currentNivel, setCurrentNivel] = useState(0);

  const [timerInicio, setTimerInicio] = useState(null);
  const [counterInicio, setCounterInicio] = useState(3);

  const [timerPergunta, setTimerPergunta] = useState(null);
  const [counterPergunta, setCounterPergunta] = useState(30);

  const [showModal, setShowModal] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [respostaCerta, setRespostaCerta] = useState(false);

  const recompensaNivel = [
    1000,
    2000,
    3000,
    4000,
    5000,
    10000,
    20000,
    30000,
    40000,
    50000,
    100000,
    200000,
    300000,
    400000,
    500000,
    1000000,
  ];

  // Divide perguntas em faceis, medias e dificeis
  useEffect(() => {
    const perguntas = [...bancoPerguntas];
    setPerguntasFaceis(perguntas.splice(0, 100));
    setPerguntasMedias(perguntas.splice(0, 100));
    setPerguntasDificeis(perguntas.splice(0, 100));
    setCurrentNivel(15);
    setTimerInicio(
      setInterval(() => {
        setCounterInicio((c) => c - 1);
      }, 1000)
    );
  }, []);

  // Para o contador de inicio quando chega a zero
  useEffect(() => {
    if (counterInicio === 0) {
      clearInterval(timerInicio);
      setTimerInicio(null);
      setTimerPergunta(
        setInterval(() => {
          setCounterPergunta((c) => c - 1);
        }, 1000)
      );
    }
  }, [counterInicio]);

  // Para o contador de pergunta quando chega a zero
  useEffect(() => {
    if (counterPergunta === 0) {
      clearInterval(timerPergunta);
      setTimerPergunta(null);
      setShowModal(true);
    }
  }, [counterPergunta]);

  // Seleciona nova pergunta quando o nível muda
  useEffect(() => {
    const getPerguntaAleatoria = (dificuldade) => {
      if (perguntasFaceis && perguntasMedias && perguntasDificeis) {
        let perguntasArr, pergunta, randomIndex;
        switch (dificuldade) {
          case 'Fácil':
            perguntasArr = [...perguntasFaceis];
            randomIndex = Math.floor(Math.random() * perguntasArr.length);
            pergunta = perguntasArr.splice(randomIndex, 1)[0];
            setPerguntasFaceis(perguntasArr);
            return pergunta;
          case 'Média':
            perguntasArr = [...perguntasMedias];
            randomIndex = Math.floor(Math.random() * perguntasArr.length);
            pergunta = perguntasArr.splice(randomIndex, 1)[0];
            setPerguntasMedias(perguntasArr);
            return pergunta;
          case 'Difícil':
            perguntasArr = [...perguntasDificeis];
            randomIndex = Math.floor(Math.random() * perguntasArr.length);
            pergunta = perguntasArr.splice(randomIndex, 1)[0];
            setPerguntasDificeis(perguntasArr);
            return pergunta;
          default:
            return new Error('Dificuldade não encontrada');
        }
      }
    };

    if (currentNivel <= 5) {
      const perguntaFacil = getPerguntaAleatoria('Fácil');
      setCurrentPergunta(perguntaFacil);
    } else if (currentNivel <= 10) {
      const perguntaMedia = getPerguntaAleatoria('Média');
      setCurrentPergunta(perguntaMedia);
    } else {
      const perguntaDificil = getPerguntaAleatoria('Difícil');
      setCurrentPergunta(perguntaDificil);
    }
  }, [currentNivel]);

  // Responde pergunta
  const responderPergunta = (resposta) => {
    clearInterval(timerPergunta);
    if (currentPergunta.resposta === resposta.toString()) {
      const myInterval = setInterval(() => {
        setRespostaCerta((r) => !r);
      }, 80);
      setTimeout(() => {
        clearInterval(myInterval);
        setRespostaCerta(false);
        proximaPergunta();
      }, 1500);
    } else {
      setGameOver(true);
      setShowModal(true);
    }
  };

  // Passa o proximo nivel e zera o timer
  const proximaPergunta = () => {
    if (currentNivel === 15) {
      confetti({
        particleCount: 200,
      });
      setShowModal(true);
      setGameWon(true);
    } else {
      setCurrentNivel((cn) => cn + 1);
      setCounterPergunta(30);
      setTimerPergunta(
        setInterval(() => {
          setCounterPergunta((c) => c - 1);
        }, 1000)
      );
    }
  };

  // Render
  return (
    <section className='game background'>
      <div className='timer-pergunta'>{counterPergunta}</div>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop='static'
        keyboard={false}>
        <Modal.Header>
          <Modal.Title>
            {counterPergunta === 0 && 'Tempo esgotado'}
            {gameOver && 'Resposta errada'}
            {gameWon && 'Você ganhou!!'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {counterPergunta === 0 && 'Sinto muito, o seu tempo acabou.'}
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
                {recompensaNivel[currentNivel - 1] / 2 === 500
                  ? '500'
                  : `${(recompensaNivel[currentNivel - 1] / 2).toString().slice(0, -3)} mil`}{' '}
                reais
              </strong>
              ! Ma oeee, senta lá!
            </p>
          )}

          <div className='text-center mt-5'>
            <Button
              className='btn btn-primary'
              onClick={() => {
                props.setGameStarted(false);
              }}>
              Jogar novamente
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Container className='py-5'>
        <Row>
          <Col>
            <div className='game-control text-center'>
              <img src={logo} alt='logo-show-do-milhao img-fluid' style={{ maxWidth: '250px' }} />
              {counterInicio === 0 && (
                <div className='contador-perguntas'>
                  <p className='text-light'>PERGUNTA NÚMERO {currentNivel}</p>
                </div>
              )}
              <div className='pergunta'>
                <p className='m-0'>
                  {counterInicio !== 0
                    ? counterInicio
                    : currentPergunta && currentPergunta.pergunta}
                </p>
              </div>

              {counterInicio === 0 && (
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

                  <Row className='mt-5'>
                    <Col xs='auto' className='mx-auto'>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {recompensaNivel[currentNivel - 1] / 2 === 500
                            ? '500'
                            : (recompensaNivel[currentNivel - 1] / 2).toString().slice(0, -3) +
                              ' MIL'}
                        </div>
                        <p className='opcao'>ERRAR</p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {recompensaNivel[currentNivel - 1].toString().slice(0, -3) + ' MIL'}
                        </div>
                        <p
                          className='opcao'
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Tem certeza de que deseja parar? Você ganhará ${recompensaNivel[
                                  currentNivel - 1
                                ]
                                  .toString()
                                  .slice(0, -3)} mil reais.`
                              )
                            ) {
                              props.setGameStarted(false);
                            }
                          }}>
                          PARAR
                        </p>
                      </div>
                      <div className='text-center projecoes'>
                        <div className='valor'>
                          {currentNivel < 15
                            ? recompensaNivel[currentNivel].toString().slice(0, -3) + ' MIL'
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

Game.propTypes = {};

export default Game;
