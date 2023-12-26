export interface AdminLoginInfo {
  Account: string
  PassWord: string
}

export interface Admin {
  Account: string
  PassWord: string
  Name: string
  Phone: string
  Role: string
  Initiator: boolean
  LastLoginAt: string
}
