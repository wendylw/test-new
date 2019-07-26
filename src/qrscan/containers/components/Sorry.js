import React, { Component } from 'react';

class Sorry extends Component {
  state = {
    isIOS: this.props.location.query.isIOS,
  }



  render() {
    let sorryText;
    if (this.state.isIOS) {
      sorryText = <p>Please open beepit.co in Safari</p>;
    } else {
      sorryText = <p>Please open beepit.co in Google Chrome</p>
    }

    return (
      <div>
        <div className="content-contenter">
          <div className="content-header"></div>

          <div className="content-body text-center">
            <div className="img-content">
              <img className="logo-img" src="/img/beep-warning.png" alt="" />
              <h2>Unsupported Browser</h2>
              {this.props.location.query.isIOS}

            </div>
          </div>

          <div className="content-footer">
            {sorryText}
          </div>
        </div>
      </div>
    );
  }
}

export default Sorry;
