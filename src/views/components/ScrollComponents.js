/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import Utils from '../../libs/utils';

const observableContainer = {};
const TOP_BAR_HEIGHT = 50;
const CATEGORY_BAR_HEIGHT = 50;

function scrollTo(scrollname) {
  // document.querySelector(`[scrollname="${scrollname}"]`).scrollIntoView({behavior: "smooth"});
  scrollToSmoothly(document.querySelector(`[scrollname="${scrollname}"]`).offsetTop - TOP_BAR_HEIGHT, 500);
}

function scrollToSmoothly(pos, time) {
  /*Time is exact amount of time the scrolling will take (in milliseconds)*/
  /*Pos is the y-position to scroll to (in pixels)*/
  /*Code written by hev1*/
  if (typeof pos !== "number") {
    pos = parseFloat(pos);
  }
  if (isNaN(pos)) {
    console.warn("Position must be a number or a numeric String.");
    throw "Position must be a number";
  }
  if (pos < 0 || time < 0) {
    return;
  }
  var currentPos = window.scrollY || window.screenTop;
  var start = null;
  time = time || 500;
  window.requestAnimationFrame(function step(currentTime) {
    start = !start ? currentTime : start;
    if (currentPos < pos) {
      var progress = currentTime - start;
      window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    } else {
      var progress = currentTime - start;
      window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    }
  });
}

window.addEventListener('scroll', (e) => {
  const obs = Object.values(observableContainer);

  const [, ob] = obs
    .map(ob => [Utils.elementPartialOffsetTop(ob, TOP_BAR_HEIGHT + 0.5 * CATEGORY_BAR_HEIGHT), ob])
    .sort(([k1], [k2]) => k1 - k2)
    .find(([k]) => k > 0) || [];

  if (!ob) {
    return;
  }
  
  console.debug(ob.getAttribute('scrollname'));

  document.dispatchEvent(new CustomEvent('SCROLL_FOUND_TOP', {
    detail: {
      scrollname: ob.getAttribute('scrollname'),
    },
  }));
});

export class ScrollObservable extends React.Component {
  container = null;

  componentDidMount() {
    const { name } = this.props;

    if (observableContainer[name]) {
      console.error('Failed to register a scroll obvervable component, because name=%o is already existed.', name);
      return;
    }

    observableContainer[name] = this.container;
  }

  componentWillUnmount() {
    delete observableContainer[this.props.name];
  }

  render() {
    const { children, name } = this.props;

    return (
      <div ref={ref => this.container = ref} scrollname={name}>
        <a name={name}></a>
        {children}
      </div>
    );
  }
}

export class ScrollObserver extends React.Component {
  state = {
    scrollname: '',
  };

  handleScrollEvent = (e) => {
    const { scrollname } = e.detail;
    this.setState({ scrollname });
  };

  componentDidMount() {
    document.addEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  render() {
    const { render } = this.props;

    if (typeof render === 'function') {
      return render(this.state.scrollname, scrollTo);
    }

    return null;
  }
}
