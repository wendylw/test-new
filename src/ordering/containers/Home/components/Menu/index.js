import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ScrollObserver,
  getCurrentScrollName,
} from '../../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as homeActions, getCategoryProductList } from '../../../../redux/modules/home';

class Menu extends Component {
  state = {
    show: this.props.show,
  };

  handleHideMenu(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  renderMenuItem(scrollInfo, category) {
    const {
      scrollname,
      scrollTo,
    } = scrollInfo;
    const { name, cartQuantity } = category;
    const classNameList = ['nav-pane__item'];
    const currentScrollName = scrollname || getCurrentScrollName();

    if (currentScrollName === name) {
      classNameList.push('active');
    }

    return (
      <li className={classNameList.join(' ')}>
        <button
          className="nav-pane__link button__block flex flex-middle flex-space-between"
          onClick={() => {
            this.handleHideMenu();
            scrollTo(name);
          }}
        >
          <label className="nav-pane__label">{name}</label>
          <span className="nav-pane__number gray-font-opacity">
            {cartQuantity}
          </span>
        </button>
      </li>
    );
  }

  render() {
    const {
      show,
      categories,
    } = this.props;
    const className = ['aside'];

    if (show) {
      className.push('active');
    }

    return (
      <div className={className.join(' ')} onClick={(e) => this.handleHideMenu(e)}>
        <nav className="nav-pane">
          <ul className="nav-pane__list">
            {
              categories.map((category) => {
                const { id } = category;

                return (
                  <ScrollObserver
                    key={id}
                    render={(scrollname, scrollTo) => this.renderMenuItem(
                      {
                        scrollname,
                        scrollTo,
                      },
                      category,
                    )}
                  />
                );
              })
            }
          </ul>
        </nav>
      </div>
    );
  }
}

Menu.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
};

Menu.defaultProps = {
  show: false,
  onToggle: () => { }
};

export default connect(
  state => {
    return {
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(Menu);
