import React, { useCallback, useState, useRef, useEffect } from 'react';
import propTypes from 'prop-types';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import styles from './Slider.module.scss';

const Slider = ({
  children,
  showPagination,
  mode,
  perView,
  spacing,
  origin,
  slideContainerClassName,
  slideContainerStyle,
  slideStyle,
  beforeAddonSlide,
  afterAddonSlide,
  loop,
  autoplay,
  autoplayTime,
}) => {
  const timeout = useRef();
  const mouseOver = useRef(false);

  function clearNextTimeout() {
    clearTimeout(timeout.current);
  }

  const selfAutoplay = useCallback(
    slider => {
      function nextTimeout() {
        clearTimeout(timeout.current);
        if (mouseOver.current) return;
        timeout.current = setTimeout(() => {
          slider.next();
        }, autoplayTime);
      }
      slider.on('created', () => {
        slider.container.addEventListener('mouseover', () => {
          mouseOver.current = true;
          clearNextTimeout();
        });
        slider.container.addEventListener('mouseout', () => {
          mouseOver.current = false;
          nextTimeout();
        });
        nextTimeout();
      });
      slider.on('dragStarted', clearNextTimeout);
      slider.on('animationEnded', nextTimeout);
      slider.on('updated', nextTimeout);
    },
    [autoplayTime]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // For more options, please refer to https://keen-slider.io/docs#options
  const options = {
    mode,
    loop,
    slides: {
      perView,
      spacing,
      origin,
    },
  };
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
      destroyed() {
        setLoaded(false);
        clearTimeout(timeout.current);
      },
      ...options,
    },
    autoplay ? [selfAutoplay] : undefined
  );
  // TODO: Updating an instance cannot update its plugin (autoplay). If there's such requirement in the future, we'll research.
  useEffect(() => {
    instanceRef.current && instanceRef.current.update && instanceRef.current.update();
  }, [instanceRef, children]);

  return (
    <div className={styles.SliderAndDotsContainer}>
      <ul
        ref={sliderRef}
        className={`keen-slider ${styles.SliderContainer} ${slideContainerClassName}`}
        style={slideContainerStyle}
      >
        {beforeAddonSlide.content && (
          <li className="keen-slider__slide" key="slide-before-addon" style={beforeAddonSlide.style}>
            {beforeAddonSlide.content}
          </li>
        )}
        {React.Children.map(children, child => (
          <li className="keen-slider__slide" key={`slide-${child?.key}`} style={slideStyle}>
            {child}
          </li>
        ))}
        {afterAddonSlide.content && (
          <li className="keen-slider__slide" key="slide-after-addon" style={afterAddonSlide.style}>
            {afterAddonSlide.content}
          </li>
        )}
      </ul>
      {/* showPagination controls whether dots show */}
      {/* loaded and instanceRef.current are used here because dots are dependent on slider instance */}
      {showPagination && loaded && instanceRef.current && (
        <div className={styles.SliderDots}>
          {[...Array(instanceRef.current.track.details.slides.length).keys()].map(index => (
            <button
              key={index}
              onClick={() => {
                instanceRef.current?.moveToIdx(index);
              }}
              aria-label="Slide"
              className={styles.SliderDot + (currentSlide === index ? ' active' : '')}
              data-test-id="common.slider.move-btn"
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
  // Sets the animation that is applied after a drag ends.
  mode: propTypes.oneOf(['snap', 'free', 'free-snap']),
  // Enables or disables carousel/loop functionality of the slider.
  loop: propTypes.bool,
  // Determines what size the slides should be in relation to the viewport/container.
  perView: propTypes.oneOfType([propTypes.number, propTypes.string]),
  // Defines the spacing between slides in pixel.
  spacing: propTypes.number,
  // Sets the origin of the slides.
  origin: propTypes.string,
  slideContainerClassName: propTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  slideContainerStyle: propTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  slideStyle: propTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  beforeAddonSlide: propTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  afterAddonSlide: propTypes.object,
  autoplay: propTypes.bool,
  autoplayTime: propTypes.number,
};
Slider.defaultProps = {
  children: null,
  showPagination: false,
  mode: 'snap',
  loop: false,
  perView: 1,
  spacing: 0,
  origin: 'auto',
  slideContainerClassName: '',
  slideContainerStyle: {},
  beforeAddonSlide: {},
  afterAddonSlide: {},
  slideStyle: {},
  autoplay: false,
  autoplayTime: 2000,
};

export default Slider;
