import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as homeActionCreators,
  getStoreHashCode,
  getCurrentStoreId,
  getCurrentOrderMethod,
} from '../../redux/modules/home';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';
import DineInImage from '../../../images/icon-dine-in.svg';
import TakeAwayImage from '../../../images/icon-take-away.svg';
import { IconNext } from '../../../components/Icons';
import Tables from '../Tables';
import qs from 'qs';
import { withRouter } from 'react-router-dom';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;

let METHODS_LIST = [
  {
    name: DELIVERY_METHOD.DINE_IN,
    logo: DineInImage,
    labelKey: 'DineIn',
    pathname: '',
  },
  {
    name: DELIVERY_METHOD.TAKE_AWAY,
    logo: TakeAwayImage,
    labelKey: 'TakeAway',
    pathname: '',
  },
];

class DineMethods extends Component {
  handleClickBack = () => {
    this.props.homeActions.clearCurrentStore();
    const queries = qs.parse(decodeURIComponent(this.props.location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      this.props.history.replace('/dine');
    }
  };

  handleSelectMethod = async methodName => {
    const { currentStoreId, homeActions } = this.props;
    homeActions.setOrderMethod(methodName);

    if (methodName === DELIVERY_METHOD.TAKE_AWAY) {
      await homeActions.getStoreHashData(currentStoreId);
      this.gotoOrderingPage();
    }
  };

  gotoOrderingPage() {
    const { hashCode, currentOrderMethod } = this.props;
    window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${hashCode}&type=${currentOrderMethod}`;
  }

  render() {
    const { t } = this.props;

    return (
      <section className="dine" data-heap-name="stores.dine-methods.container">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          data-heap-name="stores.dine-methods.header"
          isPage={true}
          title={t('SelectYourPreference')}
          navFunc={this.handleClickBack}
        />
        <ul className="delivery__list">
          {METHODS_LIST.map(method => {
            return (
              <li
                key={method.name}
                className="delivery__item border__bottom-divider flex flex-middle flex-space-between"
                onClick={() => this.handleSelectMethod(method.name)}
                data-heap-name="stores.dine-methods.method-item"
                data-heap-method-name={method.name}
              >
                <figure className="delivery__image-container">
                  <img src={method.logo} alt={t(method.labelKey)}></img>
                </figure>
                <label className="delivery__name font-weight-bolder">{t(method.labelKey)}</label>
                <IconNext className="delivery__next-icon" />
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
}

const DineMethodsContainer = props => {
  if (props.currentOrderMethod === DELIVERY_METHOD.DINE_IN) {
    return <Tables />;
  }

  return <DineMethods {...props} />;
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      hashCode: getStoreHashCode(state),
      currentStoreId: getCurrentStoreId(state),
      currentOrderMethod: getCurrentOrderMethod(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(withRouter(DineMethodsContainer));
