import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Constants from '../../../utils/constants';
import beepErrorImage from '../../../images/beep-error.png';

class Sorry extends Component {
  handleClickBack = () => {
    this.gotoPaymentPage();
  };

  gotoPaymentPage = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_PAYMENT,
      search: `${window.location.search}&type=${Constants.DELIVERY_METHOD.DIGITAL}`,
    });
  };

  render() {
    const { t } = this.props;
    return (
      <section className="sorry-page">
        <Header clickBack={this.handleClickBack} />
        <div className="sorry-page__title">{t('Sorry')}!</div>
        <div className="sorry-page__image">
          <img alt="Sorry" src={beepErrorImage} />
        </div>
        <div className="sorry-page__content">
          Your payment method was declined update it or use a new payment method and try again
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleClickBack}
            >
              {t('BackToPayment')}
            </button>
          </div>
        </footer>
      </section>
    );
  }
}

export default withTranslation(['Voucher'])(Sorry);