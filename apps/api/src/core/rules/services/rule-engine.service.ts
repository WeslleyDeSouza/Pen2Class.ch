import { Injectable, Logger } from '@nestjs/common';
import { IRuleEngine, IRuleValidator, RuleContext, RuleValidationResult } from '../interfaces/rule-validator.interface';

@Injectable()
export class RuleEngineService implements IRuleEngine {
  private readonly logger = new Logger(RuleEngineService.name);
  private rules: Map<string, IRuleValidator> = new Map();

  addRule(rule: IRuleValidator): void {
    this.rules.set(rule.name, rule);
    this.logger.log(`Rule registered: ${rule.name}`);
  }

  async validateRules(context: RuleContext, ruleNames?: string[]): Promise<RuleValidationResult[]> {
    const rulesToValidate = ruleNames || Array.from(this.rules.keys());
    const results: RuleValidationResult[] = [];

    if(ruleNames.length && rulesToValidate.length === 0){
      console.warn('No rules to validate',ruleNames)
    }

    for (const ruleName of rulesToValidate) {
      const rule = this.rules.get(ruleName);
      if (!rule) {
        this.logger.warn(`Rule not found: ${ruleName}`);
        results.push({
          isValid: false,
          errorMessage: `Rule '${ruleName}' not found`,
          errorCode: 'RULE_NOT_FOUND'
        });
        continue;
      }

      try {
        const result = await rule.validate(context);
        results.push(result);
        
        if (!result.isValid) {
          this.logger.debug(`Rule validation failed: ${ruleName} - ${result.errorMessage}`);
        }
      } catch (error) {
        this.logger.error(`Rule validation error: ${ruleName}`, error);
        results.push({
          isValid: false,
          errorMessage: `Rule validation error: ${error.message}`,
          errorCode: 'RULE_VALIDATION_ERROR'
        });
      }
    }

    return results;
  }

  async validateAllRules(context: RuleContext): Promise<RuleValidationResult[]> {
    return this.validateRules(context);
  }

  getRegisteredRules(): string[] {
    return Array.from(this.rules.keys());
  }

  getRuleByName(name: string): IRuleValidator | undefined {
    return this.rules.get(name);
  }
}