import { NextResponse } from "next/server";
import { LangflowClient } from "@/lib/langflowClient";

export async function POST(req: Request) {
    const body = await req.json();
    const { inputValue, tweaks = {} } = body;

    const flowId = "20a8ed9c-add7-4fbb-af5b-60bcd397a81d";
    const langflowId = "1f10f8e7-6cf0-49ac-b6f5-a5c104670e55";
    const applicationToken = process.env.LANGFLOW_TOKEN;

    if (!applicationToken) {
        return NextResponse.json({ error: "Application token is missing" }, { status: 500 });
    }

    const langflowClient = new LangflowClient("https://api.langflow.astra.datastax.com", applicationToken);

    try {
        const response = await langflowClient.runFlow(flowId, langflowId, inputValue, "chat", "chat", tweaks, false);
        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Langflow Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}