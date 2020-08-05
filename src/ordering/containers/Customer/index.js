import React, { Component } from 'react';
import qs from 'qs';
import isEmpty from 'lodash/isEmpty';
import { withTranslation } from 'react-i18next';
import 'react-phone-number-input/style.css';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { IconNext } from '../../../components/Icons';
import Header from '../../../components/Header';
import ErrorToast from '../../../components/ErrorToast';
import CreateOrderButton from '../../components/CreateOrderButton';
import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import Constants from '../../../utils/constants';

import { actions as homeActionCreators } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../redux/modules/payment';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getBusinessInfo } from '../../redux/modules/cart';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';
import './OrderingCustomer.scss';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

const { ROUTER_PATHS, DELIVERY_METHOD, PREORDER_IMMEDIATE_TAG } = Constants;
class Customer extends Component {
  state = {
    formTextareaTitle: null,
    asideName: null,
    sentOtp: false,
    errorToast: '',
  };

  componentDidMount = async () => {
    const { homeActions, customerActions } = this.props;

    await homeActions.loadShoppingCart();

    // init username, phone, deliveryToAddress, deliveryDetails
    await customerActions.initDeliveryDetails(this.getShippingType());
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { cartSummary } = this.props;
    const { sentOtp } = this.state;
    const { total } = cartSummary || {};

    if (sentOtp && total && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitPaymentPage();
    }
  }

  getBusinessCountry = () => {
    try {
      const { businessInfo } = this.props;
      return businessInfo.country;
    } catch (e) {
      // this could happen when allBusinessInfo is not loaded.
      return undefined;
    }
  };

