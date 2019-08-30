export default {
  // if ok is not equal to true, it means that there is a error for the request
  ok: true,
  data: {
    customerId: "xxx",
    receiptNumber: "xxxx",
    // 如果数据没有返回，请使用 GET /cash-back/result 轮询结果
    loyalty: {
      // 这次扫码获取的积分
      totalEarned: 12,
      // 当前账户的积分余额
      currentBalance: 100
    }
  },
  // exists when an error occurred
  error: {
    msg: "xxx",
    stack: "xxxxx"
  }
};
