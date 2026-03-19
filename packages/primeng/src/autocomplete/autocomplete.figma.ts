import figma, { html } from '@figma/code-connect';

// -------------------------------------------------------------------
// AutoComplete — Figma: PrimeOne 4.0.0
// GitHub: https://github.com/mike-xds/prime-ng/blob/master/packages/primeng/src/autocomplete/autocomplete.ts
// -------------------------------------------------------------------

const GITHUB_SOURCE = {
    links: [
        {
            name: 'GitHub Source',
            url: 'https://github.com/mike-xds/prime-ng/blob/master/packages/primeng/src/autocomplete/autocomplete.ts',
        },
    ],
};

// State=Idle, Dropdown=False, Multiple=False
figma.connect('https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0?node-id=6047-9516', {
    ...GITHUB_SOURCE,
    template: html`<p-autocomplete
    [(ngModel)]="value"
    [suggestions]="filteredItems"
    (completeMethod)="search($event)"
/>`,
});

// State=Idle, Dropdown=True, Multiple=False
figma.connect('https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0?node-id=6047-10521', {
    ...GITHUB_SOURCE,
    template: html`<p-autocomplete
    [(ngModel)]="value"
    [suggestions]="filteredItems"
    (completeMethod)="search($event)"
    dropdown
/>`,
});

// State=Idle, Dropdown=False, Multiple=True
figma.connect('https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0?node-id=6682-12303', {
    ...GITHUB_SOURCE,
    template: html`<p-autocomplete
    [(ngModel)]="value"
    [suggestions]="filteredItems"
    (completeMethod)="search($event)"
    multiple
/>`,
});

// State=Idle, Dropdown=True, Multiple=True
figma.connect('https://www.figma.com/design/MhKtacZNtUm8rgCQs8Zsxd/PrimeOne-4.0.0?node-id=6682-12291', {
    ...GITHUB_SOURCE,
    template: html`<p-autocomplete
    [(ngModel)]="value"
    [suggestions]="filteredItems"
    (completeMethod)="search($event)"
    dropdown
    multiple
/>`,
});
