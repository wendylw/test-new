import qs from 'qs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { IconNext } from '../../../components/Icons';
import DeliveryImage from '../../../images/icon-delivery.png';
import PickUpImage from '../../../images/icon-pickup.png';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as homeActionCreators,
  getOneStoreInfo,
  getStoreHashCode,
  isStoreClosed,
} from '../../redux/modules/home';
import Utils from '../../../utils/utils';
import { getRemovedPickUpMerchantList } from '../../redux/modules/app';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import '../DineMethods/StoresTakingMealMethod.scss';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
let METHODS_LIST = [
  {
    name: DELIVERY_METHOD.DELIVERY,
    logo: DeliveryImage,
    labelKey: 'FoodDelivery',
    pathname: ROUTER_PATHS.ORDERING_LOCATION,
  },
  {
    name: DELIVERY_METHOD.PICKUP,
    logo: PickUpImage,
    labelKey: 'SelfPickup',
    pathname: '',
  },
];

class DeliveryMethods extends Component {
  componentDidMount = async () => {
    await this.props.homeActions.loadCoreBusiness(this.props.store.id);
    await this.props.homeActions.getStoreHashData(this.props.store.id);
  };

  handleClickBack() {
    const { homeActions } = this.props;

    homeActions.clearCurrentStore();

    const queries = qs.parse(decodeURIComponent(this.props.location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      delete queries.s;
      delete queries.from;
      const search = qs.stringify(queries, { addQueryPrefix: true });

      window.location.href = `${window.location.origin}/${search}`;
    }
  }

  async handleVisitStore(methodName) {
    // const { isStoreClosed } = this.props;
    const { store, homeActions } = this.props;
    await homeActions.getStoreHashData(store.id);
    const { hashCode } = this.props;
    const currentMethod = METHODS_LIST.find(method => method.name === methodName);

    // isValid
    const { allBusinessInfo, business } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({
      business,
      allBusinessInfo,
    });
    const deliveryTo = JSON.parse(Utils.getSessionVariable('deliveryAddress'));
    if (enablePreOrder) {
      // remove delivery time write in session to prevent date inconsistence issus
      Utils.removeExpectedDeliveryTime();
      // Should always let users select delivery time if this store has enabled preOrder
      const callbackUrl = encodeURIComponent(`${ROUTER_PATHS.ORDERING_HOME}?h=${hashCode || ''}&type=${methodName}`);

      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}/?h=${hashCode ||
        ''}&type=${methodName}&callbackUrl=${callbackUrl}`;
      return;
    }

    if (currentMethod.name === DELIVERY_METHOD.DELIVERY) {
      if (store.id && deliveryTo) {
        console.warn('storeId and deliveryTo info is enough for delivery, redirect to ordering home');
        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
        return;
      } else if (!deliveryTo) {
        const callbackUrl = encodeURIComponent(`${ROUTER_PATHS.ORDERING_HOME}?h=${hashCode || ''}&type=${methodName}`);

        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${currentMethod.pathname}/?h=${hashCode ||
          ''}&type=${methodName}&callbackUrl=${callbackUrl}`;
        return;
      }
    } else {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
    }
  }

  render() {
    const { t, currentStoreInfo } = this.props;
    const { fulfillmentOptions } = currentStoreInfo || {};
    return (
      <section className="delivery" data-heap-name="stores.delivery-methods.container">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="stores.delivery-methods.header"
          isPage={true}
          title={t('SelectYourPreference')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => {
            return fulfillmentOptions && fulfillmentOptions.find(item => item.toLowerCase() === method.name) ? (
              <li
                key={method.name}
                className="border__bottom-divider flex flex-middle flex-space-between"
                data-testid="selectPrefrence"
                data-heap-name="stores.delivery-methods.method-item"
                data-heap-method-name={method.name}
                onClick={() => this.handleVisitStore(method.name)}
              >
                <summary className="taking-meal-method__summary">
                  <figure className="taking-meal-method__image-container text-middle margin-normal">
                    <img src={method.logo} alt={t(method.labelKey)}></img>
                  </figure>
                  <label className="text-middle text-size-big text-weight-bolder">{t(method.labelKey)}</label>
                </summary>
                <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />
              </li>
            ) : null;
          })}
        </ul>
      </section>
    );
  }
}

DeliveryMethods.propTypes = {
  store: PropTypes.object,
};

DeliveryMethods.defaultProps = {
  store: {},
};

export default compose(
  withTranslation(),
  connect(
    (state, ownProps) => ({
      hashCode: getStoreHashCode(state),
      isStoreClosed: isStoreClosed(state),
      business: getBusiness(state),
      removePickUpMerchantList: getRemovedPickUpMerchantList(state),
      allBusinessInfo: getAllBusinesses(state),
      currentStoreInfo: getOneStoreInfo(state, ownProps.store.id),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(DeliveryMethods));
