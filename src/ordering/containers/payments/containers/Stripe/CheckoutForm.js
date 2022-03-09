import React, { useRef, useState, useCallback, useEffect } from 'react';
import PaymentCardBrands from '../../components/PaymentCardBrands';
import { getPaymentName } from '../../utils';
import CVCCardImage from '../../../../../images/cvc-card.png';
import SaveCardSwitch from '../../components/CreditCard/SaveCardSwitch';
import CreditCardSecureInfo from '../../components/CreditCard/CreditCardSecureInfo';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Loader from '../../components/Loader';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import CleverTap from '../../../../../utils/clevertap';
import Field from './Field';
import ErrorMessage from './ErrorMessage';
import Constants from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import { alert } from '../../../../../common/feedback';
import { submitOrderErrorHandler } from '../../utils';
import { STRIPE_LOAD_TIME_OUT } from './constants';

const { PAYMENT_PROVIDERS, PAYMENT_API_PAYMENT_OPTIONS } = Constants;

function CheckoutForm({
  t,
  history,
  total,
  country,
  match,
  supportSaveCard,
  cleverTapAttributes,
  isAddCardPath,
  paymentExtraData,
  receiptNumber,
  modifiedTime,
  enablePayLater,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);

  const [cardNumber, setCardNumber] = useState({
    elementType: 'cardNumber',
    empty: true,
    complete: false,
    error: null,
    brand: null,
    isTouched: false,
  });
  const [cardExpiry, setCardExpiry] = useState({
    elementType: 'cardExpiry',
    complete: false,
    empty: true,
    error: null,
    isTouched: false,
  });
  const [cardCvc, setCardCvc] = useState({
    elementType: 'cardCvc',
    complete: false,
    empty: true,
    error: null,
    isTouched: false,
  });
  const [cardHolderName, setCardHolderName] = useState({
    value: '',
    error: null,
    empty: true,
    isTouched: false,
  });

  const timeoutRef = useRef(null);
  const [cardNumberDomLoaded, setCardNumberDom] = useState(false);
  const [cardExpiryDomLoaded, setCardExpiryDom] = useState(false);
  const [cardCVCDomLoaded, setCardCVCDom] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [saveCard, setSaveCard] = useState(supportSaveCard);

  const headerRef = useRef(null);
  const footerRef = useRef(null);

  const cardComplete = cardNumber.complete && cardExpiry.complete && cardCvc.complete && cardHolderName.value;
  const hasEmpty = [cardNumber, cardExpiry, cardCvc, cardHolderName].some(item => item.empty);
  const showCardInfoRequiredLabel = [cardNumber, cardExpiry, cardCvc].some(card => card.isTouched && card.empty);
  const showCardHolderNameRequiredLabel = cardHolderName.isTouched && cardHolderName.empty;

  const cardNumberHasError = error || cardNumber.error || (cardNumber.isTouched && cardNumber.empty);
  const cardExpiryHasError = cardExpiry.error || (cardExpiry.isTouched && cardExpiry.empty);
  const cardCvcHasError = cardCvc.error || (cardCvc.isTouched && cardCvc.empty);
  const errors = [cardNumber.error, cardExpiry.error, cardCvc.error, cardHolderName.error, error].filter(e => !!e);

  const isReady = cardNumberDomLoaded && cardExpiryDomLoaded && cardCVCDomLoaded;
  const createButtonDisabled = processing || !stripe || hasEmpty;

  const handleTimeout = useCallback(() => {
    if (isReady) {
      return;
    }

    console.error('Load Stripe time out');

    alert(t('ConnectionIssue'), { title: t('TimeOut') });

    history.goBack();
  }, [t, history, isReady]);

  useEffect(() => {
    timeoutRef.current = timeoutRef.current || setTimeout(handleTimeout, STRIPE_LOAD_TIME_OUT);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [handleTimeout]);

  const handleBeforeCreateOrder = useCallback(async () => {
    try {
      CleverTap.pushEvent('Card Details - click continue', {
        ...cleverTapAttributes,
        'payment method': getPaymentName(country, Constants.PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY),
      });

      if (saveCard) {
        CleverTap.pushEvent('saved cards - click add new card');
      }

      if (!cardComplete) {
        return;
      }

      setProcessing(true);

      enablePayLater ? await submitOrderErrorHandler({ receiptNumber, modifiedTime }) : null;

      const payload = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: cardHolderName.value,
        },
      });

      if (payload.error) {
        throw payload.error;
      }

      setPaymentMethod(payload.paymentMethod);
    } catch (error) {
      setError(error);
      setProcessing(false);
    }
  }, [cleverTapAttributes, country, cardComplete, stripe, elements, cardHolderName.value, saveCard]);

  const handleAfterCreateOrder = useCallback(async orderId => {
    setProcessing(!!orderId);
  }, []);

  const title = isAddCardPath ? t('AddCreditCardTitle') : t('PayViaCard');

  const finalPaymentExtraData = {
    ...paymentExtraData,
    paymentMethodId: paymentMethod ? paymentMethod.id : '',
    paymentOption: supportSaveCard && saveCard ? PAYMENT_API_PAYMENT_OPTIONS.SAVE_CARD : null,
  };

  return (
    <section
      className={`payment-credit-card flex flex-column ${match.isExact ? '' : 'hide'}`}
      data-heap-name="ordering.payment.stripe.container"
    >
      <HybridHeader
        headerRef={headerRef}
        className="flex-middle"
        contentClassName="flex-middle"
        data-heap-name="ordering.payment.stripe.header"
        isPage={true}
        title={title}
        navFunc={() => {
          CleverTap.pushEvent('Card Details - click back arrow');

          history.goBack();
        }}
      />

      <div
        className="payment-credit-card__container padding-top-bottom-normal"
        style={{
          top: `${Utils.mainTop({
            headerEls: [headerRef.current],
          })}px`,
          height: Utils.containerHeight({
            headerEls: [headerRef.current],
            footerEls: [footerRef.current],
          }),
        }}
      >
        <div className="form">
          <div className="text-center padding-top-bottom-normal margin-top-bottom-normal">
            <CurrencyNumber
              className="payment-credit-card__title text-size-large text-weight-bolder"
              money={total || 0}
            />
          </div>
          <div className="padding-left-right-normal">
            <div className="flex flex-middle flex-space-between padding-top-bottom-small">
              <label className="text-size-big text-weight-bolder">{t('CardInformation')}</label>
              {showCardInfoRequiredLabel ? (
                <span className="form__error-message text-weight-bolder text-uppercase">{t('RequiredMessage')}</span>
              ) : null}
            </div>
            <div
              className={`payment-credit-card__group-card-number padding-left-right-normal form__group ${
                cardNumberHasError ? 'error' : ''
              }`}
              data-heap-name="ordering.payment.stripe.card-number-wrapper"
            >
              <CardNumberElement
                options={{
                  style: {
                    base: {
                      lineHeight: '54px',
                      color: cardNumberHasError ? '#fa4133' : '#303030',
                      fontSize: '1.4285rem',
                      fontSmoothing: 'antialiased',
                      ':-webkit-autofill': {
                        color: '#8F9092',
                      },
                      '::placeholder': {
                        color: '#8F9092',
                      },
                    },
                    invalid: {
                      color: '#fa4133',
                    },
                  },
                }}
                onChange={event => {
                  setCardNumber(cardNumber => ({
                    ...cardNumber,
                    ...event,
                  }));
                  setError(null);
                }}
                onReady={e => {
                  setCardNumberDom(true);
                }}
                onBlur={() => {
                  setCardNumber(cardNumber => ({
                    ...cardNumber,
                    isTouched: true,
                  }));
                }}
              />
              <PaymentCardBrands country={country} brand={cardNumber.brand} vendor={PaymentCardBrands.VENDOR_STRIPE} />
            </div>

            <div className="flex flex-middle">
              <div
                className="payment-credit-card__group-left-bottom form__group padding-left-right-normal"
                data-heap-name="ordering.payment.stripe.valid-date-wrapper"
                style={{
                  width: '50%',
                  borderColor: cardExpiryHasError ? '#fa4133' : '#dededf',
                }}
              >
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        lineHeight: '54px',
                        color: '#303030',
                        fontSize: '1.4285rem',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                          color: '#8F9092',
                        },
                        '::placeholder': {
                          color: '#8F9092',
                        },
                      },
                      invalid: {
                        color: '#fa4133',
                      },
                    },
                  }}
                  onChange={e => {
                    setCardExpiry(cardExpiry => ({
                      ...cardExpiry,
                      ...e,
                    }));
                  }}
                  onReady={e => {
                    setCardExpiryDom(true);
                  }}
                  onBlur={() => {
                    setCardExpiry(cardExpiry => ({
                      ...cardExpiry,
                      isTouched: true,
                    }));
                  }}
                />
              </div>
              <div
                className="payment-credit-card__group-right-bottom form__group padding-left-right-normal"
                style={{
                  position: 'relative',
                  width: '50%',
                  borderWidth: cardCvcHasError ? '1px' : '1px 1px 1px 0',
                  borderColor: cardCvcHasError ? '#fa4133' : '#dededf',
                }}
                data-heap-name="ordering.payment.stripe.cvc-wrapper"
              >
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        lineHeight: '54px',
                        color: '#303030',
                        fontSize: '1.4285rem',
                        fontSmoothing: 'antialiased',
                        ':-webkit-autofill': {
                          color: '#8F9092',
                        },
                        '::placeholder': {
                          color: '#8F9092',
                        },
                      },
                      invalid: {
                        color: '#fa4133',
                      },
                    },
                  }}
                  onChange={e => {
                    setCardCvc(cardCvc => ({
                      ...cardCvc,
                      ...e,
                    }));
                  }}
                  onReady={e => {
                    setCardCVCDom(true);
                  }}
                  onBlur={() => {
                    setCardCvc(cardCvc => ({
                      ...cardCvc,
                      isTouched: true,
                    }));
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    height: '100%',
                    right: '12px',
                    top: 0,
                    width: '34px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img alt="CVC" src={CVCCardImage} />
                </div>
              </div>
            </div>
          </div>

          <ErrorMessage errors={errors}></ErrorMessage>

          <Field
            t={t}
            label={t('NameOnCard')}
            formClassName="payment-credit-card__card-holder-name padding-normal margin-top-bottom-small"
            inputClassName={`payment-credit-card__input form__input padding-left-right-normal text-size-biggest`}
            id="name"
            type="text"
            required
            autoComplete="name"
            data-heap-name="ordering.payment.stripe.holder-name"
            value={cardHolderName.value}
            showRequiredLabel={showCardHolderNameRequiredLabel}
            error={cardHolderName.error}
            onChange={e => {
              const value = e.target.value || '';

              setCardHolderName(cardHolderName => ({
                ...cardHolderName,
                value,
                empty: value.length === 0,
                error: null,
              }));
            }}
            onBlur={() => {
              setCardHolderName(cardHolderName => ({
                ...cardHolderName,
                isTouched: true,
              }));
            }}
          />

          {supportSaveCard && (
            <div className="padding-left-right-normal">
              <SaveCardSwitch
                value={saveCard}
                onChange={v => {
                  CleverTap.pushEvent('saved cards - click saved card');
                  setSaveCard(v);
                }}
              />
              <CreditCardSecureInfo paymentProvider={PAYMENT_PROVIDERS.STRIPE} />
            </div>
          )}

          <Loader className={'loading-cover opacity'} loaded={isReady} />
        </div>
      </div>
      <footer
        ref={footerRef}
        className=" payment-credit-card__footer footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal"
      >
        <CreateOrderButton
          className="margin-top-bottom-smaller text-uppercase"
          history={history}
          buttonType="submit"
          total={total}
          orderId={receiptNumber}
          data-heap-name="ordering.payment.stripe.pay-btn"
          disabled={createButtonDisabled}
          beforeCreateOrder={handleBeforeCreateOrder}
          validCreateOrder={!!paymentMethod}
          afterCreateOrder={handleAfterCreateOrder}
          paymentName={'Stripe'}
          paymentExtraData={finalPaymentExtraData}
          processing={processing}
          loaderText={t('Processing')}
        >
          {processing ? (
            t('Processing')
          ) : (
            <CurrencyNumber
              className="text-center text-weight-bolder text-uppercase"
              addonBefore={saveCard ? t('AddAndPay') : t('Pay')}
              money={total || 0}
            />
          )}
        </CreateOrderButton>
      </footer>
    </section>
  );
}
CheckoutForm.displayName = 'CheckoutForm';

export default CheckoutForm;
