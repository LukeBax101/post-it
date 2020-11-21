import { api } from './api';
import { socketio } from './socketio';

export const actions = {
  ...api,
  ...socketio,
};
