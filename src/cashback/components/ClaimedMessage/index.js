import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from '../../../components/Modal';
import RedeemInfo from '../RedeemInfo';
import succeedAnimationGif from '../../../images/succeed-animation.gif';
import beepRewardImage from '../../../images/beep-reward.jpg';
import './ClaimedMessage.scss';

const ANIMATION_TIME = 3600;

class ClaimedMessage extends React.Component {
  animationSetTimeout = null;

  state = {
    animationGifSrc: null,
  };

  componentDidMount() {
    this.setState({ animationGifSrc: succeedAnimationGif });

    this.animationSetTimeout = setTimeout(() => {
      this.setState({ animationGifSrc: null });

      clearTimeout(this.animationSetTimeout);
    }, ANIMATION_TIME);
  }

  render() {
    const { title, description, isFirstTime, hideMessage, t } = this.props;
    const { animationGifSrc } = this.state;

    return (
      <aside className="aside active" data-test-id="cashback.common.claimed-message.container">
        <div className="aside__section-content border-radius-base">
          <Modal show={true} className="align-middle" data-test-id="cashback.common.claimed-message.modal">
            <Modal.Body className="active">
              <img src={beepRewardImage} alt="beep reward" />
              <div className="modal__detail text-center">
                <h4 className="modal__title text-weight-bolder">{title}</h4>
                {description ? <p className="modal__text">{description}</p> : null}
                {isFirstTime ? (
                  <RedeemInfo
                    buttonClassName="button__fill button__block border-radius-base text-weight-bolder text-uppercase"
                    buttonText={t('HowToUseCashback')}
                  />
                ) : null}

                <button
                  className="button button__block button__block-link link text-uppercase text-weight-bolder"
                  onClick={() => hideMessage()}
                  data-test-id="cashback.common.claimed-message.close-btn"
                >
                  {t('Close')}
                </button>

                {animationGifSrc && (
                  <div className={`succeed-animation ${animationGifSrc ? 'active' : ''}`}>
                    <img src={animationGifSrc} alt="Beep Claimed" />
                  </div>
                )}
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </aside>
    );
  }
}

ClaimedMessage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  isFirstTime: PropTypes.bool,
  hideMessage: PropTypes.func,
};

ClaimedMessage.defaultProps = {
  title: '',
  description: '',
  isFirstTime: false,
  hideMessage: () => {},
};

ClaimedMessage.displayName = 'ClaimedMessage';

export default withTranslation('Cashback')(ClaimedMessage);
