import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from '../../components/AppImage';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { MdMenu } from "react-icons/md"; // <-- Import the menu icon

const AboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);

  const coreValues = [
    {
      icon: 'BookOpen',
      title: 'Excellence in Education',
      description: 'We strive for the highest standards in academic achievement and intellectual development.'
    },
    {
      icon: 'Heart',
      title: 'Character Development',
      description: 'Building strong moral foundations and ethical leadership in every student.'
    },
    {
      icon: 'Users',
      title: 'Community Spirit',
      description: 'Fostering a supportive and inclusive environment where everyone thrives.'
    },
    {
      icon: 'Lightbulb',
      title: 'Innovation & Creativity',
      description: 'Encouraging creative thinking and innovative problem-solving approaches.'
    },
    {
      icon: 'Target',
      title: 'Personal Growth',
      description: 'Supporting individual potential and personal development journeys.'
    },
    {
      icon: 'Globe',
      title: 'Global Perspective',
      description: 'Preparing students for success in an interconnected global society.'
    }
  ];

  // Replace facultyMembers with only the founder, name left blank
  const facultyMembers = [
    {
      name: 'Mr. Nnamdi Nkaru', 
      position: 'Founder',
      qualification: '',
      experience: '',
      photo: '/assets/images/founder.jpg' // Update this path to your actual founder image if available
    }
  ];

  const facilities = [
    {
      name: 'Smart Classrooms',
      description: 'Interactive whiteboards and digital learning tools',
      icon: 'Monitor'
    },
    {
      name: 'Science Laboratories',
      description: 'Well-equipped chemistry, physics, and biology labs',
      icon: 'Flask'
    },
    {
      name: 'Digital Library',
      description: 'Extensive collection of books and digital resources',
      icon: 'BookOpen'
    },
    {
      name: 'Sports Complex',
      description: 'Indoor and outdoor sports facilities',
      icon: 'Trophy'
    },
    {
      name: 'Computer Lab',
      description: 'Modern computers with high-speed internet',
      icon: 'Computer'
    },
    {
      name: 'Art & Music Studio',
      description: 'Creative spaces for artistic expression',
      icon: 'Palette'
    }
  ];

  const milestones = [
    {
      year: '2019',
      title: 'Foundation',
      description: 'GOSHEN PRINATH ACADEMY was established with a vision to provide quality education.',
      logo: true
    },
    {
      year: '2021',
      title: 'Expansion',
      description: 'Added new facilities including science labs and sports complex.',
      logo: false
    },
    {
      year: '2022',
      title: 'Digital Integration',
      description: 'Introduced smart classrooms and digital learning platforms.',
      logo: false
    },
    {
      year: '2023',
      title: 'Recognition',
      description: 'Received national recognition for academic excellence.',
      logo: true
    },
    {
      year: '2025',
      title: 'Innovation Hub',
      description: 'Launched new programs focusing on STEM and entrepreneurship.',
      logo: false
    }
  ];

  // New image data for the refactored sections
  const schoolImages = [
    {
      src: '/assets/images/playground1.jpg',
      alt: 'School Playground Overview',
      caption: 'Our modern and safe playground.'
    },
    {
      src: '/assets/images/playground2.jpg',
      alt: 'School Playground Overview',
      caption: 'Our modern and safe playground.'
    },
    {
      src: '/assets/images/school-building-pic1.jpg',
      alt: 'Main Academic Block',
      caption: 'Main Academic Block.'
    },
    {
      src: '/assets/images/school-building-pic2.jpg',
      alt: 'Playground & Activity Area',
      caption: 'Playground & Activity Area.'
    },
    {
      src: '/assets/images/school-building-pic3.jpg',
      alt: 'Science & Innovation Wing',
      caption: 'Science & Innovation Wing.'
    },
  ];

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
                <h1 className="font-heading font-bold text-lg text-foreground">GOSHEN PRINATH ACADEMY</h1>
                <p className="font-caption text-xs text-muted-foreground">Raising Life-Long Learners</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => handleNavigation('/landing-page')}
                className="font-body text-sm text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button className="font-body text-sm text-primary font-semibold">
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
                  onClick={() => handleNavigation('/landing-page')}
                  className="text-left font-body text-sm text-foreground hover:text-primary"
                >
                  Home
                </button>
                <button className="text-left font-body text-sm text-primary font-semibold">
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
              </nav>
            </motion.div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 lg:px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-xl">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="GOSHEN PRINATH ACADEMY Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              About GOSHEN PRINATH ACADEMY
            </h1>
            <p className="text-xl lg:text-2xl font-body text-primary mb-8">
              Raising Life-Long Learners
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Our institution stands as a beacon of educational excellence, committed to nurturing young minds and fostering a culture of continuous learning, character development, and academic achievement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modern & Professional GPA Slogan, Motto, Mission & Vision Section */}
      <section className="pt-12 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-primary mb-6 tracking-tight">
              GPA Slogan
            </h2>
            <div className="flex flex-col items-center justify-center mb-8">
              <Icon name="Handshake" size={48} className="text-accent mb-2" />
              <p className="text-2xl lg:text-3xl font-body font-semibold text-muted-foreground bg-card px-6 py-3 rounded-xl shadow inline-block">
                Hand-in-Hand We Learn
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Motto
                </h3>
                <p className="text-xl font-body text-primary mb-4 bg-card px-4 py-2 rounded-lg shadow">
                  Raising Life-Long Learners
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Mission Statement
                </h3>
                <p className="text-lg font-body text-muted-foreground mb-2">
                  Inspired by our acronym <span className="font-bold text-primary">"PRINATH"</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-2">
                  <ul className="space-y-2 font-body text-base text-muted-foreground">
                    <li><span className="font-bold text-primary">P</span> — Partnering with family and community.</li>
                    <li><span className="font-bold text-primary">R</span> — Revamping the teaching profession.</li>
                    <li><span className="font-bold text-primary">I</span> — Integrating excellence.</li>
                    <li><span className="font-bold text-primary">N</span> — Nurturing a love for learning.</li>
                  </ul>
                  <ul className="space-y-2 font-body text-base text-muted-foreground">
                    <li><span className="font-bold text-primary">A</span> — Actively making learning individualistic and innovative.</li>
                    <li><span className="font-bold text-primary">T</span> — Teaching our children a contextual body of organized knowledge.</li>
                    <li><span className="font-bold text-primary">H</span> — Hand-in-Hand learning.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                Vision Statement
              </h3>
              <div className="bg-card px-6 py-4 rounded-xl shadow-lg inline-block">
                <p className="text-lg font-body text-muted-foreground">
                  GPA envisions being an educational environment that produces self-directed and stimulated minds that demonstrate high value and excellence for global citizenship.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW: Dynamic School Image Gallery Section */}
      <section className="py-16 bg-muted/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our School Campus
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our vibrant campus life, modern buildings, and state-of-the-art facilities.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {schoolImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                onClick={() => setPreviewImg(img.src)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold font-heading">{img.caption}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-card border border-border rounded-xl p-8 relative overflow-hidden"
            >
              <div 
                className="absolute top-4 right-4 w-16 h-16 opacity-10 rounded-full overflow-hidden"
                style={{
                  backgroundImage: 'url(/assets/images/school_logo-1754996036714.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <Icon name="Target" size={40} className="text-primary mb-4" />
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground font-body">
                To provide exceptional educational opportunities that inspire students to achieve their full potential, develop critical thinking skills, and become responsible global citizens who contribute positively to society while maintaining the highest standards of academic excellence and character development.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-card border border-border rounded-xl p-8 relative overflow-hidden"
            >
              <div 
                className="absolute top-4 right-4 w-16 h-16 opacity-10 rounded-full overflow-hidden"
                style={{
                  backgroundImage: 'url(/assets/images/school_logo-1754996036714.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <Icon name="Eye" size={40} className="text-primary mb-4" />
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground font-body">
                To be recognized as a leading educational institution that transforms lives through innovative teaching, character building, and holistic development, creating confident, competent, and compassionate individuals who are truly life-long learners prepared for success in an ever-changing world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These fundamental principles guide everything we do at GOSHEN PRINATH ACADEMY, shaping our approach to education and student development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues?.map((value, index) => (
              <motion.div
                key={value?.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={value?.icon} size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                  {value?.title}
                </h3>
                <p className="text-muted-foreground font-body">
                  {value?.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Leadership Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Our Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the founder who leads GOSHEN PRINATH ACADEMY with vision and commitment to educational excellence.
            </p>
          </motion.div>

          {/* Founder Card Centered - enlarged card and icon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-12 text-center hover:shadow-lg transition-shadow relative overflow-hidden max-w-xl w-full flex flex-col items-center"
            >
              <div 
                className="absolute top-2 right-2 w-10 h-10 opacity-5 rounded-full"
                style={{
                  backgroundImage: 'url(/assets/images/school_logo-1754996036714.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div className="w-44 h-44 rounded-full overflow-hidden mx-auto mb-8 border-4 border-primary/10 flex items-center justify-center" style={{ boxShadow: '0 0 32px #2563eb33', background: '#fff' }}>
                <Image 
                  src={facultyMembers[0]?.photo}
                  alt={facultyMembers[0]?.name || 'Founder'}
                  className="w-full h-full object-cover object-top"
                  style={{ objectPosition: 'top center' }}
                />
              </div>
              <Icon name="Award" size={48} className="text-primary mb-4" />
              <h3 className="text-3xl font-heading font-bold text-primary mb-2 min-h-[1.5em]">
                {facultyMembers[0]?.name || <span className="text-muted-foreground italic">[Founder Name]</span>}
              </h3>
              <p className="text-xl font-semibold text-muted-foreground mb-2">
                {facultyMembers[0]?.position}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              World-Class Facilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our state-of-the-art facilities provide students with the resources they need to excel in their academic journey and personal development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities?.map((facility, index) => (
              <motion.div
                key={facility?.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={facility?.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      {facility?.name}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm">
                      {facility?.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From humble beginnings to becoming a leading educational institution, trace our path of growth and achievement over the years.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones?.map((milestone, index) => (
              <motion.div
                key={milestone?.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex items-center mb-12 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl font-heading font-bold text-primary">
                        {milestone?.year}
                      </span>
                      {milestone?.logo && (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image 
                            src="/assets/images/school_logo-1754996036714.jpg"
                            alt="GOSHEN PRINATH ACADEMY Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                      {milestone?.title}
                    </h3>
                    <p className="text-muted-foreground font-body">
                      {milestone?.description}
                    </p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full flex-shrink-0 border-4 border-background shadow-lg"></div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Playground Image Fullscreen Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImg(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-xl shadow-2xl p-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-error/90 text-white rounded-full p-2 hover:bg-error transition-colors"
              onClick={() => setPreviewImg(null)}
              aria-label="Close"
            >
              <Icon name="X" size={24} />
            </button>
            <Image
              src={previewImg}
              alt="Preview Image"
              className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            />
          </motion.div>
        </div>
      )}
      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-primary-foreground"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary-foreground/20">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="GOSHEN PRINATH ACADEMY Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Take the first step towards an exceptional educational journey at GOSHEN PRINATH ACADEMY
            </p>
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
                
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;