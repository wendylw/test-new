/* eslint-disable react/prop-types */
/* eslint-disable react/prefer-stateless-function */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Modal from '../../../components/Modal';
import Utils from '../../../utils/utils';
import withDataAttributes from '../../../components/withDataAttributes';
import './AlertWarning.scss';

// eslint-disable-next-line react/display-name
class AlertWarning extends Component {
  render() {
    const { show, t } = this.props;
    const getExistAsk = Utils.getCookieVariableChange('a_sk');
    if (getExistAsk) {
      return null;
    }
    return (
      // eslint-disable-next-line react/destructuring-assignment
      <Modal className="alert-warning__modal" show={show}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder">
            {t('AlertWarningTitle')}
          </h2>
          <p className="alert-warning__modal-description padding-small text-size-big text-line-height-higher">
            {t('AlertWarningEmial')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="alert-warning__modal-default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            // eslint-disable-next-line react/destructuring-assignment
            onClick={this.props.onDonotAsk}
          >
            {t('AlertWarningDonotAskAgain')}
          </button>
          <button
            className="alert-warning__modal-fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            // eslint-disable-next-line react/destructuring-assignment
            onClick={this.props.onBackEdit}
          >
            {t('AlertWarningBACKTOEDIT')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

AlertWarning.displayName = 'AlertWarning';

AlertWarning.propTypes = {
  show: PropTypes.bool,
  t: PropTypes.func,
  onDonotAsk: PropTypes.func,
  onBackEdit: PropTypes.func,
};

AlertWarning.defaultProps = {
  show: false,
  t: () => {},
  onDonotAsk: () => {},
  onBackEdit: () => {},
};

export default withDataAttributes(AlertWarning);
