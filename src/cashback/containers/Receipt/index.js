/* eslint-disable jsx-a11y/alt-text */
import qs from 'qs';
import React, { Component } from 'react';
import Item from './components/Item';
import Billing from './components/Billing';
import Header from '../../../components/Header';
import ItemOperator from './components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as thankYouActions, getOrder, getBusinessInfo } from '../../redux/modules/thankYou';

export class ReceiptDetail extends Component {
  componentWillMount() {
    const {
      history,
      thankYouActions,
    } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    thankYouActions.loadOrder(receiptNumber);
  }

  backToThankYou() {
    const { history } = this.props;
    const h = config.h();

    history.replace(`${Constants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${h}`, history.location.state);
  }

  renderProductItem() {
    const { order } = this.props;
    const { items } = order || {};

    return (
      <div className="list__container">
        {
          (items || []).map(item => {
            const {
              id,
              title,
              variationTexts,
              displayPrice,
              unitPrice,
              quantity,
              image,
            } = item;

            if (item.itemType) {
              return null;
            }

            return (
              <Item
                contentClassName="flex-top"
                key={id}
                image={image}
                title={title}
                variation={variationTexts.join(', ')}
                detail={
                  <CurrencyNumber money={displayPrice || unitPrice || 0} />
                }
              >

                <ItemOperator
                  className="flex-middle exhibit"
                  quantity={quantity}
                  decreaseDisabled={quantity === 0}
                />
              </Item>
            );
          })
        }
      </div>
    );
  }

  render() {
    const { order } = this.props;
    const {
      orderId,
      tax,
      serviceCharge,
      subtotal,
      total,
      tableId,
    } = order || {};

    return (
      <section className="table-ordering__receipt table-ordering__cashback-receipt">
        <Header
          className="border__bottom-divider gray"
          title="View Receipt"
          navFunc={this.backToThankYou.bind(this)}
        >
          <span className="gray-font-opacity text-uppercase">
            {
              tableId
                ? `Table ${tableId}`
                : 'Self pick-up'
            }
          </span>
        </Header>
        <div className="receipt__content text-center">
          <label className="receipt__label gray-font-opacity font-weight-bold text-uppercase">Receipt Number</label>
          <span className="receipt__id-number">{orderId}</span>
        </div>
        {this.renderProductItem()}
        <Billing
          className="fixed"
          tax={tax}
          serviceCharge={serviceCharge}
          subtotal={subtotal}
          total={total}
        />
      </section>
    )
  }
}

export default connect(
  (state) => ({
    businessInfo: getBusinessInfo(state),
    order: getOrder(state),
  }),
  (dispatch) => ({
    thankYouActions: bindActionCreators(thankYouActions, dispatch),
  })
)(ReceiptDetail);