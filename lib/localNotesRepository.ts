/**
 * Notas en AsyncStorage cuando no hay JWT de la API REST (p. ej. solo Firebase Auth).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ChecklistNote, IdeaNote, Note } from '../types';
import { storeDateReviver } from '../utils/storeSerialization';

export type LocalNoteBuckets = {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
};

const EMPTY_BUCKETS: LocalNoteBuckets = {
  notes: [],
  checklists: [],
  ideas: [],
};

function storageKey(userId: string): string {
  return `noteflow-local-${userId}`;
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function loadLocalBuckets(userId: string): Promise<LocalNoteBuckets> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return EMPTY_BUCKETS;

  try {
    const parsed = JSON.parse(raw, storeDateReviver) as LocalNoteBuckets;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      checklists: Array.isArray(parsed.checklists) ? parsed.checklists : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
    };
  } catch {
    return EMPTY_BUCKETS;
  }
}

export async function saveLocalBuckets(
  userId: string,
  buckets: LocalNoteBuckets
): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(buckets));
}

export async function clearLocalBuckets(userId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}
