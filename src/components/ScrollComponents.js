/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../utils/utils';

let observableContainer = {};
const TOP_BAR_HEIGHT = 50;
const CATEGORY_BAR_HEIGHT = 50;
const SCROLL_SPEED = {
  x: 30,
  y: 60,
  faster_y: 120,
};

function scrollToSmoothly({ direction, targetId, containerId, afterScroll, isVerticalMenu }) {
  const userAgentInfo = Utils.getUserAgentInfo();
  const el = document.getElementById(targetId);
  const container = document.getElementById(containerId);
  const isVerticalMenuProductList = isVerticalMenu && !containerId;
  const windowSize = {
    w: document.documentElement.clientWidth || document.body.clientWidth,
    h: document.documentElement.clientHeight || document.body.clientHeight,
  };

  if (
    !el ||
    document
      .getElementById('root')
      .getAttribute('class')
      .includes('fixed')
  ) {
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
    y: TOP_BAR_HEIGHT + (isVerticalMenuProductList ? 0 : CATEGORY_BAR_HEIGHT),
  };
  const elOffset = {
    x: containerScrolledDistance.x + el.getBoundingClientRect().left,
    y: containerScrolledDistance.y + el.getBoundingClientRect().top,
    w: el.offsetWidth || el.clientWidth,
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
    scrollPosition = scrollPosition - (windowSize.w - elOffset.w) / 2;
  }

  let changeTotalDistance = scrollPosition - containerScrolledDistance[direction];
  const changeSign = Math.sign(changeTotalDistance);
  let scrollSpeed = SCROLL_SPEED[direction];

  if (direction === 'y' && Math.abs(changeTotalDistance) > windowSize.h * 1.5) {
    scrollSpeed = SCROLL_SPEED['faster_y'];
  }

  let changeDistance = changeSign * scrollSpeed;

  if (direction === 'y' && Math.abs(changeTotalDistance) > windowSize.h * 5.5) {
    changeDistance = changeTotalDistance;
  }

  const _run = function() {
    containerScrolledDistance[direction] = containerScrolledDistance[direction] + changeDistance;

    if (
      (changeDistance === -scrollSpeed && containerScrolledDistance[direction] < scrollPosition) ||
      (changeDistance === scrollSpeed && containerScrolledDistance[direction] > scrollPosition)
    ) {
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
  const scrollid = getCurrentScrollId(document.getElementsByClassName('category-nav__vertical').length);

  if (!scrollid) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent('SCROLL_FOUND_TOP', {
      detail: {
        scrollid,
      },
    })
  );
});

export function getCurrentScrollId(isVerticalMenu) {
  const htmlDocumentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
  const windowScrolledTop = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
  const elObjList = Object.values(observableContainer);

  const [, elObj] =
    elObjList
      .map(elObj => [
        Utils.elementPartialOffsetTop(
          elObj,
          TOP_BAR_HEIGHT + (isVerticalMenu ? 0 : CATEGORY_BAR_HEIGHT * 2),
          windowScrolledTop
        ),
        elObj,
      ])
      .sort(([nextDistance], [distance]) => nextDistance - distance)
      .find(([distance]) => distance > 0) || [];

  if (!elObj) {
    return null;
  }

  const currentObj = windowScrolledTop >= htmlDocumentHeight - windowHeight ? elObjList[elObjList.length - 1] : elObj;

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
    const { children, targetId } = this.props;

    return (
      <div ref={ref => (this.container = ref)} scrollid={targetId}>
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

  componentDidUpdate(prevProps) {
    const { defaultScrollId } = this.props;

    if (defaultScrollId !== prevProps.defaultScrollId) {
      this.setState({
        scrollid: defaultScrollId,
      });
    }
  }

  componentDidMount() {
    document.addEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  componentWillUnmount() {
    document.removeEventListener('SCROLL_FOUND_TOP', this.handleScrollEvent);
  }

  handleRevertScrollEvent = () => {
    this.setState({ drivenToScroll: false });
  };

  handleScrollEvent = async e => {
    const { isVerticalMenu, containerId, targetIdPrefix } = this.props;
    const { drivenToScroll } = this.state;

    if (drivenToScroll) {
      return;
    }

    const { scrollid } = e.detail;

    await scrollToSmoothly({
      direction: isVerticalMenu ? 'y' : 'x',
      targetId: `${targetIdPrefix}-${scrollid}`,
      containerId,
    });

    this.setState({ scrollid });
  };

  handleSelectedTarget = async options => {
    const { targetId } = options;

    this.setState({ drivenToScroll: true, scrollid: targetId });

    await scrollToSmoothly({
      ...options,
      afterScroll: this.handleRevertScrollEvent,
    });
  };

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
  targetIdPrefix: PropTypes.string,
  isVerticalMenu: PropTypes.bool,
};

ScrollObserver.defaultProps = {
  defaultScrollId: '',
  containerId: '',
  targetIdPrefix: '',
  isVerticalMenu: false,
};
