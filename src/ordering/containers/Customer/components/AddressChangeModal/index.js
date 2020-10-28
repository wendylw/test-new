import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import '../../../../components/MessageModal/MessageModal.scss';
export class AddressChangeModal extends React.Component {
  state = {
    show: true,
  };
  handleClick = () => {
    this.setState({
      show: false,
    });
    this.props.continue();
  };
  render() {
    const { t, deliveryFee, addressChange } = this.props;

    return (
      <Modal show={this.state.show && (deliveryFee || false) && addressChange} className="message-modal">
        <Modal.Body className="text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{t('AddressChangeTitle')}</h2>
          <p className="modal__text padding-top-bottom-small">
            {t('AddressChangeDescription')}
            <CurrencyNumber money={deliveryFee || 0} />
          </p>
        </Modal.Body>
        <Modal.Footer className="padding-small">
          <button
            className="button button__fill button__block text-weight-bolder text-uppercase"
            onClick={this.handleClick}
          >
            {t('Continue')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AddressChangeModal.propTypes = {
  deliveryFee: PropTypes.number,
  addressChange: PropTypes.bool,
  continue: PropTypes.func,
};

AddressChangeModal.defaultProps = {
  deliveryFee: 0,
  addressChange: false,
};

export default compose(withTranslation('OrderingDelivery'))(AddressChangeModal);
