import { SetMetadata } from '@nestjs/common';
import { RuleMetadata } from '../interfaces/rule-validator.interface';

export const RULES_KEY = 'rules';

export const Rules = (rules: string[], action?: string): MethodDecorator => {
  const metadata: RuleMetadata = { rules, action };
  return SetMetadata(RULES_KEY, metadata);
};