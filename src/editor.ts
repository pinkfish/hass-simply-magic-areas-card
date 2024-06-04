/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { SimplyMagicCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('simply-magic-area-card-editor')
export class SimplyMagicAreaCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: SimplyMagicCardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  public setConfig(config: SimplyMagicCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _area(): string {
    return this._config?.area || '';
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    return html`
      <ha-area-picker
        .curValue=${this._area}
        no-add
        .hass=${this.hass}
        .value=${this._area}
        .configValue=${'area'}
        label="Area to display"
        @value-changed=${this._valueChanged}
      >
      </ha-area-picker>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles() {
    return [
      css`
        ha-select,
        mwc-select {
          margin-bottom: 16px;
          display: block;
        }
      `,
    ];
  }
}
