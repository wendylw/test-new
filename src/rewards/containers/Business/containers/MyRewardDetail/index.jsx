import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import { mounted } from './redux/thunks';

const MyRewardDetail = () => {
  const dispatch = useDispatch();

  useMount(() => {
    dispatch(mounted());
  });

  return <div>MyRewardDetail</div>;
};

MyRewardDetail.displayName = 'MyRewardDetail';

export default MyRewardDetail;
