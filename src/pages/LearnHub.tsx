import { Sidebar } from '../components/Sidebar';
import { Upload, FileText, Youtube, MessageCircle, Download, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';

interface Question {
  question: string;
  type: 'MCQ' | 'Conceptual' | 'Short' | 'multiple-choice' | 'short-answer' | 'step-by-step';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
}

interface GeneratedContent {
  notes: string;
  questions: Question[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const LearnHub = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'notes' | 'questions' | 'mentor'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm here to help you understand any concepts or questions you have. What would you like to know?" }
  ]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAskingMentor, setIsAskingMentor] = useState(false);

  // FIXED: Added /api to the base URL
  const API_BASE = 'https://stellarlearn.onrender.com/api';

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      await processPDF(file);
    }
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl.trim()) {
      await processYouTube(youtubeUrl);
    }
  };

  const processPDF = async (file: File) => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate PDF text extraction
      const simulatedText = `This is a simulated PDF content about ${file.name.replace('.pdf', '')}. 
      
      Key topics covered:
      - Introduction to the subject
      - Important concepts and definitions
      - Practical applications
      - Summary and conclusions
      
      This content would normally be extracted from the PDF file using a proper PDF parsing service.`;

      const response = await fetch(`${API_BASE}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: simulatedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setActiveTab('notes');
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processYouTube = async (url: string) => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate YouTube transcript
      const simulatedTranscript = `This is a simulated transcript from a YouTube video about mathematics.
      
      The video covers:
      - Basic algebraic concepts
      - Equation solving techniques
      - Real-world applications
      - Practice problems and solutions
      
      This transcript would normally be fetched from YouTube's API or a transcript service.`;

      const response = await fetch(`${API_BASE}/youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: simulatedTranscript }),
      });

      if (!response.ok) {
        throw new Error('Failed to process YouTube video');
      }

      const data = await response.json();
      setGeneratedContent(data);
      setActiveTab('notes');
    } catch (error) {
      console.error('Error processing YouTube:', error);
      alert('Failed to process YouTube video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const askMentor = async (question: string) => {
    if (!question.trim()) return;

    setIsAskingMentor(true);
    const newUserMessage: ChatMessage = { role: 'user', content: question };
    setMentorMessages(prev => [...prev, newUserMessage]);
    setUserQuestion('');

    try {
      // Update the prompt to request clean text instead of JSON
      const mentorPrompt = `Please provide a clear, helpful explanation in plain text format (no JSON). Answer this question: "${question}"`;
      
      const response = await fetch(`${API_BASE}/mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: mentorPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get mentor response');
      }

      const data = await response.json();
      
      // Clean the response - remove any JSON formatting and extract clean text
      let cleanResponse = data.reply;
      
      // Remove JSON markdown blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to parse as JSON and extract the content if it's still in JSON format
      try {
        const parsed = JSON.parse(cleanResponse);
        if (typeof parsed === 'object' && parsed.notes) {
          cleanResponse = parsed.notes;
        } else if (typeof parsed === 'object' && parsed.reply) {
          cleanResponse = parsed.reply;
        } else if (typeof parsed === 'object') {
          // If it's an object, try to stringify the most relevant field
          cleanResponse = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // If it's not valid JSON, use the response as is
        cleanResponse = cleanResponse.trim();
      }
      
      // Remove any remaining JSON structure indicators
      cleanResponse = cleanResponse.replace(/\{.*?\}/g, '').replace(/\[.*?\]/g, '').trim();
      
      const assistantMessage: ChatMessage = { role: 'assistant', content: cleanResponse };
      setMentorMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking mentor:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again later." 
      };
      setMentorMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAskingMentor(false);
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askMentor(userQuestion);
  };

  const formatNotes = (notes: string) => {
    // Clean the notes first - remove any JSON formatting
    let cleanNotes = notes;
    
    // Remove JSON markdown blocks if present
    cleanNotes = cleanNotes.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to parse as JSON and extract the notes content
    try {
      const parsed = JSON.parse(cleanNotes);
      if (typeof parsed === 'object' && parsed.notes) {
        cleanNotes = parsed.notes;
      }
    } catch {
      // If it's not valid JSON, use the notes as is
      cleanNotes = cleanNotes.trim();
    }
    
    // Remove any remaining JSON structure
    cleanNotes = cleanNotes.replace(/\{.*?\}/g, '').replace(/\[.*?\]/g, '').trim();

    return cleanNotes.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle bold text by converting **text** to actual bold styling
      const renderWithBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };
      
      if (trimmedLine.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-white/20">{trimmedLine.replace('# ', '')}</h1>;
      } else if (trimmedLine.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">{trimmedLine.replace('## ', '')}</h2>;
      } else if (trimmedLine.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-white mt-5 mb-2">{trimmedLine.replace('### ', '')}</h3>;
      } else if (trimmedLine.startsWith('#### ')) {
        return <h4 key={index} className="text-md font-bold text-white mt-4 mb-2">{trimmedLine.replace('#### ', '')}</h4>;
      } else if (trimmedLine.startsWith('- **') && trimmedLine.includes('**:')) {
        const parts = trimmedLine.split('**:');
        return (
          <div key={index} className="flex mt-3 ml-4">
            <span className="font-bold text-white mr-2 min-w-fit">{parts[0].replace('- **', '')}:</span>
            <span className="text-white/80 flex-1">{renderWithBold(parts.slice(1).join(':'))}</span>
          </div>
        );
      } else if (trimmedLine.startsWith('- **')) {
        return (
          <li key={index} className="text-white/80 ml-6 mt-2 list-disc">
            {renderWithBold(trimmedLine.replace('- **', '').replace('**', ''))}
          </li>
        );
      } else if (trimmedLine.startsWith('- ')) {
        return <li key={index} className="text-white/80 ml-6 mt-2 list-disc">{renderWithBold(trimmedLine.replace('- ', ''))}</li>;
      } else if (trimmedLine.startsWith('• ')) {
        return <li key={index} className="text-white/80 ml-6 mt-2 list-disc">{renderWithBold(trimmedLine.replace('• ', ''))}</li>;
      } else if (trimmedLine.startsWith('* ')) {
        return <li key={index} className="text-white/80 ml-6 mt-2 list-disc">{renderWithBold(trimmedLine.replace('* ', ''))}</li>;
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        return <li key={index} className="text-white/80 ml-6 mt-2 list-decimal">{renderWithBold(trimmedLine.replace(/^\d+\.\s/, ''))}</li>;
      } else if (trimmedLine === '') {
        return <div key={index} className="h-4" />;
      } else if (trimmedLine.startsWith('---') || trimmedLine.startsWith('___') || trimmedLine.startsWith('***')) {
        return <hr key={index} className="my-6 border-white/20" />;
      } else {
        return <p key={index} className="text-white/80 mt-3 leading-relaxed">{renderWithBold(trimmedLine)}</p>;
      }
    });
  };

  const exportNotes = () => {
    if (!generatedContent?.notes) return;
    
    let cleanNotes = generatedContent.notes;
    
    // Clean the notes for export
    cleanNotes = cleanNotes.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    try {
      const parsed = JSON.parse(cleanNotes);
      if (typeof parsed === 'object' && parsed.notes) {
        cleanNotes = parsed.notes;
      }
    } catch {
      cleanNotes = cleanNotes.trim();
    }
    
    cleanNotes = cleanNotes.replace(/\{.*?\}/g, '').replace(/\[.*?\]/g, '').trim();
    
    const blob = new Blob([cleanNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">LearnHub</h1>
              <p className="text-white/60">Upload content and generate smart study materials</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-2xl">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm">AI Powered</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <GlassCard className="p-2">
            <div className="flex space-x-1">
              {[
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'notes', label: 'Notes', icon: FileText },
                { id: 'questions', label: 'Questions', icon: MessageCircle },
                { id: 'mentor', label: 'AI Mentor', icon: MessageCircle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all flex-1 text-sm font-medium ${
                    activeTab === id
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Content Area */}
          <div className="space-y-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PDF Upload */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Upload PDF</h3>
                  </div>
                  
                  <label className="block">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-white/40 transition-colors">
                      <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Upload PDF Document</p>
                      <p className="text-white/60 text-sm">Click to browse or drag & drop</p>
                      <p className="text-white/40 text-xs mt-2">Supports .pdf files</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {uploadedFile && (
                    <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-white" />
                        <span className="text-white text-sm truncate">{uploadedFile.name}</span>
                      </div>
                    </div>
                  )}
                </GlassCard>

                {/* YouTube URL */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Youtube className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">YouTube Video</h3>
                  </div>
                  
                  <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                    <div>
                      <input
                        type="url"
                        placeholder="Paste YouTube video URL here..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-white/50 focus:bg-white/10 outline-none text-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!youtubeUrl.trim() || isProcessing}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isProcessing ? 'Processing...' : 'Process Video'}
                    </button>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Generated Notes</h3>
                  </div>
                  <button 
                    onClick={exportNotes}
                    disabled={!generatedContent?.notes}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                {isProcessing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/60">AI is generating your notes...</p>
                  </div>
                ) : generatedContent ? (
                  <div className="text-white">
                    {formatNotes(generatedContent.notes)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60">No notes generated yet. Upload content to get started.</p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Practice Questions</h3>
                </div>

                {isProcessing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/60">AI is generating questions...</p>
                  </div>
                ) : generatedContent?.questions && generatedContent.questions.length > 0 ? (
                  <div className="space-y-4">
                    {generatedContent.questions.map((q, index) => (
                      <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-white font-medium">Question {index + 1}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            q.difficulty === 'easy' ? 'bg-white/20 text-white' :
                            q.difficulty === 'medium' ? 'bg-white/30 text-white' :
                            'bg-white/40 text-white'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-white mb-3">{q.question}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2">
                            {q.options.map((option, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                                <div className="w-4 h-4 rounded border border-white/30" />
                                <span className="text-white/80">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            setActiveTab('mentor');
                            setUserQuestion(`Can you help me with this question: ${q.question}`);
                          }}
                          className="mt-3 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          Need help? Ask AI Mentor →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60">No questions generated yet. Upload content to get started.</p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* AI Mentor Tab */}
            {activeTab === 'mentor' && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">AI Mentor</h3>
                </div>

                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto space-y-4">
                    {mentorMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-white/20 border border-white/30 ml-8'
                            : 'bg-white/5 border border-white/10 mr-8'
                        }`}
                      >
                        <p className="text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    ))}
                    {isAskingMentor && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mr-8">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleMentorSubmit} className="flex gap-3">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ask me anything about your study material..."
                      disabled={isAskingMentor}
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-white/50 focus:bg-white/10 outline-none text-white transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!userQuestion.trim() || isAskingMentor}
                      className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <GlassCard className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <h3 className="text-white text-lg font-bold mb-2">Processing Your Content</h3>
                <p className="text-white/60">AI is analyzing and generating study materials...</p>
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};