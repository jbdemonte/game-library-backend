import mongoose, { Mongoose } from 'mongoose';

// mongoose.set('debug', true);

let instance: Mongoose | undefined;

async function connect(): Promise<Mongoose> {
  if (!instance) {
    instance = await mongoose.connect(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`);
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
