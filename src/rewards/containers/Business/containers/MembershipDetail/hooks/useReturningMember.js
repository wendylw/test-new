import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIsFromEarnedCashbackQRScan, getIsNewMember } from '../selectors';
import { toast } from '../../../../../../common/utils/feedback';

export function useReturningMember({ content }) {
  const isFromEarnedCashbackQRScan = useSelector(getIsFromEarnedCashbackQRScan);
  const isNewMember = useSelector(getIsNewMember);

  useEffect(() => {
    if (!isFromEarnedCashbackQRScan && isNewMember) {
      toast(content);
    }
  }, [isFromEarnedCashbackQRScan, isNewMember]);
}
