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
  componentDidMount = async () => {
    await this.props.homeActions.loadCoreBusiness();
    await this.props.homeActions.getStoreHashData(this.props.store.id);

    if (this.props.isStoreClosed) {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_BASE,
        search: `?h=${this.props.hashCode}&type=delivery`, // only 'delivery' type has closed status
      });
    }
  };

  handleClickBack() {
    const { homeActions } = this.props;

    homeActions.clearCurrentStore();
  }

  async handleVisitStore(methodName) {
    // TODO: duplicate logic with componentDidMount, need optimize
    const { store, homeActions } = this.props;

    await homeActions.getStoreHashData(store.id);

    const { hashCode } = this.props;

    const currentMethod = METHODS_LIST.find(method => method.name === methodName);
    // isValid
    const { allBusinessInfo, business } = this.props;
    const { validDays, validTimeFrom, validTimeTo } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const isValidTimeToOrder = Utils.isValidTimeToOrder({ validDays, validTimeFrom, validTimeTo });
    if (hashCode && isValidTimeToOrder) {
      await Utils.setSessionVariable('deliveryCallbackUrl', `/?h=${hashCode || ''}&type=${methodName}`);
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}${currentMethod.pathname}/?h=${hashCode ||
        ''}&type=${methodName}`;
    } else {
      window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode || ''}&type=${methodName}`;
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
      business: getBusiness(state),
      allBusinessInfo: getAllBusinesses(state),
      isStoreClosed: isStoreClosed(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(DeliveryMethods));
