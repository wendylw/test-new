import React, { PureComponent } from 'react';
import beepAlcoholImage from '../../../../../images/beep-alcohol-consent.png';
import Modal from '../../../../../components/Modal';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import { BrowserRouter, Link } from 'react-router-dom';
import Constants from '../../../../../utils/constants';

export class AlcoholModal extends PureComponent {
  state = {
    confirmNotLegal: false,
  };

  handleClick = isAgeLegal => {
    this.props.handleLegalAge(isAgeLegal);
    if (!isAgeLegal) {
      this.setState({
        confirmNotLegal: true,
      });
    }
  };

  renderAskContent() {
    const { t, country = 'MY' } = this.props;
    return (
      <Modal
        show={true}
        className="modal align-middle alcohol-modal"
        data-heap-name="ordering.home.alcohol-modal.confirm-modal"
      >
        <Modal.Body className="modal__content text-center">
          <div className="alcohol-modal__image">
            <img src={beepAlcoholImage} alt="" />
          </div>
          <div className="alcohol-modal__title">{t('CheckIfDrinkingAge')}</div>
          <div className="alcohol-modal__content">
            {country === 'MY' && t('AlcoholLimitationsMY')}
            {country === 'PH' && t('AlcoholLimitationsPH')}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="alcohol-modal__buttons text-center">
            <button
              className="btn"
              data-testid="noIamNot"
              data-heap-name="ordering.home.alcohol-modal.reject"
              onClick={this.handleClick.bind(null, false)}
            >
              {t('AlcoholNo')}
            </button>
            <button
              className="btn active"
              data-testid="yesIam"
              data-heap-name="ordering.home.alcohol-modal.accept"
              onClick={this.handleClick.bind(null, true)}
            >
              {t('AlcoholYes')}
            </button>
          </div>
          <div className="alcohol-modal__policy">
            <BrowserRouter basename="/">
              <Trans i18nKey="TermsAndPrivacyDescription">
                By tapping to continue, you agree to our
                <br />
                <Link
                  className="text-weight-bolder link__non-underline"
                  target="_blank"
                  to={Constants.ROUTER_PATHS.TERMS_OF_USE}
                  data-heap-name="ordering.home.alcohol-modal.terms"
                >
                  Terms of Service
                </Link>
                , and{' '}
                <Link
                  className="text-weight-bolder link__non-underline"
                  target="_blank"
                  to={Constants.ROUTER_PATHS.PRIVACY}
                  data-heap-name="ordering.home.alcohol-modal.privacy-policy"
                >
                  Privacy Policy
                </Link>
                .
              </Trans>
            </BrowserRouter>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }

  renderNotLegalContent() {
    const { t } = this.props;
    return (
      <Modal
        show={true}
        className="modal align-middle alcohol-modal"
        data-heap-name="ordering.home.alcohol-modal.reject-modal"
      >
        <Modal.Body className="modal__content text-center">
          <div className="alcohol-modal__image">
            <img src={beepAlcoholImage} alt="" />
          </div>
          <div className="alcohol-modal__title">{t('AlcoholDenied')}</div>
          <div className="alcohol-modal__content">{t('AlcoholNotAllowed')}</div>
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

export default compose(withTranslation('OrderingHome'))(AlcoholModal);
