import React from 'react';
import PropTypes from 'prop-types';

export const ShieldDollarIcon = ({ className }) => (
  <i className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path
        d="M13 2H3c-.552 0-1 .431-1 .962v3.529c0 5.375 4.738 7.16 5.688 7.461a1.04 1.04 0 0 0 .625 0C9.263 13.651 14 11.866 14 6.491V2.962C14 2.431 13.552 2 13 2z"
        fill="#fc7118"
      />
      <path
        d="M8.144 3.563c.271 0 .492.179.5.402v.427l.144.007c.41.041.796.222 1.091.516.336.336.525.792.525 1.268 0 .229-.185.414-.414.414s-.407-.179-.414-.402v-.012c0-.256-.102-.502-.283-.683-.173-.173-.405-.274-.649-.282v1.93h.242c.99 0 1.793.803 1.793 1.793 0 .98-.787 1.777-1.763 1.793h-.272v.414c0 .229-.224.414-.5.414s-.492-.179-.5-.402v-.012-.414h-.413c-.99 0-1.793-.803-1.793-1.793 0-.229.185-.414.414-.414s.407.179.414.402v.012c0 .528.424.957.949.965h.429V7.976h-.275c-.99 0-1.793-.803-1.793-1.793 0-.98.787-1.777 1.763-1.793h.305v-.413c0-.229.224-.414.5-.414zm.499 6.344h.242c.533 0 .966-.432.966-.966 0-.528-.424-.957-.949-.965h-.258v1.931zm-1-2.758V5.218h-.275c-.533 0-.966.432-.966.966 0 .528.424.957.949.965h.291z"
        fill="#fff"
      />
    </svg>
  </i>
);

ShieldDollarIcon.propTypes = {
  className: PropTypes.string,
};
ShieldDollarIcon.defaultProps = {
  className: null,
};

ShieldDollarIcon.displayName = 'ShieldDollarIcon';
