import { Injectable } from '@nestjs/common';
import { IRuleValidator, RuleContext, RuleValidationResult } from '../interfaces/rule-validator.interface';

@Injectable()
export abstract class BaseRuleValidator implements IRuleValidator {
  abstract name: string;
  
  abstract validate(context: RuleContext): Promise<RuleValidationResult>;

  protected success(): RuleValidationResult {
    return { isValid: true };
  }

  protected failure(errorMessage: string, errorCode?: string): RuleValidationResult {
    return {
      isValid: false,
      errorMessage,
      errorCode,
    };
  }
}