import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Image from '../../components/Image';
import MvpStorePlaceholderImage from '../../images/mvp-store-placeholder.jpg';
import styles from './VendorImage.module.scss';

const VendorImage = ({ src, alt, isClosed }) => {
  const { t } = useTranslation('SiteHome');

  return (
    <div className={styles.VendorImageFigure}>
      {isClosed && (
        <div className={styles.VendorImageCover}>
          <p>{t('ClosedForNow')}</p>
        </div>
      )}
      <Image
        className={`${isClosed ? 'tw-opacity-40' : ''}`}
        src={src}
        scalingRatioIndex={1}
        placeholderImage={MvpStorePlaceholderImage}
        alt={alt}
      />
    </div>
  );
};

VendorImage.displayName = 'VendorImage';

VendorImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  isClosed: PropTypes.bool,
};

VendorImage.defaultProps = {
  src: '',
  alt: '',
  isClosed: false,
};

export default VendorImage;
