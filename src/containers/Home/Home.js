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
