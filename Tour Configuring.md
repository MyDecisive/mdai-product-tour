# Tour Content Markup Language

## Overview

The tour content system uses a lightweight markup language to create interactive, formatted text within tour steps. This markup allows you to add inline formatting, clickable elements, and dynamic highlighting tied to simulator state.

## Basic Syntax

### Text Formatting

#### Code Blocks

Use `<code>` tags to display inline code snippets:

```yaml
text: "Run <code>helm upgrade</code> to deploy changes."
```

**Renders as:** Run `helm upgrade` to deploy changes.

#### Bold Text

Use `<bold>` tags to emphasize text:

```yaml
text: "This is <bold>important</bold> information."
```

**Renders as:** This is **important** information.

#### Emphasized Text

Use `<emphasize>` tags to highlight text in the theme color:

```yaml
text: "Pay attention to the <emphasize>filtered logs</emphasize> count."
```

**Renders as:** Pay attention to the <span style="color: #B062C2">filtered logs</span> count.

---

## Interactive Elements

Interactive elements trigger frame actions when clicked. Actions are defined in the `actions` array and referenced by index.

### Buttons

Buttons are visually distinct clickable elements styled as inline buttons.

**Syntax:** `<button:INDEX>text</button>`

```yaml
items:
  - text: "Click <button:0>line 78</button:0> to view the config."
    actions:
      - simulator: config
        type: scroll_to
        updates:
          fileName: otel_ref.yaml
          line: 78
```

### Multiple Actions

You can have multiple interactive elements in one text block:

```yaml
items:
  - text: >
      View <button:0>line 12</button:0> in the config, 
      then check the <button:1>Logs</button:1> output.
    actions:
      - simulator: config
        type: scroll_to
        updates:
          fileName: config.yaml
          line: 12
      - simulator: logs
        type: highlight
```

---

## Dynamic Highlighting

### Simulator Highlighting

Highlight text based on which simulator is currently active.

**Syntax:** `<highlight:SIMULATOR>text</highlight>`

```yaml
text: "The <highlight:terminal>Terminal</highlight:terminal> shows the command output."
```

**Available simulators:**

- `terminal`
- `config`
- `status`
- `logs`

**Behavior:**

- Text appears **bold and purple (#EA80FC)** when that simulator is active
- Normal weight and color when inactive

**Example with multiple highlights:**

```yaml
text: >
  Watch the <highlight:status>Status</highlight:status> window 
  while reviewing the <highlight:config>Config</highlight:config> file.
```

---

## Item-Level Click Handlers

Make an entire list item clickable using the `onClick` property:

```yaml
content:
  - variant: list
    items:
      - text: "Click anywhere on this item to scroll to line 100."
        onClick:
          simulator: config
          type: scroll_to
          updates:
            fileName: otel_ref.yaml
            line: 100
```

**Behavior:**

- Entire list item becomes clickable
- Hover background effect
- Pointer cursor

**Combining onClick with inline actions:**

```yaml
items:
  - text: "Click <button:0>here</button:0> or anywhere else on this item."
    onClick:
      simulator: status
      type: highlight
    actions:
      - simulator: logs
        type: highlight
```

---

## Complete Example

```yaml
content:
  - title: "Configure Log Filtering"
    variant: list
    items:
      - text: >
          In <button:0>line 78</button:0> of OTEL_REF.YAML, 
          define a rule to drop logs from <code>service4321</code>.
        actions:
          - simulator: config
            type: scroll_to
            updates:
              fileName: otel_ref.yaml
              line: 78

      - text: >
          The <highlight:status>Status</highlight:status> window confirms 
          containers started. Check the <button:0>Tail Logs</button:0> 
          to see <bold>filtered output</bold>.
        actions:
          - simulator: logs
            type: highlight

      - text: "Click this entire item to highlight the config simulator."
        onClick:
          simulator: config
          type: highlight
```

---

## Best Practices

### Markup Guidelines

1. **Use buttons for primary actions** - Scrolling to code, triggering major changes
2. **Keep button text short** - 1-3 words ideal
3. **Use code tags for all technical terms** - Commands, filenames, variable names
4. **Apply bold sparingly** - Only for critical emphasis
5. **Use emphasize to entice the user to click on a list item** - line numbers, file names, etc

### YAML Formatting

**Use literal style (`|`) for multi-line text with line breaks:**

```yaml
text: |
  This is line one.
  This is line two.
```

**Use folded style (`>`) for long single-line text:**

```yaml
text: >
  This is a long paragraph that will wrap naturally 
  and treats line breaks as spaces.
```

### Action Organization

**Order actions logically:**

```yaml
items:
  - text: "First <button:0>step one</button:0>, then <button:1>step two</button:1>."
    actions:
      -  # Action 0
      -  # Action 1
```

**Reuse actions when possible:**

```yaml
items:
  - text: "Click <button:0>here</button:0>. Or click <button:0>here</button:0> for the same action."
    actions:
      - simulator: config
        type: scroll_to
        updates:
          fileName: config.yaml
          line: 12
```

---

## Supported Frame Actions

Actions reference tour frames that control simulator behavior.

### Common Actions

**Scroll to config line:**

```yaml
simulator: config
type: scroll_to
updates:
  fileName: config.yaml
  line: 42
```

**Highlight simulator:**

```yaml
simulator: status
type: highlight
```

**Add terminal command:**

```yaml
simulator: terminal
type: enter_command
updates:
  strings:
    - "$ kubectl get pods"
```

---

## Troubleshooting

### Markup Not Rendering

**Issue:** Tags appear as plain text

- **Cause:** Syntax error in markup
- **Fix:** Verify closing tags match opening tags exactly

**Issue:** Action not triggering

- **Cause:** Action index doesn't exist in actions array
- **Fix:** Ensure `<button:INDEX>` matches an action at that index

### Styling Issues

**Issue:** Line breaks not preserved

- **Cause:** Using YAML folded style (`>`)
- **Fix:** Use literal style (`|`) for multi-line text

**Issue:** Text wrapping incorrectly

- **Cause:** CSS whitespace handling
- **Fix:** Already handled by `whiteSpace: 'pre-wrap'` in renderer

### Action Errors

**Issue:** Console warning about missing action

- **Cause:** Referenced action index doesn't exist
- **Fix:** Check actions array length matches highest index used

---

## Parser Implementation Notes

For developers extending the markup system:

**Adding new markup tags:**

1. Add regex pattern to `patterns` array in `parseAndRender`
2. Define render function for the pattern
3. Update documentation with syntax and examples

**Tag naming conventions:**

- Use lowercase for tag names
- Use underscores for multi-word names (if needed)
- Keep tag names descriptive but concise

**Action referencing:**

- Always use zero-based indexing
- Validate indices exist before rendering
- Provide helpful error messages for missing actions
