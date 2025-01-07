"use client";

import { useState } from "react";

export default function LangflowPage() {
  const [inputValue, setInputValue] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [insight, setInsight] = useState<string[]>([
    
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseToJsonObject(inputString: string) {
    try {
      // Replace single quotes with double quotes
      const jsonString = inputString
        .replace(/'/g, '"') // Replace all single quotes with double quotes
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']'); // Remove trailing commas before closing brackets

      // Parse the corrected string into a JSON object
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error: any) {
      console.error("Invalid input format:", error.message);
      return null; // Return null if parsing fails
    }
  }

  const getRandomStrings = (arr: string[]): string[] => {
    const result: string[] = [];
    const arrCopy = [...arr]; // Create a shallow copy of the array
  
    // Select 3 random strings
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * arrCopy.length);
      result.push(arrCopy[randomIndex]);
      arrCopy.splice(randomIndex, 1); // Remove the selected item to avoid duplicates
    }
  
    return result;
  };

  const handleRequest = async () => {
    setLoading(true);
    setError("");
    setResponseMessage("");

    try {
      const response = await fetch("/api/langflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const flowOutputs = data.outputs?.[0];
      const firstComponentOutputs = flowOutputs?.outputs?.[0];
      const output = firstComponentOutputs?.outputs?.message;
      const result = output.message.text;
      const final_result = result.split("$$$")
      const avg = parseToJsonObject(final_result[0])
      const postData = parseToJsonObject(final_result[1])
      console.log(avg);
      console.log(postData);
      setResponseMessage(result);
    } catch (err: any) {
      console.error("Error:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }

  };

  const handleInsightRequest = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const flowOutputs = data.outputs?.[0];
      const firstComponentOutputs = flowOutputs?.outputs?.[0];
      const output = firstComponentOutputs?.outputs?.message;
      const result = output.message.text;
      const final_result = JSON.parse(result);
      const random_insights = getRandomStrings(final_result)
      console.log(JSON.parse(result));
      
      setInsight(random_insights);

    } catch (err: any) {
      console.error("Error:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div>
      <div className="p-6 rounded-xl shadow-md space-y-4 m-4">
        <h1 className="text-xl font-bold">Level Supermind Hackathon</h1>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your input"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleRequest}
          disabled={loading || !inputValue}
          className={`w-full p-2 mt-2 rounded-md ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
        {responseMessage && (
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            {responseMessage}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
      <div className="p-6 rounded-xl shadow-md space-y-4 m-4">
        <h1 className="text-xl font-bold">Insights</h1>
        <button
          onClick={handleInsightRequest}
          disabled={loading}
          className={`w-full p-2 mt-2 rounded-md ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
        >
          {loading ? "Generating..." : "Generate insights"}
        </button>
        <ol className="list-decimal">
          {insight && insight.map((insight, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              {insight}
            </li>
          ))}
        </ol>
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
