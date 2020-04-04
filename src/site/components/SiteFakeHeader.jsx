import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const siteRoutes = [
  { pathname: '/', text: 'Site' },
  { pathname: '/home', text: 'Home' },
  { pathname: '/home', text: 'Home (with state)', state: { from: 'SiteFooter.jsx' } },
  { pathname: '/ordering/location', text: 'Location Picker' },
  { pathname: '/qrscan', text: 'QRScan' },
  { pathname: '/account', text: 'Account <-- sub pages needs login.' },
  { pathname: '/account/orders', text: 'Account Order List' },
  { pathname: '/account/cashback', text: 'Account Cashback' },
  { pathname: '/account/address', text: 'Account Address' },
  { pathname: '/auth/login', text: 'Auth Login' },
  { pathname: '/auth/otp', text: 'Auth Otp' },
];

const SiteFakeHeader = () => {
  const history = useHistory();
  return (
    <div
      style={{
        borderBottom: '2px dotted blue',
      }}
    >
      <ul>
        {siteRoutes.map((route, index) => {
          const { text, ...pathInfo } = route;
          return (
            <li key={`page-${index}`}>
              <Link to={pathInfo}>{text}</Link>
            </li>
          );
        })}
      </ul>
      <div>
        <p>
          <b>getPageState()</b> => {JSON.stringify(history.location.state)}
        </p>
      </div>
    </div>
  );
};

export default SiteFakeHeader;
