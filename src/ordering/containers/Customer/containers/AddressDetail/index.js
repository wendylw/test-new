import React, { Component } from 'react';
import Constants from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import Header from '../../../../../components/Header';
import Modal from '../../../../../components/Modal';
import './AddressDetail.scss';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { getUser, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import {
  actions as customerActionCreators,
  getDeliveryDetails,
  getSavedAddressInfo,
} from '../../../../redux/modules/customer';
import Utils from '../../../../../utils/utils';
import { post, put, del } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import webviewUtils from '../../../../../utils/webview-utils';
import qs from 'qs';
import CleverTap from '../../../../../utils/clevertap';

const actions = {
  EDIT: 'edit',
  ADD: 'add',
};

class AddressDetail extends Component {
  state = {
    show: false,
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

  createOrUpdateAddress = async () => {
    const { history, user, savedAddressInfo, customerActions } = this.props;
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
    customerActions.patchDeliveryDetails({
      addressId,
      addressName: name,
      addressDetails: details,
      deliveryComments: comments,
      deliveryToAddress: address,
      deliveryToLocation: coords,
      deliveryToCity: addressComponents && addressComponents.city ? addressComponents.city : '',
    });
    customerActions.removeSavedAddressInfo();
    if (webviewUtils.hasNativeSavedAddress()) {
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

  removeSavedAddress = async () => {
    const { user, savedAddressInfo } = this.props;
    const { id } = savedAddressInfo;
    const { consumerId } = user || {};
    let response = await del(url.API_URLS.DELETE_ADDRESS(consumerId, id).url);
    if (response === true) {
      this.props.history.push({ pathname: '/customer' });
    }
  };

  render() {
    const { show, hasAnyChanges } = this.state;
    const { t, history, savedAddressInfo } = this.props;
    const { type, name, address, details, comments } = savedAddressInfo || {};

    return (
      <div className="flex flex-column address-detail">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={type === actions.EDIT ? t('EditAddress') : t('AddNewAddress')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section
          className="address-detail__container padding-left-right-normal"
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
          <div className="padding-top-bottom-small">
            <div className="form__group address-detail__field">
              <div className="padding-left-right-normal">
                <span className="address-detail__title--required text-size-small">{t('Name')}</span>
              </div>
              <input
                className="address-detail__input form__input padding-left-right-normal text-size-big text-line-height-base"
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

          <div className="padding-top-bottom-small">
            <div className="form__group address-detail__field">
              <div className="padding-left-right-normal">
                <span className="address-detail__title--required text-size-small">{t('AddressDetails')}</span>
              </div>
              <div
                className="flex flex-middle flex-space-between"
                data-heap-name="ordering.customer.delivery-address"
                onClick={async () => {
                  const { search } = window.location;

                  const callbackUrl = encodeURIComponent(
                    `${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${Constants.ROUTER_PATHS.ADDRESS_DETAIL}${search}`
                  );

                  CleverTap.pushEvent('Address details - click location row');

                  history.push({
                    pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
                    search: `${search}&callbackUrl=${callbackUrl}`,
                  });
                }}
              >
                <p className="padding-left-right-normal text-size-big text-line-height-base">{address}</p>
                <IconNext className="icon  flex__shrink-fixed" />
              </div>
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div className="form__group address-detail__field">
              <div className="padding-left-right-normal">
                <span className="address-detail__title--required text-size-small">{t('UnitNumberAndFloor')}</span>
              </div>
              <input
                className="address-detail__input form__input padding-left-right-normal text-size-big text-line-height-base"
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

          <div className="padding-top-bottom-small">
            <div className="form__group address-detail__field">
              <div className="padding-left-right-normal">
                <span className="text-size-small">{t('NoteToDriver')}</span>
              </div>
              <input
                className="address-detail__input form__input padding-left-right-normal text-size-big"
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
          {/* remove address will cause delivery to pickup, will do remove feature further */}
          {/* {type === actions.EDIT && (
            <button className="button text-error" onClick={() => this.setState({ show: true })}>
              {t('Remove')}
            </button>
          )} */}
        </section>
        <footer className="footer footer__transparent margin-normal" ref={ref => (this.footerEl = ref)}>
          <button
            className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
            disabled={!name || !details || !address || (type === actions.EDIT && !hasAnyChanges)}
            onClick={() => {
              CleverTap.pushEvent('Address details - click save changes');
              this.createOrUpdateAddress();
            }}
          >
            {type === actions.EDIT ? t('SaveChanges') : t('AddAddress')}
          </button>
        </footer>
        <Modal show={show}>
          <div className="text-center padding-top-bottom-normal">
            <h2 className="text-size-big text-weight-bolder padding-top-bottom-small">{t('RemoveAddressTitle')}</h2>
            <p className="text-opacity margin-left-right-normal">{t('RemoveAddressContent')}</p>
          </div>
          <div className="flex flex-center">
            <button
              className="address-detail__button address-detail__button-outline button button__block text-weight-bolder text-uppercase"
              onClick={() => this.setState({ show: false })}
            >
              {t('KeepIt')}
            </button>
            <button
              className="address-detail__button button button__block button__fill text-weight-bolder text-uppercase"
              onClick={this.removeSavedAddress}
            >
              {t('EnsureRemove')}
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}

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
    })
  )
)(AddressDetail);
