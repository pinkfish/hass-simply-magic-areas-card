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
  show_camera?: boolean;
  aspect_ratio?: string;
}


type EntityCategory = "config" | "diagnostic";


export interface SensorEntityOptions {
  display_precision?: number | null;
  suggested_display_precision?: number | null;
  unit_of_measurement?: string | null;
}

export type LightColor =
  | {
      color_temp_kelvin: number;
    }
  | {
      hs_color: [number, number];
    }
  | {
      rgb_color: [number, number, number];
    }
  | {
      rgbw_color: [number, number, number, number];
    }
  | {
      rgbww_color: [number, number, number, number, number];
    };

export interface LightEntityOptions {
  favorite_colors?: LightColor[];
}

export interface NumberEntityOptions {
  unit_of_measurement?: string | null;
}

export interface LockEntityOptions {
  default_code?: string | null;
}

export interface WeatherEntityOptions {
  precipitation_unit?: string | null;
  pressure_unit?: string | null;
  temperature_unit?: string | null;
  visibility_unit?: string | null;
  wind_speed_unit?: string | null;
}

export interface SwitchAsXEntityOptions {
  entity_id: string;
  invert: boolean;
}

export interface EntityRegistryOptions {
  number?: NumberEntityOptions;
  sensor?: SensorEntityOptions;
  lock?: LockEntityOptions;
  weather?: WeatherEntityOptions;
  light?: LightEntityOptions;
  switch_as_x?: SwitchAsXEntityOptions;
  conversation?: Record<string, unknown>;
  "cloud.alexa"?: Record<string, unknown>;
  "cloud.google_assistant"?: Record<string, unknown>;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

export interface EntityRegistryDisplayEntryResponse {
  entities: {
    ei: string;
    di?: string;
    ai?: string;
    lb: string[];
    ec?: number;
    en?: string;
    ic?: string;
    pl?: string;
    tk?: string;
    hb?: boolean;
    dp?: number;
  }[];
  entity_categories: Record<number, EntityCategory>;
}

export interface EntityRegistryEntry {
  id: string;
  entity_id: string;
  name: string | null;
  icon: string | null;
  platform: string;
  config_entry_id: string | null;
  device_id: string | null;
  area_id: string | null;
  labels: string[];
  disabled_by: "user" | "device" | "integration" | "config_entry" | null;
  hidden_by: Exclude<EntityRegistryEntry["disabled_by"], "config_entry">;
  entity_category: EntityCategory | null;
  has_entity_name: boolean;
  original_name?: string;
  unique_id: string;
  translation_key?: string;
  options: EntityRegistryOptions | null;
  categories: { [scope: string]: string };
}



export interface AreaRegistryEntry {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}


export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  connections: Array<[string, string]>;
  identifiers: Array<[string, string]>;
  manufacturer: string | null;
  model: string | null;
  name: string | null;
  labels: string[];
  sw_version: string | null;
  hw_version: string | null;
  serial_number: string | null;
  via_device_id: string | null;
  area_id: string | null;
  name_by_user: string | null;
  entry_type: "service" | null;
  disabled_by: "user" | "integration" | "config_entry" | null;
  configuration_url: string | null;
}
