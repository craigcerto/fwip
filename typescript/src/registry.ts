/**
 * Config-driven model registry.
 *
 * Loads all built-in family configs at import time and builds a lookup index.
 * Supports runtime registration of custom models and families.
 */
import { CONFIGS } from "./configs/index.js";
import type {
  FamilyConfig,
  FamilyInfo,
  ModelConfig,
  ModelEntry,
  ModelRegistration,
} from "./types.js";

interface RegistryEntry {
  familyConfig: FamilyConfig;
  modelConfig: ModelConfig;
  modelId: string;
}

const _registry: Map<string, RegistryEntry> = new Map();
const _families: Map<string, FamilyConfig> = new Map();

/** Initialize registry from built-in configs. */
function _init(): void {
  for (const config of Object.values(CONFIGS)) {
    _registerFamilyInternal(config);
  }
}

function _registerFamilyInternal(config: FamilyConfig): void {
  _families.set(config.family, config);
  for (const [modelId, modelCfg] of Object.entries(config.models)) {
    const entry: RegistryEntry = {
      familyConfig: config,
      modelConfig: modelCfg,
      modelId,
    };
    _registry.set(modelId, entry);
    // Register aliases
    for (const alias of modelCfg.aliases ?? []) {
      _registry.set(alias, entry);
    }
  }
}

// Initialize on load
_init();

// ── Internal API ──

/** Look up a registry entry by model ID. Throws if not found. */
export function _getEntry(modelId: string): RegistryEntry {
  const entry = _registry.get(modelId);
  if (!entry) {
    const available = [..._registry.keys()].sort().join(", ");
    throw new Error(
      `Unknown model: "${modelId}". Available models: ${available}`,
    );
  }
  return entry;
}

// ── Public API ──

/** List all registered models, sorted by ID. */
export function listModels(): ModelEntry[] {
  // Deduplicate aliases — only include canonical model IDs
  const seen = new Set<string>();
  const entries: ModelEntry[] = [];

  for (const [id, entry] of _registry) {
    // Skip aliases (where the registered ID differs from the canonical modelId)
    if (id !== entry.modelId) continue;
    if (seen.has(id)) continue;
    seen.add(id);

    entries.push({
      id,
      family: entry.familyConfig.family,
      variant: entry.modelConfig.variant,
      name: entry.modelConfig.name,
      provider: entry.familyConfig.provider,
    });
  }

  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

/** List all registered families with summary info. */
export function listFamilies(): FamilyInfo[] {
  const infos: FamilyInfo[] = [];
  for (const config of _families.values()) {
    infos.push({
      family: config.family,
      provider: config.provider,
      docsUrl: config.docs_url,
      modelCount: Object.keys(config.models).length,
      ruleCount: config.rules.length,
    });
  }
  return infos.sort((a, b) => a.family.localeCompare(b.family));
}

/** Get the full config for a specific model. */
export function getModelConfig(
  modelId: string,
): ModelConfig & { family: string; provider: string; docsUrl?: string } {
  const entry = _getEntry(modelId);
  return {
    ...entry.modelConfig,
    family: entry.familyConfig.family,
    provider: entry.familyConfig.provider,
    docsUrl: entry.familyConfig.docs_url,
  };
}

/** Get the full family config (returns a deep copy to prevent accidental mutation). */
export function getFamilyConfig(family: string): FamilyConfig {
  const config = _families.get(family);
  if (!config) {
    const available = [..._families.keys()].sort().join(", ");
    throw new Error(
      `Unknown family: "${family}". Available families: ${available}`,
    );
  }
  return JSON.parse(JSON.stringify(config)) as FamilyConfig;
}

/**
 * Register a custom model at runtime, associating it with an existing family.
 * The model will inherit the family's rules and API hints.
 */
export function registerModel(
  familyName: string,
  modelId: string,
  config: ModelRegistration,
): void {
  const familyConfig = _families.get(familyName);
  if (!familyConfig) {
    throw new Error(
      `Cannot register model "${modelId}": unknown family "${familyName}". ` +
        `Register the family first with registerFamily().`,
    );
  }

  const modelConfig: ModelConfig = {
    name: config.name,
    variant: config.variant,
    tier: config.tier,
    aliases: config.aliases,
  };

  // Add to the family config's models
  familyConfig.models[modelId] = modelConfig;

  // Add to registry
  const entry: RegistryEntry = {
    familyConfig,
    modelConfig,
    modelId,
  };
  _registry.set(modelId, entry);

  for (const alias of config.aliases ?? []) {
    _registry.set(alias, entry);
  }
}

/**
 * Register a custom model family at runtime with its own rules.
 * If the family already exists, it will be overwritten.
 */
export function registerFamily(config: FamilyConfig): void {
  _registerFamilyInternal(config);
}
