import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Header from '../../../../../components/Header';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Radio from '../../../../../components/Radio';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import Loader from '../../components/Loader';
import _get from 'lodash/get';

import { compose, bindActionCreators } from 'redux';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as homeActionCreators } from '../../../../redux/modules/home';
import { getUser } from '../../../../redux/modules/app';
import { getCardList, getSelectedPaymentCard } from './redux/selectors';
import { actions as savedCardsActions, thunks as savedCardsThunks } from './redux';
import { getSelectedPaymentOption, getSelectedPaymentProvider } from '../../redux/common/selectors';
import * as paymentCommonThunks from '../../redux/common/thunks';
import { getCardLabel, getCardIcon, getCreditCardFormPathname } from '../../utils';
import { getDeliveryDetails, actions as customerActionCreators } from '../../../../redux/modules/customer';
import IconAddNew from '../../../../../images/icon-add-new.svg';
import '../../styles/PaymentCreditCard.scss';

const { PAYMENT_METHOD_LABELS } = Constants;
class SavedCards extends Component {
  state = {
    // TODO: Move whole state to redux store in Payment 2.0
    showLoading: false,
  };

  willUnmount = false;

  ensurePaymentProvider = async () => {
    const { paymentProvider, loadPaymentOptions } = this.props;
    // refresh page will lost state
    if (!paymentProvider) {
      await loadPaymentOptions(PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);
    }
  };

  componentDidMount = async () => {
    try {
      this.setState({
        showLoading: true,
      });

      const { user, appActions } = this.props;
      if (!user) await appActions.loadCustomerProfile();
      await this.ensurePaymentProvider();

      const { paymentProvider, paymentOption, history, cardList } = this.props;
      const supportSaveCard = _get(paymentOption, 'supportSaveCard', false);

      if (!supportSaveCard) {
        history.replace({
          pathname: getCreditCardFormPathname(paymentProvider),
          search: window.location.search,
        });
        return;
      }

      if (!cardList || !cardList.length) {
        await this.loadCardList();
      }

      const { cardList: loadedCardList } = this.props;
      if (!loadedCardList || !loadedCardList.length) {
        history.replace({
          pathname: getCreditCardFormPathname(paymentProvider),
          search: window.location.search,
        });
        return;
      }

      await this.loadShoppingCart();
    } catch (error) {
      // TODO: Handle this error in Payment 2.0
      console.error(error);
    } finally {
      // Resolve React Warning: perform a set state after component unmounted
      if (this.willUnmount) {
        return;
      }

      this.setState({
        showLoading: false,
      });
    }
  };

  componentWillUnmount() {
    this.willUnmount = true;
  }

  loadCardList = async () => {
    const { user: userInfo, paymentProvider, fetchSavedCard } = this.props;

    return fetchSavedCard({
      userId: userInfo.consumerId,
      paymentName: paymentProvider,
    });
  };

  loadShoppingCart = async () => {
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
  };

  setPaymentCard = card => {
    this.props.setPaymentCard(card);
  };

  renderCardList() {
    const { t, history, cardList, selectedPaymentCard, paymentProvider } = this.props;

    return (
      <div className="payment-card-list__container padding-top-bottom-normal">
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
              history.push({
                pathname: getCreditCardFormPathname(paymentProvider, true),
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
    const { t, history, cartSummary, selectedPaymentCard } = this.props;
    const { total } = cartSummary;
    const cardToken = _get(selectedPaymentCard, 'cardToken', null);

    return (
      <section className={`ordering-payment flex flex-column`}>
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={t('PayViaCard')}
          headerRef={ref => (this.headerEl = ref)}
          navFunc={() => {
            history.goBack();
          }}
        />
        <div
          className="ordering-payment__container"
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
          <div className="text-center padding-top-bottom-normal margin-top-bottom-normal">
            <CurrencyNumber
              className="payment-credit-card__title text-size-large text-weight-bolder"
              money={total || 0}
            />
          </div>
          {this.renderCardList()}

          <Loader className={'loading-cover opacity'} loaded={!this.state.showLoading} />
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="ordering-payment__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            disabled={!cardToken}
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
      deliveryDetails: getDeliveryDetails(state),
      paymentOption: getSelectedPaymentOption(state),
      paymentProvider: getSelectedPaymentProvider(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      loadPaymentOptions: bindActionCreators(paymentCommonThunks.loadPaymentOptions, dispatch),
      fetchSavedCard: bindActionCreators(savedCardsThunks.fetchSavedCard, dispatch),
      setPaymentCard: bindActionCreators(savedCardsActions.setPaymentCard, dispatch),
    })
  )
)(SavedCards);
