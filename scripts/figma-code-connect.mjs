#!/usr/bin/env node
/**
 * scripts/figma-code-connect.mjs
 *
 * Discovers every PrimeNG component page in the PrimeOne Figma file,
 * finds the COMPONENT_SET / COMPONENT node for each, then writes a
 * .figma.ts Code Connect file into the matching source directory.
 *
 * Usage:
 *   FIGMA_ACCESS_TOKEN=<token> node scripts/figma-code-connect.mjs
 *   FIGMA_ACCESS_TOKEN=<token> node scripts/figma-code-connect.mjs --publish
 *   node scripts/figma-code-connect.mjs --dry-run
 */

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'MhKtacZNtUm8rgCQs8Zsxd';
const FILE_NAME = 'PrimeOne-4.0.0';
const FIGMA_BASE = `https://www.figma.com/design/${FILE_KEY}/${FILE_NAME}`;
const GITHUB_BASE = 'https://github.com/mike-xds/prime-ng/blob/master/packages/primeng/src';
const SRC_BASE = join(ROOT, 'packages/primeng/src');

const shouldPublish = process.argv.includes('--publish');
const dryRun = process.argv.includes('--dry-run');

if (!FIGMA_TOKEN && !dryRun) {
    console.error('\nError: FIGMA_ACCESS_TOKEN environment variable is required.');
    console.error('  Get your token at: https://www.figma.com/settings (Personal access tokens)');
    console.error('  Usage: FIGMA_ACCESS_TOKEN=<token> node scripts/figma-code-connect.mjs\n');
    process.exit(1);
}

