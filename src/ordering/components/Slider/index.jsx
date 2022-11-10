/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import propTypes from 'prop-types';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import styles from './Slider.module.scss';

const Slider = ({ children, showPagination, options, liStyle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
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
    <>
      <div className={`navigation-wrapper ${styles.SliderAndDotsContainer}`}>
        <ul ref={sliderRef} className={`keen-slider ${styles.SliderContainer}`}>
          {React.Children.map(children, child => (
            <li className="keen-slider__slide" key={'li-'.concat(child.key)} style={liStyle}>
              {child}
            </li>
          ))}
        </ul>
      </div>
      {showPagination && loaded && instanceRef.current && (
        <div className={styles.SliderDots}>
          {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => (
            <button
              key={idx}
              onClick={() => {
                instanceRef.current?.moveToIdx(idx);
              }}
              className={styles.SliderDot + (currentSlide === idx ? ' active' : '')}
            />
          ))}
        </div>
      )}
    </>
  );
};

Slider.displayName = 'Slider';
Slider.propTypes = {
  children: propTypes.node,
  showPagination: propTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  options: propTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  liStyle: propTypes.object,
};
Slider.defaultProps = {
  children: null,
  showPagination: false,
  options: {},
  liStyle: {},
};

export default Slider;
