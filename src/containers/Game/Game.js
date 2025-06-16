import React, { useState, useEffect, Fragment, useRef } from 'react';

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

import certaRespostaAudio from '../../data/audio/certa_resposta.mp3';
import erradaRespostaAudio from '../../data/audio/errada_resposta.mp3';
import tempoAcabouAudio from '../../data/audio/tempo_acabou.mp3';
import ticTocAudio from '../../data/audio/tic_toc.mp3';
import ganhouChocolataoAudio from '../../data/audio/ganhou_chocolatao.mp3';
import ganhouChocolateAudio from '../../data/audio/ganhou_chocolate.mp3';
import ganhouChocolatinhoAudio from '../../data/audio/ganhou_chocolatinho.mp3';
import ganhouChuparDedoAudio from '../../data/audio/chupar_dedo.ogg';

const noPrizeOption = "Chupar o Dedo";
const tempo_para_responder_pergunta = 30;
const tempo_para_pesquisar = 40;
const tempo_para_plateia = 90;
const perguntas_faceis_a_fazer = 4;
const perguntas_medias_a_fazer = 6;
const perguntas_dificeis_a_fazer = 2;
const acertos_para_ganhar = perguntas_faceis_a_fazer + perguntas_medias_a_fazer + perguntas_dificeis_a_fazer;
const recompensaPorNivel = Array(acertos_para_ganhar - 3 + 2).fill(noPrizeOption).concat(["Chocolatinho", "Chocolate", "Chocolatão"]);


if (acertos_para_ganhar < 3) {
  throw new Error('acertos_para_ganhar deve ser maior ou igual a 3');
}
if (tempo_para_responder_pergunta < 1) {
  throw new Error('tempo_para_responder_pergunta deve ser maior ou igual a 1');
}

