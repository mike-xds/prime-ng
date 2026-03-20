import figma, { html } from '@figma/code-connect';
import { Tab } from './tab';
import { TabList } from './tablist';
import { TabPanel } from './tabpanel';
import { TabPanels } from './tabpanels';
import { Tabs } from './tabs';

const FIGMA_FILE = 'https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0';

// ── Tabs ─────────────────────────────────────────────────────────────────────
// Selector: p-tabs
// Root container. Bind [(value)] to control the active tab.
figma.connect(Tabs, `${FIGMA_FILE}?node-id=320-12276`, {
    props: {
        scrollable: figma.boolean('Scrollable'),
    },
    example: ({ scrollable }) => html`
<p-tabs [(value)]="activeTab" [scrollable]="${scrollable}">
  <p-tablist>
    <p-tab value="0">
      <i class="pi pi-calendar"></i> Header I
    </p-tab>
    <p-tab value="1">Header II</p-tab>
    <p-tab value="2">Header III</p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="0">
      <p>Content for tab 1</p>
    </p-tabpanel>
    <p-tabpanel value="1">
      <p>Content for tab 2</p>
    </p-tabpanel>
    <p-tabpanel value="2">
      <p>Content for tab 3</p>
    </p-tabpanel>
  </p-tabpanels>
</p-tabs>`,
});

// ── Tab ──────────────────────────────────────────────────────────────────────
// Selector: p-tab
// Individual tab button inside p-tablist. The value must match the
// corresponding p-tabpanel value.
figma.connect(Tab, `${FIGMA_FILE}?node-id=3358-29419`, {
    props: {
        disabled: figma.boolean('Disabled'),
    },
    example: ({ disabled }) => html`
<p-tab value="0" [disabled]="${disabled}">
  <i class="pi pi-calendar"></i> Header I
</p-tab>`,
});

// ── TabList ──────────────────────────────────────────────────────────────────
// Selector: p-tablist
// Wrapper for the row of p-tab elements. Handles keyboard navigation and
// the active-tab indicator bar automatically.
figma.connect(TabList, `${FIGMA_FILE}?node-id=320-12280`, {
    props: {},
    example: () => html`
<p-tablist>
  <p-tab value="0">Header I</p-tab>
  <p-tab value="1">Header II</p-tab>
  <p-tab value="2">Header III</p-tab>
</p-tablist>`,
});

// ── TabPanels ────────────────────────────────────────────────────────────────
// Selector: p-tabpanels
// Container for all p-tabpanel elements.
figma.connect(TabPanels, `${FIGMA_FILE}?node-id=6555-1638`, {
    props: {},
    example: () => html`
<p-tabpanels>
  <p-tabpanel value="0">Content for tab 1</p-tabpanel>
  <p-tabpanel value="1">Content for tab 2</p-tabpanel>
</p-tabpanels>`,
});

// ── TabPanel ─────────────────────────────────────────────────────────────────
// Selector: p-tabpanel
// Content area for a single tab. The value must match the p-tab value.
figma.connect(TabPanel, `${FIGMA_FILE}?node-id=6555-1637`, {
    props: {},
    example: () => html`
<p-tabpanel value="0">
  <p>Tab panel content</p>
</p-tabpanel>`,
});
