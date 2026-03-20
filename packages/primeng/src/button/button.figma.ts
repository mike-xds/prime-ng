import figma, { html } from '@figma/code-connect';
import { Button } from './button';

const FIGMA_FILE = 'https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0';

// ── Button ───────────────────────────────────────────────────────────────────
// Selector: p-button  (also available as pButton directive on <button>)
// Figma node: button (10:125)
figma.connect(Button, `${FIGMA_FILE}?node-id=10-125`, {
    props: {
        label: figma.string('Label'),

        severity: figma.enum('Severity', {
            Primary: undefined,     // default — no severity prop needed
            Secondary: 'secondary',
            Success: 'success',
            Info: 'info',
            Warning: 'warn',
            Danger: 'danger',
            Help: 'help',
            Contrast: 'contrast',
        }),

        size: figma.enum('Size', {
            Small: 'small',
            Normal: undefined,      // default — no size prop needed
            Large: 'large',
        }),

        // Style variants
        outlined: figma.boolean('Outlined'),
        text:     figma.boolean('Text'),
        raised:   figma.boolean('Raised'),
        rounded:  figma.boolean('Rounded'),
        link:     figma.boolean('Link'),

        // State
        disabled: figma.boolean('Disabled'),
        loading:  figma.boolean('Loading'),

        // Icon
        icon:    figma.string('Icon'),
        iconPos: figma.enum('Icon Position', {
            Left:   'left',
            Right:  'right',
            Top:    'top',
            Bottom: 'bottom',
        }),
    },

    example: ({
        label,
        severity,
        size,
        outlined,
        text,
        raised,
        rounded,
        link,
        disabled,
        loading,
        icon,
        iconPos,
    }) => html`
<p-button
  label="${label}"
  severity="${severity}"
  size="${size}"
  icon="${icon}"
  iconPos="${iconPos}"
  [outlined]="${outlined}"
  [text]="${text}"
  [raised]="${raised}"
  [rounded]="${rounded}"
  [link]="${link}"
  [disabled]="${disabled}"
  [loading]="${loading}"
/>`,
});
