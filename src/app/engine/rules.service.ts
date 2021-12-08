import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import * as underscoreQuery from 'underscore-query';
import {Action} from './action.model';
import {Actions} from './actions.constants';
import {Rule} from './rule.model';
import {ActionService} from './action.service';
const query = underscoreQuery(_, false);

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor(private actionService: ActionService) {

  }

  // facts
  // rules
  // workflow:
  //  - cycle through all rules in order
  //  - see if each rule matches the facts (isActive/isMatch?)
  //  - perform actions for rule

  runRules(rules: Rule[], facts: any) {
    const matchedRules = this.getMatchingRules(facts, rules);
    this.executeMatchedRules(facts, matchedRules);
  }

  runQuery(facts, rule) {
    let isMatch = false;

    const queryResult = query(facts, rule.conditions);

    return queryResult && queryResult.length > 0;
    //return queryResult;
  }


  getMatchingRules(facts: any, rules) {
    const matchingRules = [];
    let queryResults = [];

    rules.forEach((rule) => {
      const isMatch = this.runQuery(facts, rule);
      if (isMatch) {
        //queryResults.push(queryResult);
        matchingRules.push(rule);
      }
    });


    // todo: need a way to tie the queryResults to the matchedRule.  I'm hesitant because these queryResults could be large,
    //  and I don't want to just add them to each rule.  In the case of the EvaluationAnswers, basically the entire result either
    //  matches or it doesn't.  It could be bad to add that entire object to every rule that matches.  I'd at least like a way to
    //  simply point to the results that came back in the query without replicating them.
    //  UPDATE: I'm abandoning this idea.  Actions need to be completely independent.  Returning data that can be mutated by lots of
    //  different actions carries its own set of very undesirable possibilities.
    return matchingRules;
  }

  executeMatchedRules(facts: any, matchedRules) {
    const sortedRules = _.sortBy(matchedRules, ['priority']);

    sortedRules.forEach((rule) => {
      // execute all the actions for this rule
      rule.actions.forEach((action) => {
        this.executeAction(action, facts);
      })
    });
  }

  executeAction(action: Action, facts: any) {
    // {
    //   hasOddBehavior: true,
    //     name: "Joe Smith",
    //   medications: [
    //   { name: "Super Drug", diagnosis: "Hypothyroidism", dx: null },
    //   { name: "Advil", diagnosis: "Weirdness", dx: null },
    //   { name: "Super Drug2", diagnosis: "Dementia", dx: null },
    // ]
    // }
    const parameters = action.parameters;

    const functionToExecute = this.actionService[action.name];
    if (functionToExecute && typeof functionToExecute === 'function') {
      functionToExecute.call(null, facts, parameters);
    }

    // switch (action.name) {
    //   case Actions.alterMedicationDx:
    //     this.actionService.alterMedicationDx(facts, parameters);
    //     break;
    //   case Actions.alterFormItemVisibility:
    //     this.actionService.alterFormItemVisibility(facts, parameters);
    //     break;
    // }
  }


}
