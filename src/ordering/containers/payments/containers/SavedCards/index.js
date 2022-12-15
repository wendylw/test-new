import _get from 'lodash/get';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import HybridHeader from '../../../../../components/HybridHeader';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import prefetch from '../../../../../common/utils/prefetch-assets';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Radio from '../../../../../components/Radio';
import CreateOrderButton from '../../../../components/CreateOrderButton';

import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getUser } from '../../../../redux/modules/app';
import IconAddNew from '../../../../../images/icon-add-new.svg';
import { getCardList, getSelectedPaymentCard, getIsRequestSavedCardsPending } from './redux/selectors';
import { actions as savedCardsActions, thunks as savedCardsThunks } from './redux';
import {
  getSelectedPaymentOptionSupportSaveCard,
  getSelectedPaymentProvider,
  getTotal,
  getReceiptNumber,
  getInitPaymentRequestErrorMessage,
  getIsInitPaymentRequestStatusRejected,
} from '../../redux/common/selectors';
import { initialize as initializeThunkCreator } from '../../redux/common/thunks';
import { getCardLabel, getCardIcon, getCreditCardFormPathname } from '../../utils';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';
import '../../styles/PaymentCreditCard.scss';

const { PAYMENT_METHOD_LABELS } = Constants;
class SavedCards extends Component {
  willUnmount = false;

  state = { processing: false };

  componentDidMount = async () => {
    try {
      await this.props.initialize(PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY);

      const {
        paymentProvider,
        history,
        cardList,
        supportSaveCard,
        isInitPaymentFailed,
        initPaymentErrorMessage,
      } = this.props;

      if (isInitPaymentFailed) {
        logger.error(
          'Ordering_SavedCards_InitializeFailed',
          {
            message: initPaymentErrorMessage,
          },
          {
            bizFlow: {
              flow: KEY_EVENTS_FLOWS.CHECKOUT,
              step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SELECT_PAYMENT_METHOD,
            },
          }
        );
      }

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

      prefetch(['ORD_PMT', 'ORD_SRP', 'ORD_CC'], ['OrderingPayment']);
    } catch (error) {
      // TODO: Handle this error in Payment 2.0
      console.error(error);
    } finally {
      // Resolve React Warning: perform a set state after component unmounted
      if (this.willUnmount) {
        return;
      }
    }
  };

  componentWillUnmount() {
    this.willUnmount = true;
  }

  getPaymentEntryRequestData = () => {
    const { user, selectedPaymentCard } = this.props;
    const cardToken = _get(selectedPaymentCard, 'cardToken', null);

    return {
      userId: user.consumerId,
      cardToken,
      paymentProvider: Constants.PAYMENT_PROVIDERS.STRIPE,
      paymentOption: Constants.PAYMENT_API_PAYMENT_OPTIONS.TOKENIZATION,
    };
  };

  loadCardList = async () => {
    const { user: userInfo, paymentProvider, fetchSavedCards } = this.props;

    return fetchSavedCards({
      userId: userInfo.consumerId,
      paymentName: paymentProvider,
    });
  };

  setPaymentCard = card => {
    this.props.setPaymentCard(card);
  };

  beforeCreateOrder = () => {
    this.setState({ processing: true });
  };

  afterCreateOrder = orderId => {
    this.setState({
      processing: !!orderId,
    });

    if (!orderId) {
      logger.error(
        'Ordering_SavedCard_PayOrderFailed',
        {
          message: 'Failed to pay order by saved card',
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
        }
      );
    }
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
    const { t, history, total, selectedPaymentCard, receiptNumber, isRequestSavedCardsPending } = this.props;
    const { processing } = this.state;
    const cardToken = _get(selectedPaymentCard, 'cardToken', null);

    return (
      <section className={`ordering-payment flex flex-column`}>
        <HybridHeader
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
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="ordering-payment__footer flex__shrink-fixed footer padding-top-bottom-small padding-left-right-normal"
        >
          <CreateOrderButton
            className="margin-top-bottom-smaller"
            history={history}
            buttonType="submit"
            orderId={receiptNumber}
            total={total}
            disabled={!cardToken || processing || isRequestSavedCardsPending}
            paymentExtraData={this.getPaymentEntryRequestData()}
            validCreateOrder={true}
            beforeCreateOrder={this.beforeCreateOrder}
            afterCreateOrder={this.afterCreateOrder}
            processing={processing || isRequestSavedCardsPending}
            loaderText={isRequestSavedCardsPending ? t('Loading') : t('Processing')}
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
SavedCards.displayName = 'SavedCards';

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      total: getTotal(state),
      user: getUser(state),
      cardList: getCardList(state),
      selectedPaymentCard: getSelectedPaymentCard(state),
      supportSaveCard: getSelectedPaymentOptionSupportSaveCard(state),
      paymentProvider: getSelectedPaymentProvider(state),
      receiptNumber: getReceiptNumber(state),
      isRequestSavedCardsPending: getIsRequestSavedCardsPending(state),
      initPaymentErrorMessage: getInitPaymentRequestErrorMessage(state),
      isInitPaymentFailed: getIsInitPaymentRequestStatusRejected(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      initialize: bindActionCreators(initializeThunkCreator, dispatch),
      fetchSavedCards: bindActionCreators(savedCardsThunks.fetchSavedCards, dispatch),
      setPaymentCard: bindActionCreators(savedCardsActions.setPaymentCard, dispatch),
    })
  )
)(SavedCards);
