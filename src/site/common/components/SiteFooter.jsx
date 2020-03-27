import { Link } from 'react-router-dom';
import React from 'react';

const siteRoutes = [
  { to: '/', text: 'Landing' },
  { to: '/qrscan', text: 'QRScan' },
  { to: '/account', text: 'Account <-- sub pages needs login.' },
  { to: '/account/orders', text: 'Account Order List' },
  { to: '/account/cashback', text: 'Account Cashback' },
  { to: '/account/address', text: 'Account Address' },
  { to: '/auth/login', text: 'Auth Login' },
  { to: '/auth/otp', text: 'Auth Otp' },
];

const SiteFooter = () => {
  return (
    <ul>
      {siteRoutes.map(route => {
        return (
          <li key={route.text}>
            <Link to={`${route.to}`}>{route.text}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export default SiteFooter;
