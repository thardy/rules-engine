import {Actions} from './actions.constants';

export class Action {
  name: string;
  parameters: any;

  constructor(options: {
    name?: string,
    parameters?: any,
  } = {}) {
    this.name = options.name || Actions.publishEvent;
    this.parameters = options.parameters || null;
  }
}
