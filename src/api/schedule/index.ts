import { OrderMethod, Schedule } from '@/api/types'
import request from '@/axios'

export const postSchedule = async (schedule: Schedule): Promise<IResponse> => {
  return request.post({
    url: '/schedule/index',
    data: { Schedule: schedule }
  })
}

export const deleteSchedule = async (id: number): Promise<IResponse> => {
  return request.delete({
    url: '/schedule/index',
    data: { ID: id }
  })
}

export const putScheduleList = async (
  Query: any,
  Order: OrderMethod,
  PageNo: number,
  PageSize: number
): Promise<IResponse> => {
  return request.put({
    url: '/schedule/list',
    data: { Query, Order, PageNo, PageSize }
  })
}
