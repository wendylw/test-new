import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from '../../../components/Modal';
import RedeemInfo from '../RedeemInfo';

const ANIMATION_TIME = 3600;

class ClaimedMessage extends React.Component {
  animationSetTimeout = null;

  state = {
    animationGifSrc: null,
  };

  componentDidMount() {
    this.setState({ animationGifSrc: '/img/succeed-animation.gif' });

    this.animationSetTimeout = setTimeout(() => {
      this.setState({ animationGifSrc: null });

      clearTimeout(this.animationSetTimeout);
    }, ANIMATION_TIME);
  }

  render() {
    const { title, description, isFirstTime, hideMessage, t } = this.props;
    const { animationGifSrc } = this.state;

    return (
      <aside className="aside active">
        <div className="aside__section-content border-radius-base">
          <Modal show={true} className="align-middle">
            <Modal.Body className="active">
              <img src="/img/beep-reward.jpg" alt="beep reward" />
              <div className="modal__detail text-center">
                <h4 className="modal__title font-weight-bold">{title}</h4>
                {description ? <p className="modal__text">{description}</p> : null}
                {isFirstTime ? (
                  <RedeemInfo
                    buttonClassName="button__fill button__block border-radius-base font-weight-bold text-uppercase"
                    buttonText={t('HowToUseCashback')}
                  />
                ) : null}

                <button
                  className="button__block button__block-link link text-uppercase font-weight-bold"
                  onClick={() => hideMessage()}
                >
                  {t('Close')}
                </button>

                <div className={`succeed-animation ${animationGifSrc ? 'active' : ''}`}>
                  <img src={animationGifSrc} alt="Beep Claimed" />
                </div>
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

export default withTranslation('Cashback')(ClaimedMessage);
