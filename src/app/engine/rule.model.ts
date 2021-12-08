import {Action} from './action.model';

export class Rule {
  name: string;
  conditions: any;
  actions: Action[];

  constructor(options: {
    name?: string,
    conditions?: any,
    actions?: Action[]
  } = {}) {
    this.name = options.name;
    this.conditions = options.conditions || [];
    this.actions = options.actions || [];
  }
}

