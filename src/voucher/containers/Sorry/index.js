import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';
import beepErrorImage from '../../../images/beep-error.png';
import './VoucherSorry.scss';

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
      <section className="voucher-sorry flex flex-column" data-heap-name="voucher.sorry.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="voucher.sorry.header"
          isPage={true}
          navFunc={this.handleClickBack}
        />

        <div className="voucher-sorry__container">
          <h2 className="voucher-sorry__title text-center padding-normal margin-top-bottom-normal text-size-large">
            {t('TransactionFailed')}
          </h2>
          <div className="voucher-sorry__image-container padding-normal">
            <img alt="Sorry" src={beepErrorImage} />
          </div>
          <p className="text-center padding-normal text-size-big text-line-height-base">
            {t('PaymentMethodDeclined')}
            <br />
            {t('PleaseUpdateAndTryAgain')}
          </p>
        </div>
        <footer className="footer__transparent footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
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
