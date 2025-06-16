import React, { useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import homeAudio from '../../data/audio/home.mp3';
import './Home.css';

const Home = (props) => {
  // Refs
  const audioRef = useRef(null);

  // Effects
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(homeAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 1.0; // Set volume to 100%
    
    // Play audio
    const playAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    };
    
    playAudio();
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Destructuring
  const { setGameStarted } = props;

  // Render
  return (
    <section className='home background'>
      <Container>
        <Row>
          <Col>
            <div className='home-control'>
              <div style={{ width: '10%', position: 'fixed', bottom: '10%', left: '45%' }}>
                <button onClick={() => setGameStarted(true)} className='btn'>
                  Começar
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Home;
