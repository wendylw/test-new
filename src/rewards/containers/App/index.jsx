import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { mounted } from '../../redux/modules/common/thunks';
import Routes from '../Routes';
import '../../../Common.scss';
import '../../../common/styles/base.scss';

const App = () => {
  const dispatch = useDispatch();

  useMount(async () => {
    await dispatch(mounted());
  });

  return (
    <main id="beep-app-container" className="fixed-wrapper__main fixed-wrapper" data-test-id="rewards.app.container">
      <Routes />
    </main>
  );
};

App.displayName = 'RewardsApp';

export default App;
