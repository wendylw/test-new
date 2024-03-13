import qs from 'qs';
import _get from 'lodash/get';
import _trim from 'lodash/trim';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Constants from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import HybridHeader from '../../../../../components/HybridHeader';
import {
  actions as appActionCreators,
  getUser,
  getUserIsLogin,
  getStoreInfoForCleverTap,
  getDeliveryDetails,
  getIsFetchLoginStatusComplete,
} from '../../../../redux/modules/app';
import { actions as customerActionCreators } from './redux';
import { getAddressInfo, getContactNumberInvalidErrorVisibility } from './redux/selectors';
import { init as initThunk, completePhoneNumber as completePhoneNumberThunk } from './redux/thunk';
import Utils from '../../../../../utils/utils';
import { post, put } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import CleverTap from '../../../../../utils/clevertap';
import prefetch from '../../../../../common/utils/prefetch-assets';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import 'react-phone-number-input/style.css';
import './AddressDetail.scss';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import { PHONE_NUMBER_COUNTRIES } from '../../../../../common/utils/phone-number-constants';

const actions = {
  EDIT: 'edit',
  ADD: 'add',
};

class AddressDetail extends Component {
  gotoLoginPage = () => {
    const { history } = this.props;
    history.push({
      pathname: PATH_NAME_MAPPING.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  componentDidMount = async () => {
    const { init, location, isFetchLoginStatusComplete, isUserLogin } = this.props;
    const { type: actionType, selectedAddress } = location.state || {};

    if (isFetchLoginStatusComplete && !isUserLogin) {
      this.gotoLoginPage();
    }

    await init({ actionType, selectedAddress });

    prefetch(['ORD_AL', 'ORD_CI', 'ORD_LOC'], ['OrderingCustomer', 'OrderingDelivery']);
  };

  componentDidUpdate = prevProps => {
    const { isFetchLoginStatusComplete: prevIsFetchLoginStatusComplete } = prevProps;
    const { isUserLogin, isFetchLoginStatusComplete } = this.props;

    if (isFetchLoginStatusComplete && !prevIsFetchLoginStatusComplete && !isUserLogin) {
      this.gotoLoginPage();
    }
  };

  handleClickBack = () => {
    const { history, addressInfo, customerActions } = this.props;
    const { type: actionType } = addressInfo || {};
    const pathname = actionType === actions.ADD ? '/customer/addressList' : '/customer';

    CleverTap.pushEvent('Address details - click back arrow');
    customerActions.removeAddressInfo();
    history.push({
      pathname,
      search: Utils.getFilteredQueryString('callbackUrl'),
    });
  };

  handleInputChange = e => {
    const { customerActions } = this.props;

    const inputValue = e.target.value;
    if (e.target.name === 'addressName') {
      customerActions.updateAddressInfo({ name: inputValue });
    } else if (e.target.name === 'addressDetails') {
      customerActions.updateAddressInfo({ details: inputValue });
    } else if (e.target.name === 'contactName') {
      customerActions.updateAddressInfo({ contactName: inputValue });
    } else if (e.target.name === 'deliveryComments') {
      customerActions.updateAddressInfo({ comments: inputValue });
    }
  };

  phoneInputChange = phone => {
    const { customerActions } = this.props;

    const selectedCountry = document.querySelector('.PhoneInputCountrySelect').value;
    const phoneInput =
      (PHONE_NUMBER_COUNTRIES[selectedCountry] &&
        Utils.getFormatPhoneNumber(phone || '', PHONE_NUMBER_COUNTRIES[selectedCountry])) ||
      '';
    customerActions.updatePhoneNumber(phoneInput);
  };

  checkSaveButtonDisabled = () => {
    const { addressInfo, contactNumberInvalidErrorVisibility } = this.props;
    const { name, details, address, contactName } = addressInfo;
    if (!name || !details || !address) {
      return true;
    }

    if (!_trim(contactName) || contactNumberInvalidErrorVisibility || !_trim(details) || !_trim(name)) {
      return true;
    }

    return false;
  };

  handleAddressDetailClick = () => {
    const { history, location } = this.props;
    const { pathname, search } = location;
    const { type: actionType } = location.state || {};
    const callbackPayload = { type: actionType };
    const { ROUTER_PATHS } = Constants;
    const { type, h } = qs.parse(search, { ignoreQueryPrefix: true });

    const callbackQueryString = qs.stringify(
      {
        type,
        h,
        callbackUrl: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_DETAIL}`,
      },
      { addQueryPrefix: true }
    );

    const queryParams = {
      type,
      h,
      callbackUrl: `${pathname}${callbackQueryString}`,
    };

    CleverTap.pushEvent('Address details - click location row');

    history.replace({
      pathname: ROUTER_PATHS.ORDERING_LOCATION,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
      state: { addressPickerAllowed: false, updateAddressEnabled: false, callbackPayload },
    });
  };

  createOrUpdateAddress = async () => {
    const { history, user, addressInfo, customerActions, appActions } = this.props;
    const {
      id,
      type: actionType,
      name,
      address,
      details,
      comments,
      coords,
      city,
      postCode,
      countryCode,
      contactName,
      contactNumber,
    } = addressInfo;
    const { consumerId } = user || {};

    try {
      const data = {
        contactName: _trim(contactName),
        contactNumber,
        addressName: _trim(name),
        deliveryTo: _trim(address),
        addressDetails: _trim(details),
        comments: _trim(comments),
        location: coords,
        city,
        countryCode,
        postCode,
      };

      let requestUrl;
      let response;
      if (actionType === actions.ADD) {
        requestUrl = url.API_URLS.CREATE_ADDRESS(consumerId);
        response = await post(requestUrl.url, data);
      }
      if (actionType === actions.EDIT) {
        requestUrl = url.API_URLS.UPDATE_ADDRESS(consumerId, id);
        response = await put(requestUrl.url, data);
      }

      const savedAddressName = _get(response, 'addressName', name);

      appActions.updateDeliveryDetails({
        addressId: _get(response, '_id', ''),
        addressName: savedAddressName,
        addressDetails: _get(response, 'addressDetails', details),
        deliveryComments: _get(response, 'comments', comments),
        deliveryToAddress: _get(response, 'deliveryTo', address),
        deliveryToLocation: _get(response, 'location', coords),
        deliveryToCity: _get(response, 'city', city),
        postCode: _get(response, 'postCode', postCode),
        countryCode: _get(response, 'countryCode', countryCode),
        username: _get(response, 'contactName', contactName),
        phone: _get(response, 'contactNumber', contactNumber),
      });

      customerActions.removeAddressInfo();

      if (response) {
        history.push({
          pathname: '/customer',
          search: Utils.getFilteredQueryString('callbackUrl'),
        });
      }
    } catch (error) {
      logger.error(
        'Ordering_AddAddress_SaveAddressFailed',
        {
          message: error?.message,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].CHANGE_ADDRESS,
          },
          errorCategory: error?.name,
        }
      );
    }
  };

  handlePhoneNumberFocus = () => {
    const { customerActions } = this.props;

    customerActions.startEditPhoneNumber();
  };

  handlePhoneNumberInputBlur = async event => {
    const { completePhoneNumber } = this.props;
    const isValid = isValidPhoneNumber(event.target.value);

    completePhoneNumber(isValid);
  };

  render() {
    const { addressInfo, t, contactNumberInvalidErrorVisibility } = this.props;
    const { type, name, address, details, comments, contactNumber, contactName, country } = addressInfo || {};

    return (
      <div className="flex flex-column address-detail">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle"
          contentClassName="flex-middle"
          isPage
          title={type === actions.EDIT ? t('EditAddress') : t('AddNewAddress')}
          navFunc={this.handleClickBack}
        />
        <section
          className="address-detail__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: `${Utils.windowSize().height -
              Utils.mainTop({
                headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
              }) -
              Utils.marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
        >
          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('ContactName')}</span>
                </div>
                <input
                  className="address-detail__input form__input text-size-big text-line-height-base"
                  data-test-id="ordering.customer.delivery-address-name"
                  type="text"
                  maxLength="140"
                  value={contactName}
                  name="contactName"
                  placeholder={t('Name')}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="margin-normal padding-top-bottom-small" style={{ position: 'relative' }}>
            <div className={` ${contactNumberInvalidErrorVisibility ? 'error' : ''} form__group border-radius-normal`}>
              <div className=" address-detail__field flex flex-middle padding-top-bottom-small padding-left-right-normal ">
                <div className="flex__fluid-content">
                  <div className="address-detail__title required">
                    <span className="text-size-small text-top">{t('ContactNumber')}</span>
                  </div>
                  <PhoneInput
                    international // If input want to show country code when phone number is empty, pls add international on props
                    smartCaret={false}
                    data-test-id="ordering.contact-details.phone-input"
                    placeholder={t('EnterPhoneNumber')}
                    value={formatPhoneNumberIntl(contactNumber)}
                    country={country}
                    onChange={this.phoneInputChange}
                    onFocus={this.handlePhoneNumberFocus}
                    onBlur={this.handlePhoneNumberInputBlur}
                  />
                </div>
              </div>
            </div>

            {contactNumberInvalidErrorVisibility && (
              <p
                className="text-size-big  form__error-message padding-top-bottom-smaller "
                style={{ position: 'absolute' }}
              >
                {t('PleaseEnterValidPhoneNumber')}
              </p>
            )}
          </div>

          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('AddressName')}</span>
                </div>
                <input
                  className="address-detail__input form__input text-size-big text-line-height-base"
                  data-test-id="ordering.customer.delivery-address-name"
                  type="text"
                  maxLength="140"
                  value={name}
                  name="addressName"
                  placeholder={t('placeholderOfAddressName')}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="margin-normal padding-top-bottom-smaller">
            <button
              className="address-detail__detail-button button button__block form__group address-detail__field padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between"
              data-test-id="ordering.customer.address-detail.edit-btn"
              onClick={this.handleAddressDetailClick}
            >
              <div className="text-left flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('AddressDetails')}</span>
                </div>
                <div data-test-id="ordering.customer.delivery-address">
                  <p className="address-detail__detail-content text-size-big text-line-height-base">{address}</p>
                </div>
              </div>
              <IconNext className="address-detail__icon-next icon icon__small icon__default flex__shrink-fixed" />
            </button>
          </div>

          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('UnitNumberAndFloor')}</span>
                </div>
                <input
                  className="address-detail__input form__input text-size-big text-line-height-base"
                  data-test-id="ordering.customer.delivery-address-detail"
                  type="text"
                  maxLength="140"
                  value={details}
                  name="addressDetails"
                  placeholder={t('placeholderOfAddressDetails')}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title">
                  <span className="text-size-small text-top">{t('NoteToDriver')}</span>
                </div>
                <input
                  className="address-detail__input form__input text-size-big"
                  data-test-id="ordering.customer.delivery-note"
                  type="text"
                  maxLength="140"
                  value={comments}
                  name="deliveryComments"
                  placeholder={t('placeholderOfDeliveryComments')}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>
        </section>
        <footer
          className="footer footer__transparent margin-normal"
          ref={ref => {
            this.footerEl = ref;
          }}
        >
          <button
            className="address-detail__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
            data-test-id="ordering.customer.address-detail.save-button"
            disabled={this.checkSaveButtonDisabled()}
            onClick={() => {
              CleverTap.pushEvent('Address details - click save changes');
              this.createOrUpdateAddress();
            }}
          >
            {t('Save')}
          </button>
        </footer>
      </div>
    );
  }
}

AddressDetail.displayName = 'AddressDetail';

AddressDetail.propTypes = {
  user: PropTypes.shape({
    consumerId: PropTypes.string,
  }),
  appActions: PropTypes.shape({
    updateDeliveryDetails: PropTypes.func,
  }),
  customerActions: PropTypes.shape({
    updateAddressInfo: PropTypes.func,
    removeAddressInfo: PropTypes.func,
    updatePhoneNumber: PropTypes.func,
    startEditPhoneNumber: PropTypes.func,
  }),
  /* eslint-disable react/forbid-prop-types */
  location: PropTypes.object,
  addressInfo: PropTypes.object,
  /* eslint-enable */
  isUserLogin: PropTypes.bool,
  init: PropTypes.func,
  completePhoneNumber: PropTypes.func,
  isFetchLoginStatusComplete: PropTypes.bool,
  contactNumberInvalidErrorVisibility: PropTypes.bool,
};

AddressDetail.defaultProps = {
  user: {
    consumerId: '',
  },
  appActions: {
    updateDeliveryDetails: () => {},
  },
  customerActions: {
    updateAddressInfo: () => {},
    removeAddressInfo: () => {},
    updatePhoneNumber: () => {},
    startEditPhoneNumber: () => {},
  },
  location: null,
  addressInfo: null,
  isUserLogin: false,
  init: () => {},
  completePhoneNumber: () => {},
  isFetchLoginStatusComplete: false,
  contactNumberInvalidErrorVisibility: false,
};

export default compose(
  withTranslation(['OrderingCustomer']),
  connect(
    state => ({
      user: getUser(state),
      isFetchLoginStatusComplete: getIsFetchLoginStatusComplete(state),
      isUserLogin: getUserIsLogin(state),
      deliveryDetails: getDeliveryDetails(state),
      addressInfo: getAddressInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      contactNumberInvalidErrorVisibility: getContactNumberInvalidErrorVisibility(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      init: bindActionCreators(initThunk, dispatch),
      completePhoneNumber: bindActionCreators(completePhoneNumberThunk, dispatch),
    })
  )
)(AddressDetail);
