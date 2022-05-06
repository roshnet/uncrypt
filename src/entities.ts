export type FileRecord = {
  _id: string
  path: string
  op: 'enc' | 'dec'
  createdAt: Date
  updateAt: Date
}
