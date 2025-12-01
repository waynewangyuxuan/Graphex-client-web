import React, { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// GRAPHEX — CORE PROTOTYPE
// Two-way binding: Graph ↔ PDF
// Click node → PDF scrolls & highlights
// Scroll PDF → Graph node highlights
// ═══════════════════════════════════════════════════════════════════════════

const retro = {
  black: '#1a1a1a',
  white: '#f5f5f0',
  cream: '#fffef9',
  gray: '#c0c0c0',
  darkGray: '#808080',
  blue: '#000080',
  lightBlue: '#1084d0',
  green: '#227722',
  amber: '#c9a227',
  red: '#aa2222',
  windowBg: '#ececec',
  desktop: '#008080',
  inset: '#808080',
  outset: '#ffffff',
  highlight: '#ffe066'
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA: Nodes with source anchors (paragraph IDs)
// ═══════════════════════════════════════════════════════════════════════════

const nodes = [
  { 
    id: 'node-1', 
    title: 'Machine Learning', 
    type: 'key', 
    x: 40, 
    y: 60,
    sourceId: 'p1' // Links to paragraph ID in PDF
  },
  { 
    id: 'node-2', 
    title: 'Neural Networks', 
    type: 'default', 
    x: 200, 
    y: 40,
    sourceId: 'p2'
  },
  { 
    id: 'node-3', 
    title: 'Deep Learning', 
    type: 'default', 
    x: 200, 
    y: 140,
    sourceId: 'p3'
  },
  { 
    id: 'node-4', 
    title: 'Backpropagation', 
    type: 'default', 
    x: 360, 
    y: 60,
    sourceId: 'p4'
  },
  { 
    id: 'node-5', 
    title: 'Training Process', 
    type: 'default', 
    x: 360, 
    y: 160,
    sourceId: 'p5'
  },
  { 
    id: 'node-6', 
    title: 'Gradient Descent', 
    type: 'default', 
    x: 520, 
    y: 100,
    sourceId: 'p6'
  }
];

const edges = [
  { from: 'node-1', to: 'node-2', label: 'INCLUDES' },
  { from: 'node-1', to: 'node-3', label: 'ENABLES' },
  { from: 'node-2', to: 'node-4', label: 'USES' },
  { from: 'node-3', to: 'node-5', label: 'REQUIRES' },
  { from: 'node-4', to: 'node-6', label: 'OPTIMIZES' },
  { from: 'node-5', to: 'node-6', label: 'USES' }
];

// PDF content with paragraph IDs matching node sourceIds
const pdfContent = [
  {
    id: 'p1',
    nodeId: 'node-1',
    title: 'Machine Learning',
    text: `Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data, learn from it, and make predictions or decisions. The discipline has evolved significantly since its inception in the 1950s, becoming one of the most transformative technologies of the modern era.`
  },
  {
    id: 'p2',
    nodeId: 'node-2',
    title: 'Neural Networks',
    text: `Neural Networks are computing systems inspired by biological neural networks that constitute animal brains. These systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules. A neural network consists of layers of interconnected nodes or "neurons" that process information using connectionist approaches to computation.`
  },
  {
    id: 'p3',
    nodeId: 'node-3',
    title: 'Deep Learning',
    text: `Deep Learning is a subset of machine learning based on artificial neural networks with multiple layers between the input and output layers. These intermediate layers enable the model to learn increasingly abstract representations of the data. Deep learning architectures have achieved remarkable success in areas such as computer vision, natural language processing, and speech recognition.`
  },
  {
    id: 'p4',
    nodeId: 'node-4',
    title: 'Backpropagation',
    text: `Backpropagation, short for "backward propagation of errors," is a method used to train neural networks. It calculates the gradient of the loss function with respect to each weight by propagating the error backward through the network. This algorithm is fundamental to training deep neural networks and has been refined extensively since its popularization in the 1980s.`
  },
  {
    id: 'p5',
    nodeId: 'node-5',
    title: 'Training Process',
    text: `The Training Process in machine learning involves feeding data through the model, comparing outputs to expected results, and adjusting parameters to minimize error. This iterative process continues until the model achieves acceptable performance. Training requires careful consideration of factors like learning rate, batch size, and the number of epochs to prevent overfitting or underfitting.`
  },
  {
    id: 'p6',
    nodeId: 'node-6',
    title: 'Gradient Descent',
    text: `Gradient Descent is an optimization algorithm used to minimize the loss function by iteratively moving toward the steepest descent. It updates model parameters in the opposite direction of the gradient of the objective function. Variants include Stochastic Gradient Descent (SGD), Mini-batch Gradient Descent, and adaptive methods like Adam and RMSprop that adjust learning rates during training.`
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const Inset = ({ children, style = {} }) => (
  <div style={{
    background: retro.cream,
    border: '2px solid',
    borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
    ...style
  }}>
    {children}
  </div>
);

// Graph Node
const GraphNode = ({ node, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  const typeSymbols = {
    key: '★',
    default: '○'
  };

  return (
    <div
      onClick={() => onClick(node.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        background: isActive ? retro.blue : retro.cream,
        color: isActive ? retro.white : retro.black,
        border: `2px solid ${isActive ? retro.lightBlue : retro.black}`,
        padding: '8px 12px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        userSelect: 'none',
        transform: hovered && !isActive ? 'translate(-1px, -1px)' : 'translate(0, 0)',
        boxShadow: isActive 
          ? `0 0 0 2px ${retro.highlight}, 4px 4px 0 rgba(0,0,0,0.2)`
          : hovered 
            ? '3px 3px 0 rgba(0,0,0,0.2)' 
            : 'none',
        transition: 'all 0.15s ease',
        zIndex: isActive ? 10 : hovered ? 5 : 1,
        minWidth: 100,
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ 
        color: isActive ? retro.highlight : node.type === 'key' ? retro.amber : retro.darkGray,
        marginRight: 6 
      }}>
        {typeSymbols[node.type]}
      </span>
      {node.title}
      
      {/* Connection points */}
      <div style={{
        position: 'absolute',
        left: -5,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 8,
        height: 8,
        background: isActive ? retro.lightBlue : retro.cream,
        border: `2px solid ${retro.black}`,
        borderRadius: 1
      }} />
      <div style={{
        position: 'absolute',
        right: -5,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 8,
        height: 8,
        background: isActive ? retro.lightBlue : retro.cream,
        border: `2px solid ${retro.black}`,
        borderRadius: 1
      }} />
    </div>
  );
};

// PDF Paragraph
const PdfParagraph = React.forwardRef(({ paragraph, isActive, onClick }, ref) => (
  <div
    ref={ref}
    id={paragraph.id}
    onClick={() => onClick(paragraph.nodeId)}
    data-node-id={paragraph.nodeId}
    style={{
      padding: '16px 20px',
      marginBottom: 16,
      background: isActive ? retro.highlight + '40' : 'transparent',
      border: isActive ? `2px solid ${retro.amber}` : '2px solid transparent',
      borderLeft: isActive ? `4px solid ${retro.amber}` : '4px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    }}
  >
    {/* Active indicator */}
    {isActive && (
      <div style={{
        position: 'absolute',
        left: -24,
        top: 16,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 12,
        color: retro.amber,
        fontWeight: 700
      }}>
        [*]
      </div>
    )}
    
    <h3 style={{ 
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
      color: isActive ? retro.black : retro.darkGray
    }}>
      {paragraph.title}
    </h3>
    <p style={{ 
      fontFamily: 'Georgia, serif',
      fontSize: 14,
      lineHeight: 1.8,
      margin: 0,
      color: retro.black,
      textAlign: 'justify'
    }}>
      {paragraph.text}
    </p>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════════════════

export default function GraphexCore() {
  const [activeNodeId, setActiveNodeId] = useState('node-1');
  const [syncSource, setSyncSource] = useState(null); // 'graph' | 'pdf' | null
  const pdfRef = useRef(null);
  const paragraphRefs = useRef({});
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Get node center for edge drawing
  const getNodeCenter = (id) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x + 70, y: node.y + 18 } : { x: 0, y: 0 };
  };

  // GRAPH → PDF: When node clicked, scroll PDF to that paragraph
  const handleNodeClick = useCallback((nodeId) => {
    setSyncSource('graph');
    setActiveNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node && paragraphRefs.current[node.sourceId]) {
      isScrollingRef.current = true;
      
      paragraphRefs.current[node.sourceId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Reset scrolling flag after animation
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, []);

  // PDF → GRAPH: When paragraph clicked, activate that node
  const handleParagraphClick = useCallback((nodeId) => {
    setSyncSource('pdf');
    setActiveNodeId(nodeId);
  }, []);

  // PDF → GRAPH: When scrolling, detect which paragraph is in view
  useEffect(() => {
    const pdfContainer = pdfRef.current;
    if (!pdfContainer) return;

    const handleScroll = () => {
      // Skip if we're programmatically scrolling from graph click
      if (isScrollingRef.current) return;

      const containerRect = pdfContainer.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestParagraph = null;
      let closestDistance = Infinity;

      // Find which paragraph is closest to the center of the viewport
      Object.entries(paragraphRefs.current).forEach(([id, ref]) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const paragraphCenter = rect.top + rect.height / 2;
        const distance = Math.abs(paragraphCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestParagraph = pdfContent.find(p => p.id === id);
        }
      });

      if (closestParagraph && closestParagraph.nodeId !== activeNodeId) {
        setSyncSource('pdf');
        setActiveNodeId(closestParagraph.nodeId);
      }
    };

    pdfContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => pdfContainer.removeEventListener('scroll', handleScroll);
  }, [activeNodeId]);

  // Store paragraph refs
  const setParagraphRef = useCallback((id, ref) => {
    paragraphRefs.current[id] = ref;
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: retro.desktop,
      fontFamily: '"IBM Plex Mono", monospace',
      padding: 8
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${retro.blue}; color: ${retro.white}; }
        ::-webkit-scrollbar { width: 16px; }
        ::-webkit-scrollbar-track { background: ${retro.windowBg}; }
        ::-webkit-scrollbar-thumb { 
          background: ${retro.gray}; 
          border: 2px solid;
          border-color: ${retro.outset} ${retro.inset} ${retro.inset} ${retro.outset};
        }
      `}</style>

      {/* Main Window */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: retro.windowBg,
        border: '2px solid',
        borderColor: `${retro.outset} ${retro.inset} ${retro.inset} ${retro.outset}`,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Title Bar */}
        <div style={{
          background: `linear-gradient(90deg, ${retro.blue} 0%, ${retro.lightBlue} 100%)`,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none'
        }}>
          <span style={{
            color: retro.white,
            fontSize: 12,
            fontWeight: 700,
            flex: 1
          }}>
            GRAPHEX.EXE — ML_Fundamentals.pdf
          </span>
          <div style={{ display: 'flex', gap: 2 }}>
            {['_', '□', '×'].map((sym, i) => (
              <button key={i} style={{
                width: 18,
                height: 18,
                background: retro.windowBg,
                border: `1px solid ${retro.black}`,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '4px 6px',
          borderBottom: `1px solid ${retro.inset}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 11, color: retro.darkGray }}>
            Active: <strong style={{ color: retro.black }}>{nodes.find(n => n.id === activeNodeId)?.title}</strong>
          </span>
          <span style={{ fontSize: 11, color: retro.darkGray }}>|</span>
          <span style={{ fontSize: 11, color: retro.darkGray }}>
            Sync: {syncSource === 'graph' ? 'Graph → PDF' : syncSource === 'pdf' ? 'PDF → Graph' : '—'}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: retro.darkGray }}>
            Click node or scroll PDF — they stay in sync
          </span>
        </div>

        {/* Split View: Graph | PDF */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* LEFT: Graph Canvas */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            width: '45%',
            borderRight: `2px solid ${retro.inset}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: retro.gray,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              borderBottom: `1px solid ${retro.inset}`
            }}>
              KNOWLEDGE GRAPH
            </div>
            
            <Inset style={{ flex: 1, margin: 4, position: 'relative', overflow: 'hidden' }}>
              {/* Grid background */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(${retro.gray}30 1px, transparent 1px),
                  linear-gradient(90deg, ${retro.gray}30 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }} />

              {/* Edges */}
              <svg style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
              }}>
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill={retro.darkGray}
                    />
                  </marker>
                  <marker
                    id="arrow-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      fill={retro.amber}
                    />
                  </marker>
                </defs>
                
                {edges.map((edge, i) => {
                  const from = getNodeCenter(edge.from);
                  const to = getNodeCenter(edge.to);
                  const isActive = edge.from === activeNodeId || edge.to === activeNodeId;
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2;
                  
                  return (
                    <g key={i}>
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={isActive ? retro.amber : retro.darkGray}
                        strokeWidth={isActive ? 2 : 1}
                        strokeDasharray={isActive ? 'none' : '4 3'}
                        markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <rect
                        x={midX - 28}
                        y={midY - 8}
                        width={56}
                        height={14}
                        fill={retro.cream}
                        stroke={isActive ? retro.amber : retro.gray}
                        strokeWidth={1}
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fontFamily="IBM Plex Mono, monospace"
                        fontWeight={isActive ? 700 : 400}
                        fill={isActive ? retro.amber : retro.darkGray}
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map(node => (
                <GraphNode
                  key={node.id}
                  node={node}
                  isActive={activeNodeId === node.id}
                  onClick={handleNodeClick}
                />
              ))}
            </Inset>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* RIGHT: PDF Viewer */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: retro.gray,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              borderBottom: `1px solid ${retro.inset}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <span>PDF VIEWER</span>
              <span style={{ 
                marginLeft: 'auto', 
                fontWeight: 400,
                color: retro.darkGray
              }}>
                Chapter 3: Neural Network Fundamentals
              </span>
            </div>
            
            <div 
              ref={pdfRef}
              style={{ 
                flex: 1, 
                overflow: 'auto',
                background: retro.white,
                padding: '20px 32px'
              }}
            >
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h1 style={{ 
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 18,
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: `2px solid ${retro.black}`
                }}>
                  Chapter 3
                </h1>
                <h2 style={{ 
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 14,
                  marginBottom: 24,
                  color: retro.darkGray
                }}>
                  Neural Network Fundamentals
                </h2>
                
                {pdfContent.map(paragraph => (
                  <PdfParagraph
                    key={paragraph.id}
                    ref={(ref) => setParagraphRef(paragraph.id, ref)}
                    paragraph={paragraph}
                    isActive={activeNodeId === paragraph.nodeId}
                    onClick={handleParagraphClick}
                  />
                ))}
                
                {/* Extra space at bottom for scrolling */}
                <div style={{ height: 200 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{
          background: retro.windowBg,
          borderTop: `2px solid ${retro.inset}`,
          padding: '2px 4px',
          display: 'flex',
          gap: 2
        }}>
          {[
            { content: 'Two-way sync active', flex: 1 },
            { content: `Node: ${nodes.find(n => n.id === activeNodeId)?.title}` },
            { content: `Source: ${pdfContent.find(p => p.nodeId === activeNodeId)?.id.toUpperCase()}` },
            { content: `${nodes.length} nodes` }
          ].map((item, i) => (
            <div key={i} style={{
              flex: item.flex || 'none',
              padding: '1px 6px',
              border: '1px solid',
              borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
              fontSize: 10,
              whiteSpace: 'nowrap'
            }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: retro.black,
        color: retro.white,
        padding: '6px 12px',
        fontSize: 10,
        opacity: 0.9
      }}>
        Click nodes or scroll PDF — sync is automatic
      </div>
    </div>
  );
}