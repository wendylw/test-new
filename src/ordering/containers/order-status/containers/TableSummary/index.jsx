import React from 'react';
// import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Image from '../../../../../components/Image';
import Billing from '../../../../components/Billing';
import './TableSummary.scss';

export class TableSummary extends React.Component {
  renderBaseInfo() {
    return (
      <div>
        <div>
          <span>Order Placed</span>
        </div>
        <div>
          <ul>
            <li className="flex flex-middle flex-space-between">
              <h5 className="text-size-small">Order Number</h5>
              <span className="text-size-small">6789</span>
            </li>
            <li className="flex flex-middle flex-space-between">
              <h5 className="text-size-small">Table Number</h5>
              <span className="text-size-small">6789</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderSubOrder() {
    return (
      <div>
        <div className="flex flex-middle flex-space-between padding-small">
          <h2 className="margin-small">New sub-order</h2>
          <span className="margin-small text-opacity">Created at 15:30</span>
        </div>
        <ul>
          <li key="" className="flex flex-middle flex-space-between padding-left-right-small">
            <div className="flex">
              <div className="product-item__image-container flex__shrink-fixed margin-small">
                <Image className="product-item__image card__image" src={null} alt="" />
              </div>
              <div className="padding-small flex flex-column flex-space-between">
                <span className="table-summary__item-title">title</span>
                <p>
                  <span className="table-summary__item-variations">variationTexts, variationTexts</span>
                </p>
                <CurrencyNumber
                  className="padding-top-bottom-smaller flex__shrink-fixed text-opacity"
                  money={100 * 1}
                  numberOnly
                />
              </div>
            </div>
            <span className="padding-top-bottom-small flex__shrink-fixed margin-small text-opacity">x 1</span>
          </li>
        </ul>

        <div className="border__top-divider margin-top-bottom-small margin-left-right-normal text-opacity">
          <p className="padding-top-bottom-normal text-line-height-base">No tomatoes, more garlic</p>
        </div>
      </div>
    );
  }

  render() {
    const { t, history } = this.props;

    return (
      <section className="table-summary" data-heap-name="ordering.order-status.table-summary.container">
        <HybridHeader
          className="flex-middle"
          contentClassName="flex-middle text-capitalize"
          data-heap-name="ordering.need-help.header"
          isPage={false}
          title={t('TableSummary')}
          navFunc={() => {}}
        />

        <div className="table-summary__container">
          {this.renderBaseInfo()}
          {this.renderSubOrder()}
          <Billing
            className="table-summary__billing-container"
            history={history}
            tax={1}
            serviceCharge={20}
            subtotal={20}
            total={20}
            isLogin
          />
          <footer className="footer padding-small flex flex-middle">
            <button
              className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
              data-testid="pay"
              data-heap-name="ordering.order-status.table-summary.pay-btn"
              onClick={() => {}}
              disabled={false}
            >
              {t('PayNow')}
            </button>
          </footer>
        </div>
      </section>
    );
  }
}

TableSummary.displayName = 'TableSummary';

TableSummary.propTypes = {};

TableSummary.defaultProps = {};

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(() => ({}), {})
)(TableSummary);
