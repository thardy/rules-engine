import { TestBed } from '@angular/core/testing';

import { RulesService } from './rules.service';

describe('RulesService', () => {
  let service: RulesService;
  const productFacts = [
    { name: "Widget", quantity: 32, price: 19.99 },
    { name: "Doohicky", quantity: 900, price: 9.99 },
    { name: "Thingamajig", quantity: 80, price: 45.95 },
  ];


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isMatch', () => {
    it('should return the results for conditions that match the facts', async () => {
      // setup
      const rule = {
        conditions: {
          quantity: {$gt:50}
        }
      }

      // act
      const results = service.isMatch(productFacts, rule);

      // assert
      expect(results).toBeTruthy();
      expect(results.length).toEqual(2);
      expect(results.find((item) => item.name === 'Doohicky')).toBeTruthy();
      expect(results.find((item) => item.name === 'Thingamajig')).toBeTruthy();
    });

    it('can match conditions when facts contain a single document', async () => {
      // setup
      const rule = {
        conditions: {
          quantity: {$gt:50}
        }
      }

      // act
      const results = service.isMatch([productFacts[2]], rule);

      // assert
      expect(results).toBeTruthy();
      expect(results.length).toEqual(1);
      expect(results.find((item) => item.name === 'Thingamajig')).toBeTruthy();
    });
  });



});
