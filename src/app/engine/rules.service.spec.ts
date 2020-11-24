import { TestBed } from '@angular/core/testing';

import { RulesService } from './rules.service';
import {Action} from './action.model';
import {Actions} from './actions.constants';
import * as _ from 'lodash-es';

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
    tShirtStyle: null
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
      const isMatch = service.isMatch([productFacts[2]], rule);

      // assert
      expect(isMatch).toBeTruthy();
    });
  });

  describe('getMatchingRules', () => {
    it('can match multiple conditions against an array property', async () => {
      // setup
      const expectedRuleName = "Hypothyroidism & Dementia";
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
            $and: [
              {
                medications: {
                  $elemMatch: { diagnosis: "Hypothyroidism" }
                }
              },
              {
                medications: {
                  $elemMatch: { diagnosis: "Dementia" }
                }
              },
            ]
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
  });

  describe('executeAction', () => {
    it('can alterMedicationDx', async () => {
      // setup
      const newValue = 'F0280';
      const action = new Action({
        action: Actions.alterMedicationDx,
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
        action: Actions.alterFormItemVisibility,
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

});

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
