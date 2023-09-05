import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import Modal from '../../../../../components/Modal';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import '../../../../components/MessageModal/MessageModal.scss';

class AddressChangeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
    };
  }

  handleClick = () => {
    this.setState({
      show: false,
    });
  };

  render() {
    const { show } = this.state;
    const { t, deliveryFee, addressChange } = this.props;

    return (
      <Modal show={show && (deliveryFee || false) && addressChange} className="message-modal">
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
            data-test-id="ordering.customer.address-change-modal.continue-btn"
            onClick={this.handleClick}
          >
            {t('Continue')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AddressChangeModal.displayName = 'AddressChangeModal';

AddressChangeModal.propTypes = {
  deliveryFee: PropTypes.number,
  addressChange: PropTypes.bool,
};

AddressChangeModal.defaultProps = {
  deliveryFee: 0,
  addressChange: false,
};

export default compose(withTranslation('OrderingDelivery'))(AddressChangeModal);
