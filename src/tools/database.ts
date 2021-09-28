import mongoose, { Mongoose } from 'mongoose';
import { getDatabaseConfig } from '../config';

const config = getDatabaseConfig();

if (config.debug) {
  mongoose.set('debug', true);
}

let instance: Mongoose | undefined;


async function connect(): Promise<Mongoose> {
  if (!instance) {
    instance = await mongoose.connect(`mongodb://${config.host}:${config.port}/${config.name}`);
  }
  return instance;
}

async function disconnect(): Promise<void> {
  if (instance) {
    await instance.disconnect();
    instance = undefined;
  }
}

export const database = {
  connect,
  disconnect
}
