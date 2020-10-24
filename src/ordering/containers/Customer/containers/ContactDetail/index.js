import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl } from 'react-phone-number-input/mobile';
import Utils from '../../../../../utils/utils';
import Header from '../../../../../components/Header';
import constants from '../../../../../utils/constants';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { getUser } from '../../../../redux/modules/app';
import { actions as customerActionCreators, getDeliveryDetails } from '../../../../redux/modules/customer';
import './ContactDetail.scss';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class ContactDetail extends Component {
  handleClickBack = () => {
    const { history } = this.props;
    history.push({
      pathname: constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    });
  };

  render() {
    const { t, user, country, deliveryDetails } = this.props;
    const { phone, username: name } = deliveryDetails;

    console.log('deliveryDetails', deliveryDetails);
    // const { name } = user || {};
    return (
      <div className="contact-details flex flex-column">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={t('ContactDetails')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="contact-details__container padding-left-right-normal">
          <p className="text-size-small text-line-height-base text-opacity">{t('ContactTip')}</p>
          <div className="margin-top-bottom-normal">
            <form>
              <div className="padding-top-bottom-small">
                <div className="contact-details__group form__group">
                  <input
                    className="contact-details__input form__input padding-left-right-normal text-size-biggest"
                    data-heap-name="ordering.contact-details.name-input"
                    type="text"
                    placeholder={t('Name')}
                    defaultValue={name}
                    onChange={e => {
                      this.props.customerActions.patchDeliveryDetails({ username: e.target.value.trim() });
                    }}
                  />
                </div>
              </div>

              <div className="padding-top-bottom-small">
                <PhoneInput
                  smartCaret={false}
                  data-heap-name="ordering.contact-details.phone-input"
                  placeholder={t('EnterPhoneNumber')}
                  value={formatPhoneNumberIntl(phone)}
                  country={country}
                  metadata={metadataMobile}
                  onChange={phone => {
                    const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

                    this.props.customerActions.patchDeliveryDetails({
                      phone:
                        metadataMobile.countries[selectedCountry] &&
                        Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]),
                    });
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
            disabled={!name || !name.length || !phone}
            onClick={this.handleClickBack}
          >
            {t('Continue')}
          </button>
        </footer>
      </div>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(ContactDetail);
