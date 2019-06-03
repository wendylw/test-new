import React, { Component } from 'react';
import RedeemModal from './RedeemModal';

class RedeemButton extends Component {
  state = {
    showModal: false,
  }

  render() {
    const { wrapperClassName } = this.props;

    return (
      <div className={`redeem-button-wrapper ${wrapperClassName || ''}`}>
        <button className="redeem-button" onClick={() => this.setState({ showModal: true })}>HOW TO REDEEM?</button>
        <RedeemModal
          show={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
        />
      </div>
    );
  }
}

export default RedeemButton;