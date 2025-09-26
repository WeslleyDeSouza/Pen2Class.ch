import {Global, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleEngineService } from './services/rule-engine.service';
import { RulesGuard } from './guards/rules.guard';
import { BaseRuleValidator } from './validators';

@Module({
  imports: [],
  providers: [
    RuleEngineService,
    RulesGuard,
  ],
  exports: [
    RuleEngineService,
    RulesGuard,
  ],
})
export class RulesModule {
  constructor() {}
}
