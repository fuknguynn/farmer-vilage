Title: Live Content

Description: Fetched live

Source: https://raw.githubusercontent.com/hueyexe/frontend-agent-skills/main/design-systems-frontend-architecture/SKILL.md

---

---
name: design-systems-frontend-architecture
description: "Use when building reusable frontend systems, design tokens, component contracts, responsive layouts, CSS strategy, or design-system documentation and governance."
license: MIT
metadata:
  author: hueyexe
---

# Design Systems Frontend Architecture

## Purpose

Help an agent convert UI, UX, product, and brand decisions into a durable frontend system: reusable components, tokens, layout rules, state behavior, documentation, governance, and implementation guidance that can scale across screens, teams, devices, and time.

Optimize for actual product work. Do not merely describe design systems. Produce decisions, defaults, component contracts, implementation guidance, critiques, and next steps the user can act on.

## When to use this skill

Use this skill when the user asks for any of the following:

- Design-system strategy, component libraries, pattern libraries, style guides, design tokens, UI kits, component audits, interface inventories, or governance.
- UI critique, redesign, frontend implementation plans, component decomposition, responsive layout guidance, CSS architecture, or frontend maintainability.
- Turning mockups, screenshots, UX flows, or product requirements into scalable frontend components.
- Documentation for components, tokens, accessibility states, usage guidance, or design-to-code handoff.
- Resolving inconsistency across UI surfaces, duplicated patterns, ad hoc styling, or component drift.

## When not to use this skill

Do not use this skill as the primary lens when the task is mainly:

- Broad UX research planning, ethnography, discovery interviews, market research, or product strategy not yet connected to UI/system decisions.
- Visual art direction, illustration style, campaign creative, or brand identity creation unless the user is converting it into system rules.
- Pure backend architecture, API design, data modeling, or infrastructure.
- One-off static graphic design where reuse, accessibility, and frontend implementation do not matter.

## Core principles

1. **Design systems, not pages.** Scope effort by components, templates, content types, states, integrations, and behaviors rather than by page count.
2. **Think simultaneously in parts and wholes.** Evaluate tokens, atoms, components, sections, templates, and real pages together. Do not design a component without checking how it works in realistic compositions and content.
3. **Separate function from perception.** Treat functional patterns as behavioral/interface modules and perceptual patterns as the style, tone, motion, spacing, color, and type treatments that create product character.
4. **Start with purpose before abstraction.** A component exists to solve a user or product problem. Do not create abstractions from visual similarity alone.
5. **Use shared language as infrastructure.** Names, definitions, usage rules, and examples are part of the system, not decoration around it.
6. **Prefer reusable primitives, but preserve product distinctiveness.** Consistency should reduce user effort and team waste; it should not erase useful brand expression or signature moments.
7. **Make the system the source of truth.** Changes to shipped UI should update the component, token, or guideline where appropriate; avoid isolated hotfixes.
8. **Treat accessibility as a component contract.** Semantics, keyboard behavior, focus, contrast, hit areas, error handling, and reduced-motion behavior must be specified with the pattern.
9. **Choose frontend architecture early enough to prevent debt, but keep it adaptable.** Establish conventions before implementation spreads, then revise them intentionally as the product evolves.
10. **Document for use, not archival.** Documentation must answer when to use a pattern, when not to use it, how it behaves, how it is implemented, and who owns it.

See [references/principle-cards.md](references/principle-cards.md) for each principle as a reusable card.

## Default recommendations

Use these defaults unless the user provides context that clearly calls for a different choice.

### Product and scope defaults

- **Default scope:** define the smallest useful system slice: tokens + 3-5 core components + 1-2 representative templates + documentation. This avoids a bloated “big bang” system.
- **Default prioritization:** prioritize high-frequency, high-risk patterns first: buttons, links, forms, alerts, navigation, cards/lists, layout primitives, type scale, spacing, color semantics, loading/empty/error states.
- **Default migration:** improve incrementally. Prefer component-by-component replacement and deprecation over a full redesign unless the product is early-stage or a major platform migration is already happening.

### Design-system structure defaults

- **Default model:** use a layered system: foundations/tokens → primitives → components → compositions/templates → product examples/pages.
- **Default naming:** name patterns by purpose, not appearance. Prefer `Primary action`, `Course card`, `Filter panel`, `Inline validation`, or `Promotion banner` over `blue button`, `big box`, or `right rail thing`.
- **Default documentation:** every reusable pattern gets purpose, anatomy, variants, states, accessibility contract, content guidance, responsive behavior, implementation notes, examples, and anti-examples.
- **Default governance:** use light curation. Allow contribution, but require review for new tokens/components and require evidence before adding variants.

### Token defaults

- **Default token categories:** color, typography, spacing, radius, border, elevation/shadow, motion, opacity, z-index/layer, size, breakpoint/container, and semantic state tokens.
- **Default token shape:** separate primitive values from semantic tokens. Example: primitive `color.blue.600`; semantic `color.action.primary.bg`; component token `button.primary.bg` only when component-specific mapping is necessary.
- **Default naming:** use role and state rather than raw appearance. Prefer `text.muted`, `surface.raised`, `border.focus`, `status.error.fg` over `gray-500-for-labels`.
- **Default override rule:** do not introduce a new token for a single exception. First test whether an existing semantic token, component variant, or local product need already covers the case.

### Layout and responsive defaults

- **Default layout strategy:** design content-first, intrinsically responsive layouts using flexible containers, grid/flex primitives, fluid spacing, and container-aware rules. Avoid designing separate desktop/tablet/mobile screens as unrelated artifacts.
- **Default breakpoints:** use only enough breakpoints to protect readability, navigation, and task completion. Prefer component/container behavior over global viewport choreography.
- **Default density:** start with moderate density and generous scanability. Increase density only when expert workflows, data-heavy tasks, or screen real estate constraints justify it.
- **Default content testing:** test with real or realistic content, including long labels, missing images, empty data, error states, loading states, dense data, and translated strings when relevant.

### CSS and frontend defaults

- **Default markup:** semantic HTML first. Add ARIA only to fill semantic gaps, not to replace native semantics.
- **Default CSS:** component-scoped, low-specificity, token-driven CSS. Avoid styling through deep page location selectors.
- **Default methodology:** pick or adapt a clear naming and layering convention. BEM-like naming, utility layers, CSS modules, or framework-scoped styles can all work if the rules are explicit and consistent.
- **Default JS:** do not use JavaScript for effects CSS handles reliably. Use JS when behavior, state, data, or accessibility requires it.
- **Default custom controls:** start with native controls. If custom styling is needed, preserve native semantics, labels, keyboard behavior, focus visibility, and form behavior.
- **Default build/process:** automate linting, formatting, type checks where applicable, accessibility checks, visu

