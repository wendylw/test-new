import React from 'react';
import Login from '../../../Login/containers/Web';

const Test = () => (
  <div>
    <Login show disabledGuestLogin onClose={() => {}} />
  </div>
);

Test.displayName = 'Test';

export default Test;
