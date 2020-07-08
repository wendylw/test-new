import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Modal from './Modal';
import Constants from '../utils/constants';
import config from '../config';

class PeopleCountModal extends Component {
  modal = null;

  state = {
    value: Constants.PEOPLE_COUNT.DEFAULT,
  };

  render() {
    const { t, history } = this.props;
    const mostNumbers = Array.from(new Array(Constants.PEOPLE_COUNT.MAX).fill(0), (_, index) => index + 1);
    const lastNumber = `${Constants.PEOPLE_COUNT.MAX}+ pax`;
    const showLastNumber = false; // hide the MAX+ pax button for API asking

    return (
      <Modal
        ref={ref => (this.modal = ref)}
        className="customer-numbers__modal"
        data-heap-name="common.people-count-modal.container"
        show
        onHide={() => history.replace(Constants.ROUTER_PATHS.ORDERING_HOME)}
      >
        <Modal.Header>
          <h4 className="text-weight-bolder">{t('PeopleCountModalTitle')}</h4>
        </Modal.Header>
        <Modal.Body>
          <ul className="customer-numbers grid">
            {mostNumbers.map(n => (
              <li className="text-center width-1-3" key={`${n}`}>
                <span
                  className={`tag__card ${this.state.value === n ? 'active' : ''}`}
                  data-heap-name="common.people-count-modal.people-number"
                  onClick={() => this.setState({ value: n })}
                >
                  {n}
                </span>
              </li>
            ))}
            {showLastNumber ? (
              <li className="text-center width-2-3" key={`${lastNumber}`}>
                <span
                  className={`tag__card ${this.state.value === Constants.PEOPLE_COUNT.MAX_PLUS ? 'active' : ''}`}
                  data-heap-name="common.people-count-modal.people-max-number"
                  onClick={() => this.setState({ value: Constants.PEOPLE_COUNT.MAX_PLUS })}
                >
                  {lastNumber}
                </span>
              </li>
            ) : null}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button__fill button__block"
            data-heap-name="common.people-count-modal.ok-btn"
            onClick={() => {
              config.peopleCount = this.state.value;
              this.modal.hide();
            }}
          >
            {t('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withTranslation()(PeopleCountModal);
