import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styles from './Rating.module.scss';

const STAR_SIZES = [16, 24, 36, 48];

const Rating = ({
  className,
  initialStarNum,
  totalStarNum,
  showText,
  starSize,
  onRatingChanged,
  disableRatingChange,
}) => {
  const { t } = useTranslation('OrderingThankYou');

  const [rating, setRating] = useState(initialStarNum);

  useEffect(() => {
    setRating(initialStarNum);
  }, [initialStarNum]);

  const handleUpdateRating = useCallback(
    key => {
      if (!disableRatingChange) {
        setRating(key);
        onRatingChanged(key);
      }
    },
    [disableRatingChange, setRating, onRatingChanged]
  );

  const text = useMemo(() => {
    switch (rating) {
      case 5:
        return t('Great');
      case 4:
        return t('Good');
      case 3:
        return t('Okay');
      case 2:
        return t('Bad');
      case 1:
        return t('Terrible');
      default:
        return '';
    }
  }, [rating, t]);

  return (
    <div className={`${styles.RatingContainer} ${className}`}>
      <ul className={styles.Rating}>
        {Array(totalStarNum)
          .fill(null)
          .map((item, key) => (
            // TODO: wendy: may need to add tw-flex-middle
            // eslint-disable-next-line react/no-array-index-key
            <li key={`star-${key}`} className={styles.RatingStarItem}>
              <Star
                className={`${styles.RatingStar} ${
                  rating && key < rating ? styles.RatingStarSelected : styles.RatingStarDefault
                }`}
                weight={rating && key < rating ? 'fill' : 'light'}
                size={starSize}
                data-test-id="ordering.order-status.rating.rate-btn"
                onClick={() => handleUpdateRating(key + 1)}
              />
            </li>
          ))}
      </ul>
      {showText && <div className="tw-text-xl tw-leading-relaxed tw-font-black">{text}</div>}
    </div>
  );
};

Rating.propTypes = {
  className: PropTypes.string,
  onRatingChanged: PropTypes.func,
  initialStarNum: PropTypes.number,
  totalStarNum: PropTypes.number,
  showText: PropTypes.bool,
  starSize: PropTypes.oneOf(Object.values(STAR_SIZES)),
  disableRatingChange: PropTypes.bool,
};

Rating.defaultProps = {
  className: '',
  onRatingChanged: () => {},
  initialStarNum: 0,
  totalStarNum: 5,
  showText: true,
  starSize: 48,
  disableRatingChange: false,
};

Rating.displayName = 'Rating';

export default Rating;
