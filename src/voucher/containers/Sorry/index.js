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
    window.location.href = Constants.ROUTER_PATHS.VOUCHER_PAYMENT + '?type=' + Constants.DELIVERY_METHOD.DIGITAL;
  };

  render() {
    const { t } = this.props;
    return (
      <section className="sorry-page" data-heap-name="voucher.sorry.container">
        <Header clickBack={this.handleClickBack} data-heap-name="voucher.sorry.header" />
        <div className="sorry-page__title">{t('TransactionFailed')}</div>
        <div className="sorry-page__image">
          <img alt="Sorry" src={beepErrorImage} />
        </div>
        <div className="sorry-page__content">
          {t('PaymentMethodDeclined')}
          <br />
          {t('PleaseUpdateAndTryAgain')}
        </div>
        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smallest text-weight-bolder text-uppercase"
            data-heap-name="voucher.sorry.try-again-btn"
            onClick={this.handleClickBack}
          >
            {t('TryAgain')}
          </button>
        </footer>
      </section>
    );
  }
}

export default withTranslation(['Voucher'])(Sorry);
