'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  PiChatCircleBold,
  PiXBold,
  PiPaperPlaneRightBold,
  PiRobotBold,
  PiLightningBold,
  PiCaretDownBold,
} from 'react-icons/pi'
import {
  getAgentForPage,
  getAgentById,
  type AgentProfile,
  type AgentRouteResult,
} from '@/lib/chat-routing'
import {
  type ChatMessage,
  type ChatPageContext,
  buildContextSystemMessage,
  generateSimulatedResponse,
} from '@/lib/chat-api'
import './ChatPanel.css'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatPanel() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [agentSwitcherOpen, setAgentSwitcherOpen] = useState(false)
  const [activeAgentOverride, setActiveAgentOverride] = useState<string | null>(
    null,
  )
  const [contextInjected, setContextInjected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevPathRef = useRef(pathname)
  const switcherRef = useRef<HTMLDivElement>(null)

  // Resolve agent from routing manifest (or override)
  const routeResult = getAgentForPage(pathname)
  const activeAgent: AgentRouteResult = activeAgentOverride
    ? {
        ...routeResult,
        ...(getAgentById(activeAgentOverride) ?? routeResult),
        secondaryAgents: routeResult.secondaryAgents,
        quickActions: routeResult.quickActions,
      }
    : routeResult

  // --- BF-XX-010: Context Injection ---
  // When the panel opens or the route changes, inject a system message
  // describing the current page context.
  const injectContext = useCallback(() => {
    const pageContext: ChatPageContext = {
      route: pathname,
      pageType: pathname.replace('/admin/', '').split('/')[0] || 'dashboard',
    }

    const sysMsg = buildContextSystemMessage(pageContext, activeAgent.agentName)
    setMessages((prev) => {
      // Don't double-inject for the same route
      if (prev.some((m) => m.role === 'system' && m.content === sysMsg.content))
        return prev
      return [sysMsg, ...prev]
    })
    setContextInjected(true)
  }, [pathname, activeAgent.agentName])

  // Inject context when panel opens
  useEffect(() => {
    if (open && !contextInjected) {
      injectContext()
    }
  }, [open, contextInjected, injectContext])

  // Reset when navigating to a different agent section
  useEffect(() => {
    const prevRoute = getAgentForPage(prevPathRef.current)
    if (prevRoute.agentId !== routeResult.agentId) {
      setMessages([])
      setContextInjected(false)
      setActiveAgentOverride(null)
    }
    prevPathRef.current = pathname
  }, [pathname, routeResult.agentId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  // Close agent switcher on outside click
  useEffect(() => {
    if (!agentSwitcherOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(e.target as Node)
      ) {
        setAgentSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [agentSwitcherOpen])

  // --- Send Message ---
  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        agentId: null,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setTyping(true)

      // Simulate agent response (will be replaced by NATS pipeline)
      setTimeout(
        () => {
          const agentMsg: ChatMessage = {
            id: `agent-${Date.now()}`,
            role: 'agent',
            content: generateSimulatedResponse(
              trimmed,
              activeAgent.agentId,
              activeAgent.agentName,
              pathname,
            ),
            agentId: activeAgent.agentId,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, agentMsg])
          setTyping(false)
        },
        800 + Math.random() * 1200,
      )
    },
    [activeAgent, pathname],
  )

  const handleSend = useCallback(() => {
    sendMessage(input)
  }, [input, sendMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // --- Quick Actions ---
  const handleQuickAction = useCallback(
    (action: string) => {
      sendMessage(action)
    },
    [sendMessage],
  )

  // --- Agent Switcher ---
  const switchAgent = useCallback(
    (agent: AgentProfile) => {
      setActiveAgentOverride(agent.agentId)
      setAgentSwitcherOpen(false)
      // Add a system message about the switch
      const switchMsg: ChatMessage = {
        id: `sys-switch-${Date.now()}`,
        role: 'system',
        content: `Switched to ${agent.agentName} (${agent.role}).`,
        agentId: null,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, switchMsg])
    },
    [],
  )

  // --- Helpers ---
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })

  const contextLabel =
    pathname.replace('/admin', '').replace(/^\//, '') || 'dashboard'

  // Build switchable agents list: primary + secondaries (deduplicated)
  const switchableAgents: AgentProfile[] = []
  const seenIds = new Set<string>()
  const addAgent = (a: AgentProfile) => {
    if (!seenIds.has(a.agentId)) {
      seenIds.add(a.agentId)
      switchableAgents.push(a)
    }
  }
  addAgent(routeResult) // primary first
  routeResult.secondaryAgents.forEach(addAgent)

  const hasMessages =
    messages.filter((m) => m.role !== 'system').length > 0 || typing

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`chat-panel-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <PiXBold /> : <PiChatCircleBold />}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="chat-panel-overlay" onClick={() => setOpen(false)} />
          <div className="chat-panel">
            {/* Header */}
            <div className="chat-panel-header">
              <div
                className="chat-panel-agent-avatar"
                style={{ background: activeAgent.color }}
              >
                {activeAgent.agentAvatar}
              </div>
              <div className="chat-panel-agent-info">
                <div className="chat-panel-agent-name">
                  {activeAgent.agentName}
                </div>
                <div className="chat-panel-agent-role">
                  {activeAgent.role}
                </div>
              </div>

              {/* Agent Switcher */}
              {switchableAgents.length > 1 && (
                <div className="chat-panel-switcher-wrap" ref={switcherRef}>
                  <button
                    className="chat-panel-switcher-btn"
                    onClick={() => setAgentSwitcherOpen(!agentSwitcherOpen)}
                    aria-label="Switch agent"
                  >
                    <PiCaretDownBold />
                  </button>
                  {agentSwitcherOpen && (
                    <div className="chat-panel-switcher-dropdown">
                      {switchableAgents.map((a) => (
                        <button
                          key={a.agentId}
                          className={`chat-panel-switcher-option ${a.agentId === activeAgent.agentId ? 'active' : ''}`}
                          onClick={() => switchAgent(a)}
                        >
                          <span
                            className="chat-panel-switcher-dot"
                            style={{ background: a.color }}
                          />
                          <span className="chat-panel-switcher-name">
                            {a.agentName}
                          </span>
                          <span className="chat-panel-switcher-role">
                            {a.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className="chat-panel-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <PiXBold />
              </button>
            </div>

            {/* Context Bar */}
            <div className="chat-panel-context">
              <span className="chat-panel-context-dot" />
              Contextual: {contextLabel}
            </div>

            {/* Messages */}
            <div className="chat-panel-messages">
              {!hasMessages ? (
                <div className="chat-panel-empty">
                  <div className="chat-panel-empty-icon">
                    <PiRobotBold />
                  </div>
                  <h3>{activeAgent.agentName}</h3>
                  <p>{activeAgent.greeting}</p>

                  {/* Quick Actions */}
                  {routeResult.quickActions.length > 0 && (
                    <div className="chat-panel-quick-actions">
                      <div className="chat-panel-quick-actions-label">
                        <PiLightningBold /> Quick actions
                      </div>
                      {routeResult.quickActions.map((action) => (
                        <button
                          key={action}
                          className="chat-panel-quick-action"
                          onClick={() => handleQuickAction(action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg) =>
                    msg.role === 'system' ? (
                      <div key={msg.id} className="chat-msg system">
                        <div className="chat-msg-system-text">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div key={msg.id} className={`chat-msg ${msg.role}`}>
                        <div className="chat-msg-bubble">{msg.content}</div>
                        <div className="chat-msg-time">
                          {msg.role === 'agent' && msg.agentId && (
                            <span className="chat-msg-agent-tag">
                              {getAgentById(msg.agentId)?.agentName ??
                                msg.agentId}
                            </span>
                          )}
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    ),
                  )}
                  {typing && (
                    <div className="chat-typing">
                      <div className="chat-typing-dots">
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                      </div>
                      {activeAgent.agentName} is typing...
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-panel-input-area">
              <div className="chat-panel-input-row">
                <textarea
                  ref={inputRef}
                  className="chat-panel-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${activeAgent.agentName} anything...`}
                  rows={1}
                />
                <button
                  className="chat-panel-send"
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  aria-label="Send message"
                >
                  <PiPaperPlaneRightBold />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
