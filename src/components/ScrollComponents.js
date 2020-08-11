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

function getScrollToHeight(container, targetId, categoryList) {
  if (!container || !targetId) return 0;
  let targetHeight = 0;
  let hasFoundTarget = false;
  let liIndex = 0;
  while (liIndex < categoryList.length && !hasFoundTarget) {
    let el = categoryList[liIndex];
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
  let categoryList = container.querySelectorAll('li');
  return getScrollToHeight(container, targetId, categoryList);
}

function getScrollToHeightInWindow(container, targetId) {
  let categoryList = container.childNodes;
  return getScrollToHeight(container, targetId, categoryList);
}

function scrollToSmoothly({ targetId, containerId, afterScroll }) {
  const el = document.getElementById(targetId);
  const container = document.getElementById(containerId);
  const windowSize = {
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
    y: document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset,
  };

  if (container) {
    containerScrolledDistance.y = container.scrollTop;
  }

  let topBarHeight = document.querySelector('.header')
    ? document.querySelector('.header').clientHeight
    : TOP_BAR_HEIGHT;

  if (document.querySelector('.deliver-to-entry')) {
    topBarHeight += document.querySelector('.deliver-to-entry').clientHeight;
  }

  const otherDistance = {
    y: topBarHeight,
  };

  const elOffset = {
    y: containerScrolledDistance.y + el.getBoundingClientRect().top,
  };

  if (!Utils.isSafari) {
    let currentParent = el.offsetParent;

    elOffset.y = el.offsetTop;

    while (currentParent !== null) {
      elOffset.y += currentParent.offsetTop;
      currentParent = currentParent.offsetParent;
    }
  }

  let scrollPosition = elOffset.y - otherDistance.y;
  let changeTotalDistance = scrollPosition - containerScrolledDistance.y;
  const changeSign = Math.sign(changeTotalDistance);
  let scrollSpeed = SCROLL_SPEED.y;

  if (Math.abs(changeTotalDistance) > windowSize.h * 1.5) {
    scrollSpeed = SCROLL_SPEED['faster_y'];
  }

  let changeDistance = changeSign * scrollSpeed;

  if (Math.abs(changeTotalDistance) > windowSize.h * 5) {
    changeDistance = changeTotalDistance;
  }

  const _run = function() {
    containerScrolledDistance.y = containerScrolledDistance.y + changeDistance;

    if (
      (changeDistance === -scrollSpeed && containerScrolledDistance.y < scrollPosition) ||
      (changeDistance === scrollSpeed && containerScrolledDistance.y > scrollPosition)
    ) {
      containerScrolledDistance.y = scrollPosition;
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

    if (containerScrolledDistance.y !== scrollPosition) {
      requestAnimationFrame(_run);
    } else if (typeof afterScroll === 'function') {
      afterScroll();
    }
  };

  _run();
}

export function getCurrentScrollId() {
  const elObjList = Object.values(observableContainer);
  const topBarHeight = document.querySelector('.ordering-home__container')
    ? document.querySelector('.ordering-home__container').getBoundingClientRect().top
    : TOP_BAR_HEIGHT;

  if (!elObjList.length) {
    return;
  }

  const scrolledCategoryList = elObjList.filter(elObj => elObj.getBoundingClientRect().top - topBarHeight <= 0);
  const currentObj = scrolledCategoryList.length ? scrolledCategoryList[scrolledCategoryList.length - 1] : elObjList[0];

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
      scrollid = getCurrentScrollId();
    }

    if (!scrollid) {
      return;
    }
    const { containerId, targetIdPrefix } = this.props;
    const { drivenToScroll } = this.state;
    if (drivenToScroll) {
      return;
    }
    scrollToSmoothly({
      direction: 'y',
      targetId: `${targetIdPrefix}-${scrollid}`,
      containerId,
    });
    this.setState({ scrollid });
  };

  componentDidMount() {
    document.getElementById('product-list').addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    document.getElementById('product-list').removeEventListener('scroll', this.handleScroll);
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
};

ScrollObserver.defaultProps = {
  defaultScrollId: '',
  containerId: '',
  targetIdPrefix: '',
};
