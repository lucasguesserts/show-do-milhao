import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

const UncloseableModal = (props) => {
  // Destructuring
  const { title, children, show, setShow } = props;

  // Render
  return (
    <Modal show={show} onHide={() => setShow(false)} centered backdrop='static' keyboard={false}>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

UncloseableModal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
};

export default UncloseableModal;
