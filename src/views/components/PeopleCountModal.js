import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import Constants from '../../Constants';
import config from '../../config';

class PeopleCountModal extends Component {
  modal = null;

  state = {
    value: Constants.PeopleCount.DEFAULT,
  }

  render() {
    const { history } = this.props;
    const mostNumbers = Array.from(new Array(Constants.PeopleCount.MAX).fill(0), (_, index) => index + 1);
    const lastNumber = `${Constants.PeopleCount.MAX}+ pax`;

    return (
      <Modal ref={ref => this.modal = ref} className="customer-numbers__modal" show onHide={() => history.goBack()}>
          <Modal.Header>
            <h4 className="font-weight-bold">Welcome! How many of you are dining today?</h4>
          </Modal.Header>
          <Modal.Body>
            <ul className="customer-numbers grid">
              {mostNumbers.map(n => 
                <li className="text-center width-1-3" key={`${n}`}>
                  <span
                    className={`tag__card ${this.state.value === n ? 'active' : ''}`}
                    onClick={() => this.setState({ value: n })}
                  >{n}</span>
                </li>
              )}
              <li className="text-center width-2-3" key={`${lastNumber}`}>
                <span
                  className={`tag__card ${this.state.value === Constants.PeopleCount.MAX_PLUS ? 'active' : ''}`}
                  onClick={() => this.setState({ value: Constants.PeopleCount.MAX_PLUS })}
                >{lastNumber}</span>
              </li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <button className="button__fill button__block" onClick={() => {
              config.peopleCount = this.state.value;
              this.modal.hide();
            }}>OK</button>
          </Modal.Footer>
        </Modal>
    );
  }
}


export default withRouter(PeopleCountModal);
