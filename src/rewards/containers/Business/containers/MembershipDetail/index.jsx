import React from 'react';
import { useDispatch } from 'react-redux';
import { useMount } from 'react-use';
import MemberCard from './components/MemberCard';
import CashbackBlock from './components/CashbackBlock';
import PromoList from './components/PromoList';
import MembershipDetailFooter from './components/MembershipDetailFooter';
import { mounted } from './redux/thunks';

const MembershipDetail = () => {
  const dispatch = useDispatch();

  useMount(() => {
    dispatch(mounted());
  });

  return (
    <>
      <MemberCard />
      <CashbackBlock />
      <PromoList />
      <MembershipDetailFooter />
    </>
  );
};

MembershipDetail.displayName = 'MembershipDetail';

export default MembershipDetail;
