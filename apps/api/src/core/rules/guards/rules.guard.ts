import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RuleEngineService } from '../services/rule-engine.service';
import { RULES_KEY } from '../decorators/rules.decorator';
import { RuleContext, RuleMetadata } from '../interfaces/rule-validator.interface';

@Injectable()
export class RulesGuard implements CanActivate {
  private readonly logger = new Logger(RulesGuard.name);

  constructor(
    private reflector: Reflector,
    private ruleEngine: RuleEngineService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ruleMetadata = this.reflector.getAllAndOverride<RuleMetadata>(RULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ruleMetadata || !ruleMetadata.rules.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const ruleContext: RuleContext = {
      user: {
        userId: user.userId || user.id,
        tenantId: tenantId,
        roles: user.roles,
      },
      action: ruleMetadata.action || request.method,
      params: request.params,
      body: request.body,
    };

    const results = await this.ruleEngine.validateRules(ruleContext, ruleMetadata.rules);
    
    const failedRules = results.filter(result => !result.isValid);
    
    if (failedRules.length > 0) {
      const errorMessages = failedRules.map(rule => rule.errorMessage).join('; ');
      this.logger.debug(`Rule validation failed: ${errorMessages}`);
      throw new ForbiddenException(failedRules[0].errorMessage || 'Access denied');
    }

    return true;
  }
}