// ---------------------------------------------------------------------------
// PrimeNG component registry
// Maps the lowercase component key to its Angular selector, class, module,
// and a representative HTML template.
// ---------------------------------------------------------------------------
const COMPONENT_MAP = {
    accordion: {
        selector: 'p-accordion',
        class: 'Accordion',
        module: 'primeng/accordion',
        template: `<p-accordion>\n    <p-accordion-panel value="0">\n        <p-accordion-header>Panel 1</p-accordion-header>\n        <p-accordion-content>Content 1</p-accordion-content>\n    </p-accordion-panel>\n</p-accordion>`,
    },
    autocomplete: {
        selector: 'p-autocomplete',
        class: 'AutoComplete',
        module: 'primeng/autocomplete',
        template: `<p-autocomplete [(ngModel)]="value" [suggestions]="filteredItems" (completeMethod)="search($event)" />`,
    },
    avatar: {
        selector: 'p-avatar',
        class: 'Avatar',
        module: 'primeng/avatar',
        template: `<p-avatar label="P" />`,
    },
    avatargroup: {
        selector: 'p-avatargroup',
        class: 'AvatarGroup',
        module: 'primeng/avatargroup',
        template: `<p-avatargroup>\n    <p-avatar label="A" />\n    <p-avatar icon="pi pi-user" />\n</p-avatargroup>`,
    },
    badge: {
        selector: 'p-badge',
        class: 'Badge',
        module: 'primeng/badge',
        template: `<p-badge value="2" />`,
    },
    blockui: {
        selector: 'p-blockui',
        class: 'BlockUI',
        module: 'primeng/blockui',
        template: `<p-blockui [blocked]="blocked">\n    <p>Content to block</p>\n</p-blockui>`,
    },
    breadcrumb: {
        selector: 'p-breadcrumb',
        class: 'Breadcrumb',
        module: 'primeng/breadcrumb',
        template: `<p-breadcrumb [model]="items" [home]="home" />`,
    },
    button: {
        selector: 'p-button',
        class: 'Button',
        module: 'primeng/button',
        template: `<p-button label="Submit" />`,
    },
    buttongroup: {
        selector: 'p-buttongroup',
        class: 'ButtonGroup',
        module: 'primeng/buttongroup',
        template: `<p-buttongroup>\n    <p-button label="Save" />\n    <p-button label="Delete" severity="danger" />\n</p-buttongroup>`,
    },
    card: {
        selector: 'p-card',
        class: 'Card',
        module: 'primeng/card',
        template: `<p-card header="Title" subheader="Subtitle">\n    <p>Card content</p>\n</p-card>`,
    },
    carousel: {
        selector: 'p-carousel',
        class: 'Carousel',
        module: 'primeng/carousel',
        template: `<p-carousel [value]="items" [numVisible]="3" [numScroll]="1">\n    <ng-template #item let-item>{{ item.name }}</ng-template>\n</p-carousel>`,
    },
    cascadeselect: {
        selector: 'p-cascadeselect',
        class: 'CascadeSelect',
        module: 'primeng/cascadeselect',
        template: `<p-cascadeselect [(ngModel)]="value" [options]="items" optionLabel="name" />`,
    },
    chart: {
        selector: 'p-chart',
        class: 'Chart',
        module: 'primeng/chart',
        template: `<p-chart type="bar" [data]="data" />`,
    },
    checkbox: {
        selector: 'p-checkbox',
        class: 'Checkbox',
        module: 'primeng/checkbox',
        template: `<p-checkbox [(ngModel)]="checked" [binary]="true" />`,
    },
    chip: {
        selector: 'p-chip',
        class: 'Chip',
        module: 'primeng/chip',
        template: `<p-chip label="Angular" />`,
    },
    colorpicker: {
        selector: 'p-colorpicker',
        class: 'ColorPicker',
        module: 'primeng/colorpicker',
        template: `<p-colorpicker [(ngModel)]="color" />`,
    },
    confirmdialog: {
        selector: 'p-confirmdialog',
        class: 'ConfirmDialog',
        module: 'primeng/confirmdialog',
        template: `<p-confirmdialog />`,
    },
    confirmpopup: {
        selector: 'p-confirmpopup',
        class: 'ConfirmPopup',
        module: 'primeng/confirmpopup',
        template: `<p-confirmpopup />`,
    },
    contextmenu: {
        selector: 'p-contextmenu',
        class: 'ContextMenu',
        module: 'primeng/contextmenu',
        template: `<p-contextmenu [model]="items" />`,
    },
    dataview: {
        selector: 'p-dataview',
        class: 'DataView',
        module: 'primeng/dataview',
        template: `<p-dataview [value]="items">\n    <ng-template #list let-items>\n        <div *ngFor="let item of items">{{ item.name }}</div>\n    </ng-template>\n</p-dataview>`,
    },
    datepicker: {
        selector: 'p-datepicker',
        class: 'DatePicker',
        module: 'primeng/datepicker',
        template: `<p-datepicker [(ngModel)]="date" />`,
    },
    dialog: {
        selector: 'p-dialog',
        class: 'Dialog',
        module: 'primeng/dialog',
        template: `<p-dialog header="Dialog" [(visible)]="visible">\n    <p>Dialog content</p>\n</p-dialog>`,
    },
    divider: {
        selector: 'p-divider',
        class: 'Divider',
        module: 'primeng/divider',
        template: `<p-divider />`,
    },
    dock: {
        selector: 'p-dock',
        class: 'Dock',
        module: 'primeng/dock',
        template: `<p-dock [model]="items" position="bottom" />`,
    },
    drawer: {
        selector: 'p-drawer',
        class: 'Drawer',
        module: 'primeng/drawer',
        template: `<p-drawer [(visible)]="visible" header="Drawer">\n    <p>Drawer content</p>\n</p-drawer>`,
    },
    editor: {
        selector: 'p-editor',
        class: 'Editor',
        module: 'primeng/editor',
        template: `<p-editor [(ngModel)]="content" [style]="{ height: '320px' }" />`,
    },
    fieldset: {
        selector: 'p-fieldset',
        class: 'Fieldset',
        module: 'primeng/fieldset',
        template: `<p-fieldset legend="Legend">\n    <p>Content</p>\n</p-fieldset>`,
    },
    fileupload: {
        selector: 'p-fileupload',
        class: 'FileUpload',
        module: 'primeng/fileupload',
        template: `<p-fileupload name="file" url="/upload" />`,
    },
    floatlabel: {
        selector: 'p-floatlabel',
        class: 'FloatLabel',
        module: 'primeng/floatlabel',
        template: `<p-floatlabel>\n    <input pInputText id="username" [(ngModel)]="value" />\n    <label for="username">Username</label>\n</p-floatlabel>`,
    },
    galleria: {
        selector: 'p-galleria',
        class: 'Galleria',
        module: 'primeng/galleria',
        template: `<p-galleria [value]="images">\n    <ng-template #item let-item>\n        <img [src]="item.src" [alt]="item.alt" />\n    </ng-template>\n</p-galleria>`,
    },
    iconfield: {
        selector: 'p-iconfield',
        class: 'IconField',
        module: 'primeng/iconfield',
        template: `<p-iconfield>\n    <p-inputicon class="pi pi-search" />\n    <input pInputText placeholder="Search" />\n</p-iconfield>`,
    },
    iftalabel: {
        selector: 'p-iftalabel',
        class: 'IftaLabel',
        module: 'primeng/iftalabel',
        template: `<p-iftalabel>\n    <input pInputText id="username" [(ngModel)]="value" />\n    <label for="username">Username</label>\n</p-iftalabel>`,
    },
    image: {
        selector: 'p-image',
        class: 'Image',
        module: 'primeng/image',
        template: `<p-image src="/image.jpg" alt="Image" width="250" preview />`,
    },
    imagecompare: {
        selector: 'p-imagecompare',
        class: 'ImageCompare',
        module: 'primeng/imagecompare',
        template: `<p-imagecompare leftImage="/before.jpg" rightImage="/after.jpg" />`,
    },
    inplace: {
        selector: 'p-inplace',
        class: 'Inplace',
        module: 'primeng/inplace',
        template: `<p-inplace>\n    <ng-template #display>Click to Edit</ng-template>\n    <ng-template #content>\n        <input pInputText [(ngModel)]="value" />\n    </ng-template>\n</p-inplace>`,
    },
    inputgroup: {
        selector: 'p-inputgroup',
        class: 'InputGroup',
        module: 'primeng/inputgroup',
        template: `<p-inputgroup>\n    <p-inputgroupaddon>@</p-inputgroupaddon>\n    <input pInputText placeholder="Username" />\n</p-inputgroup>`,
    },
    inputgroupaddon: {
        selector: 'p-inputgroupaddon',
        class: 'InputGroupAddon',
        module: 'primeng/inputgroupaddon',
        template: `<p-inputgroupaddon>@</p-inputgroupaddon>`,
    },
    inputicon: {
        selector: 'p-inputicon',
        class: 'InputIcon',
        module: 'primeng/inputicon',
        template: `<p-inputicon class="pi pi-search" />`,
    },
    inputmask: {
        selector: 'p-inputmask',
        class: 'InputMask',
        module: 'primeng/inputmask',
        template: `<p-inputmask [(ngModel)]="value" mask="99-999999" />`,
    },
    inputnumber: {
        selector: 'p-inputnumber',
        class: 'InputNumber',
        module: 'primeng/inputnumber',
        template: `<p-inputnumber [(ngModel)]="value" />`,
    },
    inputotp: {
        selector: 'p-inputotp',
        class: 'InputOtp',
        module: 'primeng/inputotp',
        template: `<p-inputotp [(ngModel)]="value" [length]="6" />`,
    },
    inputtext: {
        selector: 'p-inputtext',
        class: 'InputText',
        module: 'primeng/inputtext',
        template: `<input pInputText [(ngModel)]="value" placeholder="Text" />`,
    },
    knob: {
        selector: 'p-knob',
        class: 'Knob',
        module: 'primeng/knob',
        template: `<p-knob [(ngModel)]="value" />`,
    },
    listbox: {
        selector: 'p-listbox',
        class: 'Listbox',
        module: 'primeng/listbox',
        template: `<p-listbox [options]="items" [(ngModel)]="selected" optionLabel="name" />`,
    },
    megamenu: {
        selector: 'p-megamenu',
        class: 'MegaMenu',
        module: 'primeng/megamenu',
        template: `<p-megamenu [model]="items" />`,
    },
    menu: {
        selector: 'p-menu',
        class: 'Menu',
        module: 'primeng/menu',
        template: `<p-menu [model]="items" />`,
    },
    menubar: {
        selector: 'p-menubar',
        class: 'Menubar',
        module: 'primeng/menubar',
        template: `<p-menubar [model]="items" />`,
    },
    message: {
        selector: 'p-message',
        class: 'Message',
        module: 'primeng/message',
        template: `<p-message severity="info" text="Info message" />`,
    },
    metergroup: {
        selector: 'p-metergroup',
        class: 'MeterGroup',
        module: 'primeng/metergroup',
        template: `<p-metergroup [value]="value" />`,
    },
    multiselect: {
        selector: 'p-multiselect',
        class: 'MultiSelect',
        module: 'primeng/multiselect',
        template: `<p-multiselect [options]="items" [(ngModel)]="selected" optionLabel="name" />`,
    },
    orderlist: {
        selector: 'p-orderlist',
        class: 'OrderList',
        module: 'primeng/orderlist',
        template: `<p-orderlist [value]="items" listStyle="height:auto" header="List">\n    <ng-template #item let-item>{{ item.name }}</ng-template>\n</p-orderlist>`,
    },
    organizationchart: {
        selector: 'p-organizationchart',
        class: 'OrganizationChart',
        module: 'primeng/organizationchart',
        template: `<p-organizationchart [value]="data" />`,
    },
    overlaybadge: {
        selector: 'p-overlaybadge',
        class: 'OverlayBadge',
        module: 'primeng/overlaybadge',
        template: `<p-overlaybadge value="4" severity="danger">\n    <i class="pi pi-bell" style="font-size: 2rem"></i>\n</p-overlaybadge>`,
    },
    paginator: {
        selector: 'p-paginator',
        class: 'Paginator',
        module: 'primeng/paginator',
        template: `<p-paginator [rows]="10" [totalRecords]="100" />`,
    },
    panel: {
        selector: 'p-panel',
        class: 'Panel',
        module: 'primeng/panel',
        template: `<p-panel header="Panel Title">\n    <p>Panel content</p>\n</p-panel>`,
    },
    panelmenu: {
        selector: 'p-panelmenu',
        class: 'PanelMenu',
        module: 'primeng/panelmenu',
        template: `<p-panelmenu [model]="items" />`,
    },
    password: {
        selector: 'p-password',
        class: 'Password',
        module: 'primeng/password',
        template: `<p-password [(ngModel)]="value" />`,
    },
    picklist: {
        selector: 'p-picklist',
        class: 'PickList',
        module: 'primeng/picklist',
        template: `<p-picklist [source]="source" [target]="target" sourceHeader="Available" targetHeader="Selected">\n    <ng-template #item let-item>{{ item.name }}</ng-template>\n</p-picklist>`,
    },
    popover: {
        selector: 'p-popover',
        class: 'Popover',
        module: 'primeng/popover',
        template: `<p-popover>\n    <p>Popover content</p>\n</p-popover>`,
    },
    progressbar: {
        selector: 'p-progressbar',
        class: 'ProgressBar',
        module: 'primeng/progressbar',
        template: `<p-progressbar [value]="50" />`,
    },
    progressspinner: {
        selector: 'p-progressspinner',
        class: 'ProgressSpinner',
        module: 'primeng/progressspinner',
        template: `<p-progressspinner />`,
    },
    radiobutton: {
        selector: 'p-radiobutton',
        class: 'RadioButton',
        module: 'primeng/radiobutton',
        template: `<p-radiobutton [(ngModel)]="value" value="Option1" />`,
    },
    rating: {
        selector: 'p-rating',
        class: 'Rating',
        module: 'primeng/rating',
        template: `<p-rating [(ngModel)]="value" />`,
    },
    scrollpanel: {
        selector: 'p-scrollpanel',
        class: 'ScrollPanel',
        module: 'primeng/scrollpanel',
        template: `<p-scrollpanel [style]="{ width: '100%', height: '200px' }">\n    <p>Content</p>\n</p-scrollpanel>`,
    },
    scrolltop: {
        selector: 'p-scrolltop',
        class: 'ScrollTop',
        module: 'primeng/scrolltop',
        template: `<p-scrolltop />`,
    },
    select: {
        selector: 'p-select',
        class: 'Select',
        module: 'primeng/select',
        template: `<p-select [options]="items" [(ngModel)]="selected" optionLabel="name" />`,
    },
    selectbutton: {
        selector: 'p-selectbutton',
        class: 'SelectButton',
        module: 'primeng/selectbutton',
        template: `<p-selectbutton [options]="options" [(ngModel)]="value" />`,
    },
    skeleton: {
        selector: 'p-skeleton',
        class: 'Skeleton',
        module: 'primeng/skeleton',
        template: `<p-skeleton width="10rem" />`,
    },
    slider: {
        selector: 'p-slider',
        class: 'Slider',
        module: 'primeng/slider',
        template: `<p-slider [(ngModel)]="value" />`,
    },
    speeddial: {
        selector: 'p-speeddial',
        class: 'SpeedDial',
        module: 'primeng/speeddial',
        template: `<p-speeddial [model]="items" direction="up" />`,
    },
    splitbutton: {
        selector: 'p-splitbutton',
        class: 'SplitButton',
        module: 'primeng/splitbutton',
        template: `<p-splitbutton label="Save" [model]="items" />`,
    },
    splitter: {
        selector: 'p-splitter',
        class: 'Splitter',
        module: 'primeng/splitter',
        template: `<p-splitter [style]="{ height: '300px' }">\n    <ng-template #panel>Panel 1</ng-template>\n    <ng-template #panel>Panel 2</ng-template>\n</p-splitter>`,
    },
    stepper: {
        selector: 'p-stepper',
        class: 'Stepper',
        module: 'primeng/stepper',
        template: `<p-stepper>\n    <p-step-panel header="Step 1" [value]="1">Content 1</p-step-panel>\n    <p-step-panel header="Step 2" [value]="2">Content 2</p-step-panel>\n</p-stepper>`,
    },
    steps: {
        selector: 'p-steps',
        class: 'Steps',
        module: 'primeng/steps',
        template: `<p-steps [model]="items" />`,
    },
    table: {
        selector: 'p-table',
        class: 'Table',
        module: 'primeng/table',
        template: `<p-table [value]="items">\n    <ng-template #header>\n        <tr><th>Name</th><th>Value</th></tr>\n    </ng-template>\n    <ng-template #body let-item>\n        <tr><td>{{ item.name }}</td><td>{{ item.value }}</td></tr>\n    </ng-template>\n</p-table>`,
    },
    tabs: {
        selector: 'p-tabs',
        class: 'Tabs',
        module: 'primeng/tabs',
        template: `<p-tabs>\n    <p-tablist>\n        <p-tab value="0">Tab 1</p-tab>\n        <p-tab value="1">Tab 2</p-tab>\n    </p-tablist>\n    <p-tabpanels>\n        <p-tabpanel value="0">Content 1</p-tabpanel>\n        <p-tabpanel value="1">Content 2</p-tabpanel>\n    </p-tabpanels>\n</p-tabs>`,
    },
    tag: {
        selector: 'p-tag',
        class: 'Tag',
        module: 'primeng/tag',
        template: `<p-tag value="New" />`,
    },
    terminal: {
        selector: 'p-terminal',
        class: 'Terminal',
        module: 'primeng/terminal',
        template: `<p-terminal welcomeMessage="Welcome" prompt="$" />`,
    },
    textarea: {
        selector: 'p-textarea',
        class: 'Textarea',
        module: 'primeng/textarea',
        template: `<textarea pTextarea [(ngModel)]="value" rows="5" cols="30"></textarea>`,
    },
    tieredmenu: {
        selector: 'p-tieredmenu',
        class: 'TieredMenu',
        module: 'primeng/tieredmenu',
        template: `<p-tieredmenu [model]="items" />`,
    },
    timeline: {
        selector: 'p-timeline',
        class: 'Timeline',
        module: 'primeng/timeline',
        template: `<p-timeline [value]="events">\n    <ng-template #content let-event>{{ event.status }}</ng-template>\n</p-timeline>`,
    },
    toast: {
        selector: 'p-toast',
        class: 'Toast',
        module: 'primeng/toast',
        template: `<p-toast />`,
    },
    togglebutton: {
        selector: 'p-togglebutton',
        class: 'ToggleButton',
        module: 'primeng/togglebutton',
        template: `<p-togglebutton [(ngModel)]="checked" onLabel="On" offLabel="Off" />`,
    },
    toggleswitch: {
        selector: 'p-toggleswitch',
        class: 'ToggleSwitch',
        module: 'primeng/toggleswitch',
        template: `<p-toggleswitch [(ngModel)]="checked" />`,
    },
    toolbar: {
        selector: 'p-toolbar',
        class: 'Toolbar',
        module: 'primeng/toolbar',
        template: `<p-toolbar>\n    <ng-template #start><p-button icon="pi pi-plus" /></ng-template>\n    <ng-template #end><p-button icon="pi pi-search" /></ng-template>\n</p-toolbar>`,
    },
    tooltip: {
        selector: '[pTooltip]',
        class: 'Tooltip',
        module: 'primeng/tooltip',
        template: `<button pTooltip="Tooltip text">Hover me</button>`,
    },
    tree: {
        selector: 'p-tree',
        class: 'Tree',
        module: 'primeng/tree',
        template: `<p-tree [value]="nodes" />`,
    },
    treeselect: {
        selector: 'p-treeselect',
        class: 'TreeSelect',
        module: 'primeng/treeselect',
        template: `<p-treeselect [options]="nodes" [(ngModel)]="selected" placeholder="Select Item" />`,
    },
    treetable: {
        selector: 'p-treetable',
        class: 'TreeTable',
        module: 'primeng/treetable',
        template: `<p-treetable [value]="items">\n    <ng-template #header><tr><th>Name</th></tr></ng-template>\n    <ng-template #body let-rowNode let-rowData="rowData">\n        <tr [ttRow]="rowNode"><td>{{ rowData.name }}</td></tr>\n    </ng-template>\n</p-treetable>`,
    },
};

