import qs from 'qs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { IconNext } from '../../../components/Icons';
import DeliveryImage from '../../../images/icon-delivery.png';
import PickUpImage from '../../../images/icon-pickup.png';
import HybridHeader from '../../../components/HybridHeader';
import Constants from '../../../utils/constants';
import { actions as homeActionCreators, getOneStoreInfo, getStoreHashCode } from '../../redux/modules/home';
import Utils from '../../../utils/utils';
import { getRemovedPickUpMerchantList, getDeliveryInfo } from '../../redux/modules/app';
import { getIfAddressInfoExists } from '../../../redux/modules/address/selectors';
import '../DineMethods/StoresTakingMealMethod.scss';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
const METHODS_LIST = [
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
    const { homeActions, store } = this.props;

    await homeActions.loadCoreBusiness(store.id);
    await homeActions.getStoreHashData(store.id);
  };

  handleClickBack = () => {
    const { homeActions, location } = this.props;

    homeActions.clearCurrentStore();

    const queries = qs.parse(decodeURIComponent(location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      delete queries.s;
      delete queries.from;
      const search = qs.stringify(queries, { addQueryPrefix: true });

      window.location.href = `${window.location.origin}/${search}`;
    }
  };

  async handleVisitStore(methodName) {
    const { store, homeActions, deliveryInfo, ifAddressInfoExists } = this.props;
    await homeActions.getStoreHashData(store.id);
    const { hashCode } = this.props;
    const currentMethod = METHODS_LIST.find(method => method.name === methodName);

    // isValid
    const { enablePreOrder } = deliveryInfo;
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
      if (store.id && ifAddressInfoExists) {
        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
        return;
      }

      if (!ifAddressInfoExists) {
        const callbackUrl = encodeURIComponent(`${ROUTER_PATHS.ORDERING_HOME}?h=${hashCode || ''}&type=${methodName}`);

        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${currentMethod.pathname}/?h=${hashCode ||
          ''}&type=${methodName}&callbackUrl=${callbackUrl}`;
      }
    } else {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
    }
  }

  render() {
    const { t, currentStoreInfo } = this.props;
    const { fulfillmentOptions } = currentStoreInfo || {};
    return (
      <section className="delivery" data-test-id="stores.delivery-methods.container">
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="stores.delivery-methods.header"
          isPage
          title={t('SelectYourPreference')}
          navFunc={this.handleClickBack}
        />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => {
            const shouldShowMethodCard =
              fulfillmentOptions && fulfillmentOptions.find(item => item.toLowerCase() === method.name);
            return shouldShowMethodCard ? (
              <li
                key={method.name}
                className="border__bottom-divider flex flex-middle flex-space-between"
                data-testid="selectPrefrence"
                data-test-id="stores.delivery-methods.method-item"
                onClick={() => this.handleVisitStore(method.name)}
              >
                <summary className="taking-meal-method__summary">
                  <figure className="taking-meal-method__image-container text-middle margin-normal">
                    <img src={method.logo} alt={t(method.labelKey)} />
                  </figure>
                  <span className="text-middle text-size-big text-weight-bolder">{t(method.labelKey)}</span>
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

DeliveryMethods.displayName = 'DeliveryMethods';

DeliveryMethods.propTypes = {
  hashCode: PropTypes.string,
  store: PropTypes.shape({
    id: PropTypes.string,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  homeActions: PropTypes.shape({
    loadCoreBusiness: PropTypes.func,
    getStoreHashData: PropTypes.func,
    clearCurrentStore: PropTypes.func,
  }),
  deliveryInfo: PropTypes.shape({
    enablePreOrder: PropTypes.bool,
  }),
  // eslint-disable-next-line react/forbid-prop-types
  currentStoreInfo: PropTypes.object,
  ifAddressInfoExists: PropTypes.bool,
};

DeliveryMethods.defaultProps = {
  hashCode: null,
  store: {
    id: '',
  },
  location: {
    search: '',
  },
  homeActions: {
    loadCoreBusiness: () => {},
    getStoreHashData: () => {},
    clearCurrentStore: () => {},
  },
  deliveryInfo: {
    enablePreOrder: false,
  },
  currentStoreInfo: {},
  ifAddressInfoExists: false,
};

export default compose(
  withTranslation(),
  connect(
    (state, ownProps) => ({
      hashCode: getStoreHashCode(state),
      removePickUpMerchantList: getRemovedPickUpMerchantList(state),
      currentStoreInfo: getOneStoreInfo(state, ownProps.store.id),
      deliveryInfo: getDeliveryInfo(state),
      ifAddressInfoExists: getIfAddressInfoExists(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(DeliveryMethods));
