/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  mdiAlert,
  mdiFan,
  mdiFanOff,
  mdiHome,
  mdiHomeOff,
  mdiHomePlus,
  mdiChevronDown,
  mdiLightbulbMultiple,
  mdiLightbulbMultipleOff,
  mdiRun,
  mdiSleep,
  mdiToggleSwitch,
  mdiToggleSwitchOff,
  mdiWaterAlert,
  mdiWeatherSunny,
  mdiHeadCog,
} from '@mdi/js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Connection, HassEntity, UnsubscribeFunc } from 'home-assistant-js-websocket';
import memoizeOne from 'memoize-one';
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  HomeAssistant,
  computeDomain,
  LovelaceCardEditor,
  getLovelace,
  STATES_OFF,
  isNumericState,
  formatNumber,
  navigate,
  forwardHaptic,
  LovelaceCard,
  turnOnOffEntity,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type {
  SimplyMagicCardConfig,
  EntityRegistryEntry,
  AreaRegistryEntry,
  DeviceRegistryEntry,
} from './internal/types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { SimplyMagicAreaCardEditor } from './editor';
import parseAspectRatio, { blankBeforeUnit, isUnavailableState } from './internal/util';
import { subscribeAreaRegistry } from './internal/area_registry';
import { subscribeDeviceRegistry } from './internal/device_registry';
import { subscribeEntityRegistry } from './internal/entity_registry';
import { SubscribeMixin } from './internal/subscribe_mixin';
import { SimplyMagicStates } from './internal/simply_magic';

export const DEFAULT_ASPECT_RATIO = '16:9';

const SELECT_DOMAIN = 'select';
const LIGHT_DOMAIN = 'light';
const SWITCH_DOMAIN = 'switch';
const SIMPLY_MAGIC_AREA_MANUFACTURER = 'Simply Magic Areas';

const SENSOR_DOMAINS = ['sensor'];

const ALERT_DOMAINS = [SELECT_DOMAIN, 'binary_sensor'];

const TOGGLE_DOMAINS = [LIGHT_DOMAIN, 'fan'];

const OTHER_DOMAINS = ['camera'];

const SWITCH_DOMAINS = [SWITCH_DOMAIN];

export const DEVICE_CLASSES = {
  sensor: ['temperature', 'humidity'],
  binary_sensor: ['motion', 'moisture'],
};

const DOMAIN_ICONS = {
  light: { on: mdiLightbulbMultiple, off: mdiLightbulbMultipleOff },
  switch: { on: mdiToggleSwitch, off: mdiToggleSwitchOff },
  fan: { on: mdiFan, off: mdiFanOff },
  binary_sensor: {
    motion: mdiRun,
    moisture: mdiWaterAlert,
  },
};

