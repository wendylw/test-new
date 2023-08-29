/* eslint-disable react/no-array-index-key */
/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import VendorImage from '../../../VendorImage';
import RibbonBadge from '../../../RibbonBadge';
import RatingTag from '../../../RatingTag';
import DistanceTag from '../../../DistanceTag';
import PromoTag from '../../../PromoTag';
import LowPriceTag from '../../../LowPriceTag';
import ProductCard from '../ProductCard';
import styles from './StoreCard.module.scss';

const StoreCard = ({ store, onClick }) => {
  const { t } = useTranslation('SiteHome');

  const name = useMemo(() => _get(store, 'name', ''), [store]);
  const storeDisplayName = useMemo(() => _get(store, 'storeDisplayName', ''), [store]);
  const displayName = useMemo(() => storeDisplayName || name, [storeDisplayName, name]);
  const avatar = useMemo(() => _get(store, 'avatar', ''), [store]);
  const isOpen = useMemo(() => _get(store, 'isOpen', false), [store]);
  const enablePreOrder = useMemo(() => _get(store, 'enablePreOrder', false), [store]);
  const enableCashback = useMemo(() => _get(store, 'enableCashback', false), [store]);
  const products = useMemo(() => _get(store, 'products', []), [store]);
  const searchingTags = useMemo(() => _get(store, 'searchingTags', []), [store]);
  const promoTag = useMemo(() => _get(store, 'promoTag', ''), [store]);
  const rating = useMemo(() => _get(store, 'reviewInfo.rating', ''), [store]);
  const distance = useMemo(() => _get(store, 'geoDistance', 0), [store]);
  const cashbackRate = useMemo(() => _get(store, 'cashbackRate', 0), [store]);
  const hasLowestPrice = useMemo(() => _get(store, 'isLowestPrice', false), [store]);
  const cashbackRatePercentage = useMemo(() => Math.round((Number(cashbackRate) || 0) * 100), [cashbackRate]);
  const isFreeDeliveryAvailable = useMemo(() => _get(store, 'showFreeDeliveryTag', false), [store]);
  const isCashbackAvailable = useMemo(() => enableCashback && cashbackRate, [enableCashback, cashbackRate]);
  const isStoreClosed = useMemo(() => !(isOpen || enablePreOrder), [isOpen, enablePreOrder]);
  const shouldShowPreOrderTag = useMemo(() => !isOpen && enablePreOrder, [isOpen, enablePreOrder]);

  const ribbonBadges = useMemo(() => {
    const badges = [];

    badges.push(promoTag ? { title: promoTag, color: '#F04B23' } : null);
    badges.push(shouldShowPreOrderTag ? { title: t('PreOrder'), color: '#0698A8' } : null);

    return badges.filter(badge => badge);
  }, [t, promoTag, shouldShowPreOrderTag]);

  const promoTags = useMemo(() => {
    const tags = [];

    tags.push(isCashbackAvailable ? t('EnabledCashbackShortText', { cashbackRate: cashbackRatePercentage }) : null);
    tags.push(isFreeDeliveryAvailable ? t('FreeDelivery') : null);

    return tags.filter(tag => tag);
  }, [t, isFreeDeliveryAvailable, isCashbackAvailable, cashbackRatePercentage]);

  const shouldShowTagList = useMemo(() => !_isEmpty(promoTags) || hasLowestPrice, [promoTags, hasLowestPrice]);

  const keywords = useMemo(() => {
    if (_isEmpty(searchingTags)) return null;

    return (searchingTags || []).join(', ');
  }, [searchingTags]);

  return (
    <button className={styles.StoreCardContainer} data-test-id="site.common.store-card.btn" onClick={onClick}>
      <div className={styles.StoreCardImageContainer}>
        {_isEmpty(ribbonBadges) ? null : (
          <div className={styles.StoreCardRibbonBadgeWrapper}>
            {ribbonBadges.map(({ title, color }, idx) => (
              <RibbonBadge key={idx} title={title} color={color} isClosed={isStoreClosed} />
            ))}
          </div>
        )}
        <VendorImage src={avatar} alt={name} isClosed={isStoreClosed} />
      </div>
      <div className={`${styles.StoreCardSummaryContainer} ${isStoreClosed ? 'tw-opacity-40' : ''}`}>
        <h3 className={styles.StoreCardTitle}>{displayName}</h3>
        {keywords && <span className={styles.StoreCardKeywords}>{keywords}</span>}
        <ol className={styles.StoreCardInfoContainer}>
          {rating && <RatingTag rating={rating} className={styles.StoreCardRatingTagContainer} />}
          {rating && <div className={styles.StoreCardInfoDivider} />}
          <DistanceTag
            distance={distance}
            className={`${styles.StoreCardDistanceTagContainer} ${rating ? 'sm:tw-px-8px tw-px-8' : ''}`}
          />
        </ol>
        {shouldShowTagList && (
          <ol className={styles.StoreCardTagListContainer}>
            {hasLowestPrice && <LowPriceTag className={styles.StoreCardTagListItem} />}
            {_isEmpty(promoTags)
              ? null
              : promoTags.map((tag, idx) => (
                  <PromoTag key={idx} tagName={tag} className={styles.StoreCardTagListItem} />
                ))}
          </ol>
        )}
        {_isEmpty(products) ? null : (
          <div className={styles.StoreCardProductContainer}>
            {(products || []).map((product, idx) => (
              <ProductCard
                key={idx}
                product={product}
                className="sm:tw-px-4px tw-px-4 first:sm:tw--ml-4px first:tw--ml-4"
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
};

StoreCard.displayName = 'StoreCard';

StoreCard.propTypes = {
  store: PropTypes.object,
  onClick: PropTypes.func,
};

StoreCard.defaultProps = {
  store: {},
  onClick: () => {},
};

export default StoreCard;
