import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions } from '../../redux/modules/app';

class Sorry extends Component {
  componentWillMount() {
    this.props.appActions.showMessageModal({
      message: 'Payment Failed',
      description: `We could not process your payment. The contents of your cart have been saved for you.`,
    });

    this.props.history.push({
      pathname: '/cart'
    });
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.order) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div className="loader theme page-loader"></div>
    );
  }
}

export default connect(
  state => ({
  }),
  dispatch => ({
    appActions: bindActionCreators(appActions, dispatch),
  })
)(Sorry);
