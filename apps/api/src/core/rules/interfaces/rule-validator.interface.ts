import { ExecutionContext } from '@nestjs/common';

export interface RuleContext {
  user: {
    userId: string;
    tenantId: string;
    roles?: string[];
  };
  tenant?:{
    tenantId: string;
  }
  resource?: any;
  action: string;
  key?: string;
  params?: Record<string, any>;
  body?: any;
}

export interface RuleValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorCode?: string;
}

export interface IRuleValidator {
  name: string;
  validate(context: RuleContext): Promise<RuleValidationResult>;
}

export interface IRuleEngine {
  addRule(rule: IRuleValidator): void;
  validateRules(context: RuleContext, ruleNames?: string[]): Promise<RuleValidationResult[]>;
  validateAllRules(context: RuleContext): Promise<RuleValidationResult[]>;
}

export interface RuleMetadata {
  rules: string[];
  action?: string;
}