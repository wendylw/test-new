import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/Modal';
import { withTranslation } from 'react-i18next';

class PopUpMessage extends React.Component {
  render() {
    const { description, title, button, containerClass = '' } = this.props;

    return (
      <Modal show={true} className={`align-middle ${containerClass}`} hideOnBlank>
        <Modal.Body className="active">
          <div className="modal__detail text-center">
            <h4 className="modal__title font-weight-bolder">{title}</h4>
            {description ? <p className="modal__text">{description}</p> : null}
          </div>
        </Modal.Body>
        <Modal.Footer>{button}</Modal.Footer>
      </Modal>
    );
  }
}

PopUpMessage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default withTranslation()(PopUpMessage);
