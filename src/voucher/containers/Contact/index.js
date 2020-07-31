import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';

import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getContactEmail,
  getOnlineStoreInfoLogo,
  getOnlineStoreName,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
  getBusinessDisplayName,
} from '../../redux/modules/app';
import { updateVoucherOrderingInfoToSessionStorage } from '../../utils';
import Utils from '../../../utils/utils';
import VoucherGiftCard from '../../components/VoucherGiftCard';
import './VoucherContact.scss';

class Contact extends Component {
  state = {
    invalidEmail: false,
  };

  componentDidMount() {
    this.props.appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    if (!Utils.checkEmailIsValid(this.props.contactEmail)) {
      this.setState({
        invalidEmail: true,
      });
      return;
    }

    updateVoucherOrderingInfoToSessionStorage({
      contactEmail: this.props.contactEmail,
    });

    this.gotoPaymentPage();
  };

  gotoPaymentPage = () => {
    window.location.href = Constants.ROUTER_PATHS.VOUCHER_PAYMENT + '?type=' + Constants.DELIVERY_METHOD.DIGITAL;
  };

  handleEmailChange = e => {
    const email = e.target.value.trim();
    this.props.appActions.updateContactEmail(email);

    this.setState({
      invalidEmail: false,
    });
  };

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_HOME,
      search: window.location.search,
    });
  };

  render() {
    const {
      t,
      contactEmail,
      onlineStoreLogo,
      onlineStoreName,
      businessDisplayName,
      currencySymbol,
      selectedVoucher,
    } = this.props;
    const { invalidEmail } = this.state;
    const invalidEmailClass = invalidEmail ? 'input__error' : '';
    const storeName = onlineStoreName || businessDisplayName;

    return (
      <section className="voucher-contact flex flex-column" data-heap-name="voucher.contact.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="voucher.contact.header"
          isPage={true}
          navFunc={this.handleClickBack}
        />

        <div className="voucher-contact__container">
          <h2 className="text-center padding-normal text-size-biggest text-weight-bolder">{t('GiftCardSelected')}</h2>
          <VoucherGiftCard
            onlineStoreLogo={onlineStoreLogo}
            storeName={storeName}
            currencySymbol={currencySymbol}
            selectedVoucher={selectedVoucher}
          />
          <div className="padding-normal">
            <h2 className="margin-top-bottom-smaller text-size-big text-weight-bolder">{t('SendGiftCardTo')}</h2>
            <p className="voucher-contact__description margin-top-bottom-smaller text-size-big text-line-height-base">
              {t('GiftCardEmailNote')}
            </p>
            <div className="voucher-contact__group form__group">
              <input
                className={`voucher-contact__input form__input ${invalidEmailClass}`}
                data-heap-name="voucher.contact.email-input"
                onChange={this.handleEmailChange}
                value={contactEmail}
              />
            </div>
            {invalidEmail ? <div className="form__error-message">{t('InvalidEmail')}</div> : null}
          </div>
        </div>

        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smallest text-weight-bolder text-uppercase"
            onClick={this.handleContinue}
            disabled={!contactEmail}
            data-heap-name="voucher.contact.continue-btn"
          >
            {t('Continue')}
          </button>
        </footer>
      </section>
    );
  }
}

export default compose(
  withTranslation(['Voucher']),
  connect(
    state => {
      return {
        contactEmail: getContactEmail(state),
        onlineStoreLogo: getOnlineStoreInfoLogo(state),
        onlineStoreName: getOnlineStoreName(state),
        businessDisplayName: getBusinessDisplayName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        selectedVoucher: getSelectedVoucher(state),
        currencySymbol: getCurrencySymbol(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Contact);
