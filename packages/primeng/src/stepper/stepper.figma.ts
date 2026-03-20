import figma, { html } from '@figma/code-connect';
import { Step, StepItem, StepList, StepPanel, StepPanels, Stepper, StepperSeparator } from './stepper';

const FIGMA_FILE = 'https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0';

// ── Stepper ─────────────────────────────────────────────────────────────────
// Selector: p-stepper
// Props: value (active step), linear (lock sequential navigation)
figma.connect(Stepper, `${FIGMA_FILE}?node-id=6978-73977`, {
    props: {
        linear: figma.boolean('Linear'),
    },
    example: ({ linear }) => html`
<p-stepper [(value)]="activeStep" [linear]="${linear}">
  <p-step-item [value]="1">
    <p-step>Step 1</p-step>
    <p-step-panel>
      <ng-template #content let-activateCallback="activateCallback">
        <div>Content for step 1</div>
        <p-button label="Next" icon="pi pi-arrow-right" iconPos="right" (onClick)="activateCallback(2)" />
      </ng-template>
    </p-step-panel>
  </p-step-item>

  <p-step-item [value]="2">
    <p-step>Step 2</p-step>
    <p-step-panel>
      <ng-template #content let-activateCallback="activateCallback">
        <div>Content for step 2</div>
        <p-button label="Back" outlined (onClick)="activateCallback(1)" />
        <p-button label="Next" icon="pi pi-arrow-right" iconPos="right" (onClick)="activateCallback(3)" />
      </ng-template>
    </p-step-panel>
  </p-step-item>

  <p-step-item [value]="3">
    <p-step>Step 3</p-step>
    <p-step-panel>
      <ng-template #content let-activateCallback="activateCallback">
        <div>Content for step 3</div>
        <p-button label="Back" outlined (onClick)="activateCallback(2)" />
        <p-button label="Finish" severity="success" (onClick)="onFinish()" />
      </ng-template>
    </p-step-panel>
  </p-step-item>
</p-stepper>`,
});

// ── StepItem ─────────────────────────────────────────────────────────────────
// Selector: p-step-item
// Wraps a single p-step + p-step-panel pair; value links them to the stepper.
figma.connect(StepItem, `${FIGMA_FILE}?node-id=6978-73449`, {
    props: {
        value: figma.string('Value'),
    },
    example: ({ value }) => html`
<p-step-item [value]="${value}">
  <p-step>Step Label</p-step>
  <p-step-panel>
    <ng-template #content let-activateCallback="activateCallback">
      <!-- step content here -->
    </ng-template>
  </p-step-panel>
</p-step-item>`,
});

// ── Step ─────────────────────────────────────────────────────────────────────
// Selector: p-step
// Renders the step header (number + title). Placed inside p-step-item.
figma.connect(Step, `${FIGMA_FILE}?node-id=6978-73384`, {
    props: {
        disabled: figma.boolean('Disabled'),
    },
    example: ({ disabled }) => html`
<p-step [disabled]="${disabled}">Step Label</p-step>`,
});

// ── StepPanels ───────────────────────────────────────────────────────────────
// Selector: p-step-panels
// Container for multiple p-step-panel elements (used in horizontal layout).
figma.connect(StepPanels, `${FIGMA_FILE}?node-id=6978-73448`, {
    props: {},
    example: () => html`
<p-step-panels>
  <p-step-panel [value]="1">
    <ng-template #content let-activateCallback="activateCallback">
      <!-- content for step 1 -->
    </ng-template>
  </p-step-panel>
</p-step-panels>`,
});

// ── StepPanel ────────────────────────────────────────────────────────────────
// Selector: p-step-panel
// Content area for a single step. Use #content template to access activateCallback.
figma.connect(StepPanel, `${FIGMA_FILE}?node-id=6978-73436`, {
    props: {},
    example: () => html`
<p-step-panel [value]="1">
  <ng-template #content let-activateCallback="activateCallback" let-active="active">
    <div>Step content</div>
    <p-button label="Next" icon="pi pi-arrow-right" iconPos="right" (onClick)="activateCallback(2)" />
  </ng-template>
</p-step-panel>`,
});

// ── StepList ─────────────────────────────────────────────────────────────────
// Selector: p-step-list
// Horizontal list of p-step elements. Used in place of p-step-item for
// layouts where step headers and panels are defined separately.
figma.connect(StepList, `${FIGMA_FILE}?node-id=6978-73476`, {
    props: {},
    example: () => html`
<p-step-list>
  <p-step [value]="1">Header 1</p-step>
  <p-step [value]="2">Header 2</p-step>
  <p-step [value]="3">Header 3</p-step>
</p-step-list>`,
});

// ── StepperSeparator ─────────────────────────────────────────────────────────
// Selector: p-stepper-separator
// Rendered automatically between steps. Can be used explicitly in custom layouts.
figma.connect(StepperSeparator, `${FIGMA_FILE}?node-id=6978-4586`, {
    props: {},
    example: () => html`<p-stepper-separator />`,
});
