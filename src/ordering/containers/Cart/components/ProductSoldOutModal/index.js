import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import '../../../../components/MessageModal/MessageModal.scss';

export class ProductSoldOuteModal extends PureComponent {
  render() {
    const { show, t, editHandler } = this.props;

    return (
      <Modal show={!!show} className="message-modal" data-heap-name="ordering.home.product-sold-out.container">
        <Modal.Body className="text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">{t('ProductSoldOutTitle')}</h2>
          <p className="modal__text padding-small">{t('ProductSoldOutTitleDescription')}</p>
        </Modal.Body>
        <Modal.Footer className="padding-small">
          <button
            className="button button__fill button__block text-weight-bolder text-uppercase"
            data-heap-name="ordering.cart.sold-out-modal.edit-btn"
            onClick={editHandler}
          >
            {t('EditCart')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ProductSoldOuteModal.propTypes = {
  show: PropTypes.bool,
};

ProductSoldOuteModal.defaultProps = {
  show: true,
};

export default compose(withTranslation('OrderingCart'))(ProductSoldOuteModal);
