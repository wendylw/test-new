import React, { useState } from 'react';
import propTypes from 'prop-types';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import styles from './Slider.module.scss';

const Slider = ({ children, showPagination, options, slideStyle }) => {
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
    // For the usage of options, please refer to https://keen-slider.io/docs#options
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
      {/* showPagination控制是否展示dots */}
      {/* loaded和instanceRef.current是因为dots的数量依赖slider，需要等slider挂载后才展示，否则报错 */}
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
  // eslint-disable-next-line react/forbid-prop-types
  options: propTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  slideStyle: propTypes.object,
};
Slider.defaultProps = {
  children: null,
  showPagination: false,
  options: {},
  slideStyle: {},
};

export default Slider;
