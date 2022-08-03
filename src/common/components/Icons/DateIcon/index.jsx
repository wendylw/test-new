import React from 'react';
import PropTypes from 'prop-types';

export const DateIcon = ({ className }) => (
  <i className={className}>
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g fillRule="nonzero" fill="none">
        <path
          d="M0 12.002c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12s-12 5.372-12 12z"
          fill="#F2F2F3"
        />
        <path d="M6 16.709V8.904h12.8v7.805c0 .858-.72 1.56-1.6 1.56H7.6c-.88 0-1.6-.702-1.6-1.56z" fill="#FF9419" />
        <path d="M18.8 7.343v2.342H6V7.343c0-.858.72-1.56 1.6-1.56h9.6c.88 0 1.6.702 1.6 1.56z" fill="#303030" />
        <path
          d="M14.8 7.343c0 .647.537 1.17 1.2 1.17.663 0 1.2-.523 1.2-1.17 0-.647-.537-1.17-1.2-1.17-.663 0-1.2.523-1.2 1.17zM8 7.343c0 .647.537 1.17 1.2 1.17.663 0 1.2-.523 1.2-1.17 0-.647-.537-1.17-1.2-1.17-.663 0-1.2.523-1.2 1.17z"
          fill="#FFF"
        />
        <path
          d="M16 5.002c-.44 0-.8.35-.8.78v1.561c0 .43.36.78.8.78.44 0 .8-.35.8-.78v-1.56c0-.43-.36-.781-.8-.781zm-6.8 0c-.44 0-.8.35-.8.78v1.561c0 .43.36.78.8.78.44 0 .8-.35.8-.78v-1.56c0-.43-.36-.781-.8-.781z"
          fill="#FF9419"
        />
        <path
          d="M14 14.367h1.6v1.561H14v-1.56zm-2.4 0h1.6v1.561h-1.6v-1.56zm-2.4 0h1.6v1.561H9.2v-1.56zm4.8-2.341h1.6v1.561H14v-1.561zm-2.4 0h1.6v1.561h-1.6v-1.561zm-2.4 0h1.6v1.561H9.2v-1.561z"
          fill="#FFF"
        />
      </g>
    </svg>
  </i>
);

DateIcon.propTypes = {
  className: PropTypes.string,
};
DateIcon.defaultProps = {
  className: null,
};

DateIcon.displayName = 'DateIcon';
