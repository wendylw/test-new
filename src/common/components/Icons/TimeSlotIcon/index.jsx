import React from 'react';
import PropTypes from 'prop-types';

export const TimeSlotIcon = ({ className }) => (
  <i className={className}>
    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12z" fill="#F2F2F3" />
      <path d="M7.2 18.439v-7.805H20v7.805c0 .859-.72 1.561-1.6 1.561H8.8c-.88 0-1.6-.702-1.6-1.561z" fill="#F93" />
      <path d="M20 9.073v2.342H7.2V9.073c0-.858.72-1.56 1.6-1.56h9.6c.88 0 1.6.702 1.6 1.56z" fill="#303030" />
      <path
        d="M16 9.073c0 .647.537 1.17 1.2 1.17.663 0 1.2-.523 1.2-1.17 0-.646-.537-1.17-1.2-1.17-.663 0-1.2.524-1.2 1.17z"
        fill="#fff"
      />
      <path
        d="M9.2 9.073c0 .647.537 1.17 1.2 1.17.663 0 1.2-.523 1.2-1.17 0-.646-.537-1.17-1.2-1.17-.663 0-1.2.524-1.2 1.17z"
        fill="#37474F"
      />
      <path
        d="M17.2 6.732c-.44 0-.8.35-.8.78v1.561c0 .43.36.78.8.78.44 0 .8-.35.8-.78v-1.56c0-.43-.36-.781-.8-.781zm-6.8 0c-.44 0-.8.35-.8.78v1.561c0 .43.36.78.8.78.44 0 .8-.35.8-.78v-1.56c0-.43-.36-.781-.8-.781z"
        fill="#F93"
      />
      <path
        d="M15.2 16.098h1.6v1.56h-1.6v-1.56zm-2.4 0h1.6v1.56h-1.6v-1.56zm-2.4 0H12v1.56h-1.6v-1.56zm4.8-2.342h1.6v1.561h-1.6v-1.56zm-2.4 0h1.6v1.561h-1.6v-1.56zm-2.4 0H12v1.561h-1.6v-1.56z"
        fill="#fff"
      />
      <path
        d="M4 8.683c0 2.586 2.149 4.683 4.8 4.683s4.8-2.097 4.8-4.683S11.451 4 8.8 4 4 6.097 4 8.683z"
        fill="#303030"
      />
      <path
        d="M5.2 8.683c0 1.94 1.612 3.512 3.6 3.512s3.6-1.572 3.6-3.512S10.788 5.17 8.8 5.17 5.2 6.743 5.2 8.683z"
        fill="#fff"
      />
      <path d="M8.4 5.951h.8v2.732h-.8V5.95z" fill="#F93" />
      <path d="m10.607 9.893-.537.524-1.527-1.49.537-.524 1.527 1.49z" fill="#F93" />
      <path
        d="M8.2 8.683c0 .323.269.585.6.585.331 0 .6-.262.6-.585a.593.593 0 0 0-.6-.585c-.331 0-.6.262-.6.585z"
        fill="#FF9419"
      />
    </svg>
  </i>
);

TimeSlotIcon.propTypes = {
  className: PropTypes.string,
};
TimeSlotIcon.defaultProps = {
  className: null,
};

TimeSlotIcon.displayName = 'TimeSlotIcon';
