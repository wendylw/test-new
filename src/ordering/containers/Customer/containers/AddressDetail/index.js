import React, { Component } from 'react';
import Constants from '../../../../../utils/constants';
import { IconChecked, IconNext } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import Header from '../../../../../components/Header';
import './AddressDetail.scss';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { getUser } from '../../../../redux/modules/app';
import {
  actions as customerActionCreators,
  getDeliveryDetails,
  getSavedAddressInfo,
} from '../../../../redux/modules/customer';
import Utils from '../../../../../utils/utils';
import { post, put } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import qs from 'qs';

const actions = {
  EDIT: 'edit',
  ADD: 'add',
};

class AddressDetail extends Component {
  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  componentDidMount = async () => {
    const { deliveryDetails, savedAddressInfo, customerActions, location } = this.props;
    const { addressId, addressName, deliveryToAddress, addressDetails, deliveryComments, deliveryToLocation } =
      deliveryDetails || {};
    const { address: savedAddress, coords: savedCoords } = savedAddressInfo || {};
    const { address, coords } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    // if choose a new location, update the savedAddressInfo
    if (address !== savedAddress || coords.lat !== savedCoords.latitude || coords.lng !== savedCoords.longitude) {
      customerActions.updateSavedAddressInfo({
        address: address,
        coords: {
          latitude: coords.lat,
          longitude: coords.lng,
        },
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
      });
    }

    if (location.state && location.state.fromAddressList) {
      customerActions.updateSavedAddressInfo({
        type: actions.ADD,
        address,
        coords: { longitude: coords.lng, latitude: coords.lat },
      });
    }
  };

  handleClickBack = () => {
    const { history, savedAddressInfo, customerActions } = this.props;
    const { type } = savedAddressInfo || {};
    const pathname = type === actions.ADD ? '/customer/addressList' : '/customer';
    customerActions.removeSavedAddressInfo();
    history.push({
      pathname,
      search: window.location.search,
    });
  };

  handleInputChange = e => {
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
    const { id, type, name, address, details, comments, coords } = savedAddressInfo;
    const { consumerId } = user || {};
    const data = {
      addressName: name,
      deliveryTo: address,
      addressDetails: details,
      comments: comments,
      location: coords,
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
    });
    customerActions.removeSavedAddressInfo();
    if (response) {
      history.push({
        pathname: '/customer',
        search: window.location.search,
      });
    }
  };

  render() {
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
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big text-line-height-base"
                data-heap-name="ordering.customer.delivery-address-name"
                type="text"
                maxLength="140"
                placeholder={t('AddressName')}
                value={name}
                name="addressName"
                onChange={this.handleInputChange}
              />
            </div>
            <p className="text-opacity padding-small">{t('AddressDetailLabel')}</p>
          </div>

          <div className="padding-top-bottom-small">
            <div
              className="form__group flex flex-middle flex-space-between"
              data-heap-name="ordering.customer.delivery-address"
              onClick={async () => {
                const { search } = window.location;

                const callbackUrl = encodeURIComponent(
                  `${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${Constants.ROUTER_PATHS.ADDRESS_DETAIL}${search}`
                );

                history.push({
                  pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
                  search: `${search}&callbackUrl=${callbackUrl}`,
                });
              }}
            >
              <p className="padding-normal text-size-big text-line-height-base">
                {address || t('AddAddressPlaceholder')}
              </p>
              <IconNext className="icon icon__normal flex__shrink-fixed" />
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big text-line-height-base"
                data-heap-name="ordering.customer.delivery-address-detail"
                type="text"
                maxLength="140"
                placeholder={t('AddressDetailsPlaceholder')}
                value={details}
                name="addressDetails"
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big"
                data-heap-name="ordering.customer.delivery-note"
                type="text"
                maxLength="140"
                value={comments}
                name="deliveryComments"
                onChange={this.handleInputChange}
                placeholder={`${t('AddNoteToDriverPlaceholder')}: ${t('AddNoteToDriverOrMerchantPlaceholderExample')}`}
              />
            </div>
          </div>
        </section>
        <footer className="footer footer__transparent margin-normal" ref={ref => (this.footerEl = ref)}>
          <button
            className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
            disabled={!name || !details || !address}
            onClick={this.createOrUpdateAddress}
          >
            {type === actions.EDIT ? t('SaveChanges') : t('AddAddress')}
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
      savedAddressInfo: getSavedAddressInfo(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(AddressDetail);
