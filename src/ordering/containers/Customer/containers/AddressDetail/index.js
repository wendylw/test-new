import React, { Component } from 'react';
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
import { actions as customerActionCreators, getSavedAddressInfo } from '../../../../redux/modules/customer';
import Utils from '../../../../../utils/utils';
import { post, put } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import qs from 'qs';
import CleverTap from '../../../../../utils/clevertap';

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
    const { deliveryDetails, savedAddressInfo, customerActions, location } = this.props;
    const {
      addressId,
      addressName,
      deliveryToAddress,
      addressDetails,
      deliveryComments,
      deliveryToLocation,
      deliveryToCity,
    } = deliveryDetails || {};
    const { address: savedAddress, coords: savedCoords, addressComponents: savedAddressComponents } =
      savedAddressInfo || {};
    const { address, coords, addressComponents } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const deliveryAddressUpdate = Boolean(Utils.getSessionVariable('deliveryAddressUpdate'));

    Utils.removeSessionVariable('deliveryAddressUpdate');

    this.setState({
      hasAnyChanges: deliveryAddressUpdate,
    });

    // if choose a new location, update the savedAddressInfo
    if (
      address !== savedAddress ||
      coords.lat !== savedCoords.latitude ||
      coords.lng !== savedCoords.longitude ||
      addressComponents.city !== savedAddressComponents.city
    ) {
      customerActions.updateSavedAddressInfo({
        address: address,
        coords: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
        addressComponents,
      });
    }

    if (location.state && location.state.fromCustomer) {
      customerActions.updateSavedAddressInfo({
        id: addressId,
        type: actions.EDIT,
        name: addressName,
        address: deliveryToAddress,
        details: addressDetails,
        comments: deliveryComments,
        coords: deliveryToLocation,
        addressComponents: {
          ...addressComponents,
          city: deliveryToCity,
        },
      });
    }

    if (location.state && location.state.fromAddressList) {
      customerActions.updateSavedAddressInfo({
        type: actions.ADD,
        address,
        coords: { longitude: coords.lng, latitude: coords.lat },
        addressComponents,
      });
    }
  };

  handleClickBack = () => {
    const { history, savedAddressInfo, customerActions } = this.props;
    const { type } = savedAddressInfo || {};
    const pathname = type === actions.ADD ? '/customer/addressList' : '/customer';

    CleverTap.pushEvent('Address details - click back arrow');
    customerActions.removeSavedAddressInfo();
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
      this.props.customerActions.updateSavedAddressInfo({ name: inputValue });
    } else if (e.target.name === 'addressDetails') {
      this.props.customerActions.updateSavedAddressInfo({ details: inputValue });
    } else if (e.target.name === 'deliveryComments') {
      this.props.customerActions.updateSavedAddressInfo({ comments: inputValue });
    }
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
    const { history, user, savedAddressInfo, customerActions, appActions } = this.props;
    const { id, type, name, address, details, comments, coords, addressComponents } = savedAddressInfo;
    const { consumerId } = user || {};
    const data = {
      addressName: name,
      deliveryTo: address,
      addressDetails: details,
      comments: comments,
      location: coords,
      city: addressComponents && addressComponents.city ? addressComponents.city : '',
      countryCode: addressComponents && addressComponents.countryCode ? addressComponents.countryCode : '',
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
    const { _id: addressId } = response || {};
    appActions.updateDeliveryDetails({
      addressId,
      addressName: name,
      addressDetails: details,
      deliveryComments: comments,
      deliveryToAddress: address,
      deliveryToLocation: coords,
      deliveryToCity: addressComponents && addressComponents.city ? addressComponents.city : '',
    });
    customerActions.removeSavedAddressInfo();
    if (Utils.hasNativeSavedAddress()) {
      const deliveryAddress = JSON.parse(sessionStorage.getItem('deliveryAddress'));
      sessionStorage.setItem('deliveryAddress', JSON.stringify({ ...deliveryAddress, addressName: name }));
    }
    if (response) {
      history.push({
        pathname: '/customer',
        search: window.location.search,
      });
    }
  };

  render() {
    const { hasAnyChanges } = this.state;
    const { t, savedAddressInfo } = this.props;
    const { type, name, address, details, comments } = savedAddressInfo || {};

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
                  <span className="text-size-small text-top">{t('Name')}</span>
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
            disabled={!name || !details || !address || (type === actions.EDIT && !hasAnyChanges)}
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
      savedAddressInfo: getSavedAddressInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(AddressDetail);
