import React, { Component } from 'react';
import qs from 'qs';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
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

const METHODS_LIST = [
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
    const { homeActions, location } = this.props;

    homeActions.clearCurrentStore();
    const queries = qs.parse(decodeURIComponent(location.search), { ignoreQueryPrefix: true });

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
        <section className="dine" data-test-id="stores.dine-methods.container">
          <HybridHeader
            className="flex-middle border__bottom-divider"
            contentClassName="flex-middle"
            data-test-id="stores.dine-methods.header"
            isPage
            title={t('SelectYourPreference')}
            navFunc={this.handleClickBack}
          />
          <ul className="delivery__list">
            {METHODS_LIST.map(method => (
              <li
                key={method.name}
                className="border__bottom-divider flex flex-middle flex-space-between"
                onClick={() => this.handleSelectMethod(method.name)}
                data-test-id="stores.dine-methods.method-item"
              >
                <summary className="taking-meal-method__summary">
                  <figure className="taking-meal-method__image-container text-middle margin-normal">
                    <img src={method.logo} alt={t(method.labelKey)} />
                  </figure>
                  <span className="text-middle text-size-big text-weight-bolder">{t(method.labelKey)}</span>
                </summary>
                <IconNext className="icon icon__normal icon__primary flex__shrink-fixed" />
              </li>
            ))}
          </ul>
        </section>
      )
    );
  }
}

DineMethods.displayName = 'DineMethods';

DineMethods.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  tables: PropTypes.array,
  hashCode: PropTypes.string,
  currentStoreId: PropTypes.string,
  currentOrderMethod: PropTypes.string,
  tableActions: PropTypes.shape({
    loadStoreTables: PropTypes.func,
  }),
  homeActions: PropTypes.shape({
    setOrderMethod: PropTypes.func,
    getStoreHashData: PropTypes.func,
    clearCurrentStore: PropTypes.func,
  }),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

DineMethods.defaultProps = {
  tables: null,
  hashCode: '',
  currentStoreId: '',
  currentOrderMethod: '',
  tableActions: {
    loadStoreTables: () => {},
  },
  homeActions: {
    setOrderMethod: () => {},
    getStoreHashData: () => {},
    clearCurrentStore: () => {},
  },
  location: {
    search: '',
  },
};

const DineMethodsContainer = props => {
  const { currentOrderMethod } = props;

  if (currentOrderMethod === DELIVERY_METHOD.DINE_IN) {
    return <Tables />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <DineMethods {...props} />;
};

DineMethodsContainer.displayName = 'DineMethodsContainer';

DineMethodsContainer.propTypes = {
  currentOrderMethod: PropTypes.string,
};

DineMethodsContainer.defaultProps = {
  currentOrderMethod: '',
};

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
