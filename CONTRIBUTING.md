# Contributing to Kitab

## Reporting issues

- **Bug report**: describe what you expected vs what happened, steps to reproduce and your operating system.
- **Feature request**: explain the feature and make a pull request.

## Coding style

- Follow the existing code style (PEP 8, no type hints enforced).
- Add comments for ambiguous logic using `# what?`:
  ```python
  # what — why is this divided by 25.4?
  ```
- Use descriptive variable names (not `x`, `y`, `temporary`) with snake case
  ```python
  this_is_a_variable_with_multiple_words = True
  ```

