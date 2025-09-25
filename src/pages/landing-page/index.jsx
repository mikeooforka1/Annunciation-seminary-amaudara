import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from '../../components/AppImage';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { MdMenu } from "react-icons/md"; // <-- Import the menu icon

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const achievements = [
    {
      icon: 'Award',
      title: 'Academic Excellence',
      description: 'Consistently ranked among top educational institutions in the region with outstanding academic performance.',
      stats: '95% Pass Rate'
    },
    {
      icon: 'Building',
      title: 'Modern Facilities',
      description: 'State-of-the-art classrooms, laboratories, library, and sports facilities to enhance learning experience.',
      stats: '20+ Facilities'
    },
    {
      icon: 'Users',
      title: 'Student Success',
      description: 'Dedicated to nurturing life-long learners with personalized attention and comprehensive development.',
      stats: '1000+ Alumni'
    }
  ];

  const testimonials = [
    {
      name: 'cynthia amaka',
      role: 'Parent',
      content: 'GOSHEN PRINATH ACADEMY has truly transformed my child\'s learning journey. The dedicated teachers and excellent facilities make it outstanding.',
      rating: 5
    },
    {
      name: 'Michael chibueze',
      role: 'Alumni',
      content: 'The foundation I received here prepared me for university and beyond. The emphasis on life-long learning is remarkable.',
      rating: 5
    },
    {
      name: 'Ebuka David',
      role: 'Parent',
      content: 'I love the interactive learning environment and the support from teachers. This school truly cares about each student.',
      rating: 5
    }
  ];

  

  const founder = {
    name: "Mr. Nnamdi Nkaru",
    title: "Founder & Visionary Leader",
    image: "/assets/images/founder.jpg",
    bio: "Mr. Nnamdi Nkaru is a visionary leader whose commitment to excellence and character development has shaped the culture of Goshen Prinath Academy. With decades of experience, he inspires both staff and students to pursue greatness, embrace lifelong learning, and make a positive impact in society.",
    quote: "Education is not just about imparting knowledge, but about nurturing minds and building character for a brighter future."
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image 
                  src="/assets/images/school_logo-1754996036714.jpg"
                  alt="GOSHEN PRINATH ACADEMY Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-foreground">ANNUNCIATION SEMINARY AMAUDARA</h1>
                <p className="font-caption text-xs text-muted-foreground">RENOVARE FACEM TERRA</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => handleNavigation('/about-page')}
                className="font-body text-sm text-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('/admissions')}
                className="font-body text-sm text-foreground hover:text-primary transition-colors"
              >
                Admissions
              </button>
              <button 
                onClick={() => handleNavigation('/contact')}
                className="font-body text-sm text-foreground hover:text-primary transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleNavigation('/login-authentication')}
                className="font-body text-sm"
              >
                  Login
              </Button>
            </div>

            {/* Mobile Menu Toggle - use MdMenu for mobile */}
            <button
              className="md:hidden p-2 rounded-lg focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Open menu"
            >
              <MdMenu size={28} className="menu-icon" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-border bg-card py-4"
            >
              <nav className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleNavigation('/about-page')}
                  className="text-left font-body text-sm text-foreground hover:text-primary"
                >
                  About
                </button>
                <button 
                  onClick={() => handleNavigation('/admissions')}
                  className="text-left font-body text-sm text-foreground hover:text-primary"
                >
                  Admissions
                </button>
                <button 
                  onClick={() => handleNavigation('/contact')}
                  className="text-left font-body text-sm text-foreground hover:text-primary"
                >
                  Contact
                </button>
                <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('/login-authentication')}
                    className="font-body text-sm justify-start"
                  >
                    Login
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('/assets/images/school-building-pic1.jpg')` }}
        >
          {/* Overlay to darken image */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Content Container with z-index to be on top of the background */}
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto lg:mx-0 mb-6 rounded-full overflow-hidden shadow-xl">
                  <Image 
                    src="/assets/images/school_logo-1754996036714.jpg"
                    alt="GOSHEN PRINATH ACADEMY Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-4xl lg:text-6xl font-heading font-bold text-white mb-4">
                 ANNUNCIATION SEMINARY AMAUDARA
                </h1>
                <p className="text-xl lg:text-2xl font-body text-primary-light mb-6">
                 RENOVARE FACEM TERRA
                </p>
                <p className="text-lg text-white/80 max-w-xl mx-auto lg:mx-0 mb-8">
                  Empowering students with excellence in education, fostering critical thinking, and building character for a successful future in an ever-evolving world.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleNavigation('/login-authentication')}
                  className="font-body text-white border-white hover:bg-white hover:text-primary"
                >
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Login
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-12">
                <div className="text-center">
                  <p className="text-2xl font-heading font-bold text-primary">500+</p>
                  <p className="text-sm font-body text-white/80">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading font-bold text-primary">50+</p>
                  <p className="text-sm font-body text-white/80">Teachers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-heading font-bold text-primary">95%</p>
                  <p className="text-sm font-body text-white/80">Success Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full h-96 bg-card/50 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20">
                      <Image 
                        src="/assets/images/school_logo-1754996036714.jpg"
                        alt="GOSHEN PRINATH ACADEMY"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-4">Virtual Campus Tour</h3>
                    <p className="text-white/80 mb-6">
                      Explore our state-of-the-art facilities and vibrant campus life
                    </p>
                    <Button 
                      variant="primary"
                      onClick={() => handleNavigation('/about-page')}
                    >
                      <Icon name="Play" size={20} className="mr-2" />
                      Start Tour
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* School Promo Image Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/assets/images/student-pic.jpg"
                alt="GOSHEN PRINATH ACADEMY Promo"
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </section>
      {/* Founder Section (increase card and icon size for fuller look) */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Founder
            </h2>
            <p className="text-lg text-muted-foreground">
              The driving force behind our vision and values.
            </p>
          </motion.div>
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-12 w-full max-w-xl flex flex-col items-center"
            >
              <div
                className="w-72 h-72 rounded-full overflow-hidden mb-8 border-4 border-primary/30 shadow-xl flex items-center justify-center"
                style={{ boxShadow: '0 0 48px #2563eb33', background: '#fff' }}
              >
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover object-top"
                  style={{ objectPosition: 'top center' }}
                />
              </div>
              <Icon name="Award" size={48} className="text-primary mb-4" />
              <h3 className="text-3xl font-heading font-bold text-primary mb-2">{founder.name}</h3>
              <p className="text-xl font-semibold text-muted-foreground mb-4">{founder.title}</p>
              <p className="text-lg text-foreground mb-8">{founder.bio}</p>
              <blockquote className="italic text-primary border-l-4 border-primary pl-4 mb-2 text-lg">
                "{founder.quote}"
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Achievements Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose GOSHEN PRINATH ACADEMY?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our commitment to academic excellence and character development sets us apart as a premier educational institution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements?.map((achievement, index) => (
              <motion.div
                key={achievement?.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={achievement?.icon} size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {achievement?.title}
                </h3>
                <p className="text-muted-foreground mb-4 font-body">
                  {achievement?.description}
                </p>
                <div className="text-2xl font-heading font-bold text-primary">
                  {achievement?.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Value Proposition Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our Promise to Every Student
            </h2>
            <p className="text-lg text-muted-foreground">
              At Goshen Prinath Academy, we believe every child deserves a nurturing environment, innovative learning, and opportunities to shine.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Heart" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Caring Community</h3>
              <p className="text-muted-foreground font-body">
                Supportive teachers and staff who care about every student’s growth and well-being.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Lightbulb" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Innovative Learning</h3>
              <p className="text-muted-foreground font-body">
                Modern teaching methods and technology to spark curiosity and creativity.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Trophy" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Opportunities to Shine</h3>
              <p className="text-muted-foreground font-body">
                Clubs, competitions, and leadership programs to help students discover and develop their talents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Activities & Clubs Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Life Beyond the Classroom
            </h2>
            <p className="text-lg text-muted-foreground">
              Our students enjoy a rich variety of clubs, sports, and creative activities that build confidence and friendships.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Football" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Sports & Fitness</h3>
              <p className="text-muted-foreground font-body">
                Football, basketball, athletics and more—our sports programs encourage teamwork and healthy living.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Music" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Music & Arts</h3>
              <p className="text-muted-foreground font-body">
                Choir, drama, and art clubs help students express themselves and discover new talents.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Code" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">STEM & Innovation</h3>
              <p className="text-muted-foreground font-body">
                Science, coding, and robotics clubs prepare students for the future and foster curiosity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The foundation of Goshen Prinath Academy is built on values that shape our students for life.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="ShieldCheck" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Integrity</h3>
              <p className="text-muted-foreground font-body">
                We instill honesty, responsibility, and strong moral principles in every student.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Users" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Respect</h3>
              <p className="text-muted-foreground font-body">
                We celebrate diversity and foster a culture of respect for self and others.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="TrendingUp" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Excellence</h3>
              <p className="text-muted-foreground font-body">
                We encourage our students to strive for their best in academics, character, and leadership.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from parents, students, and alumni about their GOSHEN PRINATH ACADEMY experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial?.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={16} className="text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 font-body italic">
                  "{testimonial?.content}"
                </p>
                <div>
                  <p className="font-heading font-semibold text-foreground">{testimonial?.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial?.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="bg-card border border-primary/20 rounded-xl shadow-lg p-8 w-full max-w-2xl text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-4">
              Ready to Join Our Family?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Discover the difference at Goshen Prinath Academy. Start your journey today!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/admissions'}
              className="font-body"
            >
              <Icon name="ArrowRightCircle" size={20} className="mr-2" />
              Apply Now
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* School Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src="/assets/images/school_logo-1754996036714.jpg"
                    alt="GOSHEN PRINATH ACADEMY Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">ANNUNCIATION SEMINARY AMAUDARA</h3>
                  <p className="font-caption text-sm text-muted-foreground">RENOVARE FACEM TERRA</p>
                </div>
              </div>
              <p className="text-muted-foreground font-body mb-4">
                Committed to providing exceptional education and fostering the growth of future leaders through innovative teaching methods and character development.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Icon name="Facebook" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Twitter" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Instagram" size={20} />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 font-body text-sm">
                <li><button onClick={() => handleNavigation('/about-page')} className="text-muted-foreground hover:text-primary">About Us</button></li>
                <li><button onClick={() => handleNavigation('/admissions')} className="text-muted-foreground hover:text-primary">Admissions</button></li>
                <li><button className="text-muted-foreground hover:text-primary">Faculty</button></li>
                <li><button onClick={() => handleNavigation('/contact')} className="text-muted-foreground hover:text-primary">Contact</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Contact Info</h4>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Icon name="MapPin" size={16} />
                  <span>Grace Avenue, Off Comprehensive Road Okpu Umuobo, Aba, Abia State</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} />
                  <span>+234
                  </span></li></ul></div></div></div></footer></div>
  );
};

export default LandingPage;