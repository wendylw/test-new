import React from 'react';
import Modal from './Modal';
import '../App.scss';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Common/Modal',
  component: Modal,
};

export const WithNothing = () => <Modal className="align-middle" show></Modal>;

export const WithContent = () => (
  <Modal className="align-middle" show hideOnBlank onHide={action('hideOnBlank')}>
    <Modal.Body className="active">
      <h4 className="modal__title text-weight-bolder">Modal can hide by clicking blank</h4>
      <p className="modal__text">Text Content</p>
    </Modal.Body>
    <Modal.Footer>Footer content</Modal.Footer>
  </Modal>
);
