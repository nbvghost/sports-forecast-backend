import { OrderMethod, Prediction } from '@/api/types'
import request from '@/axios'

export const PutPredictionJoinScheduleList = async (
  Query: any,
  Order: OrderMethod,
  PageNo: number,
  PageSize: number
): Promise<IResponse> => {
  return request.put({
    url: '/prediction/join-schedule-list',
    data: { Query, Order, PageNo, PageSize }
  })
}

export const postPrediction = async (prediction: Prediction): Promise<IResponse> => {
  return request.post({
    url: '/prediction/index',
    data: { Prediction: prediction }
  })
}

export const deletePrediction = async (id: number): Promise<IResponse> => {
  return request.delete({
    url: '/prediction/index',
    data: { ID: id },
    params: { ID: id }
  })
}
