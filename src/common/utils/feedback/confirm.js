import React from 'react';
import { render } from 'react-dom';
import { destroyTarget, CONFIRM_BUTTON_ALIGNMENT } from './utils';
import Confirm from '../../components/Confirm';
import ConfirmContent from '../../components/Confirm/ConfirmContent';

/**
 * Use confirm(...) function to call confirm modal component, that confirm can not customize display or closing.
 * If you want to customize your confirm display and other props, we provide the Confirm component, which can be imported directly in your component
 * */
const confirmOptions = ({
  container = document.body,
  title = null,
  customizeContent = false,
  closeByBackButton = true,
  closeByBackDrop = true,
  animation = true,
  closeButtonContent = null,
  className = '',
  closeButtonClassName = '',
  closeButtonStyle = {},
  confirmButtonContent = null,
  confirmButtonClassName = '',
  confirmButtonStyle = {},
  buttonAlignment = CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL,
  zIndex = 300,
  onCancel = () => {},
  onConfirm = () => {},
}) => ({
  container,
  title,
  customizeContent,
  animation,
  closeByBackButton,
  closeByBackDrop,
  closeButtonContent,
  className,
  closeButtonClassName,
  closeButtonStyle,
  confirmButtonContent,
  confirmButtonClassName,
  confirmButtonStyle,
  buttonAlignment,
  zIndex,
  onCancel,
  onConfirm,
});

const createConfirm = (content, options) =>
  new Promise(resolve => {
    const { container, title, customizeContent, onCancel, onConfirm, ...restOptions } = options;
    const rootDOM = document.createElement('div');
    const callbackFunction = () => {
      destroyTarget(rootDOM);
      resolve();
    };
    const children = customizeContent ? (
      content
    ) : (
      // eslint-disable-next-line react/jsx-filename-extension
      <ConfirmContent content={content} title={title} />
    );
    const confirmInstance = React.createElement(
      Confirm,
      {
        ...restOptions,
        show: true,
        mountAtRoot: false,
        onClose: () => {
          callbackFunction();
        },
        onCancel: () => {
          callbackFunction();
          onCancel();
        },
        onConfirm: () => {
          callbackFunction();
          onConfirm();
        },
      },
      children
    );

    rootDOM.setAttribute('class', 'feedback__confirm');
    container.appendChild(rootDOM);

    render(confirmInstance, rootDOM);
  });

export const confirm = (content, options = {}) => createConfirm(content, confirmOptions(options));
