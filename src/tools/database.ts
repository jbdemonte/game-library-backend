import mongoose, { Mongoose } from 'mongoose';

// mongoose.set('debug', true);

let instance: Mongoose | undefined;

type Config = {
  host: string;
  port: string;
  name: string;
}

async function connect(config: Config): Promise<Mongoose> {
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
