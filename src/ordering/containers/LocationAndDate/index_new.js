import React, { Component } from 'react';
import qs from 'qs';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import {
  actions as locationAndDateActionCreator,
  getDeliveryType,
  getStoreId,
} from '../../redux/modules/locationAndDate';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import config from '../../../config';
import { actions as homeActionCreators } from '../../redux/modules/home';

import { actions as appActionCreators } from '../../redux/modules/app';
import DeliveryMethods from '../../../stores/containers/DeliveryMethods';

const { DELIVERY_METHOD, ROUTER_PATHS } = Constants;

class LocationAndDate extends Component {
  headerEl = null;

  componentDidMount = async () => {
    const { actions } = this.props;
    const deliveryAddress = Utils.getDeliveryAddress();
    const deliveryType = (this.query.type || '').toLowerCase();
    this.ensureDeliveryType(deliveryType);

    console.log('this.query', this.query);

    await actions.initial({
      deliveryType,
      storeId: this.query.storeid || config.storeId,
      deliveryAddress: deliveryAddress.address,
      deliveryCoords: deliveryAddress.coords,
    });

    if (!this.props.storeId && deliveryType === DELIVERY_METHOD.PICKUP) {
      this.goStoreList();
    }
  };

  get query() {
    return qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
  }

  goStoreList = () => {
    const { history } = this.props;
    const deliveryType = (this.query.type || '').toLowerCase();

    const searchParams = {
      h: this.query.h,
      storeid: this.props.storeId || this.query.storeid || config.storeId,
      type: deliveryType,
      callbackUrl: this.query.callbackUrl,
    };

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_STORE_LIST,
      search: qs.stringify(searchParams, { addQueryPrefix: true }),
    });
  };

  ensureDeliveryType = deliveryType => {
    if (![DELIVERY_METHOD.DELIVERY, DELIVERY_METHOD.PICKUP].includes(deliveryType)) {
      if ([DELIVERY_METHOD.TAKE_AWAY, DELIVERY_METHOD.DINE_IN].includes(deliveryType)) {
        window.location.href = `${window.location.origin}${ROUTER_PATHS.DINE}`;
      } else {
        window.location.href = `${window.location.origin}${ROUTER_PATHS.ORDERING_BASE}`;
      }
    }
  };

  getLocationDisplayTitle = () => {
    const { t, deliveryType } = this.props;

    return deliveryType === DELIVERY_METHOD.DELIVERY ? t('DeliveryDetails') : t('PickUpDetails');
  };

  handleBackClicked = () => {
    // TODO: will do it later
  };

  render() {
    const { t } = this.props;

    return (
      <section className="location-date flex flex-column" data-heap-name="ordering.location-and-date.container">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.location-and-date.header"
          isPage={true}
          title={this.getLocationDisplayTitle()}
          navFunc={this.handleBackClicked}
        />
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      deliveryType: getDeliveryType(state),
      storeId: getStoreId(state),
    }),

    dispatch => ({
      actions: bindActionCreators(locationAndDateActionCreator, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(LocationAndDate);
