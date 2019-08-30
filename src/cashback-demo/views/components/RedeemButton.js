import React, { Component } from 'react';
import RedeemModal from './RedeemModal';

class RedeemButton extends Component {
  state = {
    showModal: false,
  }

  render() {
    const { wrapperClassName } = this.props;
    const classList = ['redeem__button-container'];

    if (wrapperClassName) {
      classList.push(wrapperClassName);
    }

    return (
      <div className={classList.join(' ')}>
        <button className="redeem__button button__outline button__block border-radius-base font-weight-bold text-uppercase" onClick={() => this.setState({ showModal: true })}>How to redeem?</button>
        <RedeemModal
          show={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
        />
      </div>
    );
  }
}

export default RedeemButton;