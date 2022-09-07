import React from 'react';
import { render } from 'react-dom';
import i18next from 'i18next';
import { destroyTarget, CONFIRM_BUTTON_ALIGNMENT, CONFIRM_TRIGGER_TARGET } from './utils';
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
  closeByBackButton = false,
  closeByBackDrop = false,
  animation = true,
  cancelButtonContent = null,
  className = '',
  cancelButtonClassName = '',
  cancelButtonStyle = {},
  confirmButtonContent = null,
  confirmButtonClassName = '',
  confirmButtonStyle = {},
  buttonAlignment = CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL,
  zIndex = 300,
  onSelection = () => {},
}) => ({
  container,
  title,
  customizeContent,
  animation,
  closeByBackButton,
  closeByBackDrop,
  cancelButtonContent,
  className,
  cancelButtonClassName,
  cancelButtonStyle,
  confirmButtonContent,
  confirmButtonClassName,
  confirmButtonStyle,
  buttonAlignment,
  zIndex,
  onSelection,
});

const createConfirm = (content, options) => {
  let resolvedSelection;
  return new Promise(resolve => {
    const {
      container,
      title,
      customizeContent,
      cancelButtonContent,
      confirmButtonContent,
      onSelection,
      ...restOptions
    } = options;
    const rootDOM = document.createElement('div');

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
        cancelButtonContent: cancelButtonContent || i18next.t('ConfirmCloseButtonText'),
        confirmButtonContent: confirmButtonContent || i18next.t('Confirm'),
        onSelection: target => {
          resolvedSelection = target === CONFIRM_TRIGGER_TARGET.CONFIRM;
          destroyTarget(rootDOM);
        },
        onHistoryBackCompleted: () => {
          resolve(resolvedSelection);
          onSelection(resolvedSelection);
        },
      },
      children
    );

    rootDOM.setAttribute('class', 'feedback__confirm');
    container.appendChild(rootDOM);

    render(confirmInstance, rootDOM);
  });
};

export const confirm = (content, options = {}) => createConfirm(content, confirmOptions(options));