  visitPaymentPage() {
    const { history, user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });
    }
  }

  checkDistanceError = () => {
    const { businessInfo: business, deliveryDetails, t } = this.props;
    if (this.getShippingType() !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }
    const from = {
      lat: business.stores[0].location.latitude,
      lng: business.stores[0].location.longitude,
    };
    const to = {
      lat: deliveryDetails.deliveryToLocation.latitude,
      lng: deliveryDetails.deliveryToLocation.longitude,
    };
    const maxDistance = business.qrOrderingSettings.deliveryRadius;
    const distance = computeStraightDistance(from, to);
    if (distance / 1000 > maxDistance) {
      return t(`OutOfDeliveryRange`, { distance: maxDistance.toFixed(1) });
    }
    return null;
  };

  async handleBeforeCreateOrder() {
    const { appActions, user, deliveryDetails } = this.props;
    const { phone } = deliveryDetails;
    const { isLogin } = user || {};

    const checkDistanceResult = this.checkDistanceError();
    if (checkDistanceResult) {
      this.setState({ errorToast: checkDistanceResult });
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    await Utils.setLocalStorageVariable('user.p', phone);

    if (!isLogin) {
      await appActions.getOtp({ phone });
      this.setState({ sentOtp: true });
    }
  }

  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  getHeaderTitle = () => {
    const { t } = this.props;
    const type = Utils.getOrderTypeFromUrl();

    switch (type) {
      case DELIVERY_METHOD.DELIVERY:
        return t('DeliveryDetails');
      case DELIVERY_METHOD.PICKUP:
        return t('PickUpDetails');
      case DELIVERY_METHOD.DINE_IN:
      case DELIVERY_METHOD.TAKE_AWAY:
      default:
        return t('CustomerDetails');
    }
  };

  getCanContinue = () => {
    const { isFetching, deliveryDetails, business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const { date = {} } = Utils.getExpectedDeliveryDateFromSession();
    const type = Utils.getOrderTypeFromUrl();
    const username = (deliveryDetails.username || '').trim();
    const phone = deliveryDetails.phone;

    if (isFetching || !isValidPhoneNumber(phone) || isEmpty(username)) {
      return false;
    }

    if (enablePreOrder && (type === DELIVERY_METHOD.DELIVERY || type === DELIVERY_METHOD.PICKUP)) {
      if (!date.date) {
        return false;
      }
    }

    switch (type) {
      case DELIVERY_METHOD.DELIVERY:
        const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
        const address = (deliveryAddress.address || '').trim();
        return !isEmpty(address);
      default:
    }

    return true;
  };

  renderDeliveryTime = () => {
    const { t, business, allBusinessInfo, history } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!enablePreOrder) {
      return null;
    }

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    let deliveryTime;
    if (date.date && hour.from) {
      deliveryTime =
        date.isToday && hour.from === PREORDER_IMMEDIATE_TAG.from
          ? t('DeliverNow', { separator: ',' })
          : formatToDeliveryTime({ date, hour, locale: this.getBusinessCountry() });
    } else {
      deliveryTime = '';
    }

    return (
      <div className="padding-top-bottom-small">
        <div
          className="form__group"
          data-heap-name="ordering.customer.delivery-time"
          onClick={async () => {
            const { search } = window.location;

            const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);
            // cache delivery address
            Utils.setSessionVariable('cachedeliveryAddress', Utils.getSessionVariable('deliveryAddress'));
            Utils.setSessionVariable('cacheexpectedDeliveryDate', Utils.getSessionVariable('expectedDeliveryDate'));
            Utils.setSessionVariable('cacheexpectedDeliveryHour', Utils.getSessionVariable('expectedDeliveryHour'));

            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
              search: `${search}&callbackUrl=${callbackUrl}`,
            });
          }}
        >
          <p className={`padding-normal text-size-big text-line-height-base ${deliveryTime ? '' : 'text-opacity'}`}>
            {deliveryTime || t('AddDeliveryTimePlaceholder')}
          </p>
        </div>
      </div>
    );
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    e.target.name === 'addressDetails' &&
      this.props.customerActions.patchDeliveryDetails({ addressDetails: inputValue });
    e.target.name === 'deliveryComments' &&
      this.props.customerActions.patchDeliveryDetails({ deliveryComments: inputValue });
  };

  renderDeliveryAddress() {
    const { t, history } = this.props;

    if (this.getShippingType() !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }

    const { addressDetails, deliveryComments } = this.props.deliveryDetails;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    return (
      <React.Fragment>
        <label className="ordering-customer__label padding-top-bottom-small text-size-big text-weight-bolder">
          {t('DeliveryTimeAndAddressTitle')}
        </label>
        {this.renderDeliveryTime()}

        <div className="padding-top-bottom-small">
          <div
            className="form__group flex flex-middle flex-space-between"
            data-heap-name="ordering.customer.delivery-address"
            onClick={async () => {
              const { search } = window.location;

              const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

              history.push({
                pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
                search: `${search}&callbackUrl=${callbackUrl}`,
              });
            }}
          >
            <p
              className={`padding-normal text-size-big text-line-height-base ${
                deliveryToAddress ? '' : 'text-opacity'
              }`}
            >
              {deliveryToAddress || t('AddAddressPlaceholder')}
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
      </React.Fragment>
    );
  }

  renderPickUpInfo() {
    const { t, history, business, allBusinessInfo, businessInfo = {} } = this.props;
    const { stores = [], country: locale } = businessInfo;
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY);
    const { deliveryComments } = this.props.deliveryDetails;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (this.getShippingType() !== DELIVERY_METHOD.PICKUP || !enablePreOrder) {
      return null;
    }

    const pickUpTime =
      date &&
      date.date &&
      formatToDeliveryTime({
        date,
        hour,
        locale,
      });

    return (
      <React.Fragment>
        <label className="ordering-customer__label padding-top-bottom-small text-size-big text-weight-bolder">
          {t('PickUpTimeAndAddressTitle')}
        </label>
        <div className="padding-top-bottom-small">
          <div
            className="form__group"
            data-heap-name="ordering.customer.pickup-time"
            onClick={async () => {
              const { search } = window.location;

              Utils.setSessionVariable('cachedeliveryAddress', Utils.getSessionVariable('deliveryAddress'));
              Utils.setSessionVariable('cacheexpectedDeliveryDate', Utils.getSessionVariable('expectedDeliveryDate'));
              Utils.setSessionVariable('cacheexpectedDeliveryHour', Utils.getSessionVariable('expectedDeliveryHour'));

              const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

              history.push({
                pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
                search: `${search}&callbackUrl=${callbackUrl}`,
              });
            }}
          >
            <p className={`padding-normal text-size-big text-line-height-base ${pickUpTime ? '' : 'text-opacity'}`}>
              {pickUpTime || t('PickUpAtPlaceholder')}
            </p>
          </div>
        </div>

        <div className="padding-top-bottom-small">
          <div className="form__group">
            <p className={`padding-normal text-size-big text-line-height-base ${pickUpAddress ? '' : 'text-opacity'}`}>
              {pickUpAddress || t('PickUpAtPlaceholder')}
            </p>
          </div>
        </div>

        <div className="padding-top-bottom-small">
          <div className="form__group">
            <input
              className="ordering-customer__input form__input padding-left-right-normal text-size-big"
              data-heap-name="ordering.customer.pickup-note"
              type="text"
              maxLength="140"
              value={deliveryComments}
              name="deliveryComments"
              onChange={this.handleInputChange}
              placeholder={`${t('AddNoteToMerchantPlaceholder')}: ${t('AddNoteToDriverOrMerchantPlaceholderExample')}`}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { t, user, history, onlineStoreInfo, deliveryDetails, cartSummary } = this.props;
    const { errorToast } = this.state;
    const { isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { total } = cartSummary || {};

    return (
      <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
        <Header
          className="flex-middle text-center"
          contentClassName="flex-middle"
          data-heap-name="ordering.customer.header"
          isPage={true}
          title={this.getHeaderTitle()}
          navFunc={() => {
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            });
          }}
        ></Header>
        <div className="ordering-customer__container padding-normal">
          <form className="ordering-customer__form">
            <div className="padding-top-bottom-small">
              <div className="ordering-customer__group form__group" data-testid="customerName">
                <input
                  className="ordering-customer__input form__input padding-left-right-normal text-size-biggest"
                  data-heap-name="ordering.customer.name-input"
                  type="text"
                  placeholder={t('Name')}
                  defaultValue={deliveryDetails.username}
                  onChange={e => {
                    this.props.customerActions.patchDeliveryDetails({ username: e.target.value.trim() });
                  }}
                />
              </div>
            </div>

            <div className="padding-top-bottom-small" data-testid="customerPhoneNumber">
              <PhoneInput
                smartCaret={false}
                data-heap-name="ordering.customer.phone-input"
                placeholder={t('EnterPhoneNumber')}
                value={formatPhoneNumberIntl(deliveryDetails.phone)}
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

            {this.renderDeliveryAddress()}
            {this.renderPickUpInfo()}
          </form>
        </div>

        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="ordering-customer__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            data-heap-name="ordering.customer.back-btn"
            onClick={() => {
              history.push({
                pathname: ROUTER_PATHS.ORDERING_CART,
                search: window.location.search,
              });
            }}
          >
            {t('Back')}
          </button>
          <CreateOrderButton
            className="padding-normal margin-top-bottom-smallest margin-left-right-smaller text-uppercase"
            history={history}
            data-testid="customerContinue"
            data-heap-name="ordering.customer.continue-btn"
            disabled={!this.getCanContinue() || isFetching}
            validCreateOrder={!total}
            beforeCreateOrder={this.handleBeforeCreateOrder.bind(this)}
            afterCreateOrder={this.visitPaymentPage.bind(this)}
          >
            {isFetching ? <div className="loader"></div> : t('Continue')}
          </CreateOrderButton>
        </footer>
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
      </section>
    );
  }
}

export default compose(
  withTranslation('OrderingDelivery'),
  connect(
    state => {
      const currentOrderId = getCurrentOrderId(state);

      return {
        user: getUser(state),
        cartSummary: getCartSummary(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        onlineStoreInfo: getOnlineStoreInfo(state),
        deliveryDetails: getDeliveryDetails(state),
        business: getBusiness(state),
        allBusinessInfo: getAllBusinesses(state),
        businessInfo: getBusinessInfo(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Customer);
