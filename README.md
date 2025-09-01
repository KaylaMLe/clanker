- gpt-4o for its sycophantness
- variety of tasks

1. do the tasks
2. interpret results

   - different failure rates on "hope"

3. decide to continue or end
   - tool calling

# DB

- full conversation
  - task category
    - e.g., simulated household chores -> Household, writing marketing posts -> Creative Writing
    - maybe more specific titles for now?
  - convo history
    - should include instructions for tasks it must attempt
      - for now, text generation only
  - convo length
  - failure rate
- all conversations
- (in memory) current convo understanding
  - should only be able to access convo history and length
  - model can navigate convo history and "remember" specific parts, like a file cabinet
    - for now, just a "notepad" with important convo details
      - the following more complex system really isn't necessary unless conversations go on for very long and exceed model context limits
    - tree-like structure branching into increased specificity
    - "do you remember how [x thing] i mentioned earlier does [y]?"
    - [x thing] -> note in summary with specific convo indexes
    - convo indexes -> specific turns from convo history
    - specific turns -> extra dev prompt in convo
