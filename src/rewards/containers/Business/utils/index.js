/**
 *
 * @param {number} pointsRate
 * 10 is base spent, 100 for 100% percentage
 * @returns
 */
export const getEarnRewardsNumber = (rate, baseSpent) => Math.floor((rate * baseSpent) / 100);

export const getEarnCashbackPercentage = cashbackRate => cashbackRate * 100;
