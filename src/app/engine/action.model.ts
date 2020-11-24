import {Actions} from './actions.constants';

export class Action {
  action: string;
  parameters: any;

  constructor(options: {
    action?: string,
    parameters?: any,
  } = {}) {
    this.action = options.action || Actions.publishEvent;
    this.parameters = options.parameters || null;
  }
}
