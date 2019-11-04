/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../../libs/utils';

let observableContainer = {};
const TOP_BAR_HEIGHT = 50;
const CATEGORY_BAR_HEIGHT = 50;
const SCROLL_SPEED = {
  x: 10,
  y: 30,
}

function scrollToSmoothly({
  direction,
  targetId,
  containerId,
  afterScroll,
}) {
  const userAgentInfo = Utils.getUserAgentInfo();
  const el = document.getElementById(targetId);
  const container = document.getElementById(containerId);

  if (!el || document.getElementById('root').getAttribute('class').includes('fixed')) {
    return;
  }

  const containerScrolledDistance = {
    x: document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset,
    y: document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset,
    w: document.body.clientWidth || window.innerWidth,
  };

  if (container) {
    containerScrolledDistance.x = container.scrollLeft;
    containerScrolledDistance.y = container.scrollTop;
    containerScrolledDistance.w = container.offsetWidth || container.clientWidth;
  }

  const otherDistance = {
    x: 0,
    y: TOP_BAR_HEIGHT + CATEGORY_BAR_HEIGHT,
  }
  const elOffset = {
    x: containerScrolledDistance.x + el.getBoundingClientRect().left,
    y: containerScrolledDistance.y + el.getBoundingClientRect().top,
  };

  if (!userAgentInfo.browser.includes('Safari')) {
    let currentParent = el.offsetParent;

    elOffset.x = el.offsetLeft;
    elOffset.y = el.offsetTop;

    while (currentParent !== null) {
      elOffset.x += currentParent.offsetLeft;
      elOffset.y += currentParent.offsetTop;
      currentParent = currentParent.offsetParent;
    }
  }

  let scrollPosition = elOffset[direction] - otherDistance[direction];

  if (direction === 'x') {
    scrollPosition = elOffset[direction] - containerScrolledDistance.w * 0.5;
  }

  const changeSign = Math.sign(scrollPosition - containerScrolledDistance[direction]);
  const changeDistance = changeSign * SCROLL_SPEED[direction];
  const _run = function () {
    containerScrolledDistance[direction] = containerScrolledDistance[direction] + changeDistance;

    if ((changeDistance === -SCROLL_SPEED[direction] && containerScrolledDistance[direction] < scrollPosition)
      || (changeDistance === SCROLL_SPEED[direction] && containerScrolledDistance[direction] > scrollPosition)) {
      containerScrolledDistance[direction] = scrollPosition;
    }

    (container || window).scrollTo(containerScrolledDistance.x, containerScrolledDistance.y);

    if (containerScrolledDistance[direction] !== scrollPosition) {
      requestAnimationFrame(_run);
    } else if (typeof afterScroll === 'function') {
      afterScroll();
    }
  };

  _run();
}

window.addEventListener('scroll', () => {
  const scrollid = getCurrentScrollId();

  if (!scrollid) {
    return;
  }

  document.dispatchEvent(new CustomEvent('SCROLL_FOUND_TOP', {
    detail: {
      scrollid,
    },
  }));
});

export function getCurrentScrollId() {
  const htmlDocumentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
  const windowScrolledTop = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
  const elObjList = Object.values(observableContainer);

  const [, elObj] = elObjList
    .map(elObj => [Utils.elementPartialOffsetTop(
      elObj,
      TOP_BAR_HEIGHT + CATEGORY_BAR_HEIGHT * 2,
      windowScrolledTop
    ), elObj])
    .sort(([nextDistance], [distance]) => nextDistance - distance)
    .find(([distance]) => distance > 0) || [];

  if (!elObj) {
    return null;
  }

  const currentObj = (windowScrolledTop >= htmlDocumentHeight - windowHeight) ? elObjList[elObjList.length - 1] : elObj;

  return currentObj.getAttribute('scrollid');
}

export class ScrollObservable extends React.Component {
  container = null;

  componentDidMount() {
    const { targetId } = this.props;

    if (observableContainer[targetId]) {
      return;
    }

    observableContainer[targetId] = this.container;
  }

  componentWillUnmount() {
    delete observableContainer[this.props.targetId];
  }

  render() {
    const {
      children,
      targetId,
    } = this.props;

    return (
      <div ref={ref => this.container = ref} scrollid={targetId}>
        {children}
      </div>
    );
  }
}

ScrollObservable.protoTypes = {
  targetId: PropTypes.string,
};

export class ScrollObserver extends React.Component {
  state = {
    scrollid: this.props.defaultScrollId,
    drivenToScroll: false,
  };

  componentDidMount() {
    document.addEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  handleRevertScrollEvent = () => {
    this.setState({ drivenToScroll: false });
  }

  handleScrollEvent = async (e) => {
    const { containerId } = this.props;
    const { drivenToScroll } = this.state;

    if (drivenToScroll) {
      return;
    }

    const { scrollid } = e.detail;

    await scrollToSmoothly({
      direction: 'x',
      targetId: `category-${scrollid}`,
      containerId,
    });

    this.setState({ scrollid });
  }

  handleSelectedTarget = async (options) => {
    const { targetId } = options;

    this.setState({ drivenToScroll: true, scrollid: targetId });

    await scrollToSmoothly({
      ...options,
      afterScroll: this.handleRevertScrollEvent,
    });
  }

  render() {
    const { render } = this.props;

    if (typeof render === 'function') {
      return render(this.state.scrollid, this.handleSelectedTarget);
    }

    return null;
  }
}

ScrollObserver.protoTypes = {
  defaultScrollId: PropTypes.string,
  containerId: PropTypes.string,
};

ScrollObserver.defaultProps = {
  defaultScrollId: '',
};