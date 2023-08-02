import _get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';
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
  constructor(props) {
    super(props);
    this.state = { invalidEmail: false };
  }

  componentDidMount() {
    const { appActions } = this.props;

    appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    const { contactEmail } = this.props;

    if (!Utils.checkEmailIsValid(contactEmail)) {
      this.setState({
        invalidEmail: true,
      });
      return;
    }

    updateVoucherOrderingInfoToSessionStorage({
      contactEmail,
    });

    this.gotoPaymentPage();
  };

  gotoPaymentPage = () => {
    window.location.href = `${Constants.ROUTER_PATHS.VOUCHER_PAYMENT}?type=${Constants.DELIVERY_METHOD.DIGITAL}`;
  };

  handleEmailChange = e => {
    const { appActions } = this.props;

    const email = e.target.value.trim();
    appActions.updateContactEmail(email);

    this.setState({
      invalidEmail: false,
    });
  };

  handleClickBack = () => {
    const { history } = this.props;

    history.push({
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
    const price = _get(selectedVoucher, 'unitPrice', null);

    return (
      <section className="voucher-contact flex flex-column" data-test-id="voucher.contact.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-test-id="voucher.contact.header"
          isPage
          navFunc={this.handleClickBack}
        />

        <div className="voucher-contact__container">
          <h2 className="text-center padding-normal text-size-biggest text-weight-bolder">{t('GiftCardSelected')}</h2>
          <VoucherGiftCard
            onlineStoreLogo={onlineStoreLogo}
            storeName={storeName}
            currencySymbol={currencySymbol}
            selectedVoucher={price}
          />
          <div className="padding-normal">
            <h2 className="margin-top-bottom-small text-size-big text-weight-bolder">{t('SendGiftCardTo')}</h2>
            <p className="voucher-contact__description margin-top-bottom-small text-size-big text-line-height-base">
              {t('GiftCardEmailNote')}
            </p>
            <div className="voucher-contact__group form__group margin-top-bottom-normal">
              <input
                className={`voucher-contact__input form__input padding-left-right-normal text-size-biggest ${invalidEmailClass}`}
                data-test-id="voucher.contact.email-input"
                onChange={this.handleEmailChange}
                value={contactEmail}
              />
            </div>
            {invalidEmail ? <div className="form__error-message">{t('InvalidEmail')}</div> : null}
          </div>
        </div>

        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            onClick={this.handleContinue}
            disabled={!contactEmail}
            data-test-id="voucher.contact.continue-btn"
          >
            {t('Continue')}
          </button>
        </footer>
      </section>
    );
  }
}

Contact.displayName = 'VoucherContact';

Contact.propTypes = {
  appActions: PropTypes.shape({
    updateContactEmail: PropTypes.func,
    initialVoucherOrderingInfo: PropTypes.func,
  }),
  contactEmail: PropTypes.string,
  currencySymbol: PropTypes.string,
  onlineStoreLogo: PropTypes.string,
  onlineStoreName: PropTypes.string,
  selectedVoucher: PropTypes.shape({
    unitPrice: PropTypes.number,
  }),
  businessDisplayName: PropTypes.string,
};

Contact.defaultProps = {
  appActions: {
    updateContactEmail: () => {},
    initialVoucherOrderingInfo: () => {},
  },
  contactEmail: '',
  currencySymbol: '',
  onlineStoreLogo: '',
  onlineStoreName: '',
  businessDisplayName: '',
  selectedVoucher: null,
};

export default compose(
  withTranslation(['Voucher']),
  connect(
    state => ({
      contactEmail: getContactEmail(state),
      onlineStoreLogo: getOnlineStoreInfoLogo(state),
      onlineStoreName: getOnlineStoreName(state),
      businessDisplayName: getBusinessDisplayName(state),
      beepSiteUrl: getBeepSiteUrl(state),
      selectedVoucher: getSelectedVoucher(state),
      currencySymbol: getCurrencySymbol(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Contact);
