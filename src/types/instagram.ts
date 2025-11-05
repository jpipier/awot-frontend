export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | (string & {})

export interface InstagramPost {
  id: string
  media_type: InstagramMediaType
  media_url: string
  permalink: string
  caption?: string | null
  thumbnail_url?: string | null
  timestamp?: string | null
  username?: string | null
  children?: {
    data?: Array<{
      id: string
      media_type: InstagramMediaType
      media_url: string
      thumbnail_url?: string | null
    }>
  }
}

export interface InstagramApiError {
  message?: string
  code?: number
  type?: string
  error_subcode?: number
}

export interface InstagramApiResponse {
  data?: InstagramPost[]
  error?: InstagramApiError
}

export interface InstagramPagingCursors {
  before?: string
  after?: string
}

export interface InstagramPaging {
  cursors?: InstagramPagingCursors
  next?: string
  previous?: string
}

export interface InstagramPaginatedResponse extends InstagramApiResponse {
  paging?: InstagramPaging
}
