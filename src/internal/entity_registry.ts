import { debounce } from 'custom-card-helpers';
import { Connection, createCollection } from 'home-assistant-js-websocket';
import { Store } from 'home-assistant-js-websocket/dist/store';
import { EntityRegistryDisplayEntryResponse, EntityRegistryEntry } from './types';

export const fetchEntityRegistryDisplay = (conn: Connection) =>
  conn.sendMessagePromise<EntityRegistryDisplayEntryResponse>({
    type: 'config/entity_registry/list_for_display',
  });

const subscribeEntityRegistryDisplayUpdates = (conn: Connection, store: Store<EntityRegistryDisplayEntryResponse>) =>
  conn.subscribeEvents(
    debounce(() => fetchEntityRegistryDisplay(conn).then((entities) => store.setState(entities, true)), 500, true),
    'entity_registry_updated',
  );

export const subscribeEntityRegistryDisplay = (
  conn: Connection,
  onChange: (entities: EntityRegistryDisplayEntryResponse) => void,
) =>
  createCollection<EntityRegistryDisplayEntryResponse>(
    '_entityRegistryDisplay',
    fetchEntityRegistryDisplay,
    subscribeEntityRegistryDisplayUpdates,
    conn,
    onChange,
  );

export const fetchEntityRegistry = (conn: Connection) =>
  conn.sendMessagePromise<EntityRegistryEntry[]>({
    type: 'config/entity_registry/list',
  });

const subscribeEntityRegistryUpdates = (conn: Connection, store: Store<EntityRegistryEntry[]>) =>
  conn.subscribeEvents(
    debounce(() => fetchEntityRegistry(conn).then((entities) => store.setState(entities, true)), 500, true),
    'entity_registry_updated',
  );

export const subscribeEntityRegistry = (conn: Connection, onChange: (entities: EntityRegistryEntry[]) => void) =>
  createCollection<EntityRegistryEntry[]>(
    '_entityRegistry',
    fetchEntityRegistry,
    subscribeEntityRegistryUpdates,
    conn,
    onChange,
  );
