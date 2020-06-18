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
import qs from 'qs';

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
    await this.props.homeActions.loadCoreBusiness();
    await this.props.homeActions.getStoreHashData(this.props.store.id);
  };

  handleClickBack() {
    const { homeActions } = this.props;

    homeActions.clearCurrentStore();

    const queries = qs.parse(decodeURIComponent(this.props.location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      this.props.history.replace('/');
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
      <section className="delivery">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          title={t('SelectYourPreference')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => {
            return fulfillmentOptions && fulfillmentOptions.find(item => item.toLowerCase() === method.name) ? (
              <li
                key={method.name}
                className="delivery__item border__bottom-divider flex flex-middle flex-space-between"
                data-testid="selectPrefrence"
                onClick={() => this.handleVisitStore(method.name)}
              >
                <figure className="delivery__image-container">
                  <img src={method.logo} alt={t(method.labelKey)}></img>
                </figure>
                <label className="delivery__name font-weight-bolder">{t(method.labelKey)}</label>
                <i className="delivery__next-icon">
                  <IconNext />
                </i>
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
