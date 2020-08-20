import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

export class ProductSoldOuteModal extends PureComponent {
  state = {
    // show: true,
  };

  handleHideOfflineStoreModal = () => {
    // this.setState({ show: false });
  };

  render() {
    const { show, t, editHanlder } = this.props;

    // if (!show) return null;
    return (
      <Modal show={!!show} className="align-middle" data-heap-name="ordering.home.product-sold-out.container">
        <Modal.Body className="modal__content text-center">
          <h2 className="modal__subtitle text-size-biggest font-weight-bolder">{t('ProductSoldOutTitle')}</h2>
          <p className="text-size-big">{t('ProductSoldOutTitleDescription')}</p>
        </Modal.Body>
        <Modal.Footer className="modal__footer">
          <button
            className="button__fill button__block border-radius-base text-uppercase font-weight-bolder"
            data-heap-name="ordering.home.offline-store-modal.dismiss-btn"
            onClick={editHanlder}
          >
            {t('EditCart')}
          </button>
        </Modal.Footer>
      </Modal>
      // <div>
      //   testaaa
      // </div>
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
