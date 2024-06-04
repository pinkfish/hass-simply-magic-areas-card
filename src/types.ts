import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'simply-magic-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// Configuration for the simply magic card.
export interface SimplyMagicCardConfig extends LovelaceCardConfig {
  area?: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
