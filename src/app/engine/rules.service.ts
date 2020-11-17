import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import * as underscoreQuery from 'underscore-query';
const query = underscoreQuery(_, false);

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor() {

  }

  // facts
  // rules
  // workflow:
  //  - cycle through all rules in order
  //  - see if each rule matches the facts (isActive/isMatch?)
  //  - perform actions for rule

  isMatch(facts, rule) {
    let isMatch = false;

    const queryResult = query(facts, rule.conditions);

    return queryResult;
  }


}
