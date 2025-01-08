"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

interface postData {
  'posttype': string
  'views': number
  'comments': number
  'female': number,
  'follower_likes_percentage': number,
  'likes': number,
  'male': number,
  'non_follower_likes_percentage': number,
  'postsid': number,
  'shares': number,
  'topaudience': string
}


export default function LangflowPage() {
  const [inputValue, setInputValue] = useState("Carousel");
  const [insight, setInsight] = useState<string[]>([]);
  const [postData, setPostData] = useState<any>( [
    { views: 120000, comments: 1500, likes: 18000, shares: 250 },
    { views: 80000, comments: 1000, likes: 5000, shares: 150, },
    { views: 95000, comments: 1200, likes: 15000, shares: 300, },
    { views: 110000, comments: 1600, likes: 22000, shares: 400, },
    { views: 85000, comments: 900, likes: 11000, shares: 280,},
    { views: 90000, comments: 1100, likes: 14500, shares: 500},
    { views: 125000, comments: 1700, likes: 20000, shares: 600},
    { views: 105000, comments: 1500, likes: 18000, shares: 350},
    { views: 100000, comments: 1300, likes: 16000, shares: 220},
    { views: 95000, comments: 1400, likes: 15500, shares: 300, },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartOptions = {
    chart: { id: `${inputValue}-chart`, width: "1000px" },
    xaxis: { categories: postData?.map((item:any) => inputValue) || [] },
  };
  const likesData = postData?.map((item: any) => item.likes) || [];
  const sharesData = postData?.map((item: any) => item.shares) || [];
  const commentsData = postData?.map((item: any) => item.comments) || [];
  const viewsData = postData?.map((item: any) => item.views) || [];

  function parseToJsonObject(inputString: string) {
    try {
      const jsonString = inputString
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "");
      return JSON.parse(jsonString);
    } catch (error: any) {
      console.error("Invalid input format:", error.message);
      return null;
    }
  }

  const getRandomStrings = (arr: string[]): string[] => {
    const result: string[] = [];
    const arrCopy = [...arr];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * arrCopy.length);
      result.push(arrCopy[randomIndex]);
      arrCopy.splice(randomIndex, 1);
    }
    return result;
  };

  const handleRequest = async () => {
    setLoading(true);
    setError("");

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
      const final_result = result.split("$$$");
      const avg = parseToJsonObject(final_result[0]);
      const parsedPostData = parseToJsonObject(final_result[1]);
      console.log(avg);
      console.log(parsedPostData);
      setPostData(parsedPostData);
      
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
      const final_result = parseToJsonObject(result);
      const random_insights = getRandomStrings(final_result);

      console.log(final_result);

      setInsight(random_insights);
    } catch (err: any) {
      console.error("Error:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Chart Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Level Supermind Hackathon</h1>
        <h1 className="text-2xl font-bold mb-4">Post Type Analysis</h1>
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">Select Post Type:</label>
          <select
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              handleRequest()
            }}
            className="w-full p-3 border rounded-lg"
          >
            {["Carousel", "Reels", "Static Images", "Stories", "Live Videos"].map((postType) => (
              <option key={postType} value={postType}>{postType}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Likes</h2>
            <Chart options={chartOptions} series={[{ name: "Likes", data: likesData }]} type="line" height="300" />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Shares</h2>
            <Chart options={chartOptions} series={[{ name: "Shares", data: sharesData }]} type="area" height="300" />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Comments</h2>
            <Chart options={chartOptions} series={[{ name: "Comments", data: commentsData }]} type="bar" height="300" />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Views</h2>
            <Chart options={chartOptions} series={[{ name: "Views", data: viewsData }]} type="line" height="300" />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-6 bg-gray-100 rounded-lg shadow-lg text-center">
        <p className="text-xl font-semibold">Views</p>
        <h2 className="text-3xl font-bold mb-4">50,617</h2>
        <div className="flex justify-center space-x-10">
          <p className="text-lg">Followers: <span className="font-semibold">70.55%</span></p>
          <p className="text-lg">Non-Followers: <span className="font-semibold">29.44%</span></p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Insights</h1>
        <button
          onClick={handleInsightRequest}
          disabled={loading}
          className={`w-full p-3 rounded-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
        >
          {loading ? "Generating..." : "Generate Insights"}
        </button>
        <ol className="list-decimal mt-4 space-y-2">
          {insight.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ol>
      </div>

    </div>
  );
}
