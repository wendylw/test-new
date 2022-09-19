import React, { useState, useCallback, useMemo } from 'react';
import { Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styles from './Rating.module.scss';

const Rating = ({ onRatingChanged }) => {
  const { t } = useTranslation();

  const [rating, setRating] = useState(null);

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
        {Array(5)
          .fill(null)
          .map((item, key) => (
            <li key={`star-${key.toString()}`}>
              <Star
                className={`${styles.Star} ${rating && key < rating ? styles.Yellow : styles.Gray}`}
                weight={rating && key < rating ? 'fill' : 'light'}
                size={48}
                onClick={() => handleUpdateRating(key + 1)}
              />
            </li>
          ))}
      </ul>
      <div className={styles.RatingText}>{text}</div>
    </div>
  );
};

Rating.propTypes = {
  onRatingChanged: PropTypes.func,
};

Rating.defaultProps = {
  onRatingChanged: () => {},
};

Rating.displayName = 'Rating';

export default Rating;
