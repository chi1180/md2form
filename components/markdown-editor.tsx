"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  MD2FORM_PROPERTIES,
  TYPE_PROPERTY_TEMPLATES,
} from "@/lib/md2form-autocomplete";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface Suggestion {
  value: string;
  description?: string;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const previousLineCountRef = useRef(value.split("\n").length);

  const getSuggestionPosition = (
    textarea: HTMLTextAreaElement,
    cursorPos: number,
    suggestionCount: number,
  ) => {
    const coordinates = getCaretCoordinates(textarea, cursorPos);
    const containerPadding = 8;
    const verticalOffset = 24;
    const estimatedHeight = Math.min(300, Math.max(44, suggestionCount * 44));
    const estimatedWidth = 280;

    let top = coordinates.top - textarea.scrollTop + verticalOffset;
    const maxTop = textarea.clientHeight - estimatedHeight - containerPadding;

    if (top > maxTop) {
      top = coordinates.top - textarea.scrollTop - estimatedHeight - 8;
    }

    top = Math.max(containerPadding, Math.min(top, maxTop));

    let left = coordinates.left - textarea.scrollLeft;
    const maxLeft = textarea.clientWidth - estimatedWidth - containerPadding;
    left = Math.max(containerPadding, Math.min(left, maxLeft));

    return { top, left };
  };

  const updateSuggestionsAtCursor = (text: string, cursorPos: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const nextSuggestions = getAutocompleteSuggestions(text, cursorPos);

    if (nextSuggestions.length > 0) {
      setSuggestions(nextSuggestions);
      setSelectedIndex(0);
      setShowSuggestions(true);

      setSuggestionPosition(
        getSuggestionPosition(textarea, cursorPos, nextSuggestions.length),
      );
      return;
    }

    setShowSuggestions(false);
  };

  const getQuestionBlockRange = (lines: string[], currentLineIndex: number) => {
    let questionStart = currentLineIndex;
    for (let i = currentLineIndex; i >= 0; i -= 1) {
      if (/^###\s+.+$/.test(lines[i])) {
        questionStart = i;
        break;
      }
    }

    let questionEnd = lines.length;
    for (let i = currentLineIndex + 1; i < lines.length; i += 1) {
      if (/^###\s+.+$/.test(lines[i]) || /^---\s*$/.test(lines[i])) {
        questionEnd = i;
        break;
      }
    }

    return { questionStart, questionEnd };
  };

  const buildTypeTemplateLines = (
    selectedType: string,
    lines: string[],
    currentLineIndex: number,
  ) => {
    const templates = TYPE_PROPERTY_TEMPLATES[selectedType] || [];
    if (templates.length === 0) return [];

    const { questionStart, questionEnd } = getQuestionBlockRange(lines, currentLineIndex);
    const existingKeys = new Set<string>();

    for (let i = questionStart; i < questionEnd; i += 1) {
      const keyMatch = lines[i].match(/^#(\w+)\b/);
      if (keyMatch) {
        existingKeys.add(keyMatch[1]);
      }
    }

    return templates
      .filter(([key]) => !existingKeys.has(key))
      .map(([key, templateValue]) => `#${key} ${templateValue}`);
  };

  // Get current line and check for # property
  const getAutocompleteSuggestions = (text: string, cursorPos: number): Suggestion[] => {
    const lines = text.substring(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];

    // Check if we're completing a property value (after space)
    const valueMatch = currentLine.match(/^#(\w+)\s+(.*)$/);
    if (valueMatch) {
      const property = valueMatch[1];
      const valueText = valueMatch[2];

      if (property !== 'type') {
        return [];
      }
      
      // For properties with predefined values
      const options = MD2FORM_PROPERTIES[property as keyof typeof MD2FORM_PROPERTIES];
      
      if (options && options.length > 0) {
        const partial = valueText.trim().toLowerCase();
        if (!partial) {
          return options.map(opt => ({ value: opt }));
        }

        const hasExactMatch = options.some(
          (opt) => opt.toLowerCase() === partial,
        );
        if (hasExactMatch) {
          return [];
        }

        return options
          .filter(opt => opt.toLowerCase().includes(partial))
          .map(opt => ({ value: opt }));
      }
    }

    return [];
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    updateSuggestionsAtCursor(newValue, cursorPos);
  };

  const insertSuggestion = (suggestion: Suggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const lines = value.substring(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];
    
    let newValue = value;
    let newCursorPos = cursorPos;

    // Check if completing property value
    const valueMatch = currentLine.match(/^#(\w+)\s+(.*)$/);
    if (valueMatch) {
      const currentLineIndex = lines.length - 1;
      const property = valueMatch[1];
      const beforeCursor = value.substring(0, cursorPos - valueMatch[2].length);
      const afterCursor = value.substring(cursorPos);
      newValue = beforeCursor + suggestion.value + afterCursor;
      newCursorPos = beforeCursor.length + suggestion.value.length;

      if (property === 'type') {
        const fullLines = newValue.split('\n');
        const templateLines = buildTypeTemplateLines(
          suggestion.value,
          fullLines,
          currentLineIndex,
        );

        if (templateLines.length > 0) {
          fullLines.splice(currentLineIndex + 1, 0, ...templateLines);
          newValue = fullLines.join('\n');
        }
      }
    }

    onChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after state update
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        updateSuggestionsAtCursor(newValue, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions && e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      if (selectionStart !== selectionEnd) return;

      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      if (/^###\s+.+$/.test(currentLine)) {
        e.preventDefault();
        const inserted = '\n#type ';
        const nextValue = beforeCursor + inserted + afterCursor;
        const nextCursorPos = selectionStart + inserted.length;

        onChange(nextValue);
        setTimeout(() => {
          const activeTextarea = textareaRef.current;
          if (!activeTextarea) return;
          activeTextarea.focus();
          activeTextarea.setSelectionRange(nextCursorPos, nextCursorPos);
          updateSuggestionsAtCursor(nextValue, nextCursorPos);
        }, 0);
      }

      return;
    }

    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Simple caret position calculator
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const div = document.createElement('div');
    const style = getComputedStyle(element);
    
    [...style].forEach(prop => {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.textContent = element.value.substring(0, position);
    
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    
    document.body.appendChild(div);
    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft,
    };
    document.body.removeChild(div);
    
    return coordinates;
  };

  // Scroll selected item into view
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showSuggestions]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      previousLineCountRef.current = value.split("\n").length;
      return;
    }

    const lineCount = value.split("\n").length;
    if (lineCount > previousLineCountRef.current) {
      textarea.scrollTop = textarea.scrollHeight;
    }

    previousLineCountRef.current = lineCount;
  }, [value]);

  useEffect(() => {
    if (!showSuggestions || !textareaRef.current || !suggestionsRef.current) return;

    const textarea = textareaRef.current;
    const suggestionBox = suggestionsRef.current;
    const containerPadding = 8;
    const maxTop = textarea.clientHeight - suggestionBox.offsetHeight - containerPadding;
    const maxLeft = textarea.clientWidth - suggestionBox.offsetWidth - containerPadding;

    const nextTop = Math.max(
      containerPadding,
      Math.min(suggestionPosition.top, maxTop),
    );
    const nextLeft = Math.max(
      containerPadding,
      Math.min(suggestionPosition.left, maxLeft),
    );

    if (nextTop !== suggestionPosition.top || nextLeft !== suggestionPosition.left) {
      setSuggestionPosition({ top: nextTop, left: nextLeft });
    }
  }, [showSuggestions, suggestions.length, suggestionPosition]);

  return (
    <div className="relative w-full h-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full font-mono text-sm bg-background text-foreground border border-border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Write your form markdown here...

💡 Tip: Type # to see autocomplete suggestions
Try: #type, #placeholder, #required"
        spellCheck={false}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 min-w-[200px] max-w-[400px] max-h-[300px] overflow-y-auto bg-popover border border-border rounded-md shadow-lg"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            width: "min(280px, calc(100% - 16px))",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => insertSuggestion(suggestion)}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="font-medium">{suggestion.value}</div>
              {suggestion.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
