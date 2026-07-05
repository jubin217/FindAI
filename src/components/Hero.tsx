import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { AITool } from '../data/tools';

interface HeroProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  tools: AITool[];
  onToolClick: (tool: AITool) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchValue,
  onSearchChange,
  tools,
  onToolClick
}) => {
  // Typing animation state
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const words = [
    'Writing Assistant', 
    'AI Code Editor', 
    'Image Generator', 
    'Video Editor', 
    'Customer Support Chatbot', 
    'Data Analytics Tool'
  ];
  
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delayBetweenWords = 2000;

  useEffect(() => {
    let timer: any;
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Delay before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenWords);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  // Handle autocomplete suggestions
  const [suggestions, setSuggestions] = useState<AITool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = tools
      .filter((tool) =>
        tool.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchValue.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchValue.toLowerCase()) ||
        tool.pricingType.toLowerCase().includes(searchValue.toLowerCase())
      )
      .slice(0, 5); // limit to top 5 suggestions

    setSuggestions(filtered);
  }, [searchValue, tools]);

  const handleSuggestionClick = (tool: AITool) => {
    onToolClick(tool);
    onSearchChange(''); // Reset search input
    setShowSuggestions(false);
  };

  return (
    <section className="hero" style={{ overflow: 'hidden' }}>
      <div className="container">
        {/* Animated Heading Badge */}
        <div className="hero-tag scale-up animated">
          <span className="glow-dot" />
          <span>Find AI</span>
        </div>

        {/* Title */}
        <h1 className="hero-title scroll-animate animated">
          Discover the Right <br />
          <span className="hero-glow-text">AI Tool in Seconds</span>
        </h1>

        {/* Typing Animated Subtitle */}
        <p className="hero-subtitle scroll-animate animated">
          Explore a curated repository of tools for your next{' '}
          <span className="typing-container" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {displayText || '\u00A0'}
          </span>
        </p>

        {/* Smart Search Bar */}
        <div className="hero-search-wrapper scale-up animated">
          <div className="hero-search-bar">
            <Search size={22} className="text-muted" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, category, pricing models, features..."
              value={searchValue}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow clicks
            />
            <button className="hero-search-btn">
              <span>Find AI</span>
            </button>
          </div>

          {/* Autocomplete suggestion popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions" data-lenis-prevent="true">
              {suggestions.map((tool) => (
                <div
                  key={tool.id}
                  className="suggestion-item"
                  onMouseDown={() => handleSuggestionClick(tool)}
                >
                  <div>
                    <span className="suggestion-name">{tool.name}</span>
                    <span className="suggestion-tagline"> - {tool.tagline}</span>
                  </div>
                  <span className="suggestion-cat">{tool.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics section */}
        <div className="hero-stats scroll-animate animated">
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">AI Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">9</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Independent</span>
          </div>
        </div>
      </div>
    </section>
  );
};
