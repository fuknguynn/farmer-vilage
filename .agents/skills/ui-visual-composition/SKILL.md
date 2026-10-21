Title: Live Content

Description: Fetched live

Source: https://raw.githubusercontent.com/hueyexe/frontend-agent-skills/main/ui-visual-composition/SKILL.md

---

---
name: ui-visual-composition
description: "Use when creating, critiquing, or refining visual UI, including hierarchy, spacing, typography, color, depth, imagery, or visual states."
license: MIT
metadata:
  author: hueyexe
---

# UI Visual Composition

## Purpose

Help an AI agent create and critique polished visual UI through hierarchy, spacing, typography, color, depth, imagery, and finishing details. Treat visual design as functional communication: the interface should help users understand what matters, what belongs together, what can be acted on, and what has changed.

This skill covers visual design quality, layout composition, typography, color systems, depth, imagery, polish, accessibility, and frontend implementation choices that affect visual quality. It does not cover deep UX research, information architecture strategy, or frontend architecture except where those concerns determine visual composition.

## When to use this skill

Use this skill when the user asks for UI critique, redesign, product-page improvement, frontend visual implementation, design-system guidance, style polish, layout refinement, typography, color palette, empty/error/loading state improvement, or visual QA of generated UI.

Also use it when producing frontend code for a visual interface, because component structure, semantic markup, tokens, state styling, responsive behavior, and accessibility details determine whether visual recommendations survive implementation.

## When not to use this skill

Do not use this skill as the primary framework when the user is asking mainly for user research planning, product strategy, market positioning, analytics instrumentation, backend/frontend architecture, performance engineering, copywriting without visual presentation, or detailed interaction flow design. Use it only for the visual-design portions of those tasks.

Do not use it to justify arbitrary decoration. If a visual suggestion does not improve hierarchy, comprehension, perceived quality, accessibility, or fit with product context, remove it.

## Core principles

1. **Start with the feature, not the shell.** Identify the concrete user task and content before designing navigation chrome, page framing, or decorative treatments.
2. **Hierarchy is the backbone.** Make the most important content and actions easiest to notice. Use size, weight, contrast, spacing, placement, and order before relying on color or ornament.
3. **Use familiar patterns unless novelty has a purpose.** Users bring mental models from other products. Preserve conventions for common controls, navigation, forms, and feedback unless the user’s brand or product goal justifies a deliberate departure.
4. **Group by meaning.** Proximity, common regions, alignment, and connectedness should match conceptual relationships. Ambiguous spacing creates ambiguous meaning.
5. **Constrain choices with systems.** Use type, spacing, color, radius, border, and elevation tokens instead of ad hoc one-off values.
6. **Typography is interface structure.** Choose type that fits the content and context, then set readable line length, line height, alignment, emphasis, and hierarchy.
7. **Color must carry meaning safely.** Use color to reinforce hierarchy, state, and brand, but never as the only signal. Maintain contrast and test against color-vision and low-vision needs.
8. **Depth should explain layers.** Shadows, overlaps, borders, and background shifts should clarify elevation, grouping, focus, or interaction—not create visual noise.
9. **Aesthetics improve acceptance but do not excuse usability flaws.** Polish can make users more tolerant and confident, but it can also mask problems. Verify clarity, accessibility, and task fit before celebrating beauty.
10. **Simplify without hiding necessary complexity.** Reduce visible choices and chunk complex tasks, but do not abstract away information users need to decide or recover.
11. **Design for resilient real content.** User-uploaded images, long labels, empty data, errors, loading, disabled states, and localization must not break the composition.
12. **Explain tradeoffs in user-centered terms.** Recommendations should reference user goals, comprehension, accessibility, system consistency, and implementation feasibility.

See [references/principle-cards.md](references/principle-cards.md) for each principle as a reusable card.

## Default recommendations

Use these defaults unless the user gives context that makes another choice better.

