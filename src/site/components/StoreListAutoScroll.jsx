import React from 'react';
import PropTypes from 'prop-types';

class StoreListAutoScroll extends React.Component {
  scrollParentWithEventListener = null;

  hasRestored = false;

  componentDidMount = () => {
    this.updateScrollParent();
  };

  componentDidUpdate() {
    this.updateScrollParent();
  }

  getScrollParentFromProps = () => {
    const { getScrollParent } = this.props;
    return getScrollParent();
  };

  restoreScrollPosition = scrollParent => {
    if (this.hasRestored) {
      return;
    }
    const { defaultScrollTop } = this.props;
    const { scrollBehavior } = scrollParent.style;
    scrollParent.style.scrollBehavior = 'auto';
    scrollParent.scrollTo(0, defaultScrollTop, { behavior: 'instant' });
    scrollParent.style.scrollBehavior = scrollBehavior;
    this.hasRestored = true;
  };

  registerEventListeners = scrollParent => {
    if (scrollParent === this.scrollParentWithEventListener) {
      return;
    }
    if (this.scrollParentWithEventListener) {
      this.scrollParentWithEventListener.removeEventListener('scroll', this.onScrollParentScroll);
    }
    scrollParent.addEventListener('scroll', this.onScrollParentScroll);
    this.scrollParentWithEventListener = scrollParent;
  };

  onScrollParentScroll = e => {
    const { onScroll } = this.props;

    onScroll(e.target.scrollTop || 0);
  };

  updateScrollParent() {
    // ref's update seems to be not synchronized. so we have to put the logic in async queue.
    setTimeout(() => {
      const scrollParent = this.getScrollParentFromProps();
      if (scrollParent) {
        this.restoreScrollPosition(scrollParent);
        this.registerEventListeners(scrollParent);
      }
    }, 0);
  }

  render() {
    const { children } = this.props;

    return <>{children}</>;
  }
}

StoreListAutoScroll.displayName = 'StoreListAutoScroll';

StoreListAutoScroll.propTypes = {
  children: PropTypes.node,
  getScrollParent: PropTypes.func.isRequired,
  defaultScrollTop: PropTypes.number.isRequired,
  onScroll: PropTypes.func.isRequired,
};

StoreListAutoScroll.defaultProps = {
  children: null,
};

export default StoreListAutoScroll;
