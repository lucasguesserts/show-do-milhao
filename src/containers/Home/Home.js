import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Home.css';

const Home = (props) => {
  // Destructuring
  const { setGameStarted } = props;

  // Render
  return (
    <section className='home background'>
      <Container>
        <Row>
          <Col>
            <div className='home-control'>
              <div style={{ maxWidth: '320px', margin: 'auto' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '0.8rem',
                    borderRadius: '10px',
                  }}>
                  <p className='text-light'>
                    Seja bem vindo ao Show do Milhão! Este é um projeto experimental, desenvolvido
                    com React por{' '}
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      href='https://github.com/igorschechtel'>
                      Igor Schechtel
                    </a>{' '}
                    para um processo seletivo.
                  </p>
                </div>
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
