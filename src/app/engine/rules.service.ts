import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import * as underscoreQuery from 'underscore-query';
import {Action} from './action.model';
import {Actions} from './actions.constants';
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

    return queryResult && queryResult.length > 0;
  }


  getMatchingRules(facts: any, rules) {
    const matchingRules = [];
    //const queryResults = [];

    rules.forEach((rule) => {
      const isMatch = this.isMatch(facts, rule);
      if (isMatch) {
        //queryResults.push(queryResult);
        matchingRules.push(rule);
      }
    });

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

    switch (action.action) {
      case Actions.alterMedicationDx:
        const medication = facts.medications.find((med) => med[parameters.lookupKey] === parameters.lookupValue)
        medication.dx = parameters.newValue;
        break;
      case Actions.alterFormItemVisibility:
        // todo: refactor
        for (const pageGroup of facts.layout.pageGroups) {
          if (parameters.formItemLevel === 'pageGroup') {
            if (pageGroup.shortName === parameters.shortName) {
              pageGroup.visible = parameters.newVisibilityValue;
            }
          }
          else {
            for (const page of pageGroup.pages) {
              if (parameters.formItemLevel === 'page') {
                if (page.shortName === parameters.shortName) {
                  page.visible = parameters.newVisibilityValue;
                }
              }
              else {
                for (const section of page.sections) {
                  if (parameters.formItemLevel === 'section') {
                    if (section.shortName === parameters.shortName) {
                      section.visible = parameters.newVisibilityValue;
                    }
                  }
                  else {
                    for (const question of section.questions) {
                      if (parameters.formItemLevel === 'question') {
                        if (question.shortName === parameters.shortName) {
                          question.visible = parameters.newVisibilityValue;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        break;
    }
  }
}
