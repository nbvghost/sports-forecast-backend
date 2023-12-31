import { OrderMethod, Pagination } from '@/api/types'
import request from '@/axios'
import { SystemMessage } from '@/api/system/types'

export const putSystemMessageList = async (
  Query: any,
  Order: OrderMethod,
  PageNo: number,
  PageSize: number
): Promise<IResponse<Pagination<SystemMessage>>> => {
  return request.put({
    url: '/system/message-list',
    data: { Query, Order, PageNo, PageSize }
  })
}

export const deleteSystemMessage = async (
  ID: number
): Promise<IResponse<Pagination<SystemMessage>>> => {
  return request.delete({
    url: '/system/message',
    data: { ID: ID }
  })
}

export const postSystemMessage = async (
  msg: SystemMessage
): Promise<IResponse<Pagination<SystemMessage>>> => {
  return request.post({
    url: '/system/message',
    data: { SystemMessage: msg }
  })
}
export const postConfiguration = async (msg: Record<string, string>): Promise<IResponse> => {
  return request.post({
    url: '/system/configuration',
    data: { Configurations: msg }
  })
}
//ConfigurationKeys
export const putConfigurations = async (configurationKeys: string[]): Promise<IResponse> => {
  return request.put({
    url: '/system/configuration',
    data: { ConfigurationKeys: configurationKeys }
  })
}
