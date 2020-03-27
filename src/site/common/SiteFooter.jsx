import { Link, useRouteMatch } from 'react-router-dom';
import React from 'react';

const SiteFooter = () => {
  const match = useRouteMatch();

  return (
    <ul>
      <li>
        <Link to={`${match.path}/landing`}>Landing</Link>
      </li>
      <li>
        <Link to={`${match.path}/qrscan`}>QRScan</Link>
      </li>
      <li>
        <Link to={`${match.path}/account`}>account</Link>
      </li>
    </ul>
  );
};

export default SiteFooter;
