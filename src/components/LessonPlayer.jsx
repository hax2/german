import React, { useState, useEffect } from 'react';
import './LessonPlayer.css';

const LessonPlayer = ({ module, onBack, onNextModule, isLast }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    setRevealedMeanings(new Set());
    setAllRevealed(false);
  }, [module.id]);

  const [germanRevealed, setGermanRevealed] = useState(false);
  const [englishRevealed, setEnglishRevealed] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [revealedMeanings, setRevealedMeanings] = useState(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const sentence = module.sentences[currentIndex];
  const isFinished = currentIndex >= module.sentences.length;


  useEffect(() => {
    // Reset states when changing sentence
    setGermanRevealed(false);
    setEnglishRevealed(false);
    setActiveWordIndex(null);

    // Auto-play the audio when sentence changes
    if (sentence && sentence.german) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.german);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentIndex, sentence]);

  useEffect(() => {
    if (isFinished && !isLast) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onNextModule();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  }, [isFinished, isLast, onNextModule]);


  const playAudio = () => {
    if (!sentence) return;
    window.speechSynthesis.cancel(); // clear queue
    const utterance = new SpeechSynthesisUtterance(sentence.german);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85; // Slightly slower for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };


  const getMeaning = (word) => {
    // Strip punctuation to match the dictionary keys
    const cleanWord = word.replace(/[.,¿?¡!]/g, '');
    const meanings = sentence.wordMeanings || {};
    return meanings[cleanWord] || meanings[cleanWord.toLowerCase()] || meanings[cleanWord.replace(/s$/, '')] || null;
  };

  const getModuleVocabulary = () => {
    const vocab = {};
    module.sentences.forEach(s => {
      if (s.wordMeanings) {
        Object.entries(s.wordMeanings).forEach(([word, meaning]) => {
          const cleanWord = word.replace(/[.,¿?¡!]/g, '');
          // Deduplicate by lowercase but keep the first version we find for display
          const lowerWord = cleanWord.toLowerCase();
          if (!vocab[lowerWord]) {
            vocab[lowerWord] = { original: cleanWord, meaning: meaning };
          }
        });
      }
    });
    return Object.values(vocab).sort((a, b) => a.original.localeCompare(b.original));
  };

  const speakWord = (word) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (isFinished) {
    const vocabulary = getModuleVocabulary();
    
    const handleWordClick = (idx, word) => {
      speakWord(word);
      setRevealedMeanings(prev => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    };

    const toggleRevealAll = () => {
      if (allRevealed) {
        setRevealedMeanings(new Set());
      } else {
        const allIndices = new Set(vocabulary.map((_, i) => i));
        setRevealedMeanings(allIndices);
      }
      setAllRevealed(!allRevealed);
    };

    return (
      <div className="lesson-finished animate-fade-in glass-panel">
        <div className="finished-icon">🎉</div>
        <h2 className="finished-title">Module Completed!</h2>
        <p className="finished-subtitle">You've successfully finished all sentences in this module.</p>
        
        <div className="vocabulary-summary animate-fade-in">
          <div className="vocab-header-flex">
            <h3>Module Vocabulary</h3>
            <button className="btn-text-reveal" onClick={toggleRevealAll}>
              {allRevealed ? 'Hide All' : 'Reveal All'}
            </button>
          </div>
          <div className="vocab-table-container">
            <table className="vocab-table">
              <thead>
                <tr>
                  <th>Word</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {vocabulary.map((item, idx) => {
                  const isRevealed = revealedMeanings.has(idx);
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => handleWordClick(idx, item.original)}
                      className={`vocab-row ${isRevealed ? 'revealed' : ''}`}
                      title="Click to hear pronunciation and see meaning"
                    >
                      <td className="vocab-word-cell">
                        <div className="vocab-word-flex">
                          <span className="vocab-word">{item.original}</span>
                          <svg className="speaker-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        </div>
                      </td>
                      <td className="vocab-meaning-cell">
                        <span className={`meaning-text ${isRevealed ? 'visible' : 'hidden'}`}>
                          {item.meaning}
                        </span>
                        {!isRevealed && <span className="meaning-placeholder">Click to see</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="finished-actions">
          <button className="btn-secondary" onClick={handlePrevious}>← Back to Last Sentence</button>
          <button className="btn-secondary" onClick={onBack}>Back to Modules</button>

          {!isLast && (
            <button className="btn-primary" onClick={onNextModule}>
              Next Module {countdown !== null ? `(${countdown})` : ''} →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Split sentence into words but keep punctuation attached for rendering
  const words = sentence.german.split(' ');

  const progressPercentage = ((currentIndex) / module.sentences.length) * 100;

  return (
    <div className="lesson-player animate-fade-in">
      
      {/* Header / Progress */}
      <div className="lesson-header">
        <button className="btn-secondary btn-sm" onClick={onBack}>← Back</button>
        <div className="progress-wrapper">
          <div className="progress-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
        <span className="progress-text">
          {currentIndex + 1} / {module.sentences.length}
        </span>
      </div>

      <div className="lesson-content glass-panel">
        
        {/* Audio section */}
        <div className="audio-section">
          <button 
            className="btn-play pulse-primary" 
            onClick={playAudio}
            title="Listen to German"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* German Text Area */}
        <div className="german-area">
          {!germanRevealed ? (
            <button className="btn-reveal" onClick={() => setGermanRevealed(true)}>
              Reveal German text
            </button>
          ) : (
            <div className="german-sentence animate-fade-in">
              {words.map((word, idx) => {
                const meaning = getMeaning(word);
                const isActive = activeWordIndex === idx;
                
                return (
                  <div key={idx} className="word-container">
                     <span 
                        className={`german-word ${meaning ? 'has-meaning' : ''} ${isActive ? 'active' : ''}`}
                        onClick={() => meaning && setActiveWordIndex(isActive ? null : idx)}
                      >
                        {word}
                      </span>
                      {isActive && meaning && (
                        <div className="word-tooltip animate-fade-in">
                          {meaning}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions Area */}
        <div className="actions-area">
          <div className="actions-row">
            <button 
              className="btn-secondary" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>
            <button className="btn-primary" onClick={handleNext}>
              {currentIndex === module.sentences.length - 1 ? 'Finish Module' : 'Next Sentence →'}
            </button>
          </div>


          
          <div className="translation-area">
            {!englishRevealed ? (
              <button className="btn-text-reveal" onClick={() => setEnglishRevealed(true)}>
                Reveal Full Translation
              </button>
            ) : (
              <div className="english-translation animate-fade-in">
                {sentence.english}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonPlayer;
