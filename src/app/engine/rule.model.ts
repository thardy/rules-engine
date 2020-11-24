export class Rule {
  conditions: any;
  actions: any[];

  constructor(options: {
    conditions?: any[]
  } = {}) {
    this.conditions = options.conditions || [];
  }
}

