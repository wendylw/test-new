import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../utils/constants';

import { actions as homeActionCreators, getCurrentStoreId } from '../../redux/modules/home';
import {
  actions as tablesActionCreators,
  getTables,
  getCurrentTableId,
  getStoreHashCode,
} from '../../redux/modules/tables';

import Header from '../../../components/Header';

const { ROUTER_PATHS, DELIVERY_METHOD } = Constants;
class Tables extends Component {
  componentDidMount() {
    this.props.tablesActions.loadStoreTables();
  }

  handleClickBack = () => {
    this.props.homeActions.setOrderMethod('');
  };

  handleSelectTable = tableId => {
    this.props.tablesActions.setTableId(tableId);
  };

  handleContinue = async () => {
    await this.props.tablesActions.generatorStoreHashCode();
    this.gotoOrderingPage();
  };

  gotoOrderingPage() {
    window.location.href = `${ROUTER_PATHS.ORDERING_BASE}/?h=${this.props.storeHashCode || ''}&type=${
      DELIVERY_METHOD.DINE_IN
    }`;
  }

  render() {
    const { t, tables, currentTableId } = this.props;

    return (
      <section className="tables">
        <Header
          className="border__bottom-divider gray has-right flex-middle"
          isPage={true}
          title={t('SelectTableNumber')}
          navFunc={this.handleClickBack}
        />
        <div className="tables__title">{t('PleasePickOne')}</div>
        <div className="tables__list">
          {tables.map(table => {
            const active = table.id === currentTableId ? 'active' : '';
            return (
              <button
                onClick={() => this.handleSelectTable(table.id)}
                key={table.id}
                className={`tables__list-item ${active}`}
              >
                <div className="tables__list-table-title">{t('Table')}</div>
                <div className="tables__list-table-name">{table.name}</div>
              </button>
            );
          })}
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="tables__continue-button button button__fill button__block font-weight-bolder"
              disabled={currentTableId === ''}
              onClick={this.handleContinue}
            >
              {t('Continue')}
            </button>
          </div>
        </footer>
      </section>
    );
  }
}

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
