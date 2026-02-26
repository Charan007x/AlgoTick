import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LetterGlitch from '../components/LetterGlitch';
import LANDING_ICONS from '../constants/landing-icons';

function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibleNumbers, setVisibleNumbers] = useState([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [visibleSections, setVisibleSections] = useState([]);
  const numberRefs = useRef([]);
  const cardRefs = useRef([]);
  const stepRefs = useRef([]);
  const sectionRefs = useRef([]);
  const previousY = useRef({});

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index);
          const currentY = entry.boundingClientRect.y;
          const prevY = previousY.current[index];

          if (entry.isIntersecting) {
            // Scrolling down (element coming from bottom)
            if (prevY === undefined || currentY < prevY) {
              setVisibleNumbers((prev) => [...new Set([...prev, index])]);
            }
          } else {
            // Element left viewport - check if scrolling up
            if (prevY !== undefined && currentY > prevY) {
              setVisibleNumbers((prev) => prev.filter((i) => i !== index));
            }
          }

          previousY.current[index] = currentY;
        });
      },
      { threshold: 0.5 }
    );

    numberRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.cardindex);
          if (entry.isIntersecting) {
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) cardObserver.observe(ref);
    });

    return () => cardObserver.disconnect();
  }, []);

  useEffect(() => {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.stepindex);
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) stepObserver.observe(ref);
    });

    return () => stepObserver.disconnect();
  }, []);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.sectionindex;
          if (entry.isIntersecting) {
            setVisibleSections((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) sectionObserver.observe(ref);
    });

    return () => sectionObserver.disconnect();
  }, []);

  const features = [
    {
      Icon: LANDING_ICONS.BRAIN,
      title: 'Remember Forever',
      description: 'Get reminded exactly when you need to revise. Turn short-term wins into long-term mastery.'
    },
    {
      Icon: LANDING_ICONS.LIGHTNING,
      title: 'Stop Wasting Time',
      description: 'No more guessing what to practice. Know exactly which problems need your attention today.'
    },
    {
      Icon: LANDING_ICONS.CHECKMARK,
      title: 'Honest Progress Tracking',
      description: 'Only solved problems count. We verify you actually did the work after adding it to your list.'
    },
    {
      Icon: LANDING_ICONS.CHART,
      title: 'Watch Your Growth',
      description: 'See your improving retention rate. Celebrate completing revision cycles and building real skills.'
    },
    {
      Icon: LANDING_ICONS.TARGET,
      title: 'Stay Focused',
      description: 'Clean interface with zero distractions. Just you, your goals, and the problems that matter.'
    },
    {
      Icon: LANDING_ICONS.LOCK,
      title: 'Your Data, Your Control',
      description: 'Practice privately. Your progress and study patterns stay completely confidential.'
    }
  ];

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Pill-Shaped Glassmorphism Navigation */}
      <nav className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 shadow-2xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#61dca3] to-[#61b3dc] rounded-lg flex items-center justify-center">
                <LANDING_ICONS.TICK className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={3} />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight"><span className="text-white">Algo</span><span className="text-[#61dca3]">Tick</span></span>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-3 opacity-0 animate-slideDown">
              <button 
                onClick={() => {
                  closeMenu();
                  navigate('/login');
                }}
                className="block w-full text-left text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  closeMenu();
                  navigate('/signup');
                }}
                className="block w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Full Screen LetterGlitch Background */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-6 sm:mb-8 opacity-0 animate-scaleUp leading-[1.1] tracking-tight">
            <div className="text-white font-bold">Never Forget</div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc] font-bold">What You Learn</div>
          </h1>
          <div className="opacity-0 animate-slideUp delay-400">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-[#61dca3]/50 active:scale-95 animate-glow"
            >
              Start Tracking Free
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-black py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={(el) => (sectionRefs.current[3] = el)}
            data-sectionindex="features"
            className={`text-center mb-10 sm:mb-12 md:mb-16 ${visibleSections.includes('features') ? 'animate-card-fade' : 'opacity-0'}`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc]">Serious Learners</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => {
              // First row (0,1,2) - no delay, second row (3,4,5) - delay-300
              const delayClass = index < 3 ? '' : 'delay-300';
              
              const FeatureIcon = feature.Icon;
              const isVisible = visibleCards.includes(index);
              
              return (
                <div 
                  key={index}
                  ref={(el) => (cardRefs.current[index] = el)}
                  data-cardindex={index}
                  className={isVisible ? `animate-card-fade ${delayClass}` : 'opacity-0'}
                >
                  <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-[#61dca3]/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-[#61dca3]/20 h-full">
                    <div className="mb-3 sm:mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <FeatureIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#61dca3]" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-gradient-to-b from-black to-[#0a0a0a] py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={(el) => (sectionRefs.current[0] = el)}
            data-sectionindex="how-it-works"
            className={`text-center mb-16 sm:mb-20 md:mb-24 ${visibleSections.includes('how-it-works') ? 'animate-card-fade' : 'opacity-0'}`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc]">Works</span>
            </h2>
          </div>

          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {[
              { num: '01', title: 'Add Questions', desc: 'Paste any LeetCode URL. We fetch title, difficulty, and tags automatically.' },
              { num: '02', title: 'Set LeetCode Profile', desc: 'Link your LeetCode username in settings for automatic verification.' },
              { num: '03', title: 'Solve & Revise', desc: 'Get reminded to revise at optimal intervals. Solve the problem again.' },
              { num: '04', title: 'Verify Progress', desc: 'Click checkbox to verify. We check your last 20 submissions.' }
            ].map((step, index) => {
              const isReversed = index % 2 !== 0;
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12 lg:gap-16`}
                >
                  {/* Large Outlined Number */}
                  <div className={`flex-shrink-0 ${isReversed ? 'md:justify-start' : 'md:justify-end'} flex justify-center md:w-1/3`}>
                    <span 
                      ref={(el) => (numberRefs.current[index] = el)}
                      data-index={index}
                      data-num={step.num}
                      className={`step-number text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] font-bold ${
                        visibleNumbers.includes(index) ? 'step-number-solid' : ''
                      }`}
                      style={{ 
                        WebkitTextStroke: '2px #61dca3',
                        fontFamily: 'Space Grotesk, Arial, sans-serif'
                      }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div 
                    ref={(el) => (stepRefs.current[index] = el)}
                    data-stepindex={index}
                    className={`flex-1 text-center ${isReversed ? 'md:text-right' : 'md:text-left'} ${visibleSteps.includes(index) ? 'animate-card-fade delay-200' : 'opacity-0'}`}
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                      {step.title}
                    </h3>
                    <p className={`text-base sm:text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto ${isReversed ? 'md:mr-0 md:ml-auto' : 'md:mx-0'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0a0a0a] py-12 sm:py-16 md:py-20">
        <div 
          ref={(el) => (sectionRefs.current[2] = el)}
          data-sectionindex="cta"
          className="max-w-4xl mx-auto px-4 sm:px-6 text-center"
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 ${visibleSections.includes('cta') ? 'animate-card-fade' : 'opacity-0'}`}>
            Ready to Master LeetCode?
          </h2>
          <p className={`text-base sm:text-lg md:text-xl text-white/60 mb-6 sm:mb-8 px-2 ${visibleSections.includes('cta') ? 'animate-card-fade delay-200' : 'opacity-0'}`}>
            Stop forgetting what you've learned. Build lasting skills today.
          </p>
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${visibleSections.includes('cta') ? 'animate-card-fade delay-300' : 'opacity-0'}`}>
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-[#61dca3]/50"
            >
              Start Free Now
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border-2 border-white/20 text-white hover:bg-white/5 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8">
        <div 
          ref={(el) => (sectionRefs.current[1] = el)}
          data-sectionindex="footer"
          className={`max-w-7xl mx-auto px-4 text-center ${visibleSections.includes('footer') ? 'animate-card-fade' : 'opacity-0'}`}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#61dca3] to-[#61b3dc] rounded-lg flex items-center justify-center">
              <LANDING_ICONS.TICK className="w-5 h-5 text-black" strokeWidth={3} />
            </div>
            <span className="font-semibold text-lg"><span className="text-white">Algo</span><span className="text-[#61dca3]">Tick</span></span>
          </div>
          <p className="text-white/40 text-sm">
            © 2025-26 <span className="text-white">Algo</span><span className="text-[#61dca3]">Tick</span> / GitHub - <a href="https://github.com/Charan007x" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#61dca3] transition-colors duration-200">Charan007x</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-3 opacity-0 animate-slideDown">
              <button 
                onClick={() => {
                  closeMenu();
                  navigate('/login');
                }}
                className="block w-full text-left text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  closeMenu();
                  navigate('/signup');
                }}
                className="block w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Full Screen LetterGlitch Background */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 opacity-0 animate-scaleUp">
            AlgoTick
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 opacity-0 animate-slideUp delay-200">
            Never forget what you solved. Master LeetCode with proven spaced repetition.
          </p>
          <div className="opacity-0 animate-slideUp delay-400">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-[#61dca3]/50 active:scale-95 animate-glow"
            >
              Start Tracking Free
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-black py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 px-2 opacity-0 animate-slideDown">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#61dca3] to-[#61b3dc]">Serious Learners</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4 opacity-0 animate-slideUp delay-200">
              Everything you need to master LeetCode and retain knowledge long-term
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => {
              const delays = ['delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800'];
              const delayClass = delays[index] || 'delay-800';
              const animations = ['animate-rotateIn', 'animate-scaleUp', 'animate-slideUp'];
              const animClass = animations[index % 3];
              
              return (
                <div 
                  key={index}
                  className={`opacity-0 ${animClass} ${delayClass}`}
                >
                  <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-[#61dca3]/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-[#61dca3]/20 h-full">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{feature.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-gradient-to-b from-black to-[#0a0a0a] py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 opacity-0 animate-slideDown">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/60 px-4 opacity-0 animate-slideUp delay-200">
              Four simple steps to lasting LeetCode mastery
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {[
              { num: '01', title: 'Add Questions', desc: 'Paste any LeetCode URL. We fetch title, difficulty, and tags automatically.' },
              { num: '02', title: 'Set LeetCode Profile', desc: 'Link your LeetCode username in settings for automatic verification.' },
              { num: '03', title: 'Solve & Revise', desc: 'Get reminded to revise at optimal intervals. Solve the problem again.' },
              { num: '04', title: 'Verify Progress', desc: 'Click checkbox to verify. We check your last 20 submissions.' }
            ].map((step, index) => {
              const delays = ['delay-400', 'delay-500', 'delay-600', 'delay-700'];
              const delayClass = delays[index] || 'delay-700';
              const animations = index % 2 === 0 ? 'animate-slideRight' : 'animate-slideLeft';
              
              return (
                <div 
                  key={index}
                  className={`opacity-0 ${animations} ${delayClass}`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-[#61dca3]/50 hover:transform hover:translateX-2 transition-all duration-300">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#61dca3] to-[#61b3dc] rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                      <span className="text-xl sm:text-2xl font-bold text-black">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm sm:text-base md:text-lg text-white/60">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0a0a0a] py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 opacity-0 animate-scaleUp">
            Ready to Master LeetCode?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/60 mb-6 sm:mb-8 px-2 opacity-0 animate-slideUp delay-200">
            Stop forgetting what you've learned. Build lasting skills today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 opacity-0 animate-slideUp delay-400">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#61dca3] to-[#61b3dc] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-[#61dca3]/50"
            >
              Start Free Now
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border-2 border-white/20 text-white hover:bg-white/5 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#61dca3] to-[#61b3dc] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-black">{LANDING_ICONS.TICK}</span>
            </div>
            <span className="text-white font-semibold text-lg">AlgoTick</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2025 AlgoTick / GitHub - Charan007x
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
