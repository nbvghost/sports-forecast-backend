export type UserOrderAnalyse = {
  StatusPay: number
  StatusRefund: number
  StatusComplete: number
  FromTypeDirect: number
  FromTypeGroupBuy: number
  Total: number
}
export type GroupBuyAnalyse = {
  StatusDoingPredictionScore: number
  StatusFailurePredictionScore: number
  StatusSuccessPredictionScore: number
  StatusDoingPremiumScore: number
  StatusFailurePremiumScore: number
  StatusSuccessPremiumScore: number
  StatusDoingSplitScore: number
  StatusFailureSplitScore: number
  StatusSuccessSplitScore: number
  StatusDoingNum: number
  StatusFailureNum: number
  StatusSuccessNum: number
  StatusDoingCheckNum: number
  StatusFailureCheckNum: number
  StatusSuccessCheckNum: number
  TotalPredictionScore: number
  TotalPremiumScore: number
  TotalSplitScore: number
}
export type PredictionAnalyse = {
  UserOrderAnalyse: UserOrderAnalyse
  GroupBuyAnalyse: GroupBuyAnalyse
}
