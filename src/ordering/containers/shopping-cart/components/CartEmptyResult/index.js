import React, { Component } from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import Constants from '../../../../../utils/constants';
import cartIsEmpty from '../../../../../images/mvp-no-search.svg';
import './CartEmptyResult.scss';

class CartEmptyResult extends Component {
  handleClickBack = async () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
      search: window.location.search,
    });
  };

  handleReturnClick = () => {
    const { submittedStatus, handleReturnToMenu, handleReturnToTableSummary } = this.props;
    if (submittedStatus) {
      return handleReturnToMenu();
    } else {
      return handleReturnToTableSummary();
    }
  };

  render() {
    const { t, history, submittedStatus } = this.props;

    return (
      <section className="flex flex-column shopping-cart__container">
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage
          history={history}
          title={t('ProductsInOrderText', { count: 0 })}
          navFunc={() => {
            this.handleClickBack();
          }}
        />
        <div className="text-center">
          <img className="shopping-cart-empty__image-container" src={cartIsEmpty} alt="order failure" />
          <p className="text-size-biggest text-weight-bold padding-left-right-smaller padding-smaller">
            {t('CartEmptyTitle')}
          </p>
          <p className="shopping-cart-empty__text text-size-big">{t('CartEmptyContentDescription')}</p>
          <button
            onClick={this.handleReturnClick}
            className="button button__fill margin-top-bottom-normal  padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
          >
            {/* PAY_LATER_DEBUG */}
            {!submittedStatus ? t('ReturnToMenu') : t('ReturnToTableSummary')}
          </button>
        </div>
      </section>
    );
  }
}

CartEmptyResult.displayName = 'CartEmptyResult';
export default compose(withTranslation(['OrderingCart']))(CartEmptyResult);
