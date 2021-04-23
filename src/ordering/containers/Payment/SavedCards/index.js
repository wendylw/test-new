import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import HybridHeader from '../../../../components/HybridHeader';
import Constants from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Radio from '../../../../components/Radio';
import CreateOrderButton from '../../../components/CreateOrderButton';
import Loader from '../components/Loader';

import { bindActionCreators, compose } from 'redux';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../redux/modules/home';
import { getMerchantCountry, getUser } from '../../../redux/modules/app';
import { actions as paymentActionCreators, getCardList, getSelectedPaymentCard } from '../../../redux/modules/payment';
import { getCardLabel, getCardIcon } from '../utils';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../redux/modules/customer';
import IconAddNew from '../../../../images/icon-add-new.svg';
import '../PaymentCreditCard.scss';

class SavedCards extends Component {
  state = {
    isCartLoaded: false,
  };
  card = null;

  componentWillMount = async () => {
    // Fetch card list here
    const { cardList, history, user, appActions, selectedPaymentCard } = this.props;

    if (!selectedPaymentCard || !selectedPaymentCard.cardToken) {
      if (!cardList || !cardList.length) {
        // Better find another way to ensure user is logged in already, like ensureLoggedin
        if (!user) await appActions.loadCustomerProfile();

        const { user: userInfo } = this.props;
        await this.props.paymentActions.fetchSavedCard({
          userId: userInfo.consumerId,
          paymentName: 'Adyen',
        });

        const { cardList: savedCardList } = this.props;

        if (!savedCardList || !savedCardList.length)
          history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_ADYEN_PAYMENT,
            search: window.location.search,
          });
      } else {
        this.props.paymentActions.setPaymentCard(cardList[0]);
      }
    }
  };

  componentDidMount = async () => {
    const { deliveryDetails, customerActions } = this.props;
    const { addressId } = deliveryDetails || {};
    const type = Utils.getOrderTypeFromUrl();

    !addressId && (await customerActions.initDeliveryDetails(type));

    const { deliveryDetails: newDeliveryDetails } = this.props;
    const { deliveryToLocation } = newDeliveryDetails || {};

    await this.props.homeActions.loadShoppingCart(
      deliveryToLocation.latitude &&
        deliveryToLocation.longitude && {
          lat: deliveryToLocation.latitude,
          lng: deliveryToLocation.longitude,
        }
    );

    this.setState({
      isCartLoaded: true,
    });
  };

  setPaymentCard = card => {
    this.props.paymentActions.setPaymentCard(card);
  };

  renderCardList() {
    const { t, history, cardList, selectedPaymentCard } = this.props;

    return (
      <div className="payment-card-list__container">
        <ul className="payment-card-list__items">
          {cardList.map(card => {
            const { cardInfo, cardToken } = card;
            const { cardType, maskedNumber } = cardInfo;
            return (
              <li
                key={card.cardToken}
                className="ordering-payment__card flex flex-middle flex-space-between padding-small border__bottom-divider"
                onClick={() => this.setPaymentCard(card)}
              >
                <div className="ordering-payment__item-content">
                  <figure className="ordering-card-list__image-container text-middle padding-left-right-normal">
                    <img
                      className="ordering-card-list__image"
                      src={getCardIcon(cardType)}
                      alt={getCardLabel(cardType)}
                    />
                  </figure>
                  <div className="ordering-card-list__description text-middle">
                    <label className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder">
                      {getCardLabel(cardType)}
                    </label>
                    <p className="ordering-payment__prompt">{t('CardEndingIn', { cardEnding: maskedNumber })}</p>
                  </div>
                </div>
                <Radio
                  className="margin-left-right-small"
                  checked={
                    selectedPaymentCard && selectedPaymentCard.cardToken && selectedPaymentCard.cardToken === cardToken
                  }
                />
              </li>
            );
          })}
          <li
            className="ordering-payment__card flex flex-middle flex-space-between padding-small border__bottom-divider"
            onClick={async () => {
              await this.props.paymentActions.setPaymentCard({});
              history.push({
                pathname: Constants.ROUTER_PATHS.ORDERING_ADYEN_PAYMENT,
                search: window.location.search,
              });
            }}
          >
            <div className="ordering-payment__item-content flex flex-middle">
              <div className="ordering-payment__image-container ordering-payment__card-add text-center ordering-card-list__image-container">
                <img src={IconAddNew} alt="add new icon" />
              </div>
              <div className="ordering-payment__description text-middle">
                <label className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder">
                  {t('AddCreditCard')}
                </label>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const { t, history, cartSummary } = this.props;
    const { total } = cartSummary;

    return (
      <section className={`ordering-payment flex flex-column`}>
        <HybridHeader
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          isPage={true}
          title={t('PayViaCard')}
          headerRef={ref => (this.headerEl = ref)}
          navFunc={() => {
            history.goBack();
          }}
        />
        <div
          className="ordering-payment__container padding-top-bottom-normal"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: Utils.containerHeight({
              headerEls: [this.headerEl],
              footerEls: [this.footerEl],
            }),
          }}
        >
          <div className="text-center padding-top-bottom-normal">
            <CurrencyNumber className="text-size-large text-weight-bolder" money={total || 0} />
          </div>
          {this.renderCardList()}

          <Loader className={'loading-cover opacity'} loaded={this.state.isCartLoaded} />
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="ordering-payment__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            disabled={false}
            beforeCreateOrder={async () => {
              history.push({
                pathname: Constants.ROUTER_PATHS.ORDERING_ONLINE_CVV,
                search: window.location.search,
              });
            }}
            validCreateOrder={false}
            afterCreateOrder={() => {}}
          >
            <CurrencyNumber
              className="text-center text-weight-bolder text-uppercase"
              addonBefore={t('Pay')}
              money={total || 0}
            />
          </CreateOrderButton>
        </footer>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      cartSummary: getCartSummary(state),
      user: getUser(state),
      cardList: getCardList(state),
      selectedPaymentCard: getSelectedPaymentCard(state),
      merchantCountry: getMerchantCountry(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(SavedCards);
