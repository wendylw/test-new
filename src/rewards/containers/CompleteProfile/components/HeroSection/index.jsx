import React from 'react';
import PropTypes from 'prop-types';
import { ObjectFitImage } from '../../../../../common/components/Image';
import styles from './HeroSection.module.scss';

const HeroSection = ({ title, image, description }) => (
  <section className={styles.HeroSection}>
    <h2 className={styles.HeroSectionTitle}>{title}</h2>
    {image && (
      <div className={styles.HeroSectionImage}>
        <ObjectFitImage noCompression src={image} alt="StoreHub Complete Profile" />
      </div>
    )}

    {description && <div>{description}</div>}
  </section>
);

HeroSection.propTypes = {
  title: PropTypes.string,
  image: PropTypes.string,
  description: PropTypes.node,
};

HeroSection.defaultProps = {
  title: '',
  image: null,
  description: null,
};

HeroSection.displayName = 'HeroSection';

export default HeroSection;
