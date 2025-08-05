import { IExecuteFunctions } from "n8n-workflow";
import { EightKitHttpClient } from "../utils/httpClient";

export interface CreateSetParams {
    name: string;
    description?: string;
}

export async function executeCreateSet(
    this: IExecuteFunctions,
    itemIndex: number
): Promise<any> {
    console.log("🔍 [8kit] executeCreateSet called for itemIndex:", itemIndex);

    const name = this.getNodeParameter("name", itemIndex) as string;
    const description = this.getNodeParameter("description", itemIndex, "") as string;

    console.log("🔍 [8kit] Parameters:", { name, description });

    // Initialize HTTP client
    const credentials = await this.getCredentials("eightKitApi");
    const baseUrl = credentials.hostUrl as string;

    if (!baseUrl) {
        throw new Error("Host URL is not configured in credentials");
    }

    const formattedBaseUrl = baseUrl.trim().replace(/\/$/, "");
    const client = new EightKitHttpClient(this, itemIndex);

    try {
        const endpoint = "/api/v1/sets";
        const data = {
            name: name,
            description: description || undefined,
        };

        const response = await client.post(`${formattedBaseUrl}${endpoint}`, data);

        if (!response.success) {
            throw new Error(`Failed to create set: ${response.error || "Unknown error"}`);
        }

        console.log("🔍 [8kit] Set created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("🔍 [8kit] Error creating set:", error);
        throw error;
    }
} 