import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Utils from '../../../../../utils/utils';
import HybridHeader from '../../../../../components/HybridHeader';
import constants from '../../../../../utils/constants';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { actions as appActionCreators, getUser, getDeliveryDetails } from '../../../../redux/modules/app';
import { actions as ContactDetailActions } from './redux';
import 'react-phone-number-input/style.css';
import './ContactDetail.scss';
import { getAddressInfo } from '../AddressDetail/redux/index';
import { updateContactDetail, getUsername, getPhone } from './redux/index';
const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class ContactDetail extends Component {
  componentDidMount() {
    const { deliveryDetails, init } = this.props;
    const { phone, username } = deliveryDetails;
    init({ phone, username });
  }

  handleClickBack = () => {
    const { history } = this.props;
    history.push({
      pathname: constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    });
  };

  handleClickContinue = async () => {
    this.props.updateContactDetail();
    this.handleClickBack();
  };

  render() {
    const { t, country, username, phone, updateUserName, updatePhone } = this.props;
    return (
      <div className="contact-details flex flex-column">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={t('ContactDetails')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="contact-details__container padding-left-right-normal">
          <p className="text-size-small text-line-height-base text-opacity margin-top-bottom-normal">
            {t('ContactTip')}
          </p>
          <div className="margin-top-bottom-normal">
            <form>
              <div className="padding-top-bottom-small">
                <div className="contact-details__group form__group">
                  <input
                    className="contact-details__input form__input padding-left-right-normal text-size-biggest"
                    data-heap-name="ordering.contact-details.name-input"
                    type="text"
                    placeholder={t('Name')}
                    value={username}
                    onChange={e => {
                      updateUserName(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="padding-top-bottom-small">
                <PhoneInput
                  international // If input want to show country code when phone number is empty, pls add international on props
                  smartCaret={false}
                  data-heap-name="ordering.contact-details.phone-input"
                  placeholder={t('EnterPhoneNumber')}
                  value={formatPhoneNumberIntl(phone)}
                  country={country}
                  metadata={metadataMobile}
                  onChange={phone => {
                    const selectedCountry = document.querySelector('.PhoneInputCountrySelect').value;

                    updatePhone(
                      metadataMobile.countries[selectedCountry] &&
                        Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0])
                    );
                  }}
                />
              </div>
            </form>
          </div>
        </section>
        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="ordering-cart__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            onClick={this.handleClickBack.bind(this)}
            data-heap-name="ordering.cart.back-btn"
          >
            {t('Back')}
          </button>
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            disabled={!username || !username.length || !isValidPhoneNumber(phone || '')}
            onClick={this.handleClickContinue}
          >
            {t('Continue')}
          </button>
        </footer>
      </div>
    );
  }
}
ContactDetail.displayName = 'ContactDetail';

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      username: getUsername(state),
      phone: getPhone(state),
      deliveryDetails: getDeliveryDetails(state),
      addressInfo: getAddressInfo(state),
    }),
    {
      updateDeliveryDetails: appActionCreators.updateDeliveryDetails,
      init: ContactDetailActions.init,
      updateUserName: ContactDetailActions.updateUserName,
      updatePhone: ContactDetailActions.updatePhone,
      updateContactDetail,
    }
  )
)(ContactDetail);
