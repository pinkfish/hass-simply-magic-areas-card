import { Connection, createCollection } from "home-assistant-js-websocket";
import { DeviceRegistryEntry } from "./types";
import { Store } from "home-assistant-js-websocket/dist/store";
import { debounce } from "custom-card-helpers";

export const fetchDeviceRegistry = (conn: Connection) =>
    conn.sendMessagePromise<DeviceRegistryEntry[]>({
      type: "config/device_registry/list",
    });
  
  const subscribeDeviceRegistryUpdates = (
    conn: Connection,
    store: Store<DeviceRegistryEntry[]>
  ) =>
    conn.subscribeEvents(
      debounce(
        () =>
          fetchDeviceRegistry(conn).then((devices) =>
            store.setState(devices, true)
          ),
        500,
        true
      ),
      "device_registry_updated"
    );
  
  export const subscribeDeviceRegistry = (
    conn: Connection,
    onChange: (devices: DeviceRegistryEntry[]) => void
  ) =>
    createCollection<DeviceRegistryEntry[]>(
      "_dr",
      fetchDeviceRegistry,
      subscribeDeviceRegistryUpdates,
      conn,
      onChange
    );