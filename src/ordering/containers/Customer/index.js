import qs from 'qs';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Link } from 'react-router-dom';
import { formatPhoneNumberIntl } from 'react-phone-number-input/mobile';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

import Header from '../../../components/Header';
import MessageModal from '../../components/MessageModal';
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../components/Icons';
import CreateOrderButton from '../../components/CreateOrderButton';
import AddressChangeModal from './components/AddressChangeModal';

import { getBusiness, getUser, getRequestInfo } from '../../redux/modules/app';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { getBusinessInfo } from '../../redux/modules/cart';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getDeliveryDetails, getCustomerError, actions as customerActionCreators } from '../../redux/modules/customer';
import './OrderingCustomer.scss';

const { ADDRESS_RANGE, PREORDER_IMMEDIATE_TAG, ROUTER_PATHS } = Constants;

class Customer extends Component {
  state = {
    addressChange: false,
    processing: false,
  };

  async componentDidMount() {
    const { history, homeActions, customerActions, user, requestInfo, deliveryDetails } = this.props;
    const { consumerId } = user || {};
    const { storeId } = requestInfo || {};
    const { addressId, deliveryToLocation } = deliveryDetails || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    // todo: think a better solution to avoid changing deliveryToAddress
    //won't init username, phone, deliveryToAddress, deliveryDetails unless addressId is null
    !addressId && (await customerActions.initDeliveryDetails(type));
    !addressId && customerActions.fetchConsumerAddressList({ consumerId, storeId });
    homeActions.loadShoppingCart(
      deliveryToLocation.latitude &&
      deliveryToLocation.longitude && {
        lat: deliveryToLocation.latitude,
        lng: deliveryToLocation.longitude,
      }
    );
  }

  componentDidUpdate(prevProps) {
    const { cartSummary } = this.props;
    const { cartSummary: prevCartSummary } = prevProps;
    const { shippingFee } = cartSummary || {};

    if (shippingFee && prevCartSummary.shippingFee && shippingFee !== prevCartSummary.shippingFee) {
      this.setState({ addressChange: true });
    }
  }

