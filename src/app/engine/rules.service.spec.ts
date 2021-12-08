import { TestBed } from '@angular/core/testing';

import { RulesService } from './rules.service';
import {Action} from './action.model';
import {Actions} from './actions.constants';
import * as _ from 'lodash-es';
import {Rule} from './rule.model';

describe('RulesService', () => {
  let service: RulesService;
  const productFacts = [
    { name: "Widget", quantity: 32, price: 19.99 },
    { name: "Doohicky", quantity: 900, price: 9.99 },
    { name: "Thingamajig", quantity: 80, price: 45.95 },
  ];

  const evalAnswers = {
    name: "Joe Smith",
    hasDiabetes: true,
    medications: [
      { name: "Super Drug", diagnosis: "Hypothyroidism", dx: null },
      { name: "Advil", diagnosis: "Weirdness", dx: null },
      { name: "Super Drug2", diagnosis: "Dementia", dx: null },
    ]
  };

  const merchAnswers = {
    name: "Steve Rogers",
    doYouWantATShirt: true,
    tShirtSize: null,
    tShirtColor: null,
    tShirtStyle: null,
    someProperty: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isMatch', () => {
    // it('should return the results for conditions that match the facts', async () => {
    //   // setup
    //   const rule = {
    //     conditions: {
    //       quantity: {$gt:50}
    //     }
    //   }
    //
    //   // act
    //   const results = service.isMatch(productFacts, rule);
    //
    //   // assert
    //   expect(results).toBeTruthy();
    //   expect(results.length).toEqual(2);
    //   expect(results.find((item) => item.name === 'Doohicky')).toBeTruthy();
    //   expect(results.find((item) => item.name === 'Thingamajig')).toBeTruthy();
    // });

    it('can match conditions when facts contain a single document', async () => {
      // setup
      const rule = {
        conditions: {
          quantity: {$gt:50}
        }
      }

      // act
      const isMatch = service.runQuery([productFacts[2]], rule);

      // assert
      expect(isMatch).toBeTruthy();
    });
  });

  describe('getMatchingRules', () => {
    it('can match multiple conditions against an array property', async () => {
      // setup
      const expectedRuleName = "Hypothyroidism & Dementia";
      const arrayOfRequiredDxs = ["Hypothyroidism", "Dementia"]
      // we want to match only if there is a medication with diagnosis = "Hypothyroidism", AND there is a medication with diagnosis = "Dementia"
      const rules = [
        {
          name: "test rule 1",
          conditions: {
            name: "Jane Doe"
          }
        },
        {
          name: expectedRuleName,
          conditions: {
            "medications.diagnosis": { "$all": arrayOfRequiredDxs }
            // $and: [
            //   {
            //     medications: {
            //       $elemMatch: { diagnosis: "Hypothyroidism" }
            //     }
            //   },
            //   {
            //     medications: {
            //       $elemMatch: { diagnosis: "Dementia" }
            //     }
            //   },
            // ]
          }
        },
        {
          name: "test rule 2",
          conditions: {
            name: "Ninja Monkey"
          }
        }
      ];

      // act
      const matchingRules = service.getMatchingRules([evalAnswers], rules);

      // assert
      expect(matchingRules).toBeTruthy();
      expect(matchingRules.length).toEqual(1);
      expect(matchingRules.find((item) => item.name === expectedRuleName)).toBeTruthy();
    });

    it('can use a callback in the query to do whatever the heck we want', async () => {
      // setup
      const expectedRuleName = "simple callback test";

      const rules = [
        {
          name: expectedRuleName,
          conditions: {
            events: {
              $cb: (events) => {
                const trashTakenOutWithExtremePrejudice = events.filter((event) => {
                  return event.name === 'trashTakenOut' && event.payload.disposition === "with extreme prejudice";
                })
                return trashTakenOutWithExtremePrejudice.length >= 1;
              }
            }
          }
        }
      ];

      // act
      const matchingRules = service.getMatchingRules([state], rules);

      // assert
      expect(matchingRules).toBeTruthy();
      expect(matchingRules.length).toEqual(1);
      expect(matchingRules.find((item) => item.name === expectedRuleName)).toBeTruthy();
    });

    // https://stackoverflow.com/questions/28153179/match-at-least-n-elements-of-an-array-to-a-list-of-conditions
    it('can count multiple conditions against an array property', async () => {
      // setup
      const expectedRuleName = "navigation requirement one";
      const approvedLocations = [1001, 1002, 1003, 1004, 1005];
      // we are using a callback to test if the user navigated to at least 3 out of the 5 approved locations
      const rules = [
        {
          name: expectedRuleName,
          conditions: {
            events: {
              $cb: (events) => {
                const pageNavigationsToAnApprovedLocation = events.filter((event) => {
                  let match = false;
                  if (event.name === 'pageNavigated' && event.payload && event.payload.contextId) {
                    match = approvedLocations.includes(event.payload.contextId);
                  }
                  return match;
                });
                return pageNavigationsToAnApprovedLocation.length >= 3;
              }
            }
          }
        }
      ];

      // act
      const matchingRules = service.getMatchingRules([state], rules);

      // assert
      expect(matchingRules).toBeTruthy();
      expect(matchingRules.length).toEqual(1);
      expect(matchingRules.find((item) => item.name === expectedRuleName)).toBeTruthy();
    });

  });



  describe('executeAction', () => {
    it('can alterMedicationDx', async () => {
      // setup
      const newValue = 'F0280';
      const action = new Action({
        name: Actions.alterMedicationDx,
        parameters: {
          lookupKey: 'diagnosis',
          lookupValue: 'Dementia',
          newValue: newValue
        }
      });
      const facts = _.cloneDeep(evalAnswers);

      // act
      service.executeAction(action, facts);

      // assert
      const dementiaMedicationFact = facts.medications.find((med) => med.diagnosis === 'Dementia');
      expect(dementiaMedicationFact.dx).toEqual(newValue);
    });

    it('can makeQuestionVisible', async () => {
      // setup
      const action = new Action({
        name: Actions.alterFormItemVisibility,
        parameters: {
          formItemLevel: 'section',
          shortName: 'tShirtChoices',
          newVisibilityValue: true
        }
      });
      const facts = _.cloneDeep({ answers: merchAnswers, layout: merchLayout });

      // act
      service.executeAction(action, facts);

      // assert
      const tShirtChoicesSection = facts.layout['pageGroups'][0]['pages'][0]['sections'][1];
      expect(tShirtChoicesSection.visible).toEqual(true);
    });
  });

  describe('runRules', () => {
    it('can execute actions for matched rules', async () => {
      // setup
      const rules = [
        new Rule({
          name: 'rule1',
          conditions: {
            name: 'Steve Rogers'
          },
          actions: [
            new Action({
              name: Actions.publishEvent,
              parameters: {
                name: 'contactCaptainAmerica',
                payload: {
                  theNumber: 122
                }
              }
            }),
            new Action({
              name: Actions.publishEvent,
              parameters: {
                name: 'doSomethingElse',
                payload: {
                  theString: 'cheese'
                }
              }
            })
          ]
        }),

      ];

      const facts = [_.cloneDeep(merchAnswers)];

      // act
      service.runRules(rules, facts);

      // assert
      expect(facts[0].someProperty).toEqual('doSomethingElse');
    });
  });

});

