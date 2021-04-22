export const getSelectedOnlineBanking = ({ payments }) => {
  const { agentCodes = [] } = payments.common.options.find(option => option.key === 'OnlineBanking') || {};
  const selectedOnlineBanking = agentCodes.find(
    banking => banking.agentCode === payments.onlineBanking.selectedOnlineBankingAgentCode
  );

  return selectedOnlineBanking || {};
};
