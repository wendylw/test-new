import React from 'react';
import { useSelector } from 'react-redux';
import Result from '../../../../../../../common/components/Result';
import SmartIframe from '../../../../../../../common/components/SmartIframe';
import { getCongratulationUrl } from '../../redux/selectors';

const SuccessResult = () => {
  const iframeUrl = useSelector(getCongratulationUrl);

  return (
    <Result show disableBackButtonSupport closeButtonClassName="tw-hidden">
      <SmartIframe id="join-membership-rewards" title="Join Membership Rewards" src={iframeUrl} defaultHeight={302} />
    </Result>
  );
};

SuccessResult.displayName = 'SuccessResult';

export default SuccessResult;
