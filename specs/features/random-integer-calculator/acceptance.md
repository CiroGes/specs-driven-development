# Acceptance: random-integer-calculator

## Criteria to Test Mapping

1. Feature generates exactly two random integers per run
- Covered by: (unit tests – placeholder: `tests/unit/random-integer-calculator.service.test.ts` or equivalent)

2. Sum of both integers is correct
- Covered by: (unit tests – same as above)

3. Output is a single line showing both operands and result (e.g. `X + Y = Z`)
- Covered by: (integration/feature tests – placeholder: `tests/integration/random-integer-calculator.test.ts` or equivalent)

4. Integer range is documented and respected
- Covered by: (unit tests + spec)

## Manual Verification
- Run feature entrypoint and confirm one line of output with two numbers and their sum.
- (After implementation: document exact command, e.g. `npm run random-calc` or node script path.)
