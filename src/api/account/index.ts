import request from '@/axios'
import { Admin } from './types'

export const login = (account: string, password: string): Promise<IResponse<Admin>> => {
  return request.post({
    url: '/account/login',
    data: { Account: account, Password: password }
  })
}

export const loginOut = (): Promise<IResponse> => {
  return request.get({ url: '/account/login-out' })
}
