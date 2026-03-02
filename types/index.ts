export interface IPProfile {
  id: string
  name: string
  description?: string
  persona: string
  style: string
  topics: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Content {
  id: string
  title: string
  category: string
  type: string
  content: string
  transcript?: string
  tags: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Creation {
  id: string
  sourceIds: string[]
  prompt: string
  result: string
  type: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export type ContentCategory = '职场' | '家庭' | '生活' | '学习' | '其他'
export type ContentType = '视频' | '文章' | '笔记' | '想法'
export type CreationType = '二创' | '优化' | '扩写' | '改写'
export type CreationStatus = '草稿' | '已发布' | '已归档'
