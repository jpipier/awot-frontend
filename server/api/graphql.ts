import { createProxyHandler } from 'h3-proxy'

export default createProxyHandler({
  target: process.env.WORDPRESS_URL,
  changeOrigin: true
})