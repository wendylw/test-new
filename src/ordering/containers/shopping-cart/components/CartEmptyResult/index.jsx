import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import cartIsEmpty from '../../../../../images/mvp-no-search.svg';
import './CartEmptyResult.scss';

class CartEmptyResult extends Component {
  handleReturnClick = () => {
    const { submittedStatus, handleReturnToMenu, handleReturnToTableSummary } = this.props;
    if (!submittedStatus) {
      return handleReturnToMenu();
    }

    return handleReturnToTableSummary();
  };

  render() {
    const { t, submittedStatus } = this.props;

    return (
      <div className="shopping-cart-empty__container absolute-wrapper flex flex-column flex-center flex-middle">
        <img className="shopping-cart-empty__image-container" src={cartIsEmpty} alt="order failure" />
        <div className="margin-smaller text-center">
          <h2 className="text-size-biggest text-weight-bold text-line-height-base">{t('CartEmptyTitle')}</h2>
          <p className="shopping-cart-empty__description text-center margin-top-bottom-smaller text-size-big text-line-height-base">
            {t('CartEmptyContentDescription')}
          </p>
        </div>
        <div className="padding-top-bottom-normal margin-smaller">
          <button
            onClick={this.handleReturnClick}
            className="button button__fill padding-normal text-uppercase text-weight-bolder"
            data-test-id="ordering.shopping-cart.empty-result.return-btn"
          >
            {/* PAY_LATER_DEBUG */}
            {!submittedStatus ? t('ReturnToMenu') : t('ReturnToTableSummary')}
          </button>
        </div>
      </div>
    );
  }
}

CartEmptyResult.displayName = 'CartEmptyResult';

CartEmptyResult.propTypes = {
  submittedStatus: PropTypes.bool,
  handleReturnToMenu: PropTypes.func,
  handleReturnToTableSummary: PropTypes.func,
};

CartEmptyResult.defaultProps = {
  submittedStatus: false,
  handleReturnToMenu: () => {},
  handleReturnToTableSummary: () => {},
};

export default withTranslation('OrderingCart')(CartEmptyResult);
