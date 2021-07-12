import React, { PureComponent } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { SHIPPING_TYPES_MAPPING, DELIVERY_METHOD, PROMOTIONS_TYPES } from './constants';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const appDownloadLink = 'https://dl.beepit.com/ocNj';
class PromotionContent extends PureComponent {
  getPromotionText() {
    const { promotion, t } = this.props;
    const { discountType, discountValue, promotionCode, discountProductList, validDate } = promotion;

    if (discountProductList && validDate) {
      const discountProducts = (discountProductList || []).join(', ');

      return (
        <Trans
          t={t}
          i18nKey="ProductsPromotionDescription"
          values={{ discountProducts, promotionCode, validDate }}
          components={[<CurrencyNumber className="text-weight-bolder" money={discountValue} />, <strong />]}
        />
      );
    }

    if (!discountProductList && validDate) {
      return (
        <Trans
          t={t}
          i18nKey="StorePromotionDescription"
          values={{ promotionCode, validDate }}
          components={[<CurrencyNumber className="text-weight-bolder" money={discountValue} />, <strong />]}
        />
      );
    }

    switch (discountType) {
      case PROMOTIONS_TYPES.FREE_SHIPPING:
        return (
          <Trans
            t={t}
            i18nKey="FreeDeliveryPromotionDescription"
            values={{ promotionCode }}
            components={[<span className="text-weight-bolder" />, <strong />]}
          />
        );
      case PROMOTIONS_TYPES.TAKE_AMOUNT_OFF:
        return (
          <Trans
            t={t}
            i18nKey="TakeAmountOffPromotionDescription"
            values={{ promotionCode }}
            components={[<CurrencyNumber className="text-weight-bolder" money={discountValue} />, <strong />]}
          />
        );
      case PROMOTIONS_TYPES.PERCENTAGE:
        return (
          <Trans
            t={t}
            i18nKey="PercentagePromotionDescription"
            values={{ promotionCode, discountValue }}
            components={[<span className="text-weight-bolder" />, <strong />]}
          />
        );
      default:
        return (
          <Trans
            t={t}
            i18nKey="PromotionDescription"
            values={{ promotionCode, discountValue }}
            components={[<span className="text-weight-bolder" />, <strong />]}
          />
        );
    }
  }

  getPromotionPrompt() {
    const { promotion, inApp, t } = this.props;
    const {
      discountProductList,
      validDate,
      appliedClientTypes,
      appliedSources,
      maxDiscountAmount,
      minOrderAmount,
      requireFirstPurchase,
    } = promotion;

    if (discountProductList || validDate) {
      return null;
    }

    const maxDiscountAmountEl = <CurrencyNumber money={maxDiscountAmount || 0} />;
    const minOrderAmountEl = <CurrencyNumber money={minOrderAmount || 0} />;
    const appDownloadLinkEl = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink} />
    );
    const beepAppOnlyEl = <Trans t={t} i18nKey="OnlyInBeepAppPrompt" components={[appDownloadLinkEl]} />;
    const firstOrderOnlyEl = requireFirstPurchase ? t('FirstOrderOnly') : null;
    const deliveryOrderOnlyEl =
      appliedSources.length === 1 && appliedSources[0] === SHIPPING_TYPES_MAPPING[DELIVERY_METHOD.DELIVERY_METHOD]
        ? t('DeliveryOrderOnly')
        : null;

    const showBeepAppOnlyText = appliedClientTypes.length === 1 && appliedClientTypes[0] === 'app' && !inApp;
    const prompts = [];

    if (!maxDiscountAmount && minOrderAmount) {
      prompts.push(<Trans t={t} i18nKey="PromotionOnlyMinOrderAmountPrompt" components={[minOrderAmountEl]} />);
    }

    if (maxDiscountAmount && !minOrderAmount) {
      prompts.push(<Trans t={t} i18nKey="PromotionOnlyMaxDiscountAmountPrompt" components={[maxDiscountAmountEl]} />);
    }

    if (maxDiscountAmount && minOrderAmount) {
      prompts.push(<Trans t={t} i18nKey="PromotionPrompt" components={[maxDiscountAmountEl, minOrderAmountEl]} />);
    }

    if (showBeepAppOnlyText) {
      prompts.push(beepAppOnlyEl);
    }

    if (firstOrderOnlyEl) {
      prompts.push(firstOrderOnlyEl);
    }

    if (deliveryOrderOnlyEl) {
      prompts.push(deliveryOrderOnlyEl);
    }

    prompts.join(',');
  }

  render() {
    const { promotion, singleLine = false } = this.props;
    if (!promotion) {
      return null;
    }

    const promotionPrompt = this.getPromotionPrompt();

    // 注意！！！！：这只是临时PM决定的临时解决方案，绝对绝对绝对不能有第二次，如果有请提醒PM更换翻译文字长度，或者提供更通用的解决方案，这么可笑的处理并非作者本意
    if (promotion.promotionCode === 'FREEDEL') {
      return (
        <>
          Use <strong>FREEDEL</strong> to enjoy Free Delivery for your first 5KM
          {promotionPrompt && <>&nbsp;({promotionPrompt})</>}
        </>
      );
    }

    const promotionText = this.getPromotionText();

    return (
      <>
        {promotionText}
        {promotionPrompt && (
          <>
            {singleLine ? ' ' : <br />} ({promotionPrompt})
          </>
        )}
      </>
    );
  }
}
PromotionContent.displayName = 'PromotionContent';

export default withTranslation('OrderingHome')(PromotionContent);
