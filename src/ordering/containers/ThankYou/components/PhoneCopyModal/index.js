import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import '../../../../components/MessageModal/MessageModal.scss';
export class PhoneCopyModal extends React.Component {
  handleClick = () => {
    this.props.continue();
  };
  render() {
    const { t, show, phoneCopyTitle, phoneCopyContent } = this.props;

    return (
      <Modal show={show} className="message-modal">
        <Modal.Body className="text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{phoneCopyTitle}</h2>
          <p className="modal__text padding-top-bottom-small">{phoneCopyContent}</p>
        </Modal.Body>
        <Modal.Footer className="padding-small">
          <button
            className="button button__fill button__block text-weight-bolder text-uppercase"
            onClick={this.handleClick}
          >
            {t('Ok')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

PhoneCopyModal.propTypes = {
  show: PropTypes.bool,
  continue: PropTypes.func,
  phoneCopyTitle: PropTypes.string,
  phoneCopyContent: PropTypes.string,
};

PhoneCopyModal.defaultProps = {
  show: false,
  continue: () => {},
  phoneCopyTitle: '',
  phoneCopyContent: '',
};

export default compose(withTranslation('OrderingThankYou'))(PhoneCopyModal);