  componentWillUnmount() {
    this.setState({ processing: false });
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

  getDeliveryTime = () => {
    const { t } = this.props;

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();

    if (date.date && hour.from) {
      return date.isToday && hour.from === PREORDER_IMMEDIATE_TAG.from
        ? t('DeliverNow', { separator: ',' })
        : formatToDeliveryTime({ date, hour, locale: this.getBusinessCountry() });
    }

    return '';
  };

  getPickupTime = () => {
    const { businessInfo = {} } = this.props;
    const { locale } = businessInfo;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

    return date && date.date && formatToDeliveryTime({ date, hour, locale });
  };

  validateFields() {
    const { deliveryDetails } = this.props;
    const { username, addressName } = deliveryDetails || {};
    const isDeliveryType = Utils.isDeliveryType();
    let error = {};

    if (!Boolean(addressName) && isDeliveryType) {
      error = {
        showModal: true,
        message: 'OrderingCustomer:DeliveryAddressEmptyTitle',
        description: 'OrderingCustomer:DeliveryAddressEmptyDescription',
        buttonText: 'OK',
      };
    } else if (!Boolean(username)) {
      error = {
        showModal: true,
        message: 'OrderingCustomer:ContactEmptyTitle',
        description: 'OrderingCustomer:ContactEmptyDescription',
        buttonText: 'OK',
      };
    }

    return error;
  }

  handleBeforeCreateOrder = () => {
    const { customerActions } = this.props;
    const error = this.validateFields();

    if (error.showModal) {
      customerActions.setError(error);
    } else {
      this.setState({ processing: true });
    }
  };

  handleErrorHide() {
    const { customerActions } = this.props;

    customerActions.clearError();
  }

  handleHideChangeShippingFeeModal = () => {
    const { customerActions } = this.props;

    customerActions.updateAddressChange(false);
  };

  visitPaymentPage = () => {
    const { history, cartSummary } = this.props;
    const { total } = cartSummary || {};

    if (total && !this.validateFields().showModal) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });
    }
  };

  renderDeliveryPickupDetail() {
    if (Utils.isDineInType() || Utils.isTakeAwayType()) {
      return null;
    }

    const { t, businessInfo = {}, deliveryDetails } = this.props;
    const { stores = [] } = businessInfo;
    const isDeliveryType = Utils.isDeliveryType();
    const { deliveryToAddress, addressDetails, deliveryComments, addressName } = deliveryDetails;
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], ADDRESS_RANGE.COUNTRY);

    return (
      <li>
        <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder text-capitalize">
          {isDeliveryType ? t('DeliveryTo') : t('PickupOn')}
        </h4>
        {/* Address Info of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-top-bottom-normal padding-left-right-smaller">
          <div
            className={`flex ${isDeliveryType && addressDetails && Boolean(addressName) ? 'flex-bottom' : 'flex-middle'
              }`}
          >
            <IconLocation className="icon icon__small icon__default margin-left-right-small" />
            <div
              className={`ordering-customer__summary flex ${isDeliveryType && addressDetails && Boolean(addressName) ? 'flex-bottom' : 'flex-middle'
                } flex-space-between padding-left-right-small`}
            >
              {isDeliveryType ? (
                <Link
                  to={{
                    pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_LIST}`,
                    search: window.location.search,
                  }}
                  className="ordering-customer__button-link button__link"
                >
                  {Boolean(addressName) ? (
                    <React.Fragment>
                      <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">{addressName}</h3>
                      <address className="padding-top-bottom-smaller">{deliveryToAddress}</address>
                    </React.Fragment>
                  ) : (
                      <React.Fragment>
                        <h5 className="ordering-customer__title padding-top-bottom-smaller text-weight-bolder">
                          {t('DeliveryLocationLabel')}
                        </h5>
                        <p className="padding-top-bottom-smaller text-size-big text-weight-bolder text-capitalize">
                          {' '}
                          {t('DeliveryLocationDescription')}
                        </p>
                      </React.Fragment>
                    )}
                </Link>
              ) : (
                  <Link
                    to={{
                      pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
                      search: window.location.search,
                      state: {
                        from: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
                      },
                    }}
                    className="padding-top-bottom-smaller ordering-customer__button-link button__link"
                  >
                    <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder text-capitalize">
                      {t('PickupLocationTitle')}
                    </h3>
                    <time className="ordering-customer__time padding-top-bottom-smaller">{pickUpAddress}</time>
                  </Link>
                )}

              <IconNext className="icon" />
            </div>
          </div>
          {isDeliveryType && addressDetails && Boolean(addressName) ? (
            <Link
              to={{
                pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_DETAIL}`,
                search: window.location.search,
                state: {
                  fromCustomer: true,
                },
              }}
              className="ordering-customer__address-detail-container button__link flex flex-start padding-top-bottom-smaller padding-left-right-small"
            >
              <article className="ordering-customer__address-detail flex flex-middle flex-space-between padding-smaller border-radius-base">
                <div className="ordering-customer__address-content">
                  <p className="padding-smaller text-size-small">{addressDetails}</p>
                  {deliveryComments ? <p className="padding-smaller text-size-small">{deliveryComments}</p> : null}
                </div>
                <button className="ordering-customer__address-edit-button button button__link flex__shrink-fixed padding-small text-weight-bolder text-capitalize">
                  {t('Edit')}
                </button>
              </article>
            </Link>
          ) : null}
        </div>
        {/* enf of Address Info of Delivery or Pickup */}
        {/* Time of Delivery or Pickup */}
        <Link
          to={{
            pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: window.location.search,
            state: {
              from: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
            },
          }}
          className="ordering-customer__time ordering-customer__detail button__link padding-left-right-smaller"
        >
          <div className="flex flex-middle">
            <IconMotorcycle className="icon icon__small icon__default margin-small" />
            <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-small">
              <div className="padding-top-bottom-smaller">
                <label className="text-size-big padding-top-bottom-smaller text-weight-bolder">
                  {isDeliveryType ? t('Delivery') : t('PickupTime')}
                </label>
                <p className="padding-top-bottom-smaller">
                  {isDeliveryType ? this.getDeliveryTime() : this.getPickupTime()}
                </p>
              </div>
              <IconNext className="icon" />
            </div>
          </div>
        </Link>
        {/* end of Time of Delivery or Pickup */}
      </li>
    );
  }

  intiCode = country => {
    country &&
      !this.state.isInitCoed &&
      setTimeout(() => {
        const input = document.querySelector(
          '.react-phone-number-input__input.react-phone-number-input__phone.react-phone-number-input__input--style'
        );

        input.value = `+${getCountryCallingCode(country)}`;
        this.setState({
          isInitCoed: true,
        });

        clearTimeout(timer);
      }, 0);
  }
};