const state = {
  "events": [
    {
      "id": 100,
      "name": "pageNavigated",
      "payload": {
        "contextId": 1001
      },
    },
    {
      "id": 101,
      "name": "pageNavigated",
      "payload": {
        "contextId": 1003
      },
    },
    {
      "id": 102,
      "name": "pageNavigated",
      "payload": {
        "contextId": 1004
      },
    },
    {
      "id": 103,
      "name": "trashTakenOut",
      "payload": {
        "disposition": "with extreme prejudice"
      }
    }
  ]
};

const merchLayout = {
  "pageGroups": [
    {
      "shortName": "aNewPageGroup",
      "title": "A New Page Group",
      "somePageGroupProperty": "someValue",
      "pages": [
        {
          "shortName": "pageOne",
          "title": "Exam Information",
          "somePageProperty": "someValue",
          "sections": [
            {
              "shortName": "sectionOne",
              "title": "Section One",
              "someSectionProperty": "someValue",
              "questions": {
                "doYouWantATShirt": {
                  "wiki": "my wiki"
                }
              }
            },
            {
              "shortName": "tShirtChoices",
              "title": "T-Shirt Choices",
              "visible": false,
              "someSectionProperty": "someValue",
              "questions": {
                "tShirtSize": {},
                "tShirtColor": {},
                "tShirtStyle": {}
              }
            }
          ]
        }
      ]
    }
  ]
};


// this one did not work
// {
//   name: expectedRuleName,
//     conditions: {
//   medications: {
//     $all: [
//       {$elemMatch: { diagnosis: "Hypothyroidism" }},
//       {$elemMatch: { diagnosis: "Dementia" }},
//     ]
//   }
// }
// },

// this one worked!!!
// {
//   name: expectedRuleName,
//     conditions: {
//   $and: [
//     {
//       medications: {
//         $elemMatch: { diagnosis: "Hypothyroidism" }
//       }
//     },
//     {
//       medications: {
//         $elemMatch: { diagnosis: "Dementia" }
//       }
//     },
//   ]
// }
// },
