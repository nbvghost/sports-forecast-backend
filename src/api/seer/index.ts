import { Seer } from '@/api/types'
import request from '@/axios'

export const postSeer = async (seer: Seer): Promise<IResponse> => {
  return request.post({
    url: '/seer/index',
    data: { Seer: seer }
  })
}

export const deleteSeer = async (id: number): Promise<IResponse> => {
  return request.delete({
    url: '/seer/index',
    data: { ID: id },
    params: { ID: id }
  })
}
