import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  constructor() { }

  publishEvent(facts, {name, payload}) {
    // todo: need to only edit the facts that matched
    facts[0].someProperty = name;
    console.log(`publishEvent called with name=${name} and payload=${payload}`);
  }

  alterMedicationDx(facts, {lookupKey, lookupValue, newValue}) {
    const medication = facts.medications.find((med) => med[lookupKey] === lookupValue)
    medication.dx = newValue;
  }

  alterFormItemVisibility(facts, {formItemLevel, shortName, newVisibilityValue}) {
    for (const pageGroup of facts.layout.pageGroups) {
      if (formItemLevel === 'pageGroup') {
        if (pageGroup.shortName === shortName) {
          pageGroup.visible = newVisibilityValue;
        }
      }
      else {
        for (const page of pageGroup.pages) {
          if (formItemLevel === 'page') {
            if (page.shortName === shortName) {
              page.visible = newVisibilityValue;
            }
          }
          else {
            for (const section of page.sections) {
              if (formItemLevel === 'section') {
                if (section.shortName === shortName) {
                  section.visible = newVisibilityValue;
                }
              }
              else {
                for (const question of section.questions) {
                  if (formItemLevel === 'question') {
                    if (question.shortName === shortName) {
                      question.visible = newVisibilityValue;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

}
