import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _filter from 'lodash/filter';
import { IconLocalOffer } from '../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Constants from '../../../../utils/constants';

const { PROMOTIONS_TYPES, DELIVERY_METHOD } = Constants;
const appDownloadLink = 'https://dl.beepit.com/ocNj';
const SHIPPING_TYPES_MAPPING = {
  [DELIVERY_METHOD.PICKUP]: 5,
  [DELIVERY_METHOD.DELIVERY]: 6,
  [DELIVERY_METHOD.TAKE_AWAY]: 7,
  [DELIVERY_METHOD.DINE_IN]: 8,
};
class PromotionsBar extends Component {
  getPromotionOnlyInAppState(appliedClientTypes, inApp) {
    return appliedClientTypes.length === 1 && appliedClientTypes[0] === 'app' && !inApp;
  }

  getPromotionDisappearInAppState(appliedClientTypes, inApp) {
    return appliedClientTypes.length === 1 && appliedClientTypes[0] === 'web' && inApp;
  }

  renderPromotionText(promotion) {
    const { t } = this.props;
    const { discountType, discountValue, promotionCode, discountProductList, validDate } = promotion;
    const discountProducts = (discountProductList || []).join(', ');

    /* 注意！！！！：这只是临时PM决定的临时解决方案，绝对绝对绝对不能有第二次，如果有请提醒PM更换翻译文字长度，或者提供更通用的解决方案，这么可笑的处理并非作者本意 */
    if (promotionCode === 'FREEDEL') {
      return (
        <>
          Use <strong>FREEDEL</strong> to enjoy Free Delivery for your first 5KM
        </>
      );
    }

    if (discountProductList && validDate) {
      return (
        <Trans
          i18nKey="ProductsPromotionDescription"
          discountValue={discountValue}
          discountProducts={discountProducts}
          promotionCode={promotionCode}
          validDate={validDate}
        >
          Get <strong>{discountValue}</strong> OFF for {discountProducts} with <strong>{promotionCode}</strong>. Promo
          Code is valid till {validDate}
        </Trans>
      );
    } else if (!discountProductList && validDate) {
      return (
        <Trans
          i18nKey="StorePromotionDescription"
          discountValue={discountValue}
          promotionCode={promotionCode}
          validDate={validDate}
        >
          Get <strong>{discountValue}</strong> OFF with <strong>{promotionCode}</strong>. Promo Code is valid till{' '}
          {validDate}
        </Trans>
      );
    }

    switch (discountType) {
      case PROMOTIONS_TYPES.FREE_SHIPPING:
        return (
          <Trans
            i18nKey="FreeDeliveryPromotionDescription"
            freeDelivery={t('FreeDelivery')}
            promotionCode={promotionCode}
          >
            <span className="text-weight-bolder">{t('FreeDelivery')}</span> with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
      case PROMOTIONS_TYPES.TAKE_AMOUNT_OFF:
        return (
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <CurrencyNumber className="text-weight-bolder" money={discountValue} /> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
      case PROMOTIONS_TYPES.PERCENTAGE:
        return (
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <span className="text-weight-bolder">{`${discountValue}%`}</span> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
      default:
        return (
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <span className="text-weight-bolder">{discountValue}</span> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
    }
  }

  renderPromotionPromptText(promotion, inApp) {
    const { discountProductList, validDate, appliedClientTypes, maxDiscountAmount, minOrderAmount } = promotion;

    if (discountProductList || validDate) {
      return null;
    }

    const maxDiscountAmountEl = <CurrencyNumber money={maxDiscountAmount || 0} />;
    const minOrderAmountEl = <CurrencyNumber money={minOrderAmount || 0} />;
    const showBeepAppOnlyText = this.getPromotionOnlyInAppState(appliedClientTypes, inApp);

    if (!maxDiscountAmount && !minOrderAmount) {
      return showBeepAppOnlyText ? (
        <Trans i18nKey="OnlyInBeepAppPrompt">
          <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
            Beep app
          </a>{' '}
          only
        </Trans>
      ) : null;
    }

    if (!maxDiscountAmount && minOrderAmount) {
      return showBeepAppOnlyText ? (
        <Trans i18nKey="PromotionOnlyMinOrderAmountOnlyInAppPrompt">
          min. spend {minOrderAmountEl},{' '}
          <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
            Beep app
          </a>{' '}
          only
        </Trans>
      ) : (
        <Trans i18nKey="PromotionOnlyMinOrderAmountPrompt">min. spend {minOrderAmountEl}</Trans>
      );
    }

    if (maxDiscountAmount && !minOrderAmount) {
      return showBeepAppOnlyText ? (
        <Trans i18nKey="PromotionOnlyMaxDiscountAmountOnlyInAppPrompt">
          capped at {maxDiscountAmountEl},{' '}
          <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
            Beep app
          </a>{' '}
          only
        </Trans>
      ) : (
        <Trans i18nKey="PromotionOnlyMaxDiscountAmountPrompt">capped at {maxDiscountAmountEl}</Trans>
      );
    }

    return showBeepAppOnlyText ? (
      <Trans i18nKey="PromotionOnlyInAppPrompt">
        capped at {maxDiscountAmountEl} with min. spend {minOrderAmountEl},{' '}
        <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
          Beep app
        </a>{' '}
        only
      </Trans>
    ) : (
      <Trans i18nKey="PromotionPrompt">
        capped at {maxDiscountAmountEl} with min. spend {minOrderAmountEl}
      </Trans>
    );
  }

  render() {
    const { promotionRef, promotions, shippingType, inApp } = this.props;

    if (!promotions.length) {
      return null;
    }

    return (
      <ul ref={promotionRef} className="border__top-divider border__bottom-divider">
        {promotions.map((promo, index) => {
          const { appliedSources, promotionCode, appliedClientTypes } = promo;
          const disappearPromotionInApp = this.getPromotionDisappearInAppState(appliedClientTypes, inApp);

          if (
            !appliedSources.includes(SHIPPING_TYPES_MAPPING[shippingType || DELIVERY_METHOD.DELIVERY]) ||
            disappearPromotionInApp
          ) {
            return null;
          }

          const prompt = this.renderPromotionPromptText(promo, inApp);

          return (
            <li key={`promo-${promotionCode}-${index}`} className="flex flex-top padding-small">
              <IconLocalOffer className="icon icon__primary icon__smaller" />
              <p className="margin-left-right-smaller text-line-height-base">
                {this.renderPromotionText(promo)}
                {prompt ? (
                  <>
                    {/* 注意！！！！：这只是临时PM决定的临时解决方案，绝对绝对绝对不能有第二次，如果有请提醒PM更换翻译文字长度，或者提供更通用的解决方案，这么可笑的处理并非作者本意 */}
                    {promotionCode === 'FREEDEL' ? <>&nbsp;</> : <br />}({prompt})
                  </>
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }
}

PromotionsBar.propTypes = {
  promotionRef: PropTypes.oneOfType([
    // Either a function
    PropTypes.func,
    // Or the instance of a DOM native element (see the note about SSR)
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  promotions: PropTypes.array,
  shippingType: PropTypes.oneOfType(Object.values(DELIVERY_METHOD)),
  inApp: PropTypes.bool,
};

PromotionsBar.defaultProps = {
  promotions: [],
  inApp: false,
};

export default withTranslation('OrderingHome')(PromotionsBar);
