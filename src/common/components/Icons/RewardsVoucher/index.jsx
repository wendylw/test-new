import React from 'react';
import PropTypes from 'prop-types';

export const RewardsVoucher = ({ className, color }) => (
  <i className={className}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M35.9029 15.6758L19.0732 9.87665L17.7744 13.6461C17.6278 14.0705 17.2301 14.3373 16.805 14.3373C16.6945 14.3373 16.5814 14.3192 16.4712 14.2813C15.9356 14.097 15.6517 13.5134 15.8356 12.9782L17.1344 9.20871L10.1376 6.79766C9.02499 6.41442 7.81274 7.00564 7.42913 8.1179L6.24415 11.5576L7.41932 11.9623C9.27479 12.6015 10.2605 14.6239 9.62094 16.4797C9.11371 17.9516 7.73638 18.8762 6.26197 18.8762C5.87764 18.8762 5.48749 18.8133 5.10389 18.6813L3.92873 18.2766L2.74374 21.7163C2.3605 22.8289 2.95136 24.0412 4.06362 24.4248L11.1044 26.8511C11.1073 26.7504 11.1255 26.6482 11.1601 26.5471L12.4959 22.6704C12.6803 22.1348 13.2635 21.8501 13.7991 22.0352C14.3347 22.2192 14.6187 22.8027 14.4343 23.3383L13.0984 27.2151C13.0639 27.3154 13.0152 27.4074 12.9552 27.4885L29.8289 33.3029C30.9415 33.6858 32.1538 33.0949 32.5374 31.9826L33.7227 28.543L32.5476 28.1379C30.6921 27.4987 29.7064 25.4767 30.3456 23.6212C30.9848 21.7658 33.0072 20.78 34.863 21.4192L36.0382 21.8243L37.2232 18.3846C37.6064 17.272 37.0152 16.0594 35.9029 15.6761V15.6758ZM16.7723 16.5531L15.4368 20.4302C15.2902 20.8549 14.8925 21.1214 14.4674 21.1214C14.3565 21.1214 14.2438 21.1033 14.1336 21.0651C13.598 20.8807 13.3141 20.2972 13.498 19.7619L14.8339 15.8848C15.0183 15.3496 15.6018 15.0653 16.1371 15.2496C16.6727 15.434 16.9566 16.0175 16.7723 16.5528V16.5531Z"
        fill={color}
      />
      <path
        d="M32.1254 3.44366L32.913 7.24732C33.0773 8.04106 33.6835 8.66937 34.471 8.86172L37.5046 9.6031L34.471 10.3445C33.6838 10.5368 33.0773 11.1651 32.913 11.9589L32.1254 15.7625L31.3379 11.9589C31.1735 11.1651 30.5674 10.5368 29.7798 10.3445L26.7463 9.6031L29.7798 8.86172C30.567 8.66937 31.1735 8.04106 31.3379 7.24732L32.1254 3.44366Z"
        fill={color}
      />
      <path
        d="M7.6128 26.3976L8.26292 29.5388C8.39855 30.1943 8.89923 30.7128 9.54935 30.8717L12.0546 31.484L9.54935 32.0963C8.89923 32.2552 8.39855 32.7741 8.26292 33.4293L7.6128 36.5705L6.96268 33.4293C6.82705 32.7737 6.32637 32.2552 5.67625 32.0963L3.17102 31.484L5.67625 30.8717C6.32637 30.7128 6.82705 30.194 6.96268 29.5388L7.6128 26.3976Z"
        fill={color}
      />
      <path
        d="M19.0513 6.24463C18.4899 6.24463 18.4889 7.11728 19.0513 7.11728C19.6138 7.11728 19.6138 6.24463 19.0513 6.24463Z"
        fill={color}
      />
      <path
        d="M13.442 35.2626C12.8806 35.2626 12.8795 36.1353 13.442 36.1353C14.0045 36.1353 14.0045 35.2626 13.442 35.2626Z"
        fill={color}
      />
      <path
        d="M26.7459 3.74805C26.3437 3.74805 25.9587 4.10147 25.9772 4.5167C25.9958 4.93303 26.315 5.28536 26.7459 5.28536C27.148 5.28536 27.5331 4.93194 27.5145 4.5167C27.496 4.10038 27.1767 3.74805 26.7459 3.74805Z"
        fill={color}
      />
      <path
        d="M37.6573 25.4268C37.3435 25.4268 37.0428 25.7027 37.0574 26.0267C37.0719 26.3518 37.321 26.6266 37.6573 26.6266C37.9711 26.6266 38.2718 26.3507 38.2573 26.0267C38.2427 25.7016 37.9937 25.4268 37.6573 25.4268Z"
        fill={color}
      />
      <path
        d="M3.66002 15.1354C3.17424 15.1354 2.70847 15.5626 2.73101 16.0644C2.75355 16.5676 3.13897 16.9934 3.66002 16.9934C4.14579 16.9934 4.6112 16.5662 4.58902 16.0644C4.56648 15.5612 4.1807 15.1354 3.66002 15.1354Z"
        fill={color}
      />
    </svg>
  </i>
);

RewardsVoucher.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
};
RewardsVoucher.defaultProps = {
  className: null,
  color: 'white',
};

RewardsVoucher.displayName = 'RewardsVoucher';