import React from 'react';
// import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import Utils from '../../../utils/utils';
import HybridHeader from '../../../components/HybridHeader';
import CurrencyNumber from '../../components/CurrencyNumber';
import Image from '../../../components/Image';
import { IconChecked, IconError } from '../../../components/Icons';
import Billing from '../../components/Billing';
import './TableSummary.scss';

export class TableSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartContainerHeight: '100%',
      productsContainerHeight: '0px',
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  }

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  setCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (preContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  };

  setProductsContainerHeight = preProductsContainerHeight => {
    const productsContainerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl, this.billingEl],
    });
    const preHeightNumber = _floor(_replace(preProductsContainerHeight, 'px', ''));
    const currentHeightNumber = _floor(_replace(productsContainerHeight, 'px', ''));

    if (productsContainerHeight > '0px' && Math.abs(currentHeightNumber - preHeightNumber) > 10) {
      this.setState({
        productsContainerHeight,
      });
    }
  };

  renderBaseInfo() {
    return (
      <div className="table-summary__base-info">
        {true ? (
          <div className="table-summary__base-info-status--created flex flex-middle padding-small">
            <IconChecked className="icon icon__success padding-small" />
            <span className="margin-left-right-smaller text-size-big">Order Placed</span>
          </div>
        ) : (
          <div className="table-summary__base-info-status--locked flex flex-middle padding-small">
            <IconError className="icon icon__primary padding-small" />
            <span className="margin-left-right-smaller text-size-big theme-color">Pending Payment</span>
          </div>
        )}
        <div className="padding-left-right-normal padding-top-bottom-small">
          <ul className="table-summary__base-info-list">
            <li className="flex flex-middle flex-space-between padding-top-bottom-normal">
              <h5 className="text-size-small text-opacity">Order Number</h5>
              <span className="text-size-small">6789</span>
            </li>
            <li className="flex flex-middle flex-space-between padding-top-bottom-normal border__top-divider">
              <h5 className="text-size-small text-opacity">Table Number</h5>
              <span className="text-size-small">T-45</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderSubOrder() {
    return (
      <div className="table-summary__sub-order padding-top-bottom-small">
        <div className="text-right padding-small">
          <span className="margin-small text-opacity">Created at 15:30</span>
        </div>
        <ul>
          <li key="" className="flex flex-middle flex-space-between padding-left-right-small">
            <div className="flex">
              <div className="table-summary__image-container flex__shrink-fixed margin-small">
                <Image className="table-summary__image card__image" src={null} alt="" />
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
    const { cartContainerHeight } = this.state;

    return (
      <section
        className="table-summary flex flex-column"
        data-heap-name="ordering.order-status.table-summary.container"
      >
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle"
          contentClassName="table-summary__header-content flex-middle flex-center flex-space-between text-capitalize"
          data-heap-name="ordering.need-help.header"
          isPage={false}
          title={t('TableSummary')}
          navFunc={() => {}}
        />

        <div
          className="table-summary__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          {this.renderBaseInfo()}
          {this.renderSubOrder()}
          {this.renderSubOrder()}
          <Billing
            billingRef={ref => {
              this.billingEl = ref;
            }}
            className="table-summary__billing-container"
            history={history}
            tax={1}
            serviceCharge={20}
            subtotal={20}
            total={20}
            isLogin
          />
        </div>
        <footer
          ref={ref => {
            this.footerEl = ref;
          }}
          className="footer padding-small flex flex-middle"
        >
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
