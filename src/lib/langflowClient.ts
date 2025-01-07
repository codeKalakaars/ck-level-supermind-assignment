interface LangflowHeaders {
    [key: string]: string;
}

interface LangflowResponse {
    outputs: Array<{
        outputs: Array<{
            outputs: {
                message: { text: string };
                artifacts?: { stream_url?: string };
            };
        }>;
    }>;
}

export class LangflowClient {
    private baseURL: string;
    private applicationToken: string;

    constructor(baseURL: string, applicationToken: string) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    private async post(endpoint: string, body: Record<string, unknown>, headers: LangflowHeaders = { "Content-Type": "application/json" }): Promise<LangflowResponse> {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;

        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`);
        }

        return response.json();
    }

    public async initiateSession(
        flowId: string,
        langflowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
        stream: boolean = false,
        tweaks: Record<string, unknown> = {}
    ) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks });
    }

    public handleStream(
        streamUrl: string,
        onUpdate: (data: any) => void,
        onClose: (message: string) => void,
        onError: (event: any) => void
    ): EventSource {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        };

        eventSource.onerror = (event) => {
            console.error("Stream Error:", event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose("Stream closed");
            eventSource.close();
        });

        return eventSource;
    }

    public async runFlow(
        flowId: string,
        langflowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
        tweaks: Record<string, unknown> = {},
        stream: boolean = false,
        onUpdate?: (data: any) => void,
        onClose?: (message: string) => void,
        onError?: (event: any) => void
    ) {
        const initResponse = await this.initiateSession(flowId, langflowId, inputValue, inputType, outputType, stream, tweaks);

        if (stream && initResponse.outputs[0]?.outputs[0]?.outputs.artifacts?.stream_url) {
            const streamUrl = initResponse.outputs[0].outputs[0].outputs.artifacts.stream_url;
            this.handleStream(streamUrl, onUpdate || (() => { }), onClose || (() => { }), onError || (() => { }));
        }

        return initResponse;
    }
}
