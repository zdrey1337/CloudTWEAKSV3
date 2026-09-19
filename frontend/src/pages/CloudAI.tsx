import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  Cpu,
  Zap,
  MessageCircle,
} from "lucide-react";

import type { CloudAIChatMessage } from "../types/cloudai";
import type { SystemStats } from "../types/system";

import { ChatWithAI } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

import "./CloudAI.css";

interface ChatMessage extends CloudAIChatMessage {
  id: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm **Cloud AI**, your CloudTWEAKS system assistant. I can analyze your current system stats, explain performance issues, and help you understand which optimizations may be useful.",
};

const QUICK_PROMPTS = [
  "Analyze my current system performance",
  "How can I improve my gaming FPS?",
  "Why is my RAM usage high?",
  "What Windows tweaks are safe for gaming?",
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks
  html = html.replace(
    /```([\s\S]*?)```/g,
    "<pre class=\"ai-code\"><code>$1</code></pre>"
  );

  // Inline code
  html = html.replace(
    /`([^`\n]+)`/g,
    "<code class=\"ai-inline-code\">$1</code>"
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Italic
  html = html.replace(
    /(^|[^\*])\*([^*\n]+)\*(?!\*)/g,
    "$1<em>$2</em>"
  );

  // Headings
  html = html.replace(
    /^### (.*)$/gm,
    "<h4>$1</h4>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<h2>$1</h2>"
  );

  // Bullet points
  html = html.replace(
    /^[•\-] (.*)$/gm,
    "<li>$1</li>"
  );

  html = html.replace(
    /(<li>.*<\/li>\n?)+/g,
    (match) => `<ul>${match}</ul>`
  );

  // Numbered lists
  html = html.replace(
    /^\d+\.\s+(.*)$/gm,
    "<li>$1</li>"
  );

  // New lines
  html = html.replace(/\n/g, "<br />");

  return html;
}

function generateMessageId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function CloudAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const [input, setInput] = useState("");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /*
   * ---------------------------------------------------------
   * SYSTEM TELEMETRY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const getSystemStats =
          window.go?.main?.App?.GetSystemStats;

        if (!getSystemStats) {
          return;
        }

        const result = await getSystemStats();

        if (mounted) {
          setStats(result);
        }
      } catch (error) {
        console.error(
          "Failed to load system statistics:",
          error
        );
      }
    };

    loadStats();

    const interval = window.setInterval(
      loadStats,
      1000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * AUTO SCROLL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
   * ---------------------------------------------------------
   * TEXTAREA AUTO RESIZE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  }, [input]);

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  const sendMessage = async (
    messageOverride?: string
  ) => {
    const message = (
      messageOverride ?? input
    ).trim();

    if (!message || loading) {
      return;
    }

    setInput("");

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setLoading(true);

    try {
      /*
       * Only send actual conversation messages.
       * The welcome UI message is not sent to the backend.
       */
      const history: CloudAIChatMessage[] =
        messages
          .filter(
            (item) => item.id !== "welcome"
          )
          .map((item) => ({
            role: item.role,
            content: item.content,
          }));

      history.push({
        role: "user",
        content: message,
      });

      /*
       * IMPORTANT:
       *
       * Use the Wails-generated model here.
       *
       * Do NOT use:
       *
       * const request: CloudAIChatRequest = ...
       *
       * from src/types/cloudai.ts
       *
       * because Wails requires its generated model,
       * which contains convertValues().
       */

      const request =
        new main.CloudAIChatRequest({
          message,
          history,
          systemStats: stats ?? undefined,
        });

      const result = await ChatWithAI(request);

      const responseText =
        result?.message?.trim() ||
        "Cloud AI returned an empty response.";

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: responseText,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Cloud AI request failed:",
        error
      );

      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content:
          "I couldn't connect to Cloud AI right now.\n\n" +
          "Please check your `.env` file and make sure `OPENAI_API_KEY` is configured correctly.",
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  /*
   * ---------------------------------------------------------
   * KEYBOARD HANDLING
   * ---------------------------------------------------------
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void sendMessage();
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR CHAT
   * ---------------------------------------------------------
   */

  const clearChat = () => {
    if (loading) {
      return;
    }

    setMessages([WELCOME_MESSAGE]);
    setInput("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  /*
   * ---------------------------------------------------------
   * QUICK PROMPT
   * ---------------------------------------------------------
   */

  const handleQuickPrompt = (
    prompt: string
  ) => {
    void sendMessage(prompt);
  };

  /*
   * ---------------------------------------------------------
   * FORMAT RAM
   * ---------------------------------------------------------
   */

  const formatMemory = (
    bytes: number
  ): string => {
    const gb =
      bytes /
      1024 /
      1024 /
      1024;

    return `${gb.toFixed(1)} GB`;
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <section className="cloud-ai-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="cloud-ai-header">
        <div className="cloud-ai-title">
          <div className="cloud-ai-icon">
            <Sparkles
              size={20}
              strokeWidth={2}
            />
          </div>

          <div>
            <h1>Cloud AI</h1>

            <p>
              AI-powered system analysis and
              optimization assistant
            </p>
          </div>
        </div>

        <button
          type="button"
          className="cloud-ai-clear"
          onClick={clearChat}
          disabled={
            loading ||
            messages.length <= 1
          }
        >
          <Trash2 size={15} />
          Clear Chat
        </button>
      </div>

      {/* =====================================================
          LIVE SYSTEM STATS
          ===================================================== */}

      <div className="cloud-ai-stats">
        <div className="cloud-ai-stat">
          <div className="cloud-ai-stat-icon">
            <Cpu size={16} />
          </div>

          <div>
            <span>CPU</span>

            <strong>
              {stats
                ? `${stats.cpuUsage.toFixed(
                    0
                  )}%`
                : "--"}
            </strong>
          </div>
        </div>

        <div className="cloud-ai-stat">
          <div className="cloud-ai-stat-icon">
            <Zap size={16} />
          </div>

          <div>
            <span>MEMORY</span>

            <strong>
              {stats
                ? `${stats.memoryUsage.toFixed(
                    0
                  )}%`
                : "--"}
            </strong>
          </div>
        </div>

        <div className="cloud-ai-stat">
          <div className="cloud-ai-stat-icon">
            <Sparkles size={16} />
          </div>

          <div>
            <span>PERFORMANCE</span>

            <strong>
              {stats
                ? `${stats.performance}`
                : "--"}
            </strong>
          </div>
        </div>

        <div className="cloud-ai-stat">
          <div className="cloud-ai-stat-icon">
            <MessageCircle size={16} />
          </div>

          <div>
            <span>STATUS</span>

            <strong className="online">
              ONLINE
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          CHAT AREA
          ===================================================== */}

      <div className="cloud-ai-chat">
        <div className="cloud-ai-messages">
          {messages.map((message) => {
            const isUser =
              message.role === "user";

            return (
              <div
                key={message.id}
                className={`cloud-ai-message ${
                  isUser
                    ? "user"
                    : "assistant"
                }`}
              >
                <div className="cloud-ai-avatar">
                  {isUser ? (
                    <User size={16} />
                  ) : (
                    <Bot size={17} />
                  )}
                </div>

                <div className="cloud-ai-message-content">
                  <div className="cloud-ai-message-name">
                    {isUser
                      ? "You"
                      : "Cloud AI"}
                  </div>

                  <div
                    className="cloud-ai-bubble"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(
                        message.content
                      ),
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* =================================================
              THINKING INDICATOR
              ================================================= */}

          {loading && (
            <div className="cloud-ai-message assistant">
              <div className="cloud-ai-avatar">
                <Bot size={17} />
              </div>

              <div className="cloud-ai-message-content">
                <div className="cloud-ai-message-name">
                  Cloud AI
                </div>

                <div className="cloud-ai-bubble cloud-ai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* =====================================================
          QUICK PROMPTS
          ===================================================== */}

      {messages.length <= 1 && (
        <div className="cloud-ai-quick">
          <div className="cloud-ai-quick-title">
            <Sparkles size={14} />
            Quick prompts
          </div>

          <div className="cloud-ai-quick-list">
            {QUICK_PROMPTS.map(
              (prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() =>
                    handleQuickPrompt(
                      prompt
                    )
                  }
                  disabled={loading}
                >
                  {prompt}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          INPUT
          ===================================================== */}

      <div className="cloud-ai-input-area">
        <div className="cloud-ai-input">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask Cloud AI about your system..."
            rows={1}
            disabled={loading}
          />

          <button
            type="button"
            className="cloud-ai-send"
            onClick={() =>
              void sendMessage()
            }
            disabled={
              loading ||
              !input.trim()
            }
            aria-label="Send message"
          >
            <Send
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="cloud-ai-input-hint">
          <span>
            Press <b>Enter</b> to send
          </span>

          <span>
            <b>Shift + Enter</b> for a new line
          </span>
        </div>
      </div>

      {/* =====================================================
          SYSTEM INFORMATION
          ===================================================== */}

      {stats && (
        <div className="cloud-ai-system-info">
          <span>
            {stats.os} •{" "}
            {stats.architecture}
          </span>

          <span>
            {stats.cpuCount} CPU cores
          </span>

          <span>
            {formatMemory(
              stats.memoryTotal
            )} RAM
          </span>
        </div>
      )}
    </section>
  );
}