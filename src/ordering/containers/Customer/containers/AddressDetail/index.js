import React, { Component } from 'react';
import Constants from '../../../../../utils/constants';
import { IconChecked, IconNext } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import Header from '../../../../../components/Header';
import './AddressDetail.scss';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { getUser } from '../../../../redux/modules/app';
import { actions as customerActionCreators, getDeliveryDetails } from '../../../../redux/modules/customer';
import Utils from '../../../../../utils/utils';
import { post, put } from '../../../../../utils/request';
import url from '../../../../../utils/url';
import qs from 'qs';

class AddressDetail extends Component {
  state = {
    addressName: '',
    addressDetails: '',
    deliveryComments: '',
    deliveryToAddress: '',
  };

  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  componentDidMount = async () => {
    const { deliveryDetails, customerActions, location } = this.props;
    const { addressName, addressDetails, deliveryComments, addressId } = deliveryDetails || {};

    const addressInfo = JSON.parse(Utils.getSessionVariable('savedAddressInfo'));
    const { savedName, savedDetails, savedComments } = addressInfo || {};

    const action = (location.state && location.state.action) || 'add';
    action === 'edit' &&
      this.setState({ addressName: addressName, addressDetails: addressDetails, deliveryComments: deliveryComments });

    action === 'add' &&
      this.setState({ addressName: savedName, addressDetails: savedDetails, deliveryComments: savedComments });

    //won't init username, phone, deliveryToAddress, deliveryDetails unless addressId is null
    !addressId && (await customerActions.initDeliveryDetails(this.getShippingType()));
  };

  handleClickBack = () => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/customer';
    Utils.removeSessionVariable('savedAddressInfo');
    history.push({
      pathname,
      search: window.location.search,
    });
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    const addressInfo = JSON.parse(sessionStorage.getItem('savedAddressInfo'));
    if (e.target.name === 'addressName') {
      sessionStorage.setItem('savedAddressInfo', JSON.stringify({ ...addressInfo, savedName: inputValue }));
      this.setState({ addressName: inputValue });
    } else if (e.target.name === 'addressDetails') {
      sessionStorage.setItem('savedAddressInfo', JSON.stringify({ ...addressInfo, savedDetails: inputValue }));
      this.setState({ addressDetails: inputValue });
    } else if (e.target.name === 'deliveryComments') {
      sessionStorage.setItem('savedAddressInfo', JSON.stringify({ ...addressInfo, savedComments: inputValue }));
      this.setState({ deliveryComments: inputValue });
    }
  };

  createOrUpdateAddress = async () => {
    const { history, location, user, deliveryDetails, customerActions } = this.props;
    const { addressName, addressDetails, deliveryComments } = this.state;
    const { consumerId } = user || {};
    const { deliveryToAddress, deliveryToLocation, addressId } = deliveryDetails || {};
    const { address: locationAddress, coords } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const action = (location.state && location.state.action) || 'add';

    customerActions.patchDeliveryDetails({ addressName, addressDetails, deliveryComments, deliveryToAddress });

    if (action === 'add') {
      const addUrl = url.API_URLS.CREATE_ADDRESS(consumerId);
      const data = {
        addressName,
        deliveryTo: locationAddress,
        addressDetails: addressDetails,
        comments: deliveryComments,
        address: addressDetails + ', ' + locationAddress,
        location: {
          longitude: coords.lng,
          latitude: coords.lat,
        },
      };
      const response = await post(addUrl.url, data);
      const {
        _id: addressId,
        addressName,
        addressDetails,
        comments: deliveryComments,
        deliveryTo: deliveryToAddress,
        location: deliveryToLocation,
      } = response || {};
      customerActions.patchDeliveryDetails({
        addressId,
        addressName,
        addressDetails,
        deliveryComments,
        deliveryToAddress,
        deliveryToLocation,
      });
      Utils.removeSessionVariable('savedAddressInfo');
      if (response) {
        history.push({
          pathname: '/customer',
          search: window.location.search,
        });
      }
    } else {
      const updateUrl = url.API_URLS.UPDATE_ADDRESS(consumerId, addressId);
      const data = {
        addressName,
        deliveryTo: deliveryToAddress,
        addressDetails: addressDetails,
        comments: deliveryComments,
        location: {
          longitude: deliveryToLocation.longitude,
          latitude: deliveryToLocation.latitude,
        },
      };
      const response = await put(updateUrl.url, data);
      const {
        _id: addressId,
        addressName,
        addressDetails,
        comments: deliveryComments,
        deliveryTo: deliveryToAddress,
        location: deliveryToLocation,
      } = response || {};
      customerActions.patchDeliveryDetails({
        addressId,
        addressName,
        addressDetails,
        deliveryComments,
        deliveryToAddress,
        deliveryToLocation,
      });
      Utils.removeSessionVariable('savedAddressInfo');
      if (response) {
        history.push({
          pathname: '/customer',
          search: window.location.search,
        });
      }
    }
  };

  render() {
    const { t, history, location, deliveryDetails } = this.props;
    const { addressName, addressDetails, deliveryComments } = this.state;

    const action = (location.state && location.state.action) || 'add';
    const { deliveryToAddress } = deliveryDetails || {};
    const { address: locationAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    return (
      <div className="flex flex-column address-detail">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={action === 'edit' ? t('EditAddress') : t('AddNewAddress')}
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
                value={addressName}
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
              onClick={
                action !== 'edit'
                  ? async () => {
                      const { search } = window.location;

                      const callbackUrl = encodeURIComponent(
                        `${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${Constants.ROUTER_PATHS.ADDRESS_DETAIL}${search}`
                      );

                      history.push({
                        pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
                        search: `${search}&callbackUrl=${callbackUrl}`,
                      });
                    }
                  : null
              }
            >
              <p
                className={`padding-normal text-size-big text-line-height-base ${
                  deliveryToAddress && action !== 'edit' ? '' : 'text-opacity'
                }`}
              >
                {action !== 'edit' ? locationAddress : deliveryToAddress || t('AddAddressPlaceholder')}
              </p>
              {action == 'edit' ? (
                <IconChecked className="icon icon__success icon__normal" />
              ) : (
                <IconNext className="icon icon__normal flex__shrink-fixed" />
              )}
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
                value={addressDetails}
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
                value={deliveryComments}
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
            disabled={!addressName || !addressDetails || (action !== 'edit' && !locationAddress)}
            onClick={this.createOrUpdateAddress}
          >
            {action === 'edit' ? t('SaveChanges') : t('AddAddress')}
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
)(AddressDetail);
