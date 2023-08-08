import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Constants from '../../../utils/constants';
import './OrderingTables.scss';

import { actions as homeActionCreators, getCurrentStoreId } from '../../redux/modules/home';
import {
  actions as tablesActionCreators,
  getTables,
  getCurrentTableId,
  getStoreHashCode,
} from '../../redux/modules/tables';

import HybridHeader from '../../../components/HybridHeader';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
class Tables extends Component {
  componentDidMount() {
    const { tablesActions } = this.props;

    tablesActions.loadStoreTables();
  }

  handleClickBack = () => {
    const { homeActions } = this.props;

    homeActions.setOrderMethod('');
  };

  handleSelectTable = tableId => {
    const { tablesActions } = this.props;

    tablesActions.setTableId(tableId);
  };

  handleContinue = async () => {
    const { tablesActions } = this.props;

    await tablesActions.generatorStoreHashCode();
    this.gotoOrderingPage();
  };

  gotoOrderingPage() {
    const { storeHashCode } = this.props;

    window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${storeHashCode || ''}&type=${DELIVERY_METHOD.DINE_IN}`;
  }

  render() {
    const { t, tables, currentTableId } = this.props;

    return (
      <section className="ordering-tables flex flex-column" data-test-id="stores.tables.container">
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="stores.tables.header"
          isPage
          title={t('SelectTableNumber')}
          navFunc={this.handleClickBack}
        />
        <div className="ordering-tables__container">
          <h2 className="padding-smaller margin-small text-size-big text-weight-bolder">{t('PleasePickOne')}</h2>
          <ul className="ordering-tables__list flex flex-middle padding-smaller margin-top-bottom-small">
            {tables.map(table => (
              <li className="ordering-tables__list-item padding-small" key={table.id}>
                <button
                  onClick={() => this.handleSelectTable(table.id)}
                  data-test-id="stores.tables.table-btn"
                  key={table.id}
                  className={`button button__block text-line-height-base border-radius-large ${
                    table.id === currentTableId ? 'button__fill' : 'button__outline'
                  }`}
                >
                  <div className="ordering-tables__list-table-title">{t('Table')}</div>
                  <div className="ordering-tables__list-table-name text-weight-bolder">{table.name}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            disabled={currentTableId === ''}
            onClick={this.handleContinue}
            data-test-id="stores.tables.continue"
          >
            {t('Continue')}
          </button>
        </footer>
      </section>
    );
  }
}

Tables.displayName = 'Tables';

Tables.propTypes = {
  tables: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  homeActions: PropTypes.shape({
    setOrderMethod: PropTypes.func,
  }),
  tablesActions: PropTypes.shape({
    setTableId: PropTypes.func,
    loadStoreTables: PropTypes.func,
    generatorStoreHashCode: PropTypes.func,
  }),
  storeHashCode: PropTypes.string,
  currentTableId: PropTypes.string,
};

Tables.defaultProps = {
  tables: [],
  homeActions: {
    setOrderMethod: () => {},
  },
  tablesActions: {
    setTableId: () => {},
    loadStoreTables: () => {},
    generatorStoreHashCode: () => {},
  },
  storeHashCode: '',
  currentTableId: '',
};

export default compose(
  withTranslation(),
  connect(
    state => ({
      hashCode: getStoreHashCode(state),
      currentStoreId: getCurrentStoreId(state),
      tables: getTables(state),
      currentTableId: getCurrentTableId(state),
      storeHashCode: getStoreHashCode(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      tablesActions: bindActionCreators(tablesActionCreators, dispatch),
    })
  )
)(Tables);
