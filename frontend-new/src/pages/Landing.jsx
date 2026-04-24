import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Chip,
  Avatar,
  Stack,
  Divider,
  Paper,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Code as CodeIcon,
  School as SchoolIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudIcon,
  Analytics as AnalyticsIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  AutoStories as DocsIcon,
  Rocket as RocketIcon,
  Psychology as LearnIcon,
  TrendingUp as GrowthIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Payment as PaymentIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  Lightbulb as IdeaIcon
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <RocketIcon sx={{ fontSize: 48 }} />,
      title: 'Fast Track Learning',
      description: 'Accelerated learning path designed for developers',
      color: '#8B5CF6',
      stats: '50+ Topics'
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 48 }} />,
      title: 'Industry Ready',
      description: 'Real-world projects and interview preparation',
      color: '#EC4899',
      stats: '100+ Examples'
    },
    {
      icon: <IdeaIcon sx={{ fontSize: 48 }} />,
      title: 'Expert Curated',
      description: 'Content crafted by industry professionals',
      color: '#10B981',
      stats: '24/7 Access'
    }
  ];

  const learningPath = [
    {
      phase: 'Foundation',
      duration: '2-3 weeks',
      topics: ['JavaScript Fundamentals', 'ES6+ Features', 'DOM Manipulation'],
      color: '#8B5CF6',
      progress: 100
    },
    {
      phase: 'Frontend Mastery',
      duration: '3-4 weeks', 
      topics: ['React.js', 'State Management', 'Component Architecture'],
      color: '#EC4899',
      progress: 75
    },
    {
      phase: 'Backend Development',
      duration: '4-5 weeks',
      topics: ['Node.js', 'Express.js', 'Database Design'],
      color: '#10B981',
      progress: 50
    },
    {
      phase: 'DSA & System Design',
      duration: '6-8 weeks',
      topics: ['Algorithms', 'Data Structures', 'System Architecture'],
      color: '#F59E0B',
      progress: 25
    }
  ];

  const technologies = [
    { 
      name: 'JavaScript', 
      icon: '🟨', 
      level: 'Beginner to Advanced',
      description: 'Master modern JavaScript with ES6+, async programming, and advanced concepts',
      popularity: 95
    },
    { 
      name: 'React.js', 
      icon: '⚛️', 
      level: 'Intermediate',
      description: 'Build dynamic UIs with hooks, context, and performance optimization',
      popularity: 90
    },
    { 
      name: 'Node.js', 
      icon: '🟢', 
      level: 'Intermediate',
      description: 'Server-side development with Express, APIs, and microservices',
      popularity: 85
    },
    { 
      name: 'MongoDB', 
      icon: '🍃', 
      level: 'Beginner to Intermediate',
      description: 'NoSQL database design, indexing, and performance optimization',
      popularity: 80
    },
    { 
      name: 'Next.js', 
      icon: '▲', 
      level: 'Advanced',
      description: 'Full-stack React framework with SSR, SSG, and API routes',
      popularity: 88
    },
    { 
      name: 'DSA', 
      icon: '🧠', 
      level: 'All Levels',
      description: 'Problem-solving skills for technical interviews and coding challenges',
      popularity: 100
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: `
          radial-gradient(circle at 20% 20%, #8B5CF6 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, #EC4899 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, #10B981 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      {/* Navigation Bar */}
      <AppBar position="static" elevation={0} sx={{ 
        background: 'rgba(15, 15, 35, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              mr: 2,
              width: 40,
              height: 40
            }}>
              🚀
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                Nexaura Developer Hub
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Learn • Build • Excel
              </Typography>
            </Box>
          </Box>
          
          {!isMobile && (
            <Stack direction="row" spacing={2}>
              <Chip 
                label="🎯 Premium Content" 
                size="small"
                sx={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Button
                variant="outlined"
                onClick={() => navigate('/signin')}
                sx={{
                  borderColor: '#8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    borderColor: '#A78BFA',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                  }
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/signin')}
                sx={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                }}
              >
                Get Started
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Hero Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Chip 
              label="🔥 Most Popular Developer Learning Platform" 
              sx={{ 
                mb: 3,
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#8B5CF6'
              }}
            />
            
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 50%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Master Full Stack
              <br />
              Development
            </Typography>
            
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ 
                mb: 6, 
                maxWidth: 800, 
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              From JavaScript fundamentals to advanced system design. 
              <Box component="span" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                {' '}Learn, Build, and Excel{' '}
              </Box>
              with our comprehensive developer curriculum.
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<RocketIcon />}
                onClick={() => navigate('/signin')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Learning Journey
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<DocsIcon />}
                onClick={() => navigate('/app/dashboard')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderColor: '#8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    borderColor: '#A78BFA',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Explore Content
              </Button>
            </Stack>

            {/* Stats */}
            <Grid container spacing={4} justifyContent="center">
              {[
                { number: '500+', label: 'Learning Resources' },
                { number: '50+', label: 'Code Examples' },
                { number: '24/7', label: 'Access' }
              ].map((stat, index) => (
                <Grid item key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Features Section */}
        <Grow in timeout={1500}>
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Why Choose Nexaura?
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto' }}
            >
              Designed by developers, for developers. Experience the difference.
            </Typography>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: 3,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `0 20px 60px rgba(139, 92, 246, 0.3)`,
                          borderColor: feature.color,
                          '& .feature-icon': {
                            transform: 'scale(1.1) rotate(5deg)'
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          background: `linear-gradient(135deg, ${feature.color}20 0%, transparent 70%)`,
                          borderRadius: '0 0 0 100px'
                        }}
                      />
                      
                      <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
                        <Box
                          className="feature-icon"
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            color: 'white',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 8px 32px ${feature.color}40`
                          }}
                        >
                          {feature.icon}
                        </Box>
                        
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                          {feature.title}
                        </Typography>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                          {feature.description}
                        </Typography>
                        
                        <Chip
                          label={feature.stats}
                          size="small"
                          sx={{
                            background: `${feature.color}20`,
                            color: feature.color,
                            border: `1px solid ${feature.color}40`,
                            fontWeight: 600
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grow>

        {/* Learning Path Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Your Learning Journey
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Structured curriculum designed to take you from beginner to expert
          </Typography>

          <Grid container spacing={3}>
            {learningPath.map((phase, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${phase.color}40`,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: phase.color,
                      boxShadow: `0 16px 48px ${phase.color}30`
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 4,
                      background: `linear-gradient(90deg, ${phase.color} 0%, ${phase.color}60 100%)`
                    }}
                  />
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${phase.color} 0%, ${phase.color}CC 100%)`,
                          width: 32,
                          height: 32,
                          mr: 2,
                          fontSize: '1rem',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                          {phase.phase}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {phase.duration}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <LinearProgress
                        variant="determinate"
                        value={phase.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${phase.color}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: phase.color,
                            borderRadius: 3
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {phase.progress}% Complete
                      </Typography>
                    </Box>
                    
                    <Stack spacing={1}>
                      {phase.topics.map((topic, topicIndex) => (
                        <Box key={topicIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckIcon sx={{ fontSize: 16, color: phase.color, mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {topic}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Technologies Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Master Modern Technologies
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Industry-standard technologies with hands-on projects and real-world examples
          </Typography>

          <Grid container spacing={4}>
            {technologies.map((tech, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h3" sx={{ mr: 2 }}>
                        {tech.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {tech.name}
                        </Typography>
                        <Chip
                          label={tech.level}
                          size="small"
                          sx={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#8B5CF6',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {tech.description}
                    </Typography>
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Industry Demand
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                          {tech.popularity}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={tech.popularity}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#10B981',
                            borderRadius: 2
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing Section */}
        <Box sx={{ mb: 12 }}>
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                borderRadius: '50%',
                opacity: 0.1
              }}
            />
            
            <Chip
              label="🎉 Limited Time Offer"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
            
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Unlock Everything for Just ₹30
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              One-time payment • Lifetime access • No hidden fees • No subscriptions
            </Typography>
            
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
              {[
                { icon: '📚', text: '500+ Learning Resources' },
                { icon: '💻', text: '50+ Code Examples' },
                { icon: '🎯', text: 'Interview Preparation' },
                { icon: '🚀', text: 'Project Templates' },
                { icon: '📱', text: 'Mobile Responsive' },
                { icon: '⚡', text: 'Instant Access' }
              ].map((feature, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signin')}
              sx={{
                px: 8,
                py: 3,
                fontSize: '1.3rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 48px rgba(139, 92, 246, 0.6)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Lifetime Access - ₹30
            </Button>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              💳 Secure payment • 🔒 Instant activation • ❌ No refunds
            </Typography>
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 6, 
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
          background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)'
        }}>
          <Avatar sx={{ 
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 3,
            fontSize: '1.5rem'
          }}>
            🚀
          </Avatar>
          
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Nexaura Developer Hub
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Empowering developers with world-class learning resources
          </Typography>
          
          <Divider sx={{ borderColor: 'rgba(139, 92, 246, 0.2)', mb: 3 }} />
          
          <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
            <Button
              variant="text"
              href="https://www.nexaurait.online/"
              target="_blank"
              sx={{ 
                color: '#8B5CF6',
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
              }}
            >
              🌐 Company Website
            </Button>
            <Button
              variant="text"
              href="https://www.linkedin.com/company/114344571/"
              target="_blank"
              sx={{ 
                color: '#8B5CF6',
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
              }}
            >
              💼 LinkedIn
            </Button>
            <Button
              variant="text"
              href="mailto:nexaaurait@gmail.com"
              sx={{ 
                color: '#8B5CF6',
                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
              }}
            >
              📧 Support
            </Button>
          </Stack>
          
          <Typography variant="body2" color="text.secondary">
            © 2026 Nexaura IT Solutions. All rights reserved.
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Made with ❤️ for developers, by developers
          </Typography>
        </Box>
      </Container>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </Box>
  );
};

export default Landing;