import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import CurrencyNumber from '../../../../components/CurrencyNumber';

export class AddressChangeModal extends React.Component {
  state = {
    show: true,
  };
  handleClick = () => {
    this.setState({
      show: false,
    });
  };
  render() {
    const { t, deliveryFee, addressChange } = this.props;

    return (
      <Modal show={this.state.show && (deliveryFee || false) && addressChange} className="align-middle">
        <Modal.Body className="modal__content text-center">
          <h2 className="modal__subtitle text-size-biggest font-weight-bolder">{t('AddressChangeTitle')}</h2>
          <p className="text-size-big">
            {t('AddressChangeDescription')}
            <CurrencyNumber money={deliveryFee || 0} />
          </p>
        </Modal.Body>
        <Modal.Footer className="modal__footer">
          <button
            className="button__fill button__block border-radius-base text-uppercase font-weight-bolder"
            onClick={this.handleClick}
          >
            {t('CONTINUE')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AddressChangeModal.propTypes = {
  deliveryFee: PropTypes.number,
  addressChange: PropTypes.bool,
};

AddressChangeModal.defaultProps = {
  deliveryFee: 0,
  addressChange: false,
};

export default compose(withTranslation('OrderingDelivery'))(AddressChangeModal);
