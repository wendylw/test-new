import React, { Component } from 'react';
import Modal from './Modal';

class PeopleCountModal extends Component {
  render() {
    return (
      <Modal className="customer-numbers__modal">
          <Modal.Header>
            <h4 className="font-weight-bold">Welcome! How many of you are dining today?</h4>
          </Modal.Header>
          <Modal.Body>
            <ul className="customer-numbers grid">
              <li className="text-center width-1-3">
                <span className="tag__card active">1</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">2</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">3</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">4</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">5</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">6</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">7</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">8</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">9</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">10</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card ">11</span>
              </li>
              <li className="text-center width-1-3">
                <span className="tag__card">12</span>
              </li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <button className="button__fill button__block">OK</button>
          </Modal.Footer>
        </Modal>
    );
  }
}

export default PeopleCountModal;
