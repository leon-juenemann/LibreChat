const {
  Capabilities,
  EModelEndpoint,
  assistantEndpointSchema,
  defaultAssistantsVersion,
} = require('librechat-data-provider');
const { logger } = require('~/config');

/**
 * Sets up the minimum, default Assistants configuration if Azure OpenAI Assistants option is enabled.
 * @returns {Partial<TAssistantEndpoint>} The Assistants endpoint configuration.
 */
function azureAssistantsDefaults() {
  return {
    capabilities: [Capabilities.tools, Capabilities.actions, Capabilities.code_interpreter],
    version: defaultAssistantsVersion.azureAssistants,
  };
}

/**
 * Sets up the Assistants configuration from the config (`librechat.yaml`) file.
 * @param {TCustomConfig} config - The loaded custom configuration.
 * @param {Partial<TAssistantEndpoint>} [prevConfig]
 * - The previously loaded assistants configuration from Azure OpenAI Assistants option.
 * @returns {Partial<TAssistantEndpoint>} The Assistants endpoint configuration.
 */
function assistantsConfigSetup(config, prevConfig = {}) {
  const assistantsConfig = config.endpoints[EModelEndpoint.assistants];
  const parsedConfig = assistantEndpointSchema.parse(assistantsConfig);
  if (assistantsConfig.supportedIds?.length && assistantsConfig.excludedIds?.length) {
    logger.warn(
      `Configuration conflict: The '${EModelEndpoint.assistants}' endpoint has both 'supportedIds' and 'excludedIds' defined. The 'excludedIds' will be ignored.`,
    );
  }
  if (
    assistantsConfig.privateAssistants &&
    (assistantsConfig.supportedIds?.length || assistantsConfig.excludedIds?.length)
  ) {
    logger.warn(
      `Configuration conflict: The '${EModelEndpoint.assistants}' endpoint has both 'privateAssistants' and 'supportedIds' or 'excludedIds' defined. The 'supportedIds' and 'excludedIds' will be ignored.`,
    );
  }

  return {
    ...prevConfig,
    retrievalModels: parsedConfig.retrievalModels,
    disableBuilder: parsedConfig.disableBuilder,
    pollIntervalMs: parsedConfig.pollIntervalMs,
    supportedIds: parsedConfig.supportedIds,
    capabilities: parsedConfig.capabilities,
    excludedIds: parsedConfig.excludedIds,
    privateAssistants: parsedConfig.privateAssistants,
    timeoutMs: parsedConfig.timeoutMs,
  };
}

module.exports = { azureAssistantsDefaults, assistantsConfigSetup };
