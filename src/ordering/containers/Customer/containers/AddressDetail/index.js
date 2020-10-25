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
  };

  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  componentDidMount = async () => {
    const { deliveryDetails, customerActions } = this.props;
    const { addressName, addressDetails, deliveryComments } = deliveryDetails || {};
    this.setState({ addressName: addressName, addressDetails: addressDetails, deliveryComments: deliveryComments });

    // init username, phone, deliveryToAddress, deliveryDetails
    await customerActions.initDeliveryDetails(this.getShippingType());
  };

  handleClickBack = () => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/customer';
    history.push({
      pathname,
      search: window.location.search,
    });
  };

  handleInputChange = e => {
    const inputValue = e.target.value;
    if (e.target.name === 'addressName') {
      this.setState({ addressName: inputValue });
    } else if (e.target.name === 'addressDetails') {
      this.setState({ addressDetails: inputValue });
    } else if (e.target.name === 'deliveryComments') {
      this.setState({ deliveryComments: inputValue });
    }
  };

  createOrUpdateAddress = async () => {
    const { history, location, user, deliveryDetails, addressId, customerActions } = this.props;
    const { addressName, addressDetails, deliveryComments } = this.state;
    const { consumerId } = user || {};
    const { deliveryToLocation } = deliveryDetails || {};
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const action = (location.state && location.state.action) || 'add';

    customerActions.patchDeliveryDetails({ addressName, addressDetails, deliveryComments });

    if (action === 'add') {
      const addUrl = url.API_URLS.CREATE_ADDRESS(consumerId);
      const data = {
        addressName,
        deliveryTo: deliveryToAddress,
        addressDetails: addressDetails,
        comments: deliveryComments,
        address: addressDetails + ', ' + deliveryToAddress,
        location: {
          longitude: deliveryToLocation.longitude,
          latitude: deliveryToLocation.latitude,
        },
      };
      const response = await post(addUrl.url, data);
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
      const response = put(updateUrl.url, data);
      if (response) {
        history.push({
          pathname: '/customer',
          search: window.location.search,
        });
      }
    }
  };

  render() {
    const { t, history, location } = this.props;
    const { addressName, addressDetails, deliveryComments } = this.state;
    const action = (location.state && location.state.action) || 'add';
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    return (
      <div className="flex flex-column address-detail">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={action === 'edit' ? t('EditAddress') : t('AddNewAddress')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="address-detail__container padding-left-right-normal">
          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big text-line-height-base"
                data-heap-name="ordering.customer.delivery-address-name"
                type="text"
                maxLength="140"
                placeholder={t('Name')}
                value={addressName}
                name="addressName"
                onChange={this.handleInputChange}
              />
            </div>
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
                {deliveryToAddress || t('AddAddressPlaceholder')}
              </p>
              {action == 'edit' ? (
                <IconChecked className="icon icon__fixed icon__normal" />
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
        <footer className="footer footer__transparent margin-normal">
          <button
            className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase"
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
