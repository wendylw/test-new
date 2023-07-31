import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import beepQrScanImage from '../../../images/beep-qrscan.png';
import './RedeemInfo.scss';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';

class RedeemInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showModal: false };
  }

  onHistoryBackReceived = () => {
    const { showModal } = this.state;

    if (showModal === true) {
      this.toggleModal();
    }
  };

  toggleModal = () => {
    const { showModal } = this.state;
    const { onModalVisibilityChanged } = this.props;

    this.setState({ showModal: !showModal });
    onModalVisibilityChanged(!showModal);
  };

  render() {
    const { className, buttonClassName, buttonText, t } = this.props;
    const { showModal } = this.state;

    return (
      <div className={className} data-test-id="cashback.common.redeem-info.container">
        <button
          className={buttonClassName}
          onClick={this.toggleModal.bind(this)}
          data-test-id="cashback.common.redeem-info.toggle-btn"
        >
          {buttonText}
        </button>
        {showModal ? (
          <div className="redeem-info fixed-wrapper" data-test-id="cashback.common.redeem-info.modal">
            <Header
              className="flex-middle"
              contentClassName="flex-middle"
              isPage
              navFunc={this.toggleModal}
              data-test-id="cashback.common.redeem-info.header"
            />

            <section className="padding-normal margin-top-bottom-normal text-center">
              <figure className="redeem-info__image-container">
                <img src={beepQrScanImage} alt="otp" />
              </figure>
              <h2 className="padding-small text-size-big text-weight-bold">{t('HowToUseCashback')}</h2>
              <ol className="redeem-info__list">
                <li className="margin-top-bottom-small text-line-height-base">{t('UseCashbackStep1')}</li>
                <li className="margin-top-bottom-small text-line-height-base">{t('UseCashbackStep2')}</li>
              </ol>
            </section>
          </div>
        ) : null}
      </div>
    );
  }
}

RedeemInfo.propTypes = {
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  buttonText: PropTypes.string,
  onModalVisibilityChanged: PropTypes.func,
};

RedeemInfo.defaultProps = {
  className: '',
  buttonClassName: '',
  buttonText: '',
  onModalVisibilityChanged: () => {},
};

RedeemInfo.displayName = 'RedeemInfo';

export default withTranslation('Cashback')(withBackButtonSupport(RedeemInfo));
