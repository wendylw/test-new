import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Constants from '../../Constants';
import Utils from '../../libs/utils';

const localState = {
  blockScrollTop: 0,
};

class Aside extends Component {
  // Important!! This .root class name is defined by index.js file, they should be the same.
  rootEl = document.getElementById(Constants.DOCUMENT_ROOT_ID);

  componentWillMount() {
    if (this.props.active) {
      this.toggleBodyScroll(true);
    }
  }

  componentWillUnmount() {
    if (this.props.active) {
      this.toggleBodyScroll(false);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      this.toggleBodyScroll(nextProps.active);
    }
  }

  toggleBodyScroll(blockScroll = false) {
    const rootEl = document.getElementById('root');
    const rootClassName = rootEl.getAttribute('class').replace(/fixed/g, '');
    const listEl = document.getElementById('product-list');

    if (rootEl && listEl) {
      if (blockScroll) {
        const currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
        let listElOffsetTop = currentScrollTop + listEl.getBoundingClientRect().top;

        if (!Utils.getUserAgentInfo().browser.includes('Safari')) {
          let currentParent = listEl.offsetParent;

          listElOffsetTop = listEl.offsetTop;

          while (currentParent !== null) {
            listElOffsetTop += currentParent.offsetTop;
            currentParent = currentParent.offsetParent;
          }
        }

        listEl.style.top = `${listElOffsetTop - currentScrollTop}px`;
        Object.assign(localState, { blockScrollTop: currentScrollTop });
        rootEl.setAttribute('class', `${rootClassName} fixed`);
      } else {
        const { blockScrollTop } = localState;

        rootEl.setAttribute('class', rootClassName);
        listEl.style.top = '';
        window.scrollTo(0, blockScrollTop);
      }
    }
  }

  render() {
    const { className, active, children, ...props } = this.props;
    const classList = [`aside`];

    if (active) {
      classList.push('active');
    }

    if (className) {
      classList.push(className);
    }

    return (
      <aside className={classList.join(' ')} {...props}>
        {children}
      </aside>
    );
  }
}

Aside.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
};

Aside.defaultProps = {
  active: false,
};

export default Aside;