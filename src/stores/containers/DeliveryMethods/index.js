import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconNext } from '../../../components/Icons';
import DeliveryImage from '../../../images/icon-delivery.png';
import PickUpImage from '../../../images/icon-pickup.png';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as homeActionCreators, getStoreHashCode } from '../../redux/modules/home';
import Utils from '../../../utils/utils';

const { ROUTER_PATHS } = Constants;
const METHODS_LIST = [
  {
    name: 'delivery',
    logo: DeliveryImage,
    labelKey: 'FoodDelivery',
    pathname: ROUTER_PATHS.ORDERING_LOCATION,
  },
  {
    name: 'pickup',
    logo: PickUpImage,
    labelKey: 'SelfPickup',
    pathname: '',
  },
];

class DeliveryMethods extends Component {
  handleClickBack() {
    const { homeActions } = this.props;

    homeActions.clearCurrentStore();
  }

  async handleVisitStore(methodName) {
    const { store, homeActions } = this.props;

    await homeActions.getStoreHashData(store.id);

    const { hashCode } = this.props;

    if (hashCode) {
      const currentMethod = METHODS_LIST.find(method => method.name === methodName);

      await Utils.setSessionVariable('deliveryCallbackUrl', `/?h=${hashCode || ''}&type=${methodName}`);

      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${currentMethod.pathname}/?h=${hashCode ||
        ''}&type=${methodName}`;
    }
  }

  render() {
    const { t } = this.props;

    return (
      <section className="delivery">
        <Header
          className="border__bottom-divider gray has-right"
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
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(DeliveryMethods);
