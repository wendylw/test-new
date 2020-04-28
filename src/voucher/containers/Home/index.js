import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfoLogo,
  getBusinessName,
  getVoucherList,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
} from '../../redux/modules/app';

class Home extends Component {
  handleContinue = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_CONTACT,
      search: window.location.search,
    });
  };

  handleSelectVoucher = voucher => {
    this.props.appActions.selectVoucher(voucher);
  };

  render() {
    const { t, onlineStoreLog, businessName, beepSiteUrl, voucherList, currencySymbol, selectedVoucher } = this.props;
    return (
      <div className="select-voucher__page">
        <dl>
          <dt>Business Logo</dt>
          <dd>{onlineStoreLog}</dd>
          <dt>Business Name</dt>
          <dd>{businessName}</dd>
          <dt>Beep site url</dt>
          <dd>{beepSiteUrl}</dd>
          <dt>Voucher List</dt>
          <dd>
            {voucherList.map((voucher, index) => {
              const active = selectedVoucher === voucher ? 'active' : '';
              return (
                <button
                  className={'select-voucher__button ' + active}
                  onClick={() => {
                    this.handleSelectVoucher(voucher);
                  }}
                  key={index}
                  style={{ border: '1px solid black', padding: '10px', margin: '10px' }}
                >
                  {currencySymbol} {voucher}
                </button>
              );
            })}
          </dd>
        </dl>
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
        onlineStoreLog: getOnlineStoreInfoLogo(state),
        businessName: getBusinessName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        voucherList: getVoucherList(state),
        selectedVoucher: getSelectedVoucher(state),
        currencySymbol: getCurrencySymbol(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Home);
