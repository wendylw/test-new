import React, { useState, useCallback, useMemo } from 'react';
import { Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styles from './Rating.module.scss';

const Rating = ({ initialStarNum, totalStarNum, showText, starSize, onRatingChanged }) => {
  const starSizes = {
    tiny: 16,
    small: 24,
    medium: 36,
    big: 48,
  };

  const { t } = useTranslation();

  const [rating, setRating] = useState(initialStarNum);

  const handleUpdateRating = useCallback(
    key => {
      setRating(key);
      onRatingChanged(key);
    },
    [setRating, onRatingChanged]
  );

  const text = useMemo(() => {
    switch (rating) {
      case 5:
        return t('Great');
      case 4:
        return t('Good');
      case 3:
        return t('Okie');
      case 2:
        return t('Bad');
      case 1:
        return t('Terrible');
      default:
        return '';
    }
  }, [rating, t]);

  return (
    <div className={styles.RatingContainer}>
      <ul className={styles.Rating}>
        {Array(totalStarNum)
          .fill(null)
          .map((item, key) => (
            <li key={`star-${key.toString()}`}>
              <Star
                className={`${styles.Star} ${rating && key < rating ? 'tw-text-yellow' : 'tw-text-gray-600'}`}
                weight={rating && key < rating ? 'fill' : 'light'}
                size={starSizes[starSize]}
                onClick={() => handleUpdateRating(key + 1)}
              />
            </li>
          ))}
      </ul>
      {showText && <div className={styles.RatingText}>{text}</div>}
    </div>
  );
};

Rating.propTypes = {
  onRatingChanged: PropTypes.func,
  initialStarNum: PropTypes.number,
  totalStarNum: PropTypes.number,
  showText: PropTypes.bool,
  starSize: PropTypes.string,
};

Rating.defaultProps = {
  onRatingChanged: () => {},
  initialStarNum: 0,
  totalStarNum: 5,
  showText: true,
  starSize: 'big',
};

Rating.displayName = 'Rating';

export default Rating;
