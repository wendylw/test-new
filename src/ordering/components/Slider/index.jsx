import React, { useState } from 'react';
import propTypes from 'prop-types';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import styles from './Slider.module.scss';

const Slider = ({ children, showPagination, mode, perView, spacing, slideStyle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // For more options, please refer to https://keen-slider.io/docs#options
  const options = {
    mode,
    slides: {
      perView,
      spacing,
    },
  };
  const [sliderRef, instanceRef] = useKeenSlider({
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created(slider) {
      setLoaded(true);
      // bugfix: When Slider calculates max-width & min-width, product detail drawer has not shown.
      // Width of scroll bar on the product list will be deducted in the calculation of Slider width.
      setTimeout(() => {
        slider.update();
      }, 0);
    },
    destroyed() {
      setLoaded(false);
    },
    ...options,
  });

  return (
    <div className={styles.SliderAndDotsContainer}>
      <ul ref={sliderRef} className={`keen-slider ${styles.SliderContainer}`}>
        {React.Children.map(children, child => (
          <li className="keen-slider__slide" key={`slide-${child.key}`} style={slideStyle}>
            {child}
          </li>
        ))}
      </ul>
      {/* showPagination controls whether dots show */}
      {/* loaded and instanceRef.current are used here because dots are dependent on slider instance */}
      {showPagination && loaded && instanceRef.current && (
        <div className={styles.SliderDots}>
          {[...Array(instanceRef.current.track.details.slides.length).keys()].map(index => (
            /* eslint-disable-next-line */
            <button
              key={index}
              onClick={() => {
                instanceRef.current?.moveToIdx(index);
              }}
              className={styles.SliderDot + (currentSlide === index ? ' active' : '')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Slider.displayName = 'Slider';
Slider.propTypes = {
  children: propTypes.node,
  showPagination: propTypes.bool,
  mode: propTypes.oneOf(['snap', 'free', 'free-snap']),
  perView: propTypes.number || 'auto',
  spacing: propTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  slideStyle: propTypes.object,
};
Slider.defaultProps = {
  children: null,
  showPagination: false,
  mode: 'snap',
  perView: 1,
  spacing: 0,
  slideStyle: {},
};

export default Slider;
