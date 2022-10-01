import React from 'react';
import { render } from 'react-dom';
import { destroyTarget } from './utils';
import Result from '../../components/Result';
import ResultContent from '../../components/Result/ResultContent';

/**
 * Use result(...) function to call result modal component, that result can not customize display or closing.
 * If you want to customize your result display and other props, we provide the Result component, which can be imported directly in your component
 * */
const resultOptions = ({
  container = document.body,
  title = null,
  customizeContent = false,
  closeButtonContent = null,
  className = '',
  closeButtonClassName = '',
  closeButtonStyle = {},
  zIndex = 400,
  onClose = () => {},
}) => ({
  container,
  title,
  customizeContent,
  closeButtonContent,
  className,
  closeButtonClassName,
  closeButtonStyle,
  zIndex,
  onClose,
});

const createResult = (content, options) =>
  new Promise(resolve => {
    const { container, customizeContent, title, onClose, ...restOptions } = options;
    const rootDOM = document.createElement('div');
    const children = customizeContent ? (
      content
    ) : (
      // eslint-disable-next-line react/jsx-filename-extension
      <ResultContent content={content} title={title} />
    );
    const resultInstance = React.createElement(
      Result,
      {
        ...restOptions,
        show: true,
        isFullScreen: true,
        mountAtRoot: false,
        onClose: () => {
          destroyTarget(rootDOM);
        },
        onHistoryBackCompleted: () => {
          resolve();
          onClose();
        },
      },
      children
    );

    rootDOM.setAttribute('class', 'feedback__result tw-h-full tw-w-full tw-overflow-hidden');
    container.appendChild(rootDOM);

    render(resultInstance, rootDOM);
  });

export const result = (content, options = {}) => createResult(content, resultOptions(options));
