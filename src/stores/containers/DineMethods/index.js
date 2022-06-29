import React, { Component } from 'react';
import qs from 'qs';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as homeActionCreators,
  getStoreHashCode,
  getCurrentStoreId,
  getCurrentOrderMethod,
} from '../../redux/modules/home';
import { actions as tablesActionCreators, getTables } from '../../redux/modules/tables';
import Constants from '../../../utils/constants';
import HybridHeader from '../../../components/HybridHeader';
import DineInImage from '../../../images/icon-dine-in.svg';
import TakeAwayImage from '../../../images/icon-take-away.svg';
import { IconNext } from '../../../components/Icons';
import Tables from '../Tables';
import './StoresTakingMealMethod.scss';

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
    labelKey: 'TakeAwayStore',
    pathname: '',
  },
];

class DineMethods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      afterLoadTables: false,
    };
    this.loadTables();
  }

  loadTables = async () => {
    const { tableActions } = this.props;

    await tableActions.loadStoreTables();
    const { tables } = this.props;

    if (!tables || !tables.length) {
      this.handleSelectMethod(DELIVERY_METHOD.TAKE_AWAY);
    } else {
      this.setState({
        afterLoadTables: true,
      });
    }
  };

  handleClickBack = () => {
    this.props.homeActions.clearCurrentStore();
    const queries = qs.parse(decodeURIComponent(this.props.location.search), { ignoreQueryPrefix: true });

    if (queries.s && queries.from === 'home') {
      delete queries.s;
      delete queries.from;
      const search = qs.stringify(queries, { addQueryPrefix: true });

      window.location.href = `${window.location.origin}/dine${search}`;
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
    const { afterLoadTables } = this.state;

    return (
      afterLoadTables && (
        <section className="dine" data-heap-name="stores.dine-methods.container">
          <HybridHeader
            className="flex-middle border__bottom-divider"
            contentClassName="flex-middle"
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
                  className="border__bottom-divider flex flex-middle flex-space-between"
                  onClick={() => this.handleSelectMethod(method.name)}
                  data-heap-name="stores.dine-methods.method-item"
                  data-heap-method-name={method.name}
                >
                  <summary className="taking-meal-method__summary">
                    <figure className="taking-meal-method__image-container text-middle margin-normal">
                      <img src={method.logo} alt={t(method.labelKey)}></img>
                    </figure>
                    <label className="text-middle text-size-big text-weight-bolder">{t(method.labelKey)}</label>
                  </summary>
                  <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />
                </li>
              );
            })}
          </ul>
        </section>
      )
    );
  }
}
DineMethods.displayName = 'DineMethods';

const DineMethodsContainer = props => {
  if (props.currentOrderMethod === DELIVERY_METHOD.DINE_IN) {
    return <Tables />;
  }

  return <DineMethods {...props} />;
};
DineMethodsContainer.displayName = 'DineMethodsContainer';

export default compose(
  withTranslation(),
  connect(
    state => ({
      hashCode: getStoreHashCode(state),
      currentStoreId: getCurrentStoreId(state),
      currentOrderMethod: getCurrentOrderMethod(state),
      tables: getTables(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      tableActions: bindActionCreators(tablesActionCreators, dispatch),
    })
  )
)(withRouter(DineMethodsContainer));
