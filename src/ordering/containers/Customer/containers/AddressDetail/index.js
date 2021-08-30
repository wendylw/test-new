import React, { Component } from 'react';
import _get from 'lodash/get';
import Constants from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import './AddressDetail.scss';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import {
  actions as appActionCreators,
  getUser,
  getStoreInfoForCleverTap,
  getDeliveryDetails,
} from '../../../../redux/modules/app';
import { actions as customerActionCreators, getAddressInfo } from './redux';
import Utils from '../../../../../utils/utils';
import { post, put } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import qs from 'qs';
import CleverTap from '../../../../../utils/clevertap';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const actions = {
  EDIT: 'edit',
  ADD: 'add',
};

class AddressDetail extends Component {
  state = {
    hasAnyChanges: false,
  };

  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  componentDidMount = async () => {
    const { deliveryDetails, addressInfo, customerActions, location } = this.props;
    const {
      addressId,
      addressName,
      deliveryToAddress,
      addressDetails,
      deliveryComments,
      username,
      phone,
      deliveryToLocation,
      deliveryToCity,
    } = deliveryDetails || {};
    const { address: savedAddress, coords: savedCoords, addressComponents: savedAddressComponents } = addressInfo || {};
    const { address, coords, addressComponents } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const deliveryAddressUpdate = Boolean(Utils.getSessionVariable('deliveryAddressUpdate'));

    Utils.removeSessionVariable('deliveryAddressUpdate');

    this.setState({
      hasAnyChanges: deliveryAddressUpdate,
    });

    // if choose a new location, update the addressInfo
    if (
      address !== savedAddress ||
      coords.lat !== savedCoords.latitude ||
      coords.lng !== savedCoords.longitude ||
      addressComponents.city !== savedAddressComponents.city
    ) {
      customerActions.updateAddressInfo({
        address: address,
        coords: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        addressComponents,
      });
    }

    if (location.state && location.state.fromCustomer) {
      customerActions.updateAddressInfo({
        id: addressId,
        type: actions.EDIT,
        name: addressName,
        address: deliveryToAddress,
        details: addressDetails,
        comments: deliveryComments,
        coords: deliveryToLocation,
        contactName: username,
        contactNumber: phone,
        addressComponents: {
          ...addressComponents,
          city: deliveryToCity,
        },
      });
    }

    if (location.state && location.state.fromAddressList) {
      customerActions.updateAddressInfo({
        type: actions.ADD,
        contactName: username,
        contactNumber: phone,
        address,
        coords: { longitude: coords.lng, latitude: coords.lat },
        addressComponents,
      });
    }
  };

  handleClickBack = () => {
    const { history, addressInfo, customerActions } = this.props;
    const { type } = addressInfo || {};
    const pathname = type === actions.ADD ? '/customer/addressList' : '/customer';

    CleverTap.pushEvent('Address details - click back arrow');
    customerActions.removeAddressInfo();
    history.push({
      pathname,
      search: window.location.search,
    });
  };

  handleInputChange = e => {
    this.setState({
      hasAnyChanges: true,
    });

    const inputValue = e.target.value;
    if (e.target.name === 'addressName') {
      this.props.customerActions.updateAddressInfo({ name: inputValue });
    } else if (e.target.name === 'addressDetails') {
      this.props.customerActions.updateAddressInfo({ details: inputValue });
    } else if (e.target.name === 'contactName') {
      this.props.customerActions.updateAddressInfo({ contactName: inputValue });
    } else if (e.target.name === 'contactNumber') {
      this.props.customerActions.updateAddressInfo({ contactNumber: inputValue });
    } else if (e.target.name === 'deliveryComments') {
      this.props.customerActions.updateAddressInfo({ comments: inputValue });
    }
  };

