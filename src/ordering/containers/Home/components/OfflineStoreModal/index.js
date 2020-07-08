import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

export class OfflineStoreModal extends PureComponent {
  state = {
    show: true,
  };

  handleHideOfflineStoreModal = () => {
    this.setState({ show: false });
  };

  render() {
    const { t, enableLiveOnline, currentStoreName } = this.props;
    const { show } = this.state;

    return (
      <Modal
        show={!enableLiveOnline && show}
        className="align-middle"
        data-heap-name="ordering.home.offline-store-modal.container"
      >
        <Modal.Body className="modal__content text-center">
          <h2 className="modal__subtitle text-size-biggest text-weight-bolder">
            {t('OfflinePromptTitle', { storeName: currentStoreName })}
          </h2>
          <p className="text-size-big">{t('OfflinePromptDescription')}</p>
        </Modal.Body>
        <Modal.Footer className="modal__footer">
          <button
            className="button__fill button__block border-radius-base text-uppercase text-weight-bolder"
            data-heap-name="ordering.home.offline-store-modal.dismiss-btn"
            onClick={this.handleHideOfflineStoreModal.bind(this)}
          >
            {t('Dismiss')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

OfflineStoreModal.propTypes = {
  enableLiveOnline: PropTypes.bool,
  currentStoreName: PropTypes.string,
};

OfflineStoreModal.defaultProps = {
  enableLiveOnline: true,
  currentStoreName: '',
};

export default compose(withTranslation('OrderingHome'))(OfflineStoreModal);
