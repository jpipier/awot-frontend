import http from 'node:http';
import { parse } from 'node:url';
import next from 'next';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const dev = process.env.NODE_ENV === 'development';
const hostname = process.env.HOSTNAME ?? '0.0.0.0';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        const parsedUrl = parse(req?.url ?? '', true);
        handle(req, res, parsedUrl);
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error('Failed to start Next.js server', error);
    process.exit(1);
  });