render() {
  const { t, history, deliveryDetails, cartSummary, error } = this.props;
  const { addressChange, processing } = this.state;
  const { username, phone } = deliveryDetails;
  const pageTitle = Utils.isDineInType() ? t('DineInCustomerPageTitle') : t('PickupCustomerPageTitle');
  const formatPhone = formatPhoneNumberIntl(phone);
  const splitIndex = phone ? formatPhone.indexOf(' ') : 0;
  const { total, shippingFee } = cartSummary || {};

  // console.log(shippingFee);
  // console.log(addressChange);

  return (
    <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
      <Header
        headerRef={ref => (this.headerEl = ref)}
        className="flex-middle text-center"
        contentClassName="flex-middle"
        data-heap-name="ordering.customer.header"
        isPage={true}
        title={Utils.isDeliveryType() ? t('DeliveryCustomerPageTitle') : pageTitle}
        navFunc={() => {
          history.push({
            pathname: ROUTER_PATHS.ORDERING_CART,
            search: window.location.search,
          });
        }}
      ></Header>
      <div
        className="ordering-customer__container"
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
        <ul>
          {this.renderDeliveryPickupDetail()}
          <li>
            <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
              {t('ContactDetails')}
            </h4>
            <Link
              to={{
                pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.CONTACT_DETAIL}`,
                search: window.location.search,
              }}
              className="ordering-customer__detail button__link flex flex-middle padding-left-right-smaller"
            >
              <IconAccountCircle className="icon icon__small icon__default margin-small" />
              <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-left-right-small">
                <div className="padding-top-bottom-smaller">
                  <p className="padding-top-bottom-smaller">
                    {username ? (
                      <span className="text-size-big">{username}</span>
                    ) : (
                        <React.Fragment>
                          <label className="text-size-big text-opacity">{t('NameReplaceHolder')}</label>
                          <span className="text-size-big text-error"> - *</span>
                          <span className="text-size-big text-error text-lowercase">{t('Required')}</span>
                        </React.Fragment>
                      )}
                  </p>
                  {phone ? (
                    <p className="padding-top-bottom-smaller">
                      {/* Country Code */}
                      <span className="text-size-big text-weight-bolder">{`${formatPhone.substring(
                        0,
                        splitIndex
                      )} `}</span>
                      {/* end of Country Code */}
                      <span className="text-size-big">{formatPhone.substring(splitIndex + 1)}</span>
                    </p>
                  ) : null}
                </div>
                <IconNext className="icon" />
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <footer
        ref={ref => (this.footerEl = ref)}
        className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
      >
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
          className="padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase"
          history={history}
          data-testid="customerContinue"
          data-heap-name="ordering.customer.continue-btn"
          disabled={processing}
          validCreateOrder={!total && !this.validateFields().showModal}
          beforeCreateOrder={this.handleBeforeCreateOrder}
          afterCreateOrder={this.visitPaymentPage}
        >
          {processing ? t('Processing') : t('Continue')}
        </CreateOrderButton>
      </footer>
      {error.show ? (
        <MessageModal
          data={error}
          onHide={() => {
            this.handleErrorHide();
          }}
        />
      ) : null}
      <AddressChangeModal
        deliveryFee={shippingFee}
        addressChange={addressChange}
        continue={this.handleHideChangeShippingFeeModal}
      />
    </section>
  );
}
}

export default compose(
  withTranslation(['OrderingCustomer']),
  connect(
    state => ({
      user: getUser(state),
      business: getBusiness(state),
      businessInfo: getBusinessInfo(state),
      allBusinessInfo: getAllBusinesses(state),
      deliveryDetails: getDeliveryDetails(state),
      cartSummary: getCartSummary(state),
      requestInfo: getRequestInfo(state),
      error: getCustomerError(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Customer);
