import React, { PureComponent } from 'react';
import beepAlcoholImage from '../../../../../images/beep-alcohol-consent.png';
import Modal from '../../../../../components/Modal';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import TermsAndPrivacy from '../../../../../components/TermsAndPrivacy';
import loggly from '../../../../../utils/monitoring/loggly';
import './AlcoholModal.scss';
import Utils from '../../../../../utils/utils';

export class AlcoholModal extends PureComponent {
  state = {
    confirmNotLegal: false,
  };

  handleClick = isAgeLegal => {
    loggly.log('alcohol-modal.click', { isAgeLegal });
    this.props.handleLegalAge(isAgeLegal);
    if (!isAgeLegal) {
      this.setState({
        confirmNotLegal: true,
      });
    }

    const { setCookieVariable } = Utils;
    const hostName = window.location.hostname;
    const domain = hostName.replace('hcbeep.', '');
    const expires = 'Sun, 16 Jul 3567 06:23:41 GMT';
    setCookieVariable({ name: 'AlcHide', value: '1', expires: expires, domain: domain, path: '/' });
  };

  renderAskContent() {
    const { t, country = 'MY' } = this.props;

    return (
      <Modal className="alcohol-modal" show={true} data-heap-name="ordering.home.alcohol-modal.confirm-modal">
        <Modal.Body className="alcohol-modal__body text-center">
          <div className="alcohol-modal__image">
            <img src={beepAlcoholImage} alt="" />
          </div>
          <h2 className="text-size-biggest text-weight-bolder text-line-height-base">{t('CheckIfDrinkingAge')}</h2>
          <p className="margin-small text-line-height-base">
            {country === 'MY' && t('AlcoholLimitationsMY')}
            {country === 'PH' && t('AlcoholLimitationsPH')}
          </p>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex flex-middle">
            <button
              className="button button__outline button__block margin-small text-weight-bolder"
              data-testid="noIamNot"
              data-heap-name="ordering.home.alcohol-modal.reject"
              onClick={this.handleClick.bind(null, false)}
            >
              {t('AlcoholNo')}
            </button>
            <button
              className="button button__fill button__block margin-small text-weight-bolder"
              data-testid="yesIam"
              data-heap-name="ordering.home.alcohol-modal.accept"
              onClick={this.handleClick.bind(null, true)}
            >
              {t('AlcoholYes')}
            </button>
          </div>
          <p className="alcohol-modal__policy text-center margin-top-bottom-small text-line-height-base">
            <TermsAndPrivacy buttonLinkClassName="alcohol-modal__button-link" />
          </p>
        </Modal.Footer>
      </Modal>
    );
  }

  renderNotLegalContent() {
    const { t } = this.props;
    return (
      <Modal show={true} className="alcohol-modal" data-heap-name="ordering.home.alcohol-modal.reject-modal">
        <Modal.Body className="alcohol-modal__body text-center">
          <div className="alcohol-modal__image">
            <img src={beepAlcoholImage} alt="Beep alcohol" />
          </div>
          <h2 className="text-size-biggest text-weight-bolder text-line-height-base">{t('AlcoholDenied')}</h2>
          <p className="alcohol-modal__policy text-center padding-left-right-small margin-top-bottom-small text-line-height-base">
            {t('AlcoholNotAllowed')}
          </p>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { confirmNotLegal } = this.state;

    if (confirmNotLegal) {
      return this.renderNotLegalContent();
    } else {
      return this.renderAskContent();
    }
  }
}
AlcoholModal.displayName = 'AlcoholModal';

export default compose(withTranslation('OrderingHome'))(AlcoholModal);