  phoneInputChange = phone => {
    const selectedCountry = document.querySelector('.PhoneInputCountrySelect').value;
    const phoneInput =
      metadataMobile.countries[selectedCountry] &&
      Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]);
    this.props.customerActions.updateAddressInfo({ contactNumber: phoneInput });
    this.setState({
      hasAnyChanges: true,
    });
  };

  checkSaveButtonDisabled = () => {
    const { addressInfo } = this.props;
    const { hasAnyChanges } = this.state;
    const { name, details, type, address, contactName, contactNumber } = addressInfo;

    if (type === actions.EDIT && !hasAnyChanges) {
      return true;
    }

    if (!name || !details || !address) {
      return true;
    }

    if (!contactName || !contactName.length || !isValidPhoneNumber(contactNumber || '')) {
      return true;
    }

    return false;
  };

  handleAddressDetailClick = () => {
    const { history, location } = this.props;
    const { search } = location;

    const callbackUrl = encodeURIComponent(
      `${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${Constants.ROUTER_PATHS.ADDRESS_DETAIL}${search}`
    );

    CleverTap.pushEvent('Address details - click location row');

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
      search: `${search}&callbackUrl=${callbackUrl}`,
    });
  };

  createOrUpdateAddress = async () => {
    const { history, user, addressInfo, customerActions, appActions } = this.props;
    const {
      id,
      type,
      name,
      address,
      details,
      comments,
      coords,
      addressComponents,
      contactName,
      contactNumber,
    } = addressInfo;
    const { consumerId } = user || {};
    const postCode = _get(addressComponents, 'postCode', '');
    const city = _get(addressComponents, 'city', '');
    const countryCode = _get(addressComponents, 'countryCode', '');

    const data = {
      contactName: contactName,
      contactNumber: contactNumber,
      addressName: name,
      deliveryTo: address,
      addressDetails: details,
      comments: comments,
      location: coords,
      city,
      countryCode,
      postCode,
    };

    let requestUrl;
    let response;
    if (type === actions.ADD) {
      requestUrl = url.API_URLS.CREATE_ADDRESS(consumerId);
      response = await post(requestUrl.url, data);
    }
    if (type === actions.EDIT) {
      requestUrl = url.API_URLS.UPDATE_ADDRESS(consumerId, id);
      response = await put(requestUrl.url, data);
    }

    const savedAddressName = _get(response, 'addressName', name);

    appActions.updateDeliveryDetails({
      addressId: _get(response, '_id', ''),
      addressName: savedAddressName,
      addressDetails: _get(response, 'addressDetails', details),
      deliveryComments: _get(response, 'comments', comments),
      deliveryToAddress: _get(response, 'address', address),
      deliveryToLocation: _get(response, 'location', coords),
      deliveryToCity: _get(response, 'city', city),
      postCode: _get(response, 'postCode', postCode),
      username: _get(response, 'username', contactName),
      phone: _get(response, 'phone', contactNumber),
    });

    customerActions.removeAddressInfo();

    if (Utils.hasNativeSavedAddress()) {
      const deliveryAddress = JSON.parse(sessionStorage.getItem('deliveryAddress'));
      sessionStorage.setItem('deliveryAddress', JSON.stringify({ ...deliveryAddress, addressName: savedAddressName }));
    }

    if (response) {
      history.push({
        pathname: '/customer',
        search: window.location.search,
      });
    }
  };

  render() {
    const { addressInfo, t } = this.props;
    const { type, name, address, details, comments, contactNumber, contactName, country } = addressInfo || {};
    return (
      <div className="flex flex-column address-detail">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={type === actions.EDIT ? t('EditAddress') : t('AddNewAddress')}
          navFunc={this.handleClickBack.bind(this)}
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
                  data-heap-name="ordering.customer.delivery-address-name"
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

          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('ContactNumber')}</span>
                </div>
                <PhoneInput
                  international // If input want to show country code when phone number is empty, pls add international on props
                  smartCaret={false}
                  data-heap-name="ordering.contact-details.phone-input"
                  placeholder={t('EnterPhoneNumber')}
                  value={formatPhoneNumberIntl(contactNumber)}
                  country={country}
                  metadata={metadataMobile}
                  onChange={this.phoneInputChange}
                />
              </div>
            </div>
          </div>

          <div className="margin-normal padding-top-bottom-smaller">
            <div className="address-detail__field form__group flex flex-middle padding-top-bottom-small padding-left-right-normal">
              <div className="flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('AddressName')}</span>
                </div>
                <input
                  className="address-detail__input form__input text-size-big text-line-height-base"
                  data-heap-name="ordering.customer.delivery-address-name"
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
              onClick={this.handleAddressDetailClick}
            >
              <div className="text-left flex__fluid-content">
                <div className="address-detail__title required">
                  <span className="text-size-small text-top">{t('AddressDetails')}</span>
                </div>
                <div data-heap-name="ordering.customer.delivery-address">
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
                  data-heap-name="ordering.customer.delivery-address-detail"
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
                  data-heap-name="ordering.customer.delivery-note"
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
        <footer className="footer footer__transparent margin-normal" ref={ref => (this.footerEl = ref)}>
          <button
            className="address-detail__save-button button button__fill button__block padding-small text-weight-bolder text-uppercase"
            disabled={this.checkSaveButtonDisabled()}
            onClick={() => {
              CleverTap.pushEvent('Address details - click save changes');
              this.createOrUpdateAddress();
            }}
          >
            {type === actions.EDIT ? t('SaveChanges') : t('Save')}
          </button>
        </footer>
      </div>
    );
  }
}
AddressDetail.displayName = 'AddressDetail';

export default compose(
  withTranslation(['OrderingCustomer']),
  connect(
    state => ({
      user: getUser(state),
      deliveryDetails: getDeliveryDetails(state),
      addressInfo: getAddressInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(AddressDetail);
