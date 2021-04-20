import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _filter from 'lodash/filter';
import { IconLocalOffer } from '../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import CurrencyNumber from '../../../components/CurrencyNumber';

const appDownloadLink = 'https://dl.beepit.com/ocNj';
const SHIPPING_TYPES_MAPPING = {
  pickup: 5,
  delivery: 6,
  takeaway: 7,
  'dine-in': 8,
};

class PromotionsBar extends Component {
  getPromotionOnlyInAppState(appliedClientTypes) {
    return appliedClientTypes.length === 1 && appliedClientTypes[0] === 'app';
  }

  renderPromotionText(discountType, discountValue, promotionCode) {
    const { t } = this.props;
    let discountValueEl = <span className="text-weight-bolder">{discountValue}</span>;

    if (discountType === 'freeShipping') {
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
    }

    if (discountType === 'absolute') {
      discountValueEl = <CurrencyNumber className="text-weight-bolder" money={discountValue} />;
    } else if (discountType === 'percentage') {
      discountValueEl = <span className="text-weight-bolder">{discountValue}%</span>;
    }

    return (
      <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
        {discountValueEl} OFF with promo code <strong>{promotionCode}</strong>
      </Trans>
    );
  }

  renderPromotionPromptText(promotion) {
    const { t } = this.props;
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
          const { discountType, discountValue, appliedSources, discountProductList, promotionCode, validDate } = promo;
          const discountProducts = (discountProductList || []).join(', ');
          const productsPromotionDescription = (
            <Trans
              i18nKey="ProductsPromotionDescription"
              discountValue={discountValue}
              discountProducts={discountProducts}
              promotionCode={promotionCode}
              validDate={validDate}
            >
              Get <strong>{discountValue}</strong> OFF for {discountProducts} with <strong>{promotionCode}</strong>.
              Promo Code is valid till {validDate}
            </Trans>
          );
          const storePromotionDescription = (
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
          let description = this.renderPromotionText(discountType, discountValue, promotionCode);
          let prompt = null;

          if (discountProductList && validDate) {
            description = productsPromotionDescription;
          } else if (discountProductList || validDate) {
            description = storePromotionDescription;
          } else {
            prompt = (
              <>
                <br /> ({this.renderPromotionPromptText(promo)})
              </>
            );
          }

          if (shippingType && !appliedSources.find(source => SHIPPING_TYPES_MAPPING[shippingType] === source)) {
            return null;
          }

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
  promotionRef: PropTypes.any,
  promotions: PropTypes.array,
  shippingType: PropTypes.string,
};

PromotionsBar.defaultProps = {
  promotions: [],
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {},
    dispatch => ({})
  )
)(PromotionsBar);