// ---------------------------------------------------------------------------
// Figma REST API helpers
// ---------------------------------------------------------------------------
async function figmaGet(path) {
    const res = await fetch(`https://api.figma.com/v1${path}`, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN },
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Figma API ${res.status} for ${path}: ${body}`);
    }
    return res.json();
}

// Walk the node tree looking for a COMPONENT_SET or COMPONENT whose
// normalised name matches `targetKey`.
function findComponentNode(node, targetKey, depth = 0) {
    if (depth > 8) return null;
    const name = (node.name ?? '')
        .toLowerCase()
        .replace(/^[❖✦▸►⬡\s]+/u, '')
        .replace(/[\s\-_]/g, '');
    if ((node.type === 'COMPONENT_SET' || node.type === 'COMPONENT') && name === targetKey) {
        return node;
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            const found = findComponentNode(child, targetKey, depth + 1);
            if (found) return found;
        }
    }
    return null;
}

// ---------------------------------------------------------------------------
// Generate a .figma.ts file for one component
// ---------------------------------------------------------------------------
function generateFigmaTs(componentKey, nodeId, meta) {
    const figmaUrl = `${FIGMA_BASE}?node-id=${nodeId.replace(':', '-')}`;
    const githubUrl = `${GITHUB_BASE}/${componentKey}/${componentKey}.ts`;

    return `import figma, { html } from '@figma/code-connect';

// ---------------------------------------------------------------------------
// ${meta.class}
// Figma : ${figmaUrl}
// GitHub: ${githubUrl}
// ---------------------------------------------------------------------------

figma.connect('${figmaUrl}', {
    links: [
        {
            name: 'GitHub Source',
            url: '${githubUrl}',
        },
    ],
    template: html\`${meta.template}\`,
});
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    console.log('\n=== PrimeNG Figma Code Connect Generator ===\n');

    if (dryRun) {
        console.log('DRY RUN — no files will be written or published.\n');
        for (const [key, meta] of Object.entries(COMPONENT_MAP)) {
            console.log(`  ${key} → ${meta.selector} (${meta.module})`);
        }
        console.log(`\nTotal: ${Object.keys(COMPONENT_MAP).length} components`);
        return;
    }

    // Step 1: get file page list
    console.log('Fetching Figma file structure…');
    const file = await figmaGet(`/files/${FILE_KEY}?depth=1`);
    const pages = file.document?.children ?? [];
    console.log(`  Found ${pages.length} pages\n`);

    // Step 2: for each matching page, discover the component node
    const nodeMap = {}; // componentKey → figma nodeId

    for (const page of pages) {
        // Figma pages in PrimeOne are named "❖ ComponentName"
        const pageKey = page.name
            .replace(/^[❖✦▸►⬡\s]+/u, '')
            .toLowerCase()
            .replace(/[\s\-_]/g, '');

        if (!COMPONENT_MAP[pageKey]) continue;

        process.stdout.write(`  Scanning "${page.name}" → ${pageKey} … `);

        try {
            const nodeData = await figmaGet(
                `/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(page.id)}&depth=6`
            );
            const pageNode = nodeData.nodes?.[page.id]?.document;

            if (pageNode) {
                const compNode = findComponentNode(pageNode, pageKey);
                if (compNode) {
                    nodeMap[pageKey] = compNode.id;
                    console.log(`✓ ${compNode.id} (${compNode.type})`);
                } else {
                    nodeMap[pageKey] = page.id;
                    console.log(`⚠ using page id ${page.id}`);
                }
            } else {
                console.log('✗ could not read page');
            }
        } catch (err) {
            console.log(`✗ ${err.message}`);
        }

        // Respect Figma rate limits (~40 req/min)
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log();

    // Step 3: write .figma.ts files
    let written = 0;
    let skipped = 0;

    for (const [key, meta] of Object.entries(COMPONENT_MAP)) {
        const nodeId = nodeMap[key];
        if (!nodeId) {
            console.log(`  SKIP ${key} — no Figma node found`);
            skipped++;
            continue;
        }

        const dir = join(SRC_BASE, key);
        if (!existsSync(dir)) {
            console.log(`  SKIP ${key} — directory not found: ${dir}`);
            skipped++;
            continue;
        }

        const filePath = join(dir, `${key}.figma.ts`);
        const content = generateFigmaTs(key, nodeId, meta);
        writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ packages/primeng/src/${key}/${key}.figma.ts`);
        written++;
    }

    console.log(`\nWrote ${written} files, skipped ${skipped}.`);

    // Step 4: optionally publish
    if (shouldPublish) {
        console.log('\nPublishing to Figma…');
        try {
            execSync('npx figma connect publish --token ' + FIGMA_TOKEN, {
                cwd: ROOT,
                stdio: 'inherit',
            });
            console.log('✓ Published successfully');
        } catch (err) {
            console.error('✗ Publish failed:', err.message);
            process.exit(1);
        }
    } else {
        console.log('\nTo publish to Figma, run:');
        console.log(`  FIGMA_ACCESS_TOKEN=<token> node scripts/figma-code-connect.mjs --publish\n`);
    }
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
