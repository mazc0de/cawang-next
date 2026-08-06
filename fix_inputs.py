import re
import os

def process_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# 1. AccountFormDialog
process_file('src/components/accounts/AccountFormDialog.tsx', [
    ("import { useForm } from 'react-hook-form'", "import { useForm, Controller } from 'react-hook-form'\nimport { NumericFormat } from 'react-number-format'"),
    ("const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm", "const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm"),
    ("""<Input
                  id="input-opening-balance"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="pl-9"
                  {...register('opening_balance')}
                />""", """<Controller
                  name="opening_balance"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      id="input-opening-balance"
                      customInput={Input}
                      className="pl-9"
                      placeholder="0"
                      thousandSeparator="."
                      decimalSeparator=","
                      value={field.value ? field.value : ''}
                      onValueChange={(values) => field.onChange(values.floatValue || 0)}
                      onBlur={field.onBlur}
                      min={0}
                    />
                  )}
                />""")
])

# 2. ReconciliationDialog
process_file('src/components/accounts/ReconciliationDialog.tsx', [
    ("import { useForm } from 'react-hook-form'", "import { useForm, Controller } from 'react-hook-form'\nimport { NumericFormat } from 'react-number-format'"),
    ("const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ReconciliationFormData>", "const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<ReconciliationFormData>"),
    ("""<Input
                id="input-actual-balance"
                type="number"
                min={0}
                placeholder="0"
                className="pl-9"
                {...register('actual_balance')}
              />""", """<Controller
                name="actual_balance"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    id="input-actual-balance"
                    customInput={Input}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    value={field.value ? field.value : ''}
                    onValueChange={(values) => field.onChange(values.floatValue || 0)}
                    onBlur={field.onBlur}
                    min={0}
                  />
                )}
              />""")
])

# 3. TransactionFormDialog
process_file('src/components/transactions/TransactionFormDialog.tsx', [
    ("import { useForm } from 'react-hook-form'", "import { useForm, Controller } from 'react-hook-form'\nimport { NumericFormat } from 'react-number-format'"),
    ("const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TransactionFormData>", "const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<TransactionFormData>"),
    ("""<Input
                id="input-amount"
                type="number"
                min={0}
                placeholder="0"
                className="pl-9"
                {...register('amount', { valueAsNumber: true })}
              />""", """<Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    id="input-amount"
                    customInput={Input}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    value={field.value ? field.value : ''}
                    onValueChange={(values) => field.onChange(values.floatValue || 0)}
                    onBlur={field.onBlur}
                    min={0}
                  />
                )}
              />""")
])

# 4. BudgetPage
process_file('src/views/BudgetPage.tsx', [
    ("import { Input } from '@/components/ui/input'", "import { Input } from '@/components/ui/input'\nimport { NumericFormat } from 'react-number-format'"),
    ("""<Input id="budget-amount" type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="pl-9" min={1} placeholder="0" />""", """<NumericFormat
                    id="budget-amount"
                    customInput={Input}
                    value={formAmount ? formAmount : ''}
                    onValueChange={(values) => setFormAmount(values.floatValue || 0)}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={1}
                  />"""),
    ("""<Input id="wizard-income" type="number" placeholder="0" value={wizardIncome} onChange={e => setWizardIncome(e.target.value)} className="pl-9" min={0} />""", """<NumericFormat
                    id="wizard-income"
                    customInput={Input}
                    value={wizardIncome ? wizardIncome : ''}
                    onValueChange={(values) => setWizardIncome(values.floatValue || 0)}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                  />""")
])

# 5. RecurringPage
process_file('src/views/RecurringPage.tsx', [
    ("import { Input } from '@/components/ui/input'", "import { Input } from '@/components/ui/input'\nimport { NumericFormat } from 'react-number-format'"),
    ("""<Input id="rule-amount" type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} className="pl-9" min={1} placeholder="0" />""", """<NumericFormat
                    id="rule-amount"
                    customInput={Input}
                    value={formAmount ? formAmount : ''}
                    onValueChange={(values) => setFormAmount(values.floatValue || 0)}
                    className="pl-9"
                    placeholder="0"
                    thousandSeparator="."
                    decimalSeparator=","
                    min={1}
                  />""")
])

print("Replaced all number inputs!")
