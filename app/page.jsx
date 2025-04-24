'use client'
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";

const defaultCppCode = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!";
    return 0;
}`;

const defaultCSharpCode = `using System;

class Program {
    static void Main(string[] args) {
        Console.WriteLine("Hello World!");
    }
}`;

export default function Home() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(defaultCppCode);
  const [output, setOutput] = useState("");
  const [savedCodes, setSavedCodes] = useState([]);
  const [currentCodeName, setCurrentCodeName] = useState("");
  const [input, setInput] = useState("");

  // Load saved codes from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedCodes");
    if (saved) {
      setSavedCodes(JSON.parse(saved));
    }
  }, []);

  // Save codes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedCodes", JSON.stringify(savedCodes));
  }, [savedCodes]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode(e.target.value === "cpp" ? defaultCppCode : defaultCSharpCode);
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const saveCode = () => {
    if (currentCodeName) {
      setSavedCodes([...savedCodes, { name: currentCodeName, code, language }]);
      setCurrentCodeName("");
    }
  };

  const loadCode = (savedCode) => {
    setCode(savedCode.code);
    setLanguage(savedCode.language);
  };

  const deleteCode = (index) => {
    const newSavedCodes = [...savedCodes];
    newSavedCodes.splice(index, 1);
    setSavedCodes(newSavedCodes);
  };

  const runCode = async () => {
    try {
      setOutput("Running code...");
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setOutput(data.error ? `Error:\n${data.error}` : data.output);
    } catch (error) {
      setOutput("Error running code: " + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Digital logic and Design project
          </h1>
          <p className="text-gray-400 mt-2"> logic gates in code</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor Section */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                </select>
                <button
                  onClick={runCode}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Run Code
                </button>
              </div>
              <Editor
                height="60vh"
                defaultLanguage="cpp"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 16,
                  minimap: { enabled: false },
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                }}
                className="rounded-lg overflow-hidden"
              />
            </div>

            {/* Input Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Input</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter program input here..."
                className="w-full h-32 bg-gray-700 text-white rounded-md p-3 resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Code Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Save Code</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentCodeName}
                  onChange={(e) => setCurrentCodeName(e.target.value)}
                  placeholder="Enter code name"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                />
                <button
                  onClick={saveCode}
                  disabled={!currentCodeName}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md disabled:opacity-50 hover:from-blue-600 hover:to-purple-600"
                >
                  Save Code
                </button>
              </div>
            </div>

            {/* Saved Codes Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Saved Codes</h3>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {savedCodes.map((saved, index) => (
                  <div key={index} className="bg-gray-700 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div
                        className="cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => loadCode(saved)}
                      >
                        <div className="font-medium text-white">{saved.name}</div>
                        <div className="text-sm text-gray-400">{saved.language}</div>
                      </div>
                      <button
                        onClick={() => deleteCode(index)}
                        className="text-red-400 hover:text-red-300 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Output</h3>
              <pre className="bg-gray-700 rounded-md p-3 text-white whitespace-pre-wrap max-h-[30vh] overflow-y-auto">
                {output || 'Program output will appear here...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16">
          <div className="relative overflow-hidden py-16 px-4">
            {/* Animated Background with improved blur */}
            <div className="absolute inset-0 rounded-[2.5rem]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-gradient backdrop-blur-3xl" />
              <div className="absolute inset-0 bg-gray-900/40 rounded-[2.5rem]" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-text-shine drop-shadow-lg">
                  Meet Our Team
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 p-2">
                {[
                  {
                    name: "Kerlos Hany",
                    role: "FrontEnd Developer Next JS 15",
                    gradient: "from-blue-500 to-cyan-500",
                    shadowColor: "shadow-blue-500/20",
                    type: "male"
                  },
                  {
                    name: "Ziad Ayman",
                    role: "Backend Engineer C++",
                    gradient: "from-purple-500 to-pink-500",
                    shadowColor: "shadow-purple-500/20",
                    type: "male"
                  },
                  {
                    name: "Shimaa Wael",
                    role: "Backend Engineer C#",
                    gradient: "from-pink-500 to-rose-500",
                    shadowColor: "shadow-pink-500/20",
                    type: "female"
                  },
                  {
                    name: "Akaber Ahmed",
                    role: "Backend Engineer C#",
                    gradient: "from-orange-500 to-amber-500",
                    shadowColor: "shadow-orange-500/20",
                    type: "female"
                  },
                  {
                    name: "Asser Mohammed",
                    role: "Backend Engineer C#",
                    gradient: "from-emerald-500 to-teal-500",
                    shadowColor: "shadow-emerald-500/20",
                    type: "male"
                  }
                ].map((member, index) => (
                  <div
                    key={index}
                    className="group relative perspective-1000"
                  >
                    <div className="relative h-80 transform-gpu transition-all duration-500 group-hover:rotate-y-180 preserve-3d">
                      {/* Front Card with improved design */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl">
                        <div className={`h-full rounded-2xl bg-gradient-to-br ${member.gradient} p-[2px] ${member.shadowColor} shadow-2xl`}>
                          <div className="h-full w-full rounded-2xl bg-gray-900/90 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32 mb-4">
                              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} animate-pulse-slow blur-sm`} />
                              <div className="absolute inset-[2px] rounded-full bg-gray-900" />
                              <img
                                src={member.type === 'female' ? '/woman.png' : '/boy.png'}
                                alt={member.name}
                                className="absolute inset-0 w-full h-full object-cover rounded-full ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <h3 className="text-xl font-bold text-white drop-shadow-glow">{member.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{member.role}</p>
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-green-500">Available for projects</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back Card with improved design */}
                      <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl">
                        <div className={`h-full rounded-2xl bg-gradient-to-br ${member.gradient} p-[2px] ${member.shadowColor} shadow-2xl`}>
                          <div className="h-full w-full rounded-2xl bg-gray-900/90 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
                            <div className="space-y-4 text-center">
                              <p className="text-gray-300">
                                "Contributing to make this project awesome!"
                              </p>
                              <div className="flex justify-center gap-4">
                                <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                  </svg>
                                </button>
                                <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
                                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <p className="text-sm text-gray-400/80 backdrop-blur-sm py-2 px-4 rounded-full inline-block bg-gray-800/30 border border-gray-700/30">
                  © {new Date().getFullYear()} Code Editor Project • Made with ❤️
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
