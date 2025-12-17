"use client"
import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  Bug,
  Camera,
  Send,
  AlertCircle
} from 'lucide-react';

type Message = {
  sender: 'ai' | 'user';
  text?: string;
  diagnosis?: {
    name: string;
    crop: string;
    confidence: 'High' | 'Medium' | 'Low';
    similarity_score: number;
    symptoms: string[];
    recommendation: string;
  };
};

const initialMessage: Message = {
  sender: 'ai',
  text: 'Hello! I\'m your AI Agronomist. Describe what you see on your crops (e.g., "Yellow spots on maize leaves with ragged holes").',
};

const PestDoctor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const presentDiagnosis = (matches: any[]) => {
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      const diagnosisMessage: Message = {
        sender: 'ai',
        diagnosis: {
          name: bestMatch.common_name,
          crop: bestMatch.crop,
          confidence: bestMatch.confidence_level,
          similarity_score: bestMatch.similarity_score,
          symptoms: bestMatch.key_symptoms_sample || [],
          recommendation: bestMatch.management_options?.cultural || 'Contact your local extension officer for guidance.',
        },
      };
      setMessages(prev => [...prev, diagnosisMessage]);
      setIsConfirming(true);
    } else {
      const noMatchMessage: Message = {
        sender: 'ai',
        text: "I'm sorry, I couldn't find a clear match based on your description. Please describe it differently or add more details about the symptoms.",
      };
      setMessages(prev => [...prev, noMatchMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsConfirming(false);
    setIsLoading(true);

    try {
      const apiUrl = 'https://agriseed.onrender.com';
      const res = await fetch(`${apiUrl}/diagnose?query=${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        throw new Error(`Backend returned status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `Error: ${data.error}. Please try again with a clearer description.` 
        }]);
      } else {
        setPotentialMatches(data.results);
        presentDiagnosis(data.results);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Sorry, I had trouble connecting to the diagnostic server. Please check your connection and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (isCorrect: boolean) => {
    setIsConfirming(false);
    
    if (isCorrect) {
      const bestMatch = potentialMatches[0];
      
      // Save feedback (optional)
      try {
        const apiUrl = 'https://agriseed.onrender.com';
        await fetch(`${apiUrl}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagnosis: bestMatch.common_name,
            is_correct: true
          })
        });
      } catch (err) {
        console.log('Feedback not saved');
      }
      
      const confirmationMessage: Message = { 
        sender: 'ai', 
        text: 'Great! Glad I could help. Follow the recommendations provided and monitor your crops regularly.' 
      };
      setMessages(prev => [...prev, confirmationMessage]);
      setPotentialMatches([]);
    } else {
      const remainingMatches = potentialMatches.slice(1);
      setPotentialMatches(remainingMatches);
      
      if (remainingMatches.length > 0) {
        const nextSuggestionMessage: Message = { 
          sender: 'ai', 
          text: "Okay, let me suggest another possibility..." 
        };
        setMessages(prev => [...prev, nextSuggestionMessage]);
        presentDiagnosis(remainingMatches);
      } else {
        const finalMessage: Message = { 
          sender: 'ai', 
          text: "I'm sorry, I don't have any other matches. My knowledge is still growing. Please consider consulting a local extension officer for expert advice." 
        };
        setMessages(prev => [...prev, finalMessage]);
      }
    }
  };

  return (
    <div className="animate-fadeIn h-full flex flex-col gap-4">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">🐛 Pest & Disease Diagnosis</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Powered by <strong>TF-IDF & Cosine Similarity</strong> analysis
        </p>
      </div>

      <div ref={chatContainerRef} className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl p-4 mb-4 overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bug size={16} />
                </div>
              )}
              <div className={`${
                msg.sender === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm'
              } p-4 rounded-2xl max-w-[80%] md:max-w-[60%]`}>
                {msg.text ? (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                ) : msg.diagnosis ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {msg.diagnosis.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Crop: {msg.diagnosis.crop}
                        </p>
                      </div>
                      <Badge color={
                        msg.diagnosis.confidence === 'High' ? 'red' : 
                        msg.diagnosis.confidence === 'Medium' ? 'yellow' : 
                        'green'
                      }>
                        {msg.diagnosis.confidence}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg">
                      <p><strong>Match Score:</strong> {(msg.diagnosis.similarity_score * 100).toFixed(1)}%</p>
                    </div>
                    
                    {msg.diagnosis.symptoms.length > 0 && (
                      <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                        <p className="text-xs font-semibold mb-1 text-emerald-700 dark:text-emerald-400">Key Symptoms:</p>
                        <ul className="text-xs space-y-1">
                          {msg.diagnosis.symptoms.map((symptom, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span className="text-slate-700 dark:text-slate-300">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-semibold mb-1 text-amber-800 dark:text-amber-300">📋 Recommendation:</p>
                      <p className="text-xs text-amber-900 dark:text-amber-100">{msg.diagnosis.recommendation}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bug size={16} />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          
          {isConfirming && (
            <div className="flex justify-center gap-2 mt-4 animate-fadeIn">
              <Button 
                onClick={() => handleConfirmation(true)} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all hover:shadow-lg"
              >
                ✓ Yes, correct
              </Button>
              <Button 
                onClick={() => handleConfirmation(false)} 
                className="bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all hover:shadow-lg"
              >
                ✗ Try another
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex gap-2 items-center">
        <button className="p-3 text-slate-400 hover:text-emerald-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
          <Camera size={24} />
        </button>
        <input 
          type="text" 
          placeholder="Describe symptoms here..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 text-sm"
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
      `}</style>
    </div>
  );
};

export default PestDoctor;