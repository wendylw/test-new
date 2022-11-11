import React from 'react';
import { useMount } from 'react-use';
import { useDispatch } from 'react-redux';
import usePrefetch from '../../../common/utils/hooks/usePrefetch';
import Frame from '../../../common/components/Frame';
import FoodCourtHeader from './components/FoodCourtHeader';
import FoodCourtInfo from './components/FoodCourtInfo';
import FoodCourtStoreList from './components/FoodCourtStoreList';
import { mounted } from './redux/common/thunks';

const FoodCourt = () => {
  const dispatch = useDispatch();

  usePrefetch(['ORD_PL']);

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <Frame>
      <FoodCourtHeader />
      <FoodCourtInfo />
      <FoodCourtStoreList />
    </Frame>
  );
};

FoodCourt.displayName = 'FoodCourt';

export default FoodCourt;
