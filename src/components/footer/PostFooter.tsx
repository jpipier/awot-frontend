import PostFooterClient from './PostFooterClient'
import { getRecentPosts } from '@/lib/posts'

export default async function PostFooter() {
  const posts = await getRecentPosts(20)

  if (!posts.length) {
    return null
  }

  return <PostFooterClient posts={posts} />
}
