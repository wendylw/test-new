import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getContactEmail,
  getOnlineStoreInfoLogo,
  getBusinessName,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
} from '../../redux/modules/app';

class Contact extends Component {
  handleContinue = () => {};
  handleEmailChange = e => {
    const email = e.target.value;
    console.log(email);
    this.props.appActions.updateContactEmail(email);
  };

  render() {
    const { t, contactEmail, onlineStoreLog, businessName, beepSiteUrl, currencySymbol, selectedVoucher } = this.props;
    return (
      <div className="update-contact__page">
        <dl>
          <dt>Business Logo</dt>
          <dd>{onlineStoreLog}</dd>
          <dt>Business Name</dt>
          <dd>{businessName}</dd>
          <dt>Beep site url</dt>
          <dd>{beepSiteUrl}</dd>
          <dt>selected voucher</dt>
          <dd>{currencySymbol + selectedVoucher}</dd>
        </dl>
        <label>
          Email:
          <input style={{ border: '1px solid black' }} onChange={this.handleEmailChange} value={contactEmail} />
        </label>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleContinue}
            >
              {t('CONTINUE')}
            </button>
          </div>
        </footer>
      </div>
    );
  }
}

export default compose(
  withTranslation(['Voucher']),
  connect(
    state => {
      return {
        contactEmail: getContactEmail(state),
        onlineStoreLog: getOnlineStoreInfoLogo(state),
        businessName: getBusinessName(state),
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
