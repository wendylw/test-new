import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from './utils';
import Alert from '../../components/Alert';
import AlertContent from '../../components/Alert/AlertContent';

/**
 * Use alert(...) function to call alert modal component, that alert can not customize display or closing.
 * If you want to customize your alert display and other props, we provide the Alert component, which can be imported directly in your component
 * */
const alertOptions = ({
  container = document.body,
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
    const { container, customizeContent, title, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');
    // eslint-disable-next-line react/jsx-filename-extension
    const children = customizeContent ? content : <AlertContent content={content} title={title} />;
    const alertInstance = React.createElement(
      Alert,
      {
        title,
        ...restOptions,
        show: true,
        mountAtRoot: false,
        onClose: () => {
          destroyTarget(rootDOM);
          resolve();
          onClose();
        },
      },
      children
    );

    container.appendChild(rootDOM);

    render(alertInstance, rootDOM);
  });

export const alert = (content, options = {}) => createAlert(content, alertOptions(options));