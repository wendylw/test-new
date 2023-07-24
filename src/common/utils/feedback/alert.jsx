import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from './utils';
import Alert from '../../components/Alert';
import AlertContent from '../../components/Alert/AlertContent';

/**
 * Use alert(...) function to call alert modal component, that alert can not customize display or closing.
 * If you want to customize your alert display and other props, we provide the Alert component, which can be imported directly in your component
 * */
const alertIdsSet = new Set();
const alertOptions = ({
  container = document.body,
  // If you add id for an alert, the same alert will not be created again.
  id = null,
  title = null,
  customizeContent = false,
  animation = true,
  closeButtonContent = null,
  className = '',
  closeButtonClassName = '',
  closeButtonStyle = {},
  zIndex = 300,
  onClose = () => {},
}) => ({
  container,
  id,
  title,
  customizeContent,
  animation,
  closeButtonContent,
  className,
  closeButtonClassName,
  closeButtonStyle,
  zIndex,
  onClose,
});

const createAlert = (content, options) =>
  new Promise(resolve => {
    const { container, id, customizeContent, title, onClose, ...restOptions } = options;

    if (alertIdsSet.has(id)) {
      // Reject an error that will throw an unhandled error to warn.
      // The issue should be caught, so resolving an error to reference.
      resolve(new Error('Failed to create alert: id existed'));

      return;
    }

    const rootDOM = document.createElement('div');
    const deleteAlertId = () => {
      alertIdsSet.delete(id);
    };
    const children = customizeContent ? content : <AlertContent content={content} title={title} />;
    const alertInstance = React.createElement(
      Alert,
      {
        ...restOptions,
        show: true,
        mountAtRoot: false,
        onClose: () => {
          deleteAlertId();
          destroyTarget(rootDOM);
        },
        onHistoryBackCompleted: () => {
          deleteAlertId();
          resolve();
          onClose();
        },
      },
      children
    );

    if (id) {
      alertIdsSet.add(id);
      rootDOM.setAttribute('id', id);
    }

    rootDOM.setAttribute('class', 'feedback__alert');
    container.appendChild(rootDOM);

    render(alertInstance, rootDOM);
  });

export const alert = (content, options = {}) => createAlert(content, alertOptions(options));
