/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../utils/utils';

let observableContainer = {};
let causeByNavClick = false;
let currentCategoryId = null;
let isScrolling = null;

const TOP_BAR_HEIGHT = 50;
const CATEGORY_BAR_HEIGHT = 50;
const SCROLL_SPEED = {
  x: 30,
  y: 80,
  faster_y: 120,
};

/** calculate container's scrollTo height
 * 1.find all children within container
 * 2.find all children above target element(not including target), calculate their total height
 * 3.this total height is what container need to scrollTo to show the targetElement.(so we don't need to worry about whatever other DOM is around container)
 */

function getScrollToHeight(container, targetId, categoryLis) {
  if (!container || !targetId) return 0;
  let targetHeight = 0;
  let hasFoundTarget = false;
  let liIndex = 0;
  while (liIndex < categoryLis.length && !hasFoundTarget) {
    let el = categoryLis[liIndex];
    let rectInfo = el.getBoundingClientRect();
    if (el.id === targetId) {
      hasFoundTarget = true;
    } else {
      targetHeight += rectInfo.height;
    }
    liIndex++;
  }
  return targetHeight;
}
function getScrollToHeightInContainer(container, targetId) {
  let categoryLis = container.querySelectorAll('li');
  return getScrollToHeight(container, targetId, categoryLis);
}
function getScrollToHeightInWindow(container, targetId) {
  let categoryLis = container.childNodes;
  return getScrollToHeight(container, targetId, categoryLis);
}
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

  if (direction === 'y' && Math.abs(changeTotalDistance) > windowSize.h * 5) {
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

    /** Side menu shouldn't scroll when user taps on it
     * when user tabs on menu, data condition:causeByNavClick is true and container point to  'id=CategoryNavContent' element
     * causeByNavClick && container equal true shows user taps on menu. otherwise,follow the previous scroll logic.
     */
    if (!(causeByNavClick && container)) {
      /** fix the calculation for side menu scroll height */
      if (container && targetId) {
        const targetHeight = getScrollToHeightInContainer(container, targetId);
        container.scrollTo(containerScrolledDistance.x, targetHeight);
      } else {
        const targetHeight = getScrollToHeightInWindow(el.parentNode, targetId);
        window.scrollTo(containerScrolledDistance.x, targetHeight);
      }
    }
    if (containerScrolledDistance[direction] !== scrollPosition) {
      requestAnimationFrame(_run);
    } else if (typeof afterScroll === 'function') {
      afterScroll();
    }
  };

  _run();
}

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

  handleScroll = () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function() {
      causeByNavClick = false;
      currentCategoryId = null;
    }, 50);
    let scrollid;
    if (currentCategoryId) {
      scrollid = currentCategoryId;
    } else {
      scrollid = getCurrentScrollId(document.getElementsByClassName('category-nav__vertical').length);
    }
    if (!scrollid) {
      return;
    }
    const { isVerticalMenu, containerId, targetIdPrefix } = this.props;
    const { drivenToScroll } = this.state;

    if (drivenToScroll) {
      return;
    }

    scrollToSmoothly({
      direction: isVerticalMenu ? 'y' : 'x',
      targetId: `${targetIdPrefix}-${scrollid}`,
      containerId,
    });

    this.setState({ scrollid });
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleRevertScrollEvent = () => {
    this.setState({ drivenToScroll: false });
  };

  handleSelectedTarget = async options => {
    const { targetId, categoryId } = options;
    causeByNavClick = true;
    currentCategoryId = categoryId;
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
