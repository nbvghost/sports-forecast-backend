import { OrderMethod, Pagination } from '@/api/types'
import request from '@/axios'
import { ScoreJournalWithUser, UserInfoStateType, UserWithSuperiorUser } from '@/api/user/types'

export const putUserList = async (
  Query: any,
  Order: OrderMethod,
  PageNo: number,
  PageSize: number
): Promise<IResponse<Pagination<UserWithSuperiorUser>>> => {
  return request.put({
    url: '/user/list',
    data: { Query, Order, PageNo, PageSize }
  })
}

export const postUserState = async (
  userID: number,
  state: UserInfoStateType
): Promise<IResponse> => {
  return request.post({
    url: '/user/state',
    data: { UserID: userID, State: state }
  })
}

/**
 *
 * UserID dao.PrimaryKey
 *    Score  int64
 *    Reason string
 * */
export const postUserScoreRecharge = async (
  userID: number,
  score: number,
  reason: string
): Promise<IResponse> => {
  return request.post({
    url: '/user/score-recharge',
    data: { UserID: userID, Score: score, Reason: reason }
  })
}

export const putUserScoreJournalList = async (
  Query: any,
  Order: OrderMethod,
  PageNo: number,
  PageSize: number
): Promise<IResponse<Pagination<ScoreJournalWithUser>>> => {
  return request.put({
    url: '/user/score-journal-list',
    data: { Query, Order, PageNo, PageSize }
  })
}
