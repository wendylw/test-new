import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import './OfflineStoreModal.scss';

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
        className="offline-store-modal"
        data-heap-name="ordering.home.offline-store-modal.container"
      >
        <Modal.Body className="offline-store-modal__body text-center">
          <h2 className="padding-small text-size-biggest text-weight-bolder">
            {t('OfflinePromptTitle', { storeName: currentStoreName })}
          </h2>
          <p className="padding-left-right-smaller margin-small text-size-big">{t('OfflinePromptDescription')}</p>
        </Modal.Body>
        <Modal.Footer className="padding-small">
          <button
            className="button button__fill button__block border-radius-base text-uppercase text-weight-bolder"
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
