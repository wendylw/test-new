import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Utils from '../../../../../utils/utils';
import HybridHeader from '../../../../../components/HybridHeader';
import constants from '../../../../../utils/constants';
import { PHONE_NUMBER_COUNTRIES } from '../../../../../common/utils/phone-number-constants';
import { getDeliveryDetails } from '../../../../redux/modules/app';
import {
  actions as ContactDetailActions,
  updateContactDetail as updateContactDetailThunk,
  getUsername,
  getPhone,
} from './redux';
import 'react-phone-number-input/style.css';
import './ContactDetail.scss';

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
    const { updateContactDetail } = this.props;

    await updateContactDetail();
    this.handleClickBack();
  };

  render() {
    const { t, username, phone, updateUserName, updatePhone } = this.props;
    return (
      <div className="contact-details flex flex-column">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle"
          isPage
          title={t('ContactDetails')}
          navFunc={this.handleClickBack}
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
                    data-test-id="ordering.contact-details.name-input"
                    type="text"
                    placeholder={t('Name')}
                    value={username || ''}
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
                  data-test-id="ordering.contact-details.phone-input"
                  placeholder={t('EnterPhoneNumber')}
                  value={formatPhoneNumberIntl(phone)}
                  onChange={phoneNumber => {
                    const selectedCountry = document.querySelector('.PhoneInputCountrySelect').value;

                    updatePhone(
                      PHONE_NUMBER_COUNTRIES[selectedCountry] &&
                        Utils.getFormatPhoneNumber(phoneNumber || '', PHONE_NUMBER_COUNTRIES[selectedCountry])
                    );
                  }}
                />
              </div>
            </form>
          </div>
        </section>
        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="contact-details__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            onClick={this.handleClickBack.bind(this)}
            data-test-id="ordering.contact-detail.back-btn"
          >
            {t('Back')}
          </button>
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-test-id="ordering.contact-detail.pay-btn"
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

ContactDetail.propTypes = {
  deliveryDetails: PropTypes.shape({
    username: PropTypes.string,
    phone: PropTypes.string,
  }),
  username: PropTypes.string,
  phone: PropTypes.string,
  init: PropTypes.func,
  updateUserName: PropTypes.func,
  updatePhone: PropTypes.func,
  updateContactDetail: PropTypes.func,
};

ContactDetail.defaultProps = {
  deliveryDetails: {
    username: '',
    phone: '',
  },
  username: '',
  phone: '',
  init: () => {},
  updateUserName: () => {},
  updatePhone: () => {},
  updateContactDetail: () => {},
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      username: getUsername(state),
      phone: getPhone(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    {
      init: ContactDetailActions.init,
      updateUserName: ContactDetailActions.updateUserName,
      updatePhone: ContactDetailActions.updatePhone,
      updateContactDetail: updateContactDetailThunk,
    }
  )
)(ContactDetail);
