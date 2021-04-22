import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _filter from 'lodash/filter';
import { IconLocalOffer } from '../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Constants from '../../../../utils/constants';

const { PROMOTIONS_TYPES } = Constants;
const appDownloadLink = 'https://dl.beepit.com/ocNj';
const SHIPPING_TYPES_MAPPING = {
  pickup: 5,
  delivery: 6,
  takeaway: 7,
  dineIn: 8,
};

class PromotionsBar extends Component {
  getPromotionOnlyInAppState(appliedClientTypes) {
    return appliedClientTypes.length === 1 && appliedClientTypes[0] === 'app';
  }

  renderPromotionText(promotion) {
    const { t } = this.props;
    const { discountType, discountValue, promotionCode, discountProductList, validDate } = promotion;
    const discountProducts = (discountProductList || []).join(', ');

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
    } else if (discountProductList || validDate) {
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

  renderPromotionPromptText(promotion) {
    const { appliedClientTypes, maxDiscountAmount, minOrderAmountCondition } = promotion;
    const maxDiscountAmountEl = <CurrencyNumber money={maxDiscountAmount || 0} />;
    const minOrderAmountConditionEl = <CurrencyNumber money={minOrderAmountCondition || 0} />;
    const onlyInApp = this.getPromotionOnlyInAppState(appliedClientTypes);

    if (!maxDiscountAmount && !minOrderAmountCondition) {
      return onlyInApp ? (
        <Trans i18nKey="OnlyInBeepAppPrompt">
          <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
            Beep app
          </a>{' '}
          only
        </Trans>
      ) : null;
    }

    if (!maxDiscountAmount && minOrderAmountCondition) {
      return onlyInApp ? (
        <Trans i18nKey="PromotionOnlyMinOrderAmountOnlyInAppPrompt">
          min. spend {minOrderAmountConditionEl},{' '}
          <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
            Beep app
          </a>{' '}
          only
        </Trans>
      ) : (
        <Trans i18nKey="PromotionOnlyMinOrderAmountPrompt">min. spend {minOrderAmountConditionEl}</Trans>
      );
    }

    if (maxDiscountAmount && !minOrderAmountCondition) {
      return onlyInApp ? (
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

    return onlyInApp ? (
      <Trans i18nKey="PromotionOnlyInAppPrompt">
        capped at {maxDiscountAmountEl} with min. spend {minOrderAmountConditionEl},{' '}
        <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
          Beep app
        </a>{' '}
        only
      </Trans>
    ) : (
      <Trans i18nKey="PromotionPrompt">
        capped at {maxDiscountAmountEl} with min. spend {minOrderAmountConditionEl}
      </Trans>
    );
  }

  render() {
    const { promotionRef, promotions, shippingType } = this.props;

    if (!promotions.length) {
      return null;
    }

    return (
      <ul ref={promotionRef} className="border__top-divider border__bottom-divider">
        {promotions.map((promo, index) => {
          const { appliedSources, discountProductList, promotionCode, validDate } = promo;
          const description = this.renderPromotionText(promo);

          if (shippingType && !appliedSources.find(source => SHIPPING_TYPES_MAPPING[shippingType] === source)) {
            return null;
          }

          const prompt =
            discountProductList || validDate || !this.renderPromotionPromptText(promo) ? null : (
              <>
                <br /> ({this.renderPromotionPromptText(promo)})
              </>
            );

          return (
            <li key={`promo-${promotionCode}-${index}`} className="flex flex-top padding-small">
              <IconLocalOffer className="icon icon__primary icon__smaller" />
              <p className="margin-left-right-smaller text-line-height-base">
                {description}
                {prompt}
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
  shippingType: PropTypes.string,
};

PromotionsBar.defaultProps = {
  promotions: [],
};

export default withTranslation('OrderingHome')(PromotionsBar);
