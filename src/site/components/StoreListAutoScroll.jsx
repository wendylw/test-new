import React from 'react';
import PropTypes from 'prop-types';

class StoreListAutoScroll extends React.Component {
  componentDidMount = () => {
    this.restoreScrollPosition();
    this.registerEventListeners();
  };

  restoreScrollPosition = () => {
    const { defaultScrollTop, getScrollParent } = this.props;
    const scrollParent = getScrollParent();
    const scrollBehavior = scrollParent.style.scrollBehavior;
    scrollParent.style.scrollBehavior = 'auto';
    scrollParent.scrollTo(0, defaultScrollTop, { behavior: 'instant' });
    scrollParent.style.scrollBehavior = scrollBehavior;
  };

  registerEventListeners = () => {
    const { getScrollParent } = this.props;
    getScrollParent().addEventListener('scroll', e => {
      this.props.onScroll(e.target.scrollTop || 0);
    });
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