| Area | Default | Why it is usually best | Override when | Ask before overriding |
|---|---|---|---|---|
| Product/task focus | Begin with one core feature or screen goal | Prevents designing app chrome before content and actions are known | User is explicitly asking for global navigation, design-system shell, or IA | Ask for the primary task and the screen’s success criterion |
| Visual direction | Professional, warm, restrained, and content-first | Works for most productivity, SaaS, dashboard, admin, and commerce interfaces | Brand is playful, luxury, editorial, youth-focused, highly technical, or campaign-like | Ask for brand personality and examples |
| Information density | Comfortable spacing first; reduce only deliberately | Spacious layouts usually read as cleaner and clearer | Dashboard, pro tool, trading, ops, or data-monitoring context requires high density | Ask about density and scan speed needs |
| Layout strategy | Content-width container with clear groups; avoid filling the screen by default | Reduces line length and visual drift on large screens | Immersive canvas, map, media, spreadsheet, timeline, or data grid needs full width | Ask what content needs to stay visible together |
| Grid | Use a simple flexible grid plus tokenized spacing, not a rigid layout for its own sake | Helps alignment without forcing content into arbitrary columns | Editorial, marketing, or data-dense layouts need stronger grid logic | Ask about content types and responsive breakpoints |
| Typography | System UI or high-quality neutral sans for UI; pair with one expressive display face only when brand calls for it | Reduces loading risk and improves legibility | Editorial/brand work needs a distinct typographic voice | Ask for brand tone and font constraints |
| Type scale | Small set of reusable steps for body, supporting text, labels, titles, and display | Reduces inconsistent hierarchy | Existing design system has a scale | Ask for the design-system token source |
| Line length | Keep prose and long-form text in a readable measure; avoid edge-to-edge text | Improves scanning and reading comfort | Data tables, code, or short cards need different measures | Ask only if the content type is unusual |
| Color | Build semantic roles from a limited palette with neutral scale, accent scale, success/warning/error/info, and focus states | Supports consistency and accessibility | Brand palette is fixed or compliance/regulatory states are prescribed | Ask for brand palette and accessibility target |
| Contrast | Treat contrast as a functional requirement; verify text, icons, controls, and states | Prevents inaccessible or low-confidence UI | Large decorative text or nonessential illustration is exempt | Ask if the product requires a specific accessibility standard |
| Depth | Use a small elevation scale and one consistent light model | Creates layers without visual chaos | Brand is intentionally flat/brutalist or skeuomorphic | Ask only if depth direction is a brand choice |
| Imagery | Use high-quality, purpose-fit imagery; protect text overlays with scrims/gradients/containers | Images vary and can destroy readability | User provides fixed photography or UGC | Ask about image source and volatility |
| Borders | Use spacing, background, shadow, or subtle dividers before adding many borders | Borders add noise quickly | Data tables, legal forms, or dense settings screens need explicit separation | Ask if density or tabular precision matters |
| Empty states | Include helpful empty states with next action | Empty states are part of the experience, not blank failure | Empty state is impossible or intentionally hidden | Do not ask; implement by default |
| Motion | Use subtle, purposeful motion for feedback, continuity, and loading; respect reduced-motion preferences | Adds clarity without distraction | Product is entertainment-heavy or brand motion is a key differentiator | Ask about motion appetite and accessibility constraints |
| Frontend implementation | Use semantic HTML, design tokens, responsive CSS, visible focus states, keyboard access, and state variants | Preserves visual quality and accessibility in real UI | Prototype is static and disposable | Ask if production constraints or framework/design-system rules exist |

## Required user questions

Do not ask users to confirm routine best practices such as readable text, sufficient contrast, or clear hierarchy. Apply those by default.

Ask a focused question only when the answer materially changes the visual solution. Use the `question` tool or equivalent when available. Good triggers:

- The product goal, primary task, audience, or platform is unknown and cannot be inferred.
- Brand personality or visual tone could plausibly change type, color, density, imagery, or ornament.
- The user asks for a redesign but does not provide the current UI, screenshot, code, design-system constraints, or success criteria.
- Accessibility target, compliance context, or audience needs are stricter than ordinary inclusive defaults.
- The UI will handle volatile content such as user-uploaded images, 

