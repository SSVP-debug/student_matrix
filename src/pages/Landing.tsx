import { Rocket, Sparkles, Target, Users, BookOpen, MessageCircle, FileText, ChevronRight, Play} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated Star Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-5 md:px-8 py-5 md:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <span className="text-2xl font-bold text-white">student_matrix</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="border border-white/20 bg-white/[0.03] px-5 py-2 rounded-2xl font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-cyan-200/30 hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="cosmic-button bg-white px-6 py-2 rounded-2xl font-semibold text-black transition-all duration-300 hover:bg-cyan-50"
          >
            Start Learning
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-5 md:px-8 pt-8 pb-24 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full shadow-2xl">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">AI-Powered Learning Platform</span>
              </div>
            </div>

            <h1 className="cosmic-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.04]">
              Learn Across{' '}
              <span className="cosmic-gradient-text">
                The Universe
              </span>
            </h1>

            <p className="text-xl text-white/80 leading-relaxed max-w-xl capitalize">
              Embark on an interstellar educational journey where every lesson is a mission, 
              every topic a new galaxy, and every achievement a star in your cosmic constellation...
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="cosmic-button bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-cyan-50 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Launch Learning</span>
                <Rocket className="w-5 h-5" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 px-8 py-4 text-white border border-white/20 rounded-2xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
                <Play className="w-5 h-5" />
                Explore Features
              </button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">0+</div>
                <div className="text-sm text-white/60">Cosmic Learners</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">0+</div>
                <div className="text-sm text-white/60">Missions Completed</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.9/5</div>
                <div className="text-sm text-white/60">Rating</div>
              </div>
            </div>
          </div>

          {/* Monochromatic Hero Visual */}
          <div className="relative h-[700px] hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Massive Monochromatic Ring System */}
              <div className="relative">
                {/* Outer Ring */}
                <div className="w-[600px] h-[600px] rounded-full border border-white/20 animate-spin-slow">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-white/50" />
                </div>
                
                {/* Middle Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/30 animate-spin-medium">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50" />
                </div>
                
                {/* Inner Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/40 animate-spin-fast">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50" />
                </div>

                {/* Central Astronaut */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border border-white/20 shadow-[0_0_80px_rgba(0,229,255,0.18)]">
                    <img 
                      src="/images/Pixie.webp" 
                      alt="student_matrix cosmic learning illustration"
                      className="w-full h-full object-cover rounded-full"
                    />
                    {/* White glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
                  </div>
                </div>

              </div>
            </div>

            {/* Monochromatic Background Orbs */}
            <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            </div>
            <div className="absolute bottom-32 right-32 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-40 h-40 rounded-full bg-white/5 blur-2xl" />
            </div>
            <div className="absolute top-1/3 right-40 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-24 h-24 rounded-full bg-white/10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-8 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Why Choose <span className="text-white">student_matrix?</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed capitalize">
            Experience the future of education with our cosmic learning ecosystem designed to make 
            every study session an interstellar adventure
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Target,
              title: "Adaptive Practice",
              description: "Questions adjust to your level and pace after every answer, focusing on your weak spots and fading memories."
            },
            {
              icon: Sparkles,
              title: "On-device Tutor",
              description: "Explanations, feedback and study recommendations are generated on your device, so it works with no internet."
            },
            {
              icon: Users,
              title: "Private by Design",
              description: "No account, no tracking, no server. Your progress and notes never leave your device, and it runs smoothly on low-end phones."
            }
          ].map((feature, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-white/5 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass glass-hover relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-8 transition-all duration-300 h-full">
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Galaxies Section */}
      <section className="relative z-10 container mx-auto px-8 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Powerful Learning <span className="text-white">Features</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto capitalize">
            Discover our comprehensive suite of tools designed to enhance your learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { 
              name: 'Mission Quests', 
              description: 'Embark on structured learning journeys with guided missions and challenges',
              icon: Target,
              path: '/quests'
            },
            { 
              name: 'LearnHub', 
              description: 'Upload PDFs or YouTube videos to generate smart notes and practice questions',
              icon: FileText,
              path: '/learnhub'
            },
            { 
              name: 'AI Mentor', 
              description: 'Get instant help and explanations from our intelligent learning assistant',
              icon: MessageCircle,
              path: '/mentor'
            },
            { 
              name: 'Flashcards', 
              description: 'Master concepts with interactive flashcards and spaced repetition',
              icon: BookOpen,
              path: '/flashcards'
            }
          ].map((feature, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-white/5 rounded-[28px] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="glass glass-hover relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-[28px] p-8 transition-all duration-300 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.name}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
                  {feature.description}
                </p>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <button 
                    onClick={() => navigate(feature.path)}
                    className="text-sm text-white hover:text-white/80 transition-colors font-medium flex items-center gap-2 group/btn"
                  >
                    Explore Feature
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 container mx-auto px-8 py-20">
        <div className="glass relative overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/20 rounded-[32px] md:rounded-[40px] p-7 md:p-16 text-center">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Launch Your Learning Journey?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed capitalize">
              Join thousands of cosmic learners exploring the universe of knowledge. 
              Your educational adventure across the stars begins now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-white/90 transition-all duration-300 hover:scale-105 flex items-center gap-3 text-lg"
              >
                <span>Begin Cosmic Journey</span>
                <Rocket className="w-6 h-6" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 text-white border border-white/30 rounded-2xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-2xl bg-white/5">
        <div className="container mx-auto px-8 py-16">
          <div className="grid lg:grid-cols-5 gap-24 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Logo size={40} />
                <span className="text-3xl font-bold text-white">student_matrix</span>
              </div>
              <p className="text-white/70 text-lg leading-relaxed max-w-md capitalize">
                Pioneering the future of education through cosmic exploration and AI-powered learning adventures. 
                Join us in making knowledge accessible across the universe.
              </p>
            </div>
            
            {/* Features Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Features</h4>
              <ul className="space-y-3">
                {[
                  { name: "Mission Quests", path: "/quests" },
                  { name: "LearnHub", path: "/learnhub" },
                  { name: "AI Mentor", path: "/mentor" },
                  { name: "Flashcards", path: "/flashcards" }
                ].map((feature) => (
                  <li key={feature.name}>
                    <a 
                      href={feature.path} 
                      className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {feature.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
              
            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Resources</h4>
              <ul className="space-y-3">
                {["Learning Paths", "Documentation", "Blogs", "Roadmap"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
              
            {/* Support Column */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3">
                {["Help Center", "Contact", "Privacy Policy"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
    
          </div>
          
           <div className="border-t border-white/10 pt-8 flex flex-col lg:flex-row justify-between items-center">
            <p className="text-white/60 text-base capitalize">
              © {new Date().getFullYear()} student_matrix. Embark on infinite learning possibilities.
            </p>
            <div className="flex gap-10 mt-4 lg:mt-0">
              {[
                { 
                  name: 'Email', 
                  url: 'mailto:pranav.kh25@gmail.com' 
                },
                { 
                  name: 'GitHub', 
                  url: 'https://github.com/FrostByte-49' 
                },
                { 
                  name: 'LinkedIn', 
                  url: 'https://www.linkedin.com/in/pranav-kh' 
                },
                { 
                  name: 'Discord', 
                  url: 'https://discord.com/users/1377918872925241375' 
                }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-all duration-300 hover:scale-110 text-base"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>
      
    </div>
  );
};