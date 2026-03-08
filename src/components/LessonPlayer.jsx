import React, { useState, useEffect } from 'react';
import './LessonPlayer.css';

const LessonPlayer = ({ module, onBack, onNextModule, isLast }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [module.id]);

  const [germanRevealed, setGermanRevealed] = useState(false);
  const [englishRevealed, setEnglishRevealed] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [countdown, setCountdown] = useState(null);

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

  if (isFinished) {
    return (
      <div className="lesson-finished animate-fade-in glass-panel">
        <div className="finished-icon">🎉</div>
        <h2 className="finished-title">Module Completed!</h2>
        <p className="finished-subtitle">You've successfully finished all sentences in this module.</p>
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
