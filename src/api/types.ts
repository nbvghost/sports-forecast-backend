export interface OrderMethod {
  ColumnName: string
  Method: string
}

export interface Pagination<T = any> {
  List: T[]
  Total: number
  PageSize: number
  Page: number
}

export type Seer = {
  ID: number
  Name: string
  Avatar: string
  Signature: string
  Grades: number[]
}
export type Prediction = {
  ID: number
  SeerID: number
  ScheduleID: number
  Recommend: string
  Score: number
  Rl: string
  Rn: string
  Result: number
}
export type Schedule = {
  ID: number
  Name: string
  TypeName: string
  Hoster: string
  Guester: string
  StartAt: string
  EndAt: string
  Rl: string
  Rn: string
}
