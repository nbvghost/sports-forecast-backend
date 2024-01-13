export type User = {
  ID: number //dao.PrimaryKey `gorm:"column:OID"`
  Name: string //string         `gorm:"column:Name"`                  //
  OpenID: string //string         `gorm:"column:OpenID"`                //
  Email: string //string         `gorm:"column:Email"`                 //
  Phone: string //string         `gorm:"column:Phone"`                 //
  Age: number //int            `gorm:"column:Age"`                   //
  Amount: number //uint           `gorm:"column:Amount"`                //现金
  BlockAmount: number //uint           `gorm:"column:BlockAmount"`           //冻结现金
  Score: number //uint           `gorm:"column:Score"`                 //积分
  Growth: number //uint           `gorm:"column:Growth"`                //成长值
  Portrait: string //string         `gorm:"column:Portrait"`              //头像
  Gender: number //int            `gorm:"column:Gender"`                //性别 1男  2女
  LastLoginAt: string //time.Time      `gorm:"column:LastLoginAt;type:time"` //
  RankID: number //uint           `gorm:"column:RankID"`                //
  SuperiorID: number //dao.PrimaryKey `gorm:"column:SuperiorID"`            //
  RoleID: number //dao.PrimaryKey `gorm:"column:RoleID"`                //
}

export interface UserWithSuperiorUser extends User {
  SuperiorUser: User
  UserInfoKeys: string[] //pq.StringArray `gorm:"column:UserInfoKeys"`
  UserInfoValues: string[] //pq.StringArray `gorm:"column:UserInfoValues"`
}

export type UserInfoStateType = 'closure' | ''

export type ScoreJournal = {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  Name: string //string           `gorm:"column:Name;not null"`   //
  Detail: string //string           `gorm:"column:Detail;not null"` //
  UserID: number //dao.PrimaryKey   `gorm:"column:UserID"`          //
  Score: number //int64            `gorm:"column:Score"`           //变动金额
  Type: number //ScoreJournalType `gorm:"column:Type"`            //
  Balance: number //uint             `gorm:"column:Balance"`         //变动后的余额
}
export type ScoreJournalWithUser = {
  ScoreJournal: ScoreJournal
  User: User
}

export type BrokerageLevel = {
  Leve1: number
  Leve2: number
  Leve3: number
  Leve4: number
  Leve5: number
  Leve6: number
}
