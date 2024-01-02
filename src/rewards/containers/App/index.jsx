import React from 'react';
import Routes from '../Routes';
import '../../../Common.scss';
import '../../../common/styles/base.scss';

const App = () => (
  <main id="beep-app-container" className="fixed-wrapper__main fixed-wrapper" data-test-id="rewards.app.container">
    <Routes />
  </main>
);

App.displayName = 'RewardsApp';

export default App;
