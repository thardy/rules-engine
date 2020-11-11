import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor() { }

  // facts
  // rules
  // workflow:
  //  - cycle through all rules in order
  //  - see if each rule matches the facts (isActive/isMatch?)
  //  - perform actions for rule
}
