import { IExecuteFunctions } from "n8n-workflow";
import {
  EightKitHttpClient,
  buildSetEndpoint,
  validateSetName,
  validateValue,
} from "../utils/httpClient";

export interface CheckSetValuesParams {
  name: string;
  value: string;
  outputField: string;
  createSetIfMissing: boolean;
}

interface SingleCheckResult {
  exists: boolean;
  value?: any;
}

interface BulkCheckResult {
  found: number;
  notFound: number;
  errors: Array<{ index: number; error: string }>;
  checks: Array<{ value: string; exists: boolean; setValue?: any }>;
}

export async function executeCheckSetValues(
  this: IExecuteFunctions,
  itemIndex: number
): Promise<{ result: any; outputIndex: number } | null> {
  console.log(
    "🔍 [8kit] executeCheckSetValues called for itemIndex:",
    itemIndex
  );
  console.log("🔍 [8kit] Starting checkSetValues operation...");

  const name = this.getNodeParameter("name", itemIndex) as string;
  const value = this.getNodeParameter("value", itemIndex) as string;

  // Get advanced settings
  const getSetValueData =
    (this.getNodeParameter("getSetValueData", itemIndex) as
      | boolean
      | undefined) || false;
  const setValueDataFieldName = getSetValueData
    ? (this.getNodeParameter("setValueDataFieldName", itemIndex) as
      | string
      | undefined) || "__checkData"
    : "__checkData"; // Default value when getSetValueData is false
  console.log("🔍 [8kit] Parameters:", {
    name,
    value,
    getSetValueData,
    setValueDataFieldName,
  });

  // Validate inputs
  validateSetName(name);

  const inputData = this.getInputData()[itemIndex].json;

  console.log("🔍 [8kit] Input data:", { inputData, value });

  if (!value) {
    throw new Error(
      `Value is required and cannot be empty`
    );
  }

  // Initialize HTTP client
  const credentials = await this.getCredentials("eightKitApi");
  const baseUrl = credentials.hostUrl as string;

  if (!baseUrl) {
    throw new Error("Host URL is not configured in credentials");
  }

  // Ensure baseUrl is properly formatted
  const formattedBaseUrl = baseUrl.trim().replace(/\/$/, ""); // Remove trailing slash if present

  console.log("🔍 [8kit] API Configuration:", {
    originalUrl: baseUrl,
    formattedUrl: formattedBaseUrl,
  });

  const client = new EightKitHttpClient(this, itemIndex);

  try {
    let result;
    result = await executeSingleCheck.call(
      this,
      itemIndex,
      {
        name,
        value,
        client,
        baseUrl: formattedBaseUrl,
        getSetValueData,
        setValueDataFieldName,
      },
      inputData
    );

    if (!result) {
      return null;
    }

    // Determine output index based on existence
    const outputIndex = result.exists !== undefined && result.exists ? 0 : 1;

    return { result, outputIndex };
  } catch (error: any) {
    console.log(
      "🔍 [8kit] Error in executeCheckSetValues:",
      error.message
    );
    throw error;
  }
}

async function executeSingleCheck(
  this: IExecuteFunctions,
  itemIndex: number,
  params: {
    name: string;
    value: any;
    client: EightKitHttpClient;
    baseUrl: string;
    getSetValueData?: boolean;
    setValueDataFieldName?: string;
  },
  inputData: any
): Promise<{ result: any; exists: boolean } | null> {
  const {
    name,
    value,
    client,
    baseUrl,
    getSetValueData,
    setValueDataFieldName,
  } = params;

  // Validate the value
  //TODO: Add support for other value types
  if (typeof value !== "string") {
    throw new Error(`Value must be a string, got ${typeof value}`);
  }
  validateValue(value);

  // Build endpoint for single value check
  const endpoint = buildSetEndpoint(name, "contains");

  // Ensure baseUrl is valid and properly formatted
  if (!baseUrl || typeof baseUrl !== "string") {
    throw new Error("Invalid base URL provided");
  }

  // Ensure baseUrl ends with no trailing slash and endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${baseUrl}${formattedEndpoint}`;

  console.log("🔍 [8kit] Single check URL:", url);
  console.log("🔍 [8kit] Single check payload:", { value });

  try {
    console.log("🔍 [8kit] Making API request (POST)...");
    // Changed from GET with query param to POST with body
    const response = await client.post<SingleCheckResult>(url, { value });

    console.log("🔍 [8kit] API Response received:", response);

    if (!response.success) {
      throw new Error(`API Error: ${response.error || "Unknown error"}`);
    }

    if (!response.data) {
      throw new Error("API response missing data field");
    }

    const result = response.data;
    const exists = result.exists;

    console.log("🔍 [8kit] API Response:", { result });

    // Build output based on advanced settings
    let output = { ...inputData };

    // Only add set value data if the advanced setting is enabled
    if (getSetValueData) {
      const fieldName = setValueDataFieldName || "__checkData";
      output[fieldName] = result.value;
    }

    console.log("🔍 [8kit] Single check result:", output);
    return { result: output, exists };
  } catch (error: any) {
    console.log("🔍 [8kit] Single check error:", error.message);

    // Handle 404 (set not found)
    if (
      error.message.includes("404") ||
      error.message.includes("SET_NOT_FOUND")
    ) {
      throw new Error(`Set "${name}" not found.`);
    }

    console.log("🔍 [8kit] Re-throwing error:", error.message);
    throw error;
  }
}
