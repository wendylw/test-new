import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../../../../components/Modal';
import withDataAttributes from '../../../../../components/withDataAttributes';
import './DuplicatedEmailAlert.scss';

function DuplicatedEmailAlert(props) {
  const { show, t, onDoNotAsk, onBackEdit } = props;
  return (
    <Modal className="profile__duplicated-email-alert" show={show}>
      <Modal.Body className="text-center padding-small">
        <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder">
          {t('DuplicatedEmailAlertTitle')}
        </h2>
        <p className="profile__duplicated-email-alert-description padding-small text-size-big text-line-height-higher">
          {t('DuplicatedEmailAlertEmial')}
        </p>
      </Modal.Body>
      <Modal.Footer className="flex flex-stretch">
        <button
          className="profile__duplicated-email-alert-default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
          // eslint-disable-next-line react/destructuring-assignment
          onClick={onDoNotAsk}
        >
          {t('DuplicatedEmailAlertDoNotAskAgain')}
        </button>
        <button
          className="profile__duplicated-email-alert-fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
          // eslint-disable-next-line react/destructuring-assignment
          onClick={onBackEdit}
        >
          {t('DuplicatedEmailAlertBackToEdit')}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

DuplicatedEmailAlert.displayName = 'DuplicatedEmailAlert';

DuplicatedEmailAlert.propTypes = {
  show: PropTypes.bool,
  t: PropTypes.func,
  onDoNotAsk: PropTypes.func,
  onBackEdit: PropTypes.func,
};

DuplicatedEmailAlert.defaultProps = {
  show: false,
  t: () => {},
  onDoNotAsk: () => {},
  onBackEdit: () => {},
};

export default withDataAttributes(DuplicatedEmailAlert);
