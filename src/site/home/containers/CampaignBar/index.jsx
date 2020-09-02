import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Campaign from './components/Campaign';
import dataSource from './dataSource';

// this container is kind of view, and can have dom level animation between banner bars
const CampaignBar = ({ countryCode, onToggle = () => {} }) => {
  // for further from redux state
  const defaultCampaign = dataSource[3];
  const [currentCampaign] = useState(defaultCampaign);

  if (countryCode.toUpperCase() === 'MY') {
    return <Campaign campaign={currentCampaign} onToggle={onToggle} />;
  }

  return null;
};

CampaignBar.propTypes = {
  countryCode: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
};

export default CampaignBar;
