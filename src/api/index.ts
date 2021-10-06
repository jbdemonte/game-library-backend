import express from 'express';
import { router as systems } from './systems';
import { getServerConfig } from '../config';

const config = getServerConfig();

const app = express();

app.use('/systems', systems);

export function startAPI() {
  app.listen(config.PORT, config.HOSTNAME, () => {
    console.log(`listening on ${config.HOSTNAME}:${config.PORT}`);
  });
}
