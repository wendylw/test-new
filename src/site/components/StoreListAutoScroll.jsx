import React from 'react';
import PropTypes from 'prop-types';

class StoreListAutoScroll extends React.Component {
  scrollParentWithEventListener = null;
  hasRestored = false;

  getScrollParentFromProps = () => {
    const { getScrollParent } = this.props;
    return getScrollParent();
  };

  componentDidMount = () => {
    this.updateScrollParent();
  };

  componentDidUpdate() {
    this.updateScrollParent();
  }

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

  restoreScrollPosition = scrollParent => {
    if (this.hasRestored) {
      return;
    }
    const { defaultScrollTop } = this.props;
    const scrollBehavior = scrollParent.style.scrollBehavior;
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
    this.props.onScroll(e.target.scrollTop || 0);
  };

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

StoreListAutoScroll.propTypes = {
  getScrollParent: PropTypes.func.isRequired,
  defaultScrollTop: PropTypes.number.isRequired,
  onScroll: PropTypes.func.isRequired,
};

export default StoreListAutoScroll;
