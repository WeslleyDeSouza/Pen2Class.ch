# Rule Validator Usage Examples

## Basic Usage

### 1. Apply Rules to Controller Methods

```typescript
import { Controller, Delete, Patch } from '@nestjs/common';
import { Rules, RulesGuard } from '../../common/rules';

@Controller('bookmarks')
@UseGuards(RulesGuard) // Add RulesGuard to controller
export class BookmarkController {
  
  @Patch(':id')
  @Rules(['ownership', 'tenant-isolation'], 'PATCH')
  async update(@Param('id') id: string, @Body() dto: UpdateDto) {
    // Only owner can update, within same tenant
  }

  @Delete(':id')
  @Rules(['ownership', 'tenant-isolation', 'business-hours'], 'DELETE')
  async delete(@Param('id') id: string) {
    // Only owner can delete, within same tenant, during business hours
  }
}
```

### 2. Create Custom Rules

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRuleValidator } from '../validators/base-rule.validator';
import { RuleContext, RuleValidationResult } from '../interfaces/rule-validator.interface';

@Injectable()
export class CustomRuleValidator extends BaseRuleValidator {
  name = 'custom-rule';

  async validate(context: RuleContext): Promise<RuleValidationResult> {
    // Your custom validation logic here
    if (someCondition) {
      return this.success();
    }
    
    return this.failure('Custom rule failed', 'CUSTOM_ERROR');
  }
}
```

### 3. Register Custom Rules

```typescript
// In your module constructor
constructor(
  private ruleEngine: RuleEngineService,
  private customRule: CustomRuleValidator,
) {
  this.ruleEngine.addRule(this.customRule);
}
```

## Available Built-in Rules

### 1. Ownership Rule (`ownership`)
- Ensures only resource owner can modify/delete
- Applies to: DELETE, PATCH, PUT operations
- Supports: BookmarkEntity, ProjectEntity

```typescript
@Delete(':id')
@Rules(['ownership'])
async delete(@Param('id') id: string) {
  // Only the user who created this resource can delete it
}
```

### 2. Tenant Isolation Rule (`tenant-isolation`)
- Ensures resources belong to user's tenant
- Prevents cross-tenant access

```typescript
@Patch(':id')
@Rules(['tenant-isolation'])
async update(@Param('id') id: string) {
  // Resource must belong to user's tenant
}
```

### 3. Role-Based Rule (`role-based`)
- Enforces role hierarchy permissions
- Configurable action requirements

```typescript
@Delete(':id')
@Rules(['role-based'])
async delete(@Param('id') id: string) {
  // Requires manager role or above for DELETE operations
}
```

### 4. Business Hours Rule (`business-hours`)
- Restricts sensitive operations to business hours
- Monday-Friday, 9 AM - 5 PM

```typescript
@Delete(':id')
@Rules(['business-hours'])
async delete(@Param('id') id: string) {
  // Can only delete during business hours
}
```

## Advanced Usage

### 1. Combine Multiple Rules

```typescript
@Delete(':id')
@Rules(['ownership', 'tenant-isolation', 'business-hours', 'role-based'])
async delete(@Param('id') id: string) {
  // All rules must pass for operation to succeed
}
```

### 2. Conditional Rules

```typescript
@Injectable()
export class ConditionalRuleValidator extends BaseRuleValidator {
  name = 'conditional-rule';

  async validate(context: RuleContext): Promise<RuleValidationResult> {
    const { user, tenant, resource, action } = context;
    
    // Apply different logic based on conditions
    if (action === 'DELETE' && resource.isImportant) {
      if (!user.roles.includes('admin')) {
        return this.failure('Admin role required for important resources');
      }
    }
    
    return this.success();
  }
}
```

### 3. Rule with External Dependencies

```typescript
@Injectable()
export class QuotaRuleValidator extends BaseRuleValidator {
  name = 'quota-rule';

  constructor(
    private quotaService: QuotaService,
  ) {
    super();
  }

  async validate(context: RuleContext): Promise<RuleValidationResult> {
    const { user, tenant, action } = context;
    
    if (action === 'POST') {
      const quota = await this.quotaService.getUserQuota(user.userId);
      if (quota.exceeded) {
        return this.failure('User quota exceeded', 'QUOTA_EXCEEDED');
      }
    }
    
    return this.success();
  }
}
```

## Error Handling

Rules return specific error codes for better error handling:

```typescript
// Error codes from built-in rules:
- 'OWNERSHIP_VIOLATION'      // ownership rule
- 'TENANT_VIOLATION'         // tenant-isolation rule  
- 'INSUFFICIENT_ROLE'        // role-based rule
- 'NO_ROLES'                 // role-based rule
- 'OUTSIDE_BUSINESS_HOURS'   // business-hours rule
- 'OUTSIDE_BUSINESS_DAYS'    // business-hours rule
- 'RULE_NOT_FOUND'           // rule engine
- 'RULE_VALIDATION_ERROR'    // rule engine
```

## Testing Rules

```typescript
describe('OwnershipRuleValidator', () => {
  let rule: OwnershipRuleValidator;
  
  beforeEach(async () => {
    // Setup test module
  });

  it('should allow owner to delete resource', async () => {
    const context: RuleContext = {
      user: { userId: 'user1', tenantId: 'tenant1' },
      action: 'DELETE',
      params: { id: 'resource1' }
    };
    
    // Mock repository to return resource owned by user1
    jest.spyOn(bookmarkRepo, 'findOne').mockResolvedValue({
      bookmarkId: 'resource1',
      createdBy: 'user1',
      tenantId: 'tenant1'
    });
    
    const result = await rule.validate(context);
    expect(result.isValid).toBe(true);
  });
});
```