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
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../components/Icons';
import CreateOrderButton from '../../components/CreateOrderButton';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getBusinessInfo } from '../../redux/modules/cart';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';

import './OrderingCustomer.scss';

const { ADDRESS_RANGE, PREORDER_IMMEDIATE_TAG, ROUTER_PATHS } = Constants;

class Customer extends Component {
  componentDidMount() {
    const { customerActions } = this.props;

    customerActions.initDeliveryDetails();
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
    const { t, business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!enablePreOrder) {
      return null;
    }

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    let deliveryTime;
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

  renderDeliveryPickupDetail() {
    if (Utils.isDineInType()) {
      return null;
    }

    const { t, businessInfo = {}, deliveryDetails } = this.props;
    const { stores = [] } = businessInfo;
    const isDeliveryType = Utils.isDeliveryType();
    const { deliveryAddressList } = deliveryDetails;
    const { deliveryTo, addressDetails, comments: deliveryComments, addressName, availableStatus } =
      deliveryAddressList[0] || {};
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], ADDRESS_RANGE.COUNTRY);

    return (
      <li>
        <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder text-capitalize">
          {isDeliveryType ? t('DeliveryTo') : t('PickupOn')}
        </h4>
        {/* Address Info of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-top-bottom-normal padding-left-right-smaller">
          <div className="flex flex-middle">
            <IconLocation className="icon icon__small icon__default margin-left-right-small" />
            <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-smaller padding-left-right-small">
              {isDeliveryType ? (
                <div>
                  {deliveryAddressList && deliveryAddressList[0] && availableStatus ? (
                    <React.Fragment>
                      <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">{addressName}</h3>
                      <address className="padding-top-bottom-smaller">{deliveryTo}</address>
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
                </div>
              ) : (
                <div>
                  <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                    {t('PickupLocationTitle')}
                  </h3>
                  <time className="ordering-customer__time padding-top-bottom-smaller">{pickUpAddress}</time>
                </div>
              )}
              <IconNext className="icon" />
            </div>
          </div>
          {isDeliveryType && addressDetails ? (
            <div className="ordering-customer__address-detail-container flex flex-start padding-top-bottom-smaller padding-left-right-small">
              <article className="ordering-customer__address-detail flex flex-middle flex-space-between padding-smaller border-radius-base">
                <div className="ordering-customer__address-content">
                  <p className="padding-smaller text-size-small">{addressDetails}</p>
                  {deliveryComments ? <p className="padding-smaller text-size-small">{deliveryComments}</p> : null}
                </div>
                <button className="ordering-customer__address-edit-button button button__link flex__shrink-fixed padding-small text-weight-bolder">
                  {t('Edit')}
                </button>
              </article>
            </div>
          ) : null}
        </div>
        {/* enf of Address Info of Delivery or Pickup */}
        {/* Time of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-left-right-smaller">
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
        </div>
        {/* end of Time of Delivery or Pickup */}
      </li>
    );
  }

  render() {
    const { t, history, deliveryDetails } = this.props;
    const { username, phone, deliveryAddressList } = deliveryDetails;
    const pageTitle = Utils.isDineInType() ? t('DineInCustomerPageTitle') : t('PickupCustomerPageTitle');
    const formatPhone = formatPhoneNumberIntl(phone);
    const splitIndex = phone ? formatPhone.indexOf(' ') : 0;

    return (
      <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
        <Header
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
        <div className="ordering-customer__container">
          <ul>
            {this.renderDeliveryPickupDetail()}
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
                {t('ContactDetails')}
              </h4>
              <Link
                to=""
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
        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="ordering-customer__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            data-heap-name="ordering.customer.back-btn"
            onClick={() => {}}
          >
            {t('Back')}
          </button>
          <CreateOrderButton
            className="padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase"
            history={history}
            data-testid="customerContinue"
            data-heap-name="ordering.customer.continue-btn"
            disabled={false}
            validCreateOrder={false}
            beforeCreateOrder={() => {}}
            afterCreateOrder={() => {}}
          >
            {t('Continue')}
          </CreateOrderButton>
        </footer>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingCustomer']),
  connect(
    state => ({
      business: getBusiness(state),
      businessInfo: getBusinessInfo(state),
      allBusinessInfo: getAllBusinesses(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Customer);
