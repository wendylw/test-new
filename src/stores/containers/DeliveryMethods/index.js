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
import { actions as homeActionCreators, getStoreHashCode, isStoreClosed } from '../../redux/modules/home';
import Utils from '../../../utils/utils';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';

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
    const { allBusinessInfo, business } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    // remove delivery time write in session to prevent date inconsistence issus
    if (enablePreOrder) {
      Utils.removeExpectedDeliveryTime();
    }

    if (this.props.isStoreClosed) {
      const search = `?h=${this.props.hashCode}&type=delivery`;
      const searchStr = enablePreOrder ? `${search}&isPreOrder=true` : search;

      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${searchStr}`;
    }
  };

  handleClickBack() {
    const { homeActions } = this.props;

    homeActions.clearCurrentStore();
  }

  async handleVisitStore(methodName) {
    const { isStoreClosed } = this.props;
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

    if (hashCode && currentMethod.name === DELIVERY_METHOD.DELIVERY) {
      if (!isStoreClosed && enablePreOrder) {
        // Should always let users select delivery time once they selected delivery not pickup
        await Utils.setSessionVariable(
          'deliveryTimeCallbackUrl',
          JSON.stringify({
            pathname: ROUTER_PATHS.ORDERING_HOME,
            search: `?h=${hashCode || ''}&type=${methodName}`,
          })
        );

        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}/?h=${hashCode ||
          ''}&type=${methodName}`;
        return;
      }

      if (store.id && deliveryTo) {
        console.warn('storeId and deliveryTo info is enough for delivery, redirect to ordering home');
        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
        return;
      } else if (!deliveryTo) {
        await Utils.setSessionVariable(
          'deliveryCallbackUrl',
          JSON.stringify({
            pathname: ROUTER_PATHS.ORDERING_HOME,
            search: `?h=${hashCode || ''}&type=${methodName}`,
          })
        );

        window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${currentMethod.pathname}/?h=${hashCode ||
          ''}&type=${methodName}`;
        return;
      }
    } else {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
    }
  }

  render() {
    const { t } = this.props;

    return (
      <section className="delivery">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          title={t('SelectYourPreference')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => (
            <li
              key={method.name}
              className="delivery__item border__bottom-divider flex flex-middle flex-space-between"
              onClick={() => this.handleVisitStore(method.name)}
            >
              <figure className="delivery__image-container">
                <img src={method.logo} alt={t(method.labelKey)}></img>
              </figure>
              <label className="delivery__name font-weight-bold">{t(method.labelKey)}</label>
              <i className="delivery__next-icon">
                <IconNext />
              </i>
            </li>
          ))}
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
    state => ({
      hashCode: getStoreHashCode(state),
      isStoreClosed: isStoreClosed(state),
      business: getBusiness(state),
      allBusinessInfo: getAllBusinesses(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(DeliveryMethods));
