import React, { Component } from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import HybridHeader from '../../../../../components/HybridHeader';
import Constants from '../../../../../utils/constants';
import cartIsEmpty from '../../../../../images/mvp-no-search.svg';
import './ShoppingCartEmpty.scss';

class ShoppingCartEmpty extends Component {
  handleClickBack = async () => {
    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      // eslint-disable-next-line react/destructuring-assignment
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    }, 100);
  };

  render() {
    const { t, history } = this.props;
    return (
      // eslint-disable-next-line react/jsx-filename-extension
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
            {t('YourCartIsEmpty')}
          </p>
          <p className="shopping-cart-empty__text text-size-big">{t('ReturnToTheMainMenuAndOrderAgain')}</p>
          <button className="button button__fill margin-top-bottom-normal  padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder">
            {t('ReturnToMenu')}
          </button>
        </div>
      </section>
    );
  }
}

ShoppingCartEmpty.displayName = 'ShoppingCartEmpty';
export default compose(withTranslation(['OrderingShoppingCartEmpty']))(ShoppingCartEmpty);
