export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const wpUrl = config.public.wordpressUrl

  // 1. Gérer les requêtes OPTIONS (préflight)
  if (getMethod(event) === 'OPTIONS') {
    setHeader(event, 'Access-Control-Allow-Origin', 'http://frontend.awot.local:3000')
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type, Cookie')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return ''
  }

  // 2. Ajoute les headers CORS sur toutes les requêtes REST
  setHeader(event, 'Access-Control-Allow-Origin', 'http://frontend.awot.local:3000')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // 3. Récupère les cookies envoyés
  const cookie = getHeader(event, 'cookie')
  if (!cookie) return { loggedIn: false }

  // 4. Requête vers l’API WP pour vérifier l'utilisateur
  try {
    const res = await $fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        cookie,
      },
      credentials: 'include'
    })

    return {
      loggedIn: true,
      user: {
        id: res.id,
        name: res.name,
        roles: res.roles,
      }
    }
  } catch (err) {
    return { loggedIn: false }
  }
})