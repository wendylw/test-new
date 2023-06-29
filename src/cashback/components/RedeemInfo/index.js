import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/Header';
import { withTranslation } from 'react-i18next';
import beepQrScanImage from '../../../images/beep-qrscan.png';
import './RedeemInfo.scss';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';

class RedeemInfo extends React.Component {
  state = {
    showModal: false,
  };

  onHistoryBackReceived = () => {
    if (this.state.showModal === true) {
      this.toggleModal();
    }
  };

  toggleModal() {
    const { showModal } = this.state;

    this.setState({ showModal: !showModal });
    this.props.onModalVisibilityChanged(!showModal);
  }

  render() {
    const { className, buttonClassName, buttonText, t } = this.props;
    const { showModal } = this.state;

    return (
      <div className={className} data-heap-name="cashback.common.redeem-info.container">
        <button
          className={buttonClassName}
          onClick={this.toggleModal.bind(this)}
          data-heap-name="cashback.common.redeem-info.toggle-btn"
        >
          {buttonText}
        </button>
        {showModal ? (
          <div className="redeem-info fixed-wrapper" data-heap-name="cashback.common.redeem-info.modal">
            <Header
              className="flex-middle"
              contentClassName="flex-middle"
              isPage={true}
              navFunc={this.toggleModal.bind(this)}
              data-heap-name="cashback.common.redeem-info.header"
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
  buttonClassName: PropTypes.string,
  buttonText: PropTypes.string,
};

RedeemInfo.defaultProps = {
  buttonClassName: '',
  buttonText: '',
};

RedeemInfo.displayName = 'RedeemInfo';

export default withTranslation('Cashback')(withBackButtonSupport(RedeemInfo));
