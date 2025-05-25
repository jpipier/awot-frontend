import { d as defineEventHandler, u as useRuntimeConfig, g as getMethod, s as setHeader, a as getHeader } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const wpSession = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const wpUrl = config.public.wordpressUrl;
  if (getMethod(event) === "OPTIONS") {
    setHeader(event, "Access-Control-Allow-Origin", "http://frontend.awot.local:3000");
    setHeader(event, "Access-Control-Allow-Credentials", "true");
    setHeader(event, "Access-Control-Allow-Headers", "Authorization, Content-Type, Cookie");
    setHeader(event, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    return "";
  }
  setHeader(event, "Access-Control-Allow-Origin", "http://frontend.awot.local:3000");
  setHeader(event, "Access-Control-Allow-Credentials", "true");
  const cookie = getHeader(event, "cookie");
  if (!cookie) return { loggedIn: false };
  try {
    const res = await $fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        cookie
      },
      credentials: "include"
    });
    return {
      loggedIn: true,
      user: {
        id: res.id,
        name: res.name,
        roles: res.roles
      }
    };
  } catch (err) {
    return { loggedIn: false };
  }
});

export { wpSession as default };
//# sourceMappingURL=wp-session.mjs.map
