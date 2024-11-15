import request from '@/axios'

export const GetRestfull = (model, params): Promise<IResponse> => {
  return request.get({
    url: '/restful/' + model,
    params: params
  })
}

export const DeleteRestfull = async (model, id: number | bigint, params): Promise<IResponse> => {
  return request.delete({
    url: '/restful/' + model + '/' + `${id}`,
    params: params
  })
}
export const PostRestfull = async (model, params, data): Promise<IResponse> => {
  return request.post({
    url: '/restful/' + model,
    params: params,
    data: data
  })
}
export const PutRestfull = async (model, id: number | bigint, params, data): Promise<IResponse> => {
  return request.put({
    url: '/restful/' + model + '/' + `${id}`,
    params: params,
    data: data
  })
}