const Game = ({ setGameStarted }) => {
  // States
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

  const [ajudaPlateiaDisponiveis, setAjudaPlateiaDisponiveis] = useState(1);
  const [showPlateiaPrompt, setShowPlateiaPrompt] = useState(false);
  const [timerPlateia, setTimerPlateia] = useState(null);
  const [counterPlateia, setCounterPlateia] = useState(1);

  const [pesquisaDisponiveis, setPesquisaDisponiveis] = useState(1);
  const [showPesquisasPrompt, setShowPesquisasPrompt] = useState(false);
  const [timerPesquisas, setTimerPesquisas] = useState(null);
  const [counterPesquisas, setCounterPesquisas] = useState(1);

  const [perguntasFaceis, setPerguntasFaceis] = useState(bancoPerguntas.filter((p) => p.dificuldade === 'Fácil'));
  const [perguntasFaceisRestantes, setPerguntasFaceisRestantes] = useState(perguntas_faceis_a_fazer);
  const [perguntasMedias, setPerguntasMedias] = useState(bancoPerguntas.filter((p) => p.dificuldade === 'Média'));
  const [perguntasMediasRestantes, setPerguntasMediasRestantes] = useState(perguntas_medias_a_fazer);
  const [perguntasDificeis, setPerguntasDificeis] = useState(bancoPerguntas.filter((p) => p.dificuldade === 'Difícil'));
  const [perguntasDificeisRestantes, setPerguntasDificeisRestantes] = useState(perguntas_dificeis_a_fazer);


  // Seleciona pergunta aleatoria
  const getPerguntaAleatoria = (currentNivel) => {
    if (perguntasFaceis.length < perguntasFaceisRestantes) {
      throw new Error(`O número de perguntas fáceis disponíveis (${perguntasFaceis.length}) é menor que o número de perguntas fáceis a fazer (${perguntas_faceis_a_fazer}).`);
    }
    if (perguntasMedias.length < perguntasMediasRestantes) {
      throw new Error(`O número de perguntas médias disponíveis (${perguntasMedias.length}) é menor que o número de perguntas médias a fazer (${perguntas_medias_a_fazer}).`);
    }
    if (perguntasDificeis.length < perguntasDificeisRestantes) {
      throw new Error(`O número de perguntas difíceis disponíveis (${perguntasDificeis.length}) é menor que o número de perguntas difíceis a fazer (${perguntas_dificeis_a_fazer}).`);
    }
    console.log(`perguntas faceis disponiveis: ${perguntasFaceis.length}`)
    console.log(`perguntas medias disponiveis: ${perguntasMedias.length}`)
    console.log(`perguntas dificeis disponiveis: ${perguntasDificeis.length}`)
    console.log(`perguntas faceis restantes: ${perguntasFaceisRestantes}`)
    console.log(`perguntas medias restantes: ${perguntasMediasRestantes}`)
    console.log(`perguntas dificeis restantes: ${perguntasDificeisRestantes}`)
    console.log("========")
    let pergunta, randomIndex;
    if (currentNivel <= perguntas_faceis_a_fazer) {
      randomIndex = Math.floor(Math.random() * perguntasFaceis.length);
      pergunta = perguntasFaceis[randomIndex];
      const newPerguntasFaceis = [...perguntasFaceis];
      newPerguntasFaceis.splice(randomIndex, 1);
      setPerguntasFaceis(newPerguntasFaceis);
      setPerguntasFaceisRestantes(perguntasFaceisRestantes - 1);
    } else if (currentNivel <= perguntas_faceis_a_fazer + perguntas_medias_a_fazer) {
      randomIndex = Math.floor(Math.random() * perguntasMedias.length);
      pergunta = perguntasMedias[randomIndex];
      const newPerguntasMedias = [...perguntasMedias];
      newPerguntasMedias.splice(randomIndex, 1);
      setPerguntasMedias(newPerguntasMedias);
      setPerguntasMediasRestantes(perguntasMediasRestantes - 1);
    } else if (currentNivel <= perguntas_faceis_a_fazer + perguntas_medias_a_fazer + perguntas_dificeis_a_fazer) {
      randomIndex = Math.floor(Math.random() * perguntasDificeis.length);
      pergunta = perguntasDificeis[randomIndex];
      const newPerguntasDificeis = [...perguntasDificeis];
      newPerguntasDificeis.splice(randomIndex, 1);
      setPerguntasDificeis(newPerguntasDificeis);
      setPerguntasDificeisRestantes(perguntasDificeisRestantes - 1);
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
    setCurrentNivel(0); // start at 0 so that continueGame() will start at 1
    setCounterInicio(0);
    setCartaValue(Math.floor(Math.random() * 4));
    setCartaEnabled(false);
  }, []);



  // songs

  //// certa resposta
  const certaRespostaAudioRef = useRef(null);
  // certa resposta
  useEffect(() => {
    certaRespostaAudioRef.current = new Audio(certaRespostaAudio);
    certaRespostaAudioRef.current.loop = false;
    certaRespostaAudioRef.current.volume = 1.0;
    return () => {
      if (certaRespostaAudioRef.current) {
        certaRespostaAudioRef.current.pause();
        certaRespostaAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// errada resposta
  const erradaRespostaAudioRef = useRef(null);
  // errada resposta
  useEffect(() => {
    erradaRespostaAudioRef.current = new Audio(erradaRespostaAudio);
    erradaRespostaAudioRef.current.loop = false;
    erradaRespostaAudioRef.current.volume = 1.0;
    return () => {
      if (erradaRespostaAudioRef.current) {
        erradaRespostaAudioRef.current.pause();
        erradaRespostaAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// tempo acabou
  const tempoAcabouAudioRef = useRef(null);
  // tempo acabou
  useEffect(() => {
    tempoAcabouAudioRef.current = new Audio(tempoAcabouAudio);
    tempoAcabouAudioRef.current.loop = false;
    tempoAcabouAudioRef.current.volume = 1.0;
    return () => {
      if (tempoAcabouAudioRef.current) {
        tempoAcabouAudioRef.current.pause();
        tempoAcabouAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// tic toc
  const ticTocAudioRef = useRef(null);
  // tic toc
  useEffect(() => {
    ticTocAudioRef.current = new Audio(ticTocAudio);
    ticTocAudioRef.current.loop = true;
    ticTocAudioRef.current.volume = 1.0;
    return () => {
      if (ticTocAudioRef.current) {
        ticTocAudioRef.current.pause();
        ticTocAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// ganhou chocolatao
  const ganhouChocolataoAudioRef = useRef(null);
  // ganhou chocolatao
  useEffect(() => {
    ganhouChocolataoAudioRef.current = new Audio(ganhouChocolataoAudio);
    ganhouChocolataoAudioRef.current.loop = false;
    ganhouChocolataoAudioRef.current.volume = 1.0;
    return () => {
      if (ganhouChocolataoAudioRef.current) {
        ganhouChocolataoAudioRef.current.pause();
        ganhouChocolataoAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// ganhou chocolate
  const ganhouChocolateAudioRef = useRef(null);
  // ganhou chocolate
  useEffect(() => {
    ganhouChocolateAudioRef.current = new Audio(ganhouChocolateAudio);
    ganhouChocolateAudioRef.current.loop = false;
    ganhouChocolateAudioRef.current.volume = 1.0;
    return () => {
      if (ganhouChocolateAudioRef.current) {
        ganhouChocolateAudioRef.current.pause();
        ganhouChocolateAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// ganhou chocolatinho
  const ganhouChocolatinhoAudioRef = useRef(null);
  // ganhou chocolatinho
  useEffect(() => {
    ganhouChocolatinhoAudioRef.current = new Audio(ganhouChocolatinhoAudio);
    ganhouChocolatinhoAudioRef.current.loop = false;
    ganhouChocolatinhoAudioRef.current.volume = 1.0;
    return () => {
      if (ganhouChocolatinhoAudioRef.current) {
        ganhouChocolatinhoAudioRef.current.pause();
        ganhouChocolatinhoAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  //// ganhou chupar dedo
  const ganhouChuparDedoAudioRef = useRef(null);
  // ganhou chupar dedo
  useEffect(() => {
    ganhouChuparDedoAudioRef.current = new Audio(ganhouChuparDedoAudio);
    ganhouChuparDedoAudioRef.current.loop = false;
    ganhouChuparDedoAudioRef.current.volume = 1.0;
    return () => {
      if (ganhouChuparDedoAudioRef.current) {
        ganhouChuparDedoAudioRef.current.pause();
        ganhouChuparDedoAudioRef.current.currentTime = 0;
      }
    };
  }, [counterInicio]);

  const playPrizeAudio = () => {
    switch (recompensaPorNivel[currentNivel + 1]) {
      case recompensaPorNivel[recompensaPorNivel.length - 1]:
        ganhouChocolataoAudioRef.current.play();
        break;
      case recompensaPorNivel[recompensaPorNivel.length - 2]:
        ganhouChocolateAudioRef.current.play();
        break;
      case recompensaPorNivel[recompensaPorNivel.length - 3]:
        ganhouChocolatinhoAudioRef.current.play();
        break;
      default:
        ganhouChuparDedoAudioRef.current.play();
        break;
    }
  };

  //// stop sounds
  const stopSounds = () => {
    if (certaRespostaAudioRef.current) {
      certaRespostaAudioRef.current.pause();
      certaRespostaAudioRef.current.currentTime = 0;
    }
    if (erradaRespostaAudioRef.current) {
      erradaRespostaAudioRef.current.pause();
      erradaRespostaAudioRef.current.currentTime = 0;
    }
    if (tempoAcabouAudioRef.current) {
      tempoAcabouAudioRef.current.pause();
      tempoAcabouAudioRef.current.currentTime = 0;
    }
    if (ticTocAudioRef.current) {
      ticTocAudioRef.current.pause();
      ticTocAudioRef.current.currentTime = 0;
    }
    if (ganhouChocolataoAudioRef.current) {
      ganhouChocolataoAudioRef.current.pause();
      ganhouChocolataoAudioRef.current.currentTime = 0;
    }
    if (ganhouChocolateAudioRef.current) {
      ganhouChocolateAudioRef.current.pause();
      ganhouChocolateAudioRef.current.currentTime = 0;
    }
    if (ganhouChocolatinhoAudioRef.current) {
      ganhouChocolatinhoAudioRef.current.pause();
      ganhouChocolatinhoAudioRef.current.currentTime = 0;
    }
    if (ganhouChuparDedoAudioRef.current) {
      ganhouChuparDedoAudioRef.current.pause();
      ganhouChuparDedoAudioRef.current.currentTime = 0;
    }
  };

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
    stopSounds();
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
    stopSounds();
    if (currentPergunta.resposta === resposta.toString()) {
      // certa resposta song
      certaRespostaAudioRef.current.play();
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
      // errada resposta song
      erradaRespostaAudioRef.current.play();
      setGameOver(true);
      setShowModal(true);
    }
  };

  // Pula a pergunta
  const pularPergunta = () => {
    stopSounds();
    setPularDisponiveis((p) => p - 1);
    clearInterval(timerPergunta);
    setShowNextQuestionPrompt(true);
    setCurrentNivel((c) => c - 1);
    setCartaEnabled(false);
  };

  // Continue game when prompt is dismissed
  const continueGame = () => {
    stopSounds();
    setShowNextQuestionPrompt(false);
    setCurrentNivel((c) => c + 1);
    getPerguntaAleatoria(currentNivel + 1);
    iniciaTimerPergunta();
    setCartaEnabled(false);
  };

  const usarCartas = () => {
    stopSounds();
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

  const cartasResumeGame = () => {
    stopSounds();
    setShowCardsPrompt(false);
    iniciaTimerPergunta();
  };

  const perguntaJaRespondida = () => {
    stopSounds();
    const password = "sim";
    const input_password = window.prompt(`Essa pergunta realmente já foi respondida? (digite "${password}" para confirmar)`);
    if (input_password === password) {
      clearInterval(timerPergunta);
      setShowNextQuestionPrompt(true);
      setCurrentNivel((c) => c - 1);
      setCartaEnabled(false);
    }
  }

  const iniciaTimerPesquisas = () => {
    stopSounds();
    clearInterval(timerPesquisas);
    setCounterPesquisas(tempo_para_pesquisar);
    ticTocAudioRef.current.play();
    setTimerPesquisas(
      setInterval(() => {
        setCounterPesquisas((c) => c - 1);
      }, 1000)
    );
  };

  const usarPesquisa = () => {
    stopSounds();
    setPesquisaDisponiveis((p) => p - 1);
    clearInterval(timerPergunta);
    setShowPesquisasPrompt(true);
    setCounterPesquisas(tempo_para_pesquisar);
  };

  const pesquisasResumeGame = () => {
    stopSounds();
    setShowPesquisasPrompt(false);
    iniciaTimerPergunta();
  };

  const timerPesquisasFinished = () => {
    clearInterval(timerPesquisas);
    ticTocAudioRef.current.pause();
    tempoAcabouAudioRef.current.play();
  };

  const usarAjudaPlateia = () => {
    stopSounds();
    setAjudaPlateiaDisponiveis((a) => a - 1);
    clearInterval(timerPergunta);
    setShowPlateiaPrompt(true);
    setCounterPlateia(tempo_para_plateia);
  };

  const iniciaTimerPlateia = () => {
    stopSounds();
    clearInterval(timerPlateia);
    setCounterPlateia(tempo_para_plateia);
    ticTocAudioRef.current.play();
    setTimerPlateia(
      setInterval(() => {
        setCounterPlateia((c) => c - 1);
      }, 1000)
    );
  };

  const plateiaResumeGame = () => {
    stopSounds();
    setShowPlateiaPrompt(false);
    iniciaTimerPergunta();
  };

  const timerPlateiaFinished = () => {
    clearInterval(timerPlateia);
    ticTocAudioRef.current.pause();
    tempoAcabouAudioRef.current.play();
  };

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
      {showPesquisasPrompt && (
        <div className="prompt-modal">
          <div className="prompt-content">
            <h3>Pronto para pesquisar?</h3>
            <p>A pergunta é:</p>
            <blockquote>{currentPergunta.pergunta}</blockquote>
            <p>Tempo disponível para pesquisa: {counterPesquisas}</p>
            <p><Button className="btn btn-primary" onClick={iniciaTimerPesquisas}>Iniciar</Button></p>
            <p><Button className="btn btn-primary" onClick={pesquisasResumeGame}>Responder</Button></p>
            {counterPesquisas === 0 && timerPesquisasFinished()}
          </div>
        </div>
      )}
      {showPlateiaPrompt && (
        <div className="prompt-modal">
          <div className="prompt-content">
            <h3>Peça ajuda para a plateia!</h3>
            <p>A pergunta é:</p>
            <blockquote>{currentPergunta.pergunta}</blockquote>
            <p>Tempo disponível para ajuda da plateia: {counterPlateia}</p>
            <p><Button className="btn btn-primary" onClick={iniciaTimerPlateia}>Iniciar</Button></p>
            <p><Button className="btn btn-primary" onClick={plateiaResumeGame}>Responder</Button></p>
            {counterPlateia === 0 && timerPlateiaFinished()}
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
          {counterPergunta === 0 && tempoAcabouAudioRef.current.play() &&
            `Sinto muito, o seu tempo acabou. A opção certa era ${
              currentPergunta.alternativas[parseInt(currentPergunta.resposta) - 1]
            }.\nVoce ganhou: ${noPrizeOption}`}
          {gameOver &&
            `A resposta está ERRADA. A opção certa era ${
              currentPergunta.alternativas[parseInt(currentPergunta.resposta) - 1]
            }.\nVoce ganhou: ${noPrizeOption}`}
          {gameWon && ganhouChocolataoAudioRef.current.play() && (
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
      <Container>
        <Row>
          <Col>
            <div className='game-control text-center'>
              <figure style={{ margin: '0' }}>
                <img src={logo} alt='logo-show-do-milhao img-fluid' style={{ maxWidth: '240px' }} />
              </figure>
              {(
                <div className='contador-perguntas'>
                  {currentNivel !== acertos_para_ganhar ? (
                    <p className='text-light' style={{ margin: '0' }}>Pergunta Número {currentNivel} de {acertos_para_ganhar}</p>
                  ) : (
                    <p className='text-light' style={{ margin: '0' }}>Última Pergunta</p>
                  )}
                </div>
              )}
              <div className='pergunta' style={{ margin: '0, auto' }}>
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

                  <Row className='mt-4' style={{ margin: '0 auto' }}>
                    <Col xs='auto' className='mx-auto' style={{ margin: '0 auto' }}>
                      <div className='text-center opcoes' style={{ margin: '0 auto' }}>
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
                        {currentNivel < acertos_para_ganhar && ajudaPlateiaDisponiveis > 0 && (
                          <div className='opcao' onClick={usarAjudaPlateia}>
                            PLATEIA ({ajudaPlateiaDisponiveis})
                          </div>
                        )}
                        {currentNivel < acertos_para_ganhar && pesquisaDisponiveis > 0 && (
                          <div className='opcao' onClick={usarPesquisa}>
                            PESQUISA ({pesquisaDisponiveis})
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

                  <Row className='mt-5' style={{ margin: '0 auto' }}>
                    <Col xs='auto' className='mx-auto' style={{ margin: '0 auto' }}>
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