/* eslint no-console: 0 */
console.info(
  `%c  SIMPLY-MAGIC-AREA-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'simply-magic-area-card',
  name: 'Simply Magic Area Card',
  description: 'Card displaying information about the current magic area',
});

// The simply magic areas card.
@customElement('simply-magic-area-card')
export class SimplyMagicAreaCard extends SubscribeMixin(LitElement) implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('simply-magic-area-card-editor') as SimplyMagicAreaCardEditor;
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: SimplyMagicCardConfig;

  @state() private _entities?: EntityRegistryEntry[];

  @state() private _devices?: DeviceRegistryEntry[];

  @state() private _areas?: AreaRegistryEntry[];

  private _deviceClasses: { [key: string]: string[] } = DEVICE_CLASSES;

  private _ratio: {
    w: number;
    h: number;
  } | null = null;

  private _entitiesByDomain = memoizeOne(
    (
      areaId: string,
      devicesInArea: Set<string>,
      simplyMagicDevicesInArea: Set<string>,
      registryEntities: EntityRegistryEntry[],
      deviceClasses: { [key: string]: string[] },
      states: HomeAssistant['states'],
    ) => {
      const entitiesInArea = registryEntities.filter(
        (entry) =>
          !entry.entity_category &&
          !entry.hidden_by &&
          (entry.area_id ? entry.area_id === areaId : entry.device_id && devicesInArea.has(entry.device_id)),
      );

      const entitiesByDomain: { [domain: string]: HassEntity[] } = {};
      const magicByDomain: { [domain: string]: HassEntity[] } = {};

      for (const entity of entitiesInArea) {
        const domain = computeDomain(entity.entity_id);
        if (
          !TOGGLE_DOMAINS.includes(domain) &&
          !SENSOR_DOMAINS.includes(domain) &&
          !ALERT_DOMAINS.includes(domain) &&
          !OTHER_DOMAINS.includes(domain) &&
          !SWITCH_DOMAINS.includes(domain)
        ) {
          continue;
        }
        const stateObj: HassEntity | undefined = states[entity.entity_id];

        if (!stateObj) {
          continue;
        }

        if (
          (SENSOR_DOMAINS.includes(domain) || ALERT_DOMAINS.includes(domain)) &&
          domain !== SELECT_DOMAIN &&
          !deviceClasses[domain].includes(stateObj.attributes.device_class || '')
        ) {
          continue;
        }

        if (!(domain in entitiesByDomain)) {
          entitiesByDomain[domain] = [];
          magicByDomain[domain] = [];
        }
        entitiesByDomain[domain].push(stateObj);
        if (simplyMagicDevicesInArea.has(entity.device_id ?? '')) {
          magicByDomain[domain].push(stateObj);
        }
      }

      return { entitiesByDomain, magicByDomain };
    },
  );

  private _stateIcon(state?: SimplyMagicStates) {
    switch (state) {
      case SimplyMagicStates.Clear:
        return mdiHomeOff;
      case SimplyMagicStates.Sleep:
        return mdiSleep;
      case SimplyMagicStates.Occupied:
        return mdiHome;
      case SimplyMagicStates.Bright:
        return mdiWeatherSunny;
      case SimplyMagicStates.Accent:
        return mdiHomePlus;
      case SimplyMagicStates.Manual:
        return mdiHomeOff;
      default:
        return mdiAlert;
    }
  }

  private _simplyMagicState(): SimplyMagicStates | undefined {
    if (!this._config) {
      return undefined;
    }
    const entities = this._entitiesByDomain(
      this._config!.area ?? '',
      this._devicesInArea(this._config!.area, this._devices ?? []),
      this._simplyMagicDevice(this._config!.area, this._devices ?? []),
      this._entities ?? [],
      this._deviceClasses,
      this.hass.states,
    );
    if (!entities || !(SELECT_DOMAIN in entities.entitiesByDomain)) {
      return undefined;
    }
    // if we have a magic entity use that for the device type.
    const magicEntity = entities.magicByDomain[SELECT_DOMAIN];
    if (magicEntity.length < 1) {
      return undefined;
    }
    return magicEntity[0].state as SimplyMagicStates;
  }

  private _isOn(domain: string, deviceClass?: string): HassEntity | undefined {
    const entities = this._entitiesByDomain(
      this._config!.area ?? '',
      this._devicesInArea(this._config!.area, this._devices! ?? []),
      this._simplyMagicDevice(this._config!.area, this._devices! ?? []),
      this._entities!,
      this._deviceClasses,
      this.hass.states,
    );
    if (!entities || !(domain in entities.entitiesByDomain)) {
      return undefined;
    }
    const toCheck: HassEntity[] = [];
    // if we have a magic entity use that for the device type.
    const magicEntity = entities.magicByDomain[domain].filter(
      (entity) => !deviceClass || entity.attributes.device_class === deviceClass,
    );
    if (magicEntity.length > 0) {
      toCheck.push(...magicEntity);
    } else {
      toCheck.push(
        ...entities.entitiesByDomain[domain].filter(
          (entity) => !deviceClass || entity.attributes.device_class === deviceClass,
        ),
      );
    }
    return toCheck.find((entity) => !isUnavailableState(entity.state) && !STATES_OFF.includes(entity.state));
  }

  private _average(domain: string, deviceClass?: string): string | undefined {
    const entities = this._entitiesByDomain(
      this._config!.area ?? '',
      this._devicesInArea(this._config!.area, this._devices!),
      this._simplyMagicDevice(this._config!.area, this._devices!),
      this._entities!,
      this._deviceClasses,
      this.hass.states,
    );
    if (!entities || !(domain in entities.entitiesByDomain)) {
      return undefined;
    }
    let uom;
    // if we have a magic entity use that for the device type.
    const toCheck = entities.magicByDomain[domain].filter(
      (entity) => !deviceClass || entity.attributes.device_class === deviceClass,
    );
    if (toCheck.length === 0) {
      toCheck.push(
        ...entities.entitiesByDomain[domain].filter(
          (entity) => !deviceClass || entity.attributes.device_class === deviceClass,
        ),
      );
    }

    const values = entities.entitiesByDomain[domain].filter((entity) => {
      if (!isNumericState(entity) || isNaN(Number(entity.state))) {
        return false;
      }
      if (!uom) {
        uom = entity.attributes.unit_of_measurement;
        return true;
      }
      return entity.attributes.unit_of_measurement === uom;
    });
    if (!values.length) {
      return undefined;
    }
    const sum = values.reduce((total, entity) => total + Number(entity.state), 0);
    return `${formatNumber(sum / values.length, this.hass!.locale, {
      maximumFractionDigits: 1,
    })}${uom ? blankBeforeUnit(uom, this.hass!.locale) : ''}${uom || ''}`;
  }

  private _area = memoizeOne(
    (areaId: string | undefined, areas: AreaRegistryEntry[]) => areas.find((area) => area.area_id === areaId) || null,
  );

  private _devicesInArea = memoizeOne(
    (areaId: string | undefined, devices: DeviceRegistryEntry[]) =>
      new Set(areaId ? devices.filter((device) => device.area_id === areaId).map((device) => device.id) : []),
  );

  private _simplyMagicDevice = memoizeOne(
    (areaId: string | undefined, devices: DeviceRegistryEntry[]) =>
      new Set(
        areaId
          ? devices
              .filter((device) => device.area_id === areaId && device.manufacturer === SIMPLY_MAGIC_AREA_MANUFACTURER)
              .map((device) => device.id)
          : [],
      ),
  );

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: SimplyMagicCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._deviceClasses = { ...DEVICE_CLASSES };
    if (config.sensor_classes) {
      this._deviceClasses.sensor = config.sensor_classes;
    }
    if (config.alert_classes) {
      this._deviceClasses.binary_sensor = config.alert_classes;
    }

    this._config = {
      name: 'SimplyMagic',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has('_config') || !this._config) {
      return true;
    }

    if (changedProps.has('_devicesInArea') || changedProps.has('_areas') || changedProps.has('_entities')) {
      return true;
    }

    if (!changedProps.has('hass')) {
      return false;
    }

    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

    if (!oldHass || oldHass.themes !== this.hass!.themes || oldHass.locale !== this.hass!.locale) {
      return true;
    }

    if (!this._devices || !this._devicesInArea(this._config.area, this._devices) || !this._entities) {
      return false;
    }

    const entities = this._entitiesByDomain(
      this._config.area ?? '',
      this._devicesInArea(this._config.area, this._devices),
      this._simplyMagicDevice(this._config.area, this._devices),
      this._entities,
      this._deviceClasses,
      this.hass.states,
    );

    for (const domainEntities of Object.values(entities.entitiesByDomain)) {
      for (const stateObj of domainEntities) {
        if (oldHass!.states[stateObj.entity_id] !== stateObj) {
          return true;
        }
      }
    }

    return false;
  }

  public willUpdate(changedProps: PropertyValues) {
    if (changedProps.has('_config') || this._ratio === null) {
      this._ratio = this._config?.aspect_ratio ? parseAspectRatio(this._config?.aspect_ratio) : null;

      if (this._ratio === null || this._ratio.w <= 0 || this._ratio.h <= 0) {
        this._ratio = parseAspectRatio(DEFAULT_ASPECT_RATIO);
      }
    }
  }

  public hassSubscribe(): UnsubscribeFunc[] {
    return [
      subscribeAreaRegistry(this.hass!.connection as any as Connection, (areas) => {
        this._areas = areas;
      }),
      subscribeDeviceRegistry(this.hass!.connection as any as Connection, (devices) => {
        this._devices = devices;
      }),
      subscribeEntityRegistry(this.hass!.connection as any as Connection, (entries) => {
        this._entities = entries;
      }),
    ];
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    const entitiesByDomain = this._entitiesByDomain(
      this._config.area ?? '',
      this._devicesInArea(this._config.area, this._devices ?? []),
      this._simplyMagicDevice(this._config.area, this._devices ?? []),
      this._entities ?? [],
      this._deviceClasses,
      this.hass.states,
    );
    const area = this._area(this._config.area, this._areas ?? []);

    if (area === null) {
      return html`
        <hui-warning> ${this.hass.localize('ui.card.area.area_not_found')} ${this._config.area} </hui-warning>
      `;
    }

    const sensors: TemplateResult[] = [];
    SENSOR_DOMAINS.forEach((domain) => {
      if (!(domain in entitiesByDomain.entitiesByDomain)) {
        return;
      }
      this._deviceClasses[domain].forEach((deviceClass) => {
        // If we have a magic entity, use that, otherwise the other ones.
        if (entitiesByDomain.magicByDomain[domain].some((entity) => entity.attributes.device_class == deviceClass)) {
          sensors.push(html`
            <div class="sensor">
              <ha-domain-icon .hass=${this.hass} .domain=${domain} .deviceClass=${deviceClass}></ha-domain-icon>
              ${this._average(domain, deviceClass)}
            </div>
          `);
        } else if (
          entitiesByDomain.entitiesByDomain[domain].some((entity) => entity.attributes.device_class === deviceClass)
        ) {
          sensors.push(html`
            <div class="sensor">
              <ha-domain-icon .hass=${this.hass} .domain=${domain} .deviceClass=${deviceClass}></ha-domain-icon>
              ${this._average(domain, deviceClass)}
            </div>
          `);
        }
      });
    });

    let cameraEntityId: string | undefined;
    if (this._config.show_camera && 'camera' in entitiesByDomain) {
      cameraEntityId = entitiesByDomain.entitiesByDomain.camera[0].entity_id;
    }

    const controlState = this.hass.states[this._simplyMagicControlEntity()]?.state ?? 'off';
    const lightState = this.hass.states[this._simplyMagicLightEntity()]?.state ?? 'off';

    const imageClass = area.picture || cameraEntityId;
    return html`
      <ha-card
        class=${imageClass ? 'image' : ''}
        style=${styleMap({
          paddingBottom: imageClass ? '0' : `${((100 * this._ratio!.h) / this._ratio!.w).toFixed(2)}%`,
        })}
      >
        ${area.picture || cameraEntityId
          ? html`
              <hui-image
                .config=${this._config}
                .hass=${this.hass}
                .image=${area.picture ? area.picture : undefined}
                .cameraImage=${cameraEntityId}
                .cameraView=${this._config.camera_view}
                .aspectRatio=${this._config.aspect_ratio || DEFAULT_ASPECT_RATIO}
              ></hui-image>
            `
          : area.icon
          ? html`
              <div class="icon-container">
                <ha-icon icon=${area.icon}></ha-icon>
              </div>
            `
          : nothing}

        <div
          class="container ${classMap({
            navigate: this._config.navigation_path !== undefined,
          })}"
          @click=${this._handleNavigation}
        >
          <div class="top">
            <div class="alerts">
              ${ALERT_DOMAINS.map((domain) => {
                if (domain == SELECT_DOMAIN) {
                  const magicState = this._simplyMagicState();
                  return html` <ha-svg-icon .path=${this._stateIcon(magicState)} class="select"></ha-svg-icon> `;
                }
                if (!(domain in entitiesByDomain.entitiesByDomain)) {
                  return nothing;
                }
                return this._deviceClasses[domain].map((deviceClass) => {
                  const entity = this._isOn(domain, deviceClass);
                  return entity
                    ? html`
                        <ha-state-icon
                          class="alert"
                          .hass=${this.hass}
                          .stateObj=${entity}
                          entityId=${entity ? entity.entity_id : 'off'}
                        ></ha-state-icon>
                      `
                    : nothing;
                });
              })}
            </div>
            <div class="controls">
              <ha-button-menu fixed>
                <ha-button slot="trigger">
                  <div>${controlState === 'on' ? 'Auto' : lightState === 'on' ? 'on' : 'off'}</div>
                  <ha-svg-icon slot="trailingIcon" .path=${mdiChevronDown}></ha-svg-icon>
                </ha-button>
                <ha-list-item graphic="icon" @click=${this._handleChangeControl} .state=${'auto'}>
                  <ha-svg-icon .path=${mdiHeadCog} slot="graphic"></ha-svg-icon>
                  Auto
                </ha-list-item>
                <ha-list-item graphic="icon" @click=${this._handleChangeControl} .state=${'on'}>
                  <ha-svg-icon .path=${mdiLightbulbMultiple} slot="graphic"></ha-svg-icon>
                  Always On
                </ha-list-item>
                <ha-list-item graphic="icon" @click=${this._handleChangeControl} .state=${'off'}>
                  <ha-svg-icon .path=${mdiLightbulbMultipleOff} slot="graphic"></ha-svg-icon>
                  Always Off
                </ha-list-item>
              </ha-button-menu>
            </div>
          </div>
          <div class="bottom">
            <div>
              <div class="name">${area.name}</div>
              ${sensors.length ? html`<div class="sensors">${sensors}</div>` : ''}
            </div>
            <div class="buttons">
              ${TOGGLE_DOMAINS.map((domain) => {
                if (!(domain in entitiesByDomain.entitiesByDomain)) {
                  return '';
                }

                const on = this._isOn(domain)!;
                return TOGGLE_DOMAINS.includes(domain)
                  ? html`
                      <ha-icon-button
                        class=${on ? 'on' : 'off'}
                        .path=${DOMAIN_ICONS[domain][on ? 'on' : 'off']}
                        .domain=${domain}
                        entityId=${on ? on.entity_id : 'off'}
                        @click=${this._toggle}
                      >
                      </ha-icon-button>
                    `
                  : '';
              })}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _handleChangeControl(ev: Event) {
    ev.stopPropagation();
    const state = (ev.currentTarget as any).state as string;
    console.log(ev.currentTarget);
    console.log(state);
    let controlState = true;
    let lightState = true;
    switch (state) {
      case 'auto':
        controlState = true;
        lightState = true;
        break;
      case 'on':
        controlState = false;
        lightState = true;
        break;
      case 'off':
        controlState = false;
        lightState = false;
        break;
      default:
        return;
    }
    console.log('turn on control ' + controlState);
    turnOnOffEntity(this.hass, this._simplyMagicControlEntity(), controlState);
    if (!controlState) {
      console.log('turn on light ' + lightState);
      turnOnOffEntity(this.hass, this._simplyMagicLightEntity(), lightState);
    }
  }

  private _simplyMagicControlEntity() {
    const area = this._area(this._config.area, this._areas ?? []);
    return SWITCH_DOMAIN + '.simply_magic_areas_light_control_' + area?.area_id;
  }

  private _simplyMagicLightEntity() {
    const area = this._area(this._config.area, this._areas ?? []);
    return LIGHT_DOMAIN + '.simply_magic_areas_light_' + area?.area_id;
  }

  private _handleNavigation() {
    if (this._config!.navigation_path) {
      navigate(this, this._config!.navigation_path);
    }
  }

  private _toggle(ev: Event) {
    ev.stopPropagation();
    const domain = (ev.currentTarget as any).domain as string;
    if (TOGGLE_DOMAINS.includes(domain)) {
      this.hass.callService(domain, this._isOn(domain) ? 'turn_off' : 'turn_on', undefined, {
        area_id: this._config!.area,
      });
    }
    forwardHaptic('light');
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        overflow: hidden;
        position: relative;
        background-size: cover;
      }

      .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(0, rgba(33, 33, 33, 0.9) 0%, rgba(33, 33, 33, 0) 45%);
      }

      ha-card:not(.image) .container::before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        background-color: var(--sidebar-selected-icon-color);
        opacity: 0.12;
      }

      .icon-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-container ha-icon {
        --mdc-icon-size: 60px;
        color: var(--sidebar-selected-icon-color);
      }

      .sensors {
        color: #e3e3e3;
        font-size: 16px;
        --mdc-icon-size: 24px;
        opacity: 0.6;
        margin-top: 8px;
      }

      .buttons {
        min-width: 100px;
        display: flex;
        justify-content: flex-end;
      }

      .sensor {
        white-space: nowrap;
        float: left;
        margin-right: 4px;
        margin-inline-end: 4px;
        margin-inline-start: initial;
      }

      .alerts {
        padding: 16px;
      }

      .top {
        display: flex;
      }

      .controls {
        display: flex;
        flex-grow: 2;
        flex-direction: row;
        justify-content: flex-end;
      }

      .select {
        border-radius: 50%;
        background-color: green;
        padding: 8px;
        color: white;
      }

      ha-state-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .alerts ha-state-icon {
        background: var(--accent-color);
        color: var(--text-accent-color, var(--text-primary-color));
        padding: 8px;
        margin-right: 8px;
        margin-inline-end: 8px;
        margin-inline-start: initial;
        border-radius: 50%;
      }

      .name {
        color: white;
        font-size: 24px;
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
      }

      .navigate {
        cursor: pointer;
      }

      ha-icon-button {
        color: white;
        background-color: var(--area-button-color, #727272b2);
        border-radius: 50%;
        margin-left: 8px;
        margin-inline-start: 8px;
        margin-inline-end: initial;
        --mdc-icon-button-size: 44px;
      }
      .on {
        color: var(--state-light-active-color);
      }
    `;
  }
}
