import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from '../../components/AppImage';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { MdMenu } from "react-icons/md"; // <-- Import the menu icon

const VOCATION_REPORT_URL = "/assets/docs/vacation_report.png"; // Ensure this path is correct

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showXmasModal, setShowXmasModal] = useState(true); // Modal state

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

  // Team of Formators data
  const formators = [
    {
      name: "Very Rev. Fr. Chidi Obilor",
      title: "Rector",
      image: "/assets/images/rector-pic.WebP",
      bio: "Very Rev. Fr. Chidi Obilor is the dedicated Rector of Annunciation Seminary Amaudara. His leadership, spiritual guidance, and commitment to holistic formation inspire both staff and seminarians to pursue excellence in academics, faith, and character.",
      quote: "Formation is the heart of our mission—shaping minds, nurturing faith, and building leaders for the Church and society."
    },
    {
      name: "Rev. Fr. Francis Ihesiaba",
      title: "Vice Rector I",
      image: "/assets/images/vice-rector2.WebP",
      bio: "Rev. Fr. Francis Ihesiaba assists in the holistic formation of seminarians, focusing on their spiritual and moral growth.",
      quote: "Every seminarian is a seed of hope for the Church."
    },
    {
      name: "Rev. Fr. Paschal Chigozie",
      title: "Vice Rector II",
      image: "/assets/images/pastoral-intern.jpg",
      bio: "Rev. Fr. Paschal Chigozie is Vice Rector II, assisting in formation and parish activities with dedication and zeal.",
      quote: "Pastoral service is a call to love and serve."
    },
    {
      name: "Rev. Fr. Chinedu Ubani",
      title: "Dean of Studies",
      image: "/assets/images/dean-pic.WebP",
      bio: "Rev. Fr. Chinedu Ubani coordinates academic programs, ensuring high standards and fostering a culture of learning.",
      quote: "Academic excellence is the foundation for future leaders."
    },
    {
      name: "Rev. Fr. Jude Okebaram",
      title: "Spiritual Director",
      image: "/assets/images/spiritual-director.WebP",
      bio: "Rev. Fr. Jude Okebaram provides spiritual guidance and support to all seminarians, nurturing their faith and vocation.",
      quote: "Spiritual direction is a journey of faith and growth."
    },
    {
      name: "Rev. Fr. Ignatius Onyekwere",
      title: "Parish Priest, Regina Pacis Amaudara",
      image: "/assets/images/parish-priest.jpg",
      bio: "Rev. Fr. Ignatius Onyekwere serves as the Parish Priest of Regina Pacis Amaudara, fostering a vibrant parish community and supporting the seminary.",
      quote: "A strong parish is the heart of a thriving seminary."
    }
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Happy New Year Modal */}
      {showXmasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowXmasModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-2">🎉 Happy New Year 2026!</h2>
            <p className="mb-3 text-base font-semibold text-gray-700">
              Wishing you a prosperous and successful new year from all of us at Annunciation Seminary Amaudara!
            </p>
            <p className="mb-4 text-sm text-gray-600">
              <span className="font-bold text-primary">Welcome back!</span> We look forward to another year of excellence, growth, and achievement together.
            </p>
            <a
              href={VOCATION_REPORT_URL}
              download
              className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-primary/90 transition"
            >
              Download Vacation Report
            </a>
          </div>
        </div>
      )}

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
                onClick={() => handleNavigation('/announcements')}
                className="font-body text-sm text-foreground hover:text-primary transition-colors"
              >
                Announcement & Updates
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
                  onClick={() => handleNavigation('/announcements')}
                  className="text-left font-body text-sm text-foreground hover:text-primary"
                >
                  Announcement & Updates
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
      <section className="relative pt-20 min-h-[80vh] flex items-center justify-center text-white">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('/assets/images/chapel-pic.WebP')` }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Centered Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center w-full">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-xl bg-white flex items-center justify-center">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-bold text-white mb-3 sm:mb-4 text-center leading-tight">
              ANNUNCIATION SEMINARY AMAUDARA
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-body text-primary-light mb-4 sm:mb-6 text-center">
              RENOVARE FACEM TERRA
            </p>
            <p className="text-base sm:text-lg text-white/90 max-w-md sm:max-w-2xl mx-auto mb-6 sm:mb-8 text-center">
              Empowering students with excellence in education, fostering critical thinking, and building character for a successful future in an ever-evolving world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleNavigation('/login-authentication')}
                className="font-body text-white border-white hover:bg-white hover:text-primary w-full sm:w-auto"
              >
                <Icon name="LogIn" size={20} className="mr-2" />
                Login
              </Button>
            </div>
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 justify-center mt-8 sm:mt-12 w-full">
              <div className="text-center flex-1 min-w-[90px]">
                <p className="text-xl sm:text-2xl font-heading font-bold text-primary">500+</p>
                <p className="text-xs sm:text-sm font-body text-white/80">Students</p>
              </div>
              <div className="text-center flex-1 min-w-[90px]">
                <p className="text-xl sm:text-2xl font-heading font-bold text-primary">50+</p>
                <p className="text-xs sm:text-sm font-body text-white/80">Teachers</p>
              </div>
              <div className="text-center flex-1 min-w-[90px]">
                <p className="text-xl sm:text-2xl font-heading font-bold text-primary">95%</p>
                <p className="text-xs sm:text-sm font-body text-white/80">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rector's Welcome Address Section */}
      <section className="py-16 bg-card/80 border-y border-border">
        <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center gap-10">
          {/* Rector's Image */}
          <div className="flex-shrink-0 w-full md:w-64 flex justify-center mb-8 md:mb-0">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg bg-white flex items-center justify-center">
              <Image
                src="/assets/images/rector-pic.WebP"
                alt="Very Rev. Fr. Chidi Obilor"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          {/* Welcome Address Content */}
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-4">
              Welcome Address from the Rector
            </h2>
            <p className="text-lg text-muted-foreground mb-4 font-body">
              Dear Parents, Relatives, and Friends,<br />
              On behalf of the entire Annunciation Seminary Amaudara community, I warmly welcome you to our cherished institution—a place where faith, knowledge, and character are nurtured in every young man entrusted to our care.
            </p>
            <p className="text-base text-foreground mb-4 font-body">
              At Annunciation Seminary, we believe that true formation is a partnership between the seminary, families, and the wider community. Your support, prayers, and encouragement are invaluable as we guide our seminarians on their journey of spiritual, academic, and human growth.
            </p>
            {/* Collapsible full address */}
            <WelcomeAddressFull />
          </div>
        </div>
      </section>

      {/* Grotto and Main Gate Section (moved and reordered) */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Seminary Grotto FIRST */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border-4 border-primary/30 bg-white">
                <Image
                  src="/assets/images/mary-grotto.jpg"
                  alt="Annunciation Seminary Grotto"
                  className="w-full h-80 object-cover"
                />
              </div>
              <p className="mt-4 text-center text-base font-semibold text-primary">
                <span className="block">The New Annunciation Grotto:</span>
                <span className="block">A serene spot for prayer and reflection within the seminary grounds</span>
              </p>
            </motion.div>
            {/* Seminary Main Gate SECOND */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border-4 border-accent/30 bg-white">
                <Image
                  src="/assets/images/front-gate.jpg"
                  alt="Annunciation Seminary Main Gate"
                  className="w-full h-80 object-cover"
                />
              </div>
              <p className="mt-4 text-center text-base font-semibold text-accent">
                <span className="block">The Iconic Main Gate:</span>
                <span className="block">Welcoming all to a place of faith, learning, and transformation</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* School Promo Image & Anthem Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
            {/* Seminarians Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="flex-1 w-full max-w-3xl"
              style={{ minWidth: 0 }}
            >
              <div className="aspect-[16/9] rounded-3xl border-4 border-primary/40 bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/seminarians-pic.WebP"
                  alt="Seminarians Group"
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </motion.div>
            {/* School Anthem */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="flex-1 w-full max-w-xl"
              style={{ minWidth: 0 }}
            >
              <div className="bg-card border border-primary/30 rounded-2xl shadow-xl p-6 flex flex-col h-full justify-center">
                <h3 className="text-2xl font-heading font-bold text-primary mb-4 text-center lg:text-left">
                  School Anthem
                </h3>
                <div className="whitespace-pre-line text-base sm:text-lg font-body text-muted-foreground text-center lg:text-left leading-relaxed">
                  We are children of Annunciation<br />
                  A special people of God<br />
                  Our task to proclaim the word<br />
                  Announcers of the word of God<br /><br />
                  The world in which we now live<br />
                  From the original plan has departed<br />
                  Through us may this order be re-achieved<br />
                  Announcers of the word of God<br /><br />
                  O Mary Mother of Jesus<br />
                  You first the word of God born<br />
                  Good bearers of this word may we be<br />
                  Announcers of the word of God<br /><br />
                  Your assistance O Lord we implore<br />
                  This vocation to fulfil<br />
                  Making the world a better place<br />
                  So help us Mother of Annunciation
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Jesus Image Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full max-w-2xl mx-auto aspect-[4/5] rounded-3xl border-4 border-accent/40 bg-white shadow-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/images/jesus-pic.jpg"
                alt="Sacred Heart of Jesus"
                className="w-full h-full object-contain"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mary Image Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full max-w-2xl mx-auto aspect-[4/5] rounded-3xl border-4 border-primary/40 bg-white shadow-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/images/mary-pic.webp"
                alt="Immaculate Heart of Mary"
                className="w-full h-full object-contain"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </section>
      {/* Pope Picture Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full flex justify-center items-center">
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                <div className="relative w-full aspect-[4/5]">
                  {/* Frame (no bg-white) */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-accent/40 shadow-xl pointer-events-none z-10"></div>
                  {/* Image fills the card */}
                  <Image
                    src="/assets/images/pope-pic1.WebP"
                    alt="His Holiness, Pope Leo XIV"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                </div>
              </div>
            </div>
            <p className="text-center text-base font-semibold text-primary mt-4">
              His Holiness, Pope Leo XIV
            </p>
          </motion.div>
        </div>
      </section>
      {/* Bishop Picture Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full flex justify-center items-center">
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                <div className="relative w-full aspect-[4/5]">
                  {/* Frame (no bg-white) */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-primary/40 shadow-xl pointer-events-none z-10"></div>
                  {/* Image fills the card */}
                  <Image
                    src="/assets/images/bishop-pic.WebP"
                    alt="His Lordship, Most Rev. Prof. Augustine Ndubueze Echema, Bishop, Catholic Diocese of Aba"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                </div>
              </div>
            </div>
            <p className="text-center text-base font-semibold text-primary mt-4">
              His Lordship, Most Rev. Prof. Augustine Ndubueze Echema<br />
              Bishop, Catholic Diocese of Aba
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Picture Section */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-0 lg:px-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-full flex justify-center items-center">
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                <div className="relative w-full aspect-[4/5]">
                  {/* Frame (no bg-white) */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-primary/40 shadow-xl pointer-events-none z-10"></div>
                  {/* Image fills the card */}
                  <Image
                    src="/assets/images/founder.jpg"
                    alt="HIS LORDSHIP LATE BISHOP ANTHONY NWEDO,cssp."
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                </div>
              </div>
            </div>
            <p className="text-center text-base font-semibold text-primary mt-4">
              HIS LORDSHIP<br />
              LATE BISHOP ANTHONY NWEDO, cssp.<br />
              <span className="text-muted-foreground">(Founder of Annunciation Seminary Amaudara)</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team of Formators Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Team of Formators
            </h2>
            <p className="text-lg text-muted-foreground">
              Meet the spiritual and academic leaders guiding our seminarians.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {formators.map((formator, idx) => (
              <motion.div
                key={formator.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: idx * 0.07 }}
                className="bg-card border border-border rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center"
              >
                <div
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-6 border-4 border-primary/30 shadow-xl flex items-center justify-center"
                  style={{ boxShadow: '0 0 32px #2563eb33', background: '#fff' }}
                >
                  <img
                    src={formator.image}
                    alt={formator.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <Icon name="Award" size={56} className="text-primary mb-2" />
                <h3 className="text-lg sm:text-xl font-heading font-bold text-primary mb-1">{formator.name}</h3>
                <p className="text-sm sm:text-base font-semibold text-muted-foreground mb-2">{formator.title}</p>
                <p className="text-xs sm:text-sm text-foreground mb-4">{formator.bio}</p>
                <blockquote className="italic text-primary border-l-4 border-primary pl-3 mb-0 text-xs sm:text-sm">
                  "{formator.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose ANNUNCIATION SEMINARY AMAUDARA?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our commitment to academic excellence, spiritual formation, and character development sets us apart as a premier Catholic seminary dedicated to nurturing future leaders of the Church and society.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              key="Academic Excellence"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Award" size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Academic & Spiritual Excellence
              </h3>
              <p className="text-muted-foreground mb-4 font-body">
                Renowned for outstanding academic performance and deep spiritual formation, preparing seminarians for priestly and lay leadership.
              </p>
              <div className="text-2xl font-heading font-bold text-primary">
                95% Pass Rate
              </div>
            </motion.div>
            <motion.div
              key="Modern Facilities"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Building" size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Modern & Sacred Facilities
              </h3>
              <p className="text-muted-foreground mb-4 font-body">
                State-of-the-art classrooms, serene chapel, library, and sports facilities to enhance holistic formation and learning.
              </p>
              <div className="text-2xl font-heading font-bold text-primary">
                20+ Facilities
              </div>
            </motion.div>
            <motion.div
              key="Student Success"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Formation for Life & Mission
              </h3>
              <p className="text-muted-foreground mb-4 font-body">
                Dedicated to nurturing future priests and lay leaders with personalized attention, discipline, and comprehensive development.
              </p>
              <div className="text-2xl font-heading font-bold text-primary">
                1000+ Alumni
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* --- Special Seminary Moments Section --- */}
      <section className="py-12 bg-muted/10">
        <div className="container mx-auto px-4 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Peter Obi with Bishop */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border-4 border-primary/30 bg-white">
                <Image
                  src="/assets/images/bishop123.jpg"
                  alt="Peter Obi with Bishop at Annunciation Seminary"
                  className="w-full h-80 object-cover"
                  style={{ objectPosition: 'center top' }}
                />
              </div>
              <p className="mt-4 text-center text-base font-semibold text-primary break-words max-w-xs sm:max-w-md md:max-w-lg">
                <span className="block">A Memorable Visit:</span>
                <span className="block">Peter Obi with His Lordship, Most Rev. Prof. Augustine Ndubueze Echema,</span>
                <span className="block">Bishop of Catholic Diocese of Aba, at Annunciation Seminary Amaudara</span>
              </p>
            </motion.div>
            {/* Seminary Field */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border-4 border-accent/20 bg-white mb-6">
                <Image
                  src="/assets/images/main-football-field.jpg"
                  alt="Seminary Football Field"
                  className="w-full h-80 object-cover"
                />
              </div>
              <p className="mt-4 text-center text-base font-semibold text-accent break-words max-w-xs sm:max-w-md md:max-w-lg">
                <span className="block">Vibrant Seminary Life:</span>
                <span className="block">Sports and brotherhood on the lush football field</span>
              </p>
              {/* Lawn Tennis Pic and Caption */}
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border-4 border-accent/20 bg-white mt-8">
                <Image
                  src="/assets/images/lawn-tennis.jpg"
                  alt="Seminary Lawn Tennis Court"
                  className="w-full h-80 object-cover"
                />
              </div>
              <p className="mt-4 text-center text-base font-semibold text-accent break-words max-w-xs sm:max-w-md md:max-w-lg">
                <span className="block">Lawn Tennis Court:</span>
                <span className="block">A modern court for tennis, recreation, and healthy competition</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our Promise to Every Seminarian
            </h2>
            <p className="text-lg text-muted-foreground">
              At Annunciation Seminary Amaudara, we believe every seminarian deserves a nurturing environment, deep spiritual formation, and opportunities to grow in knowledge, faith, and service.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Heart" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Caring Community</h3>
              <p className="text-muted-foreground font-body">
                Supportive priests, formators, and staff who care about every seminarian’s growth, vocation, and well-being.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Lightbulb" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Holistic Formation</h3>
              <p className="text-muted-foreground font-body">
                Spiritual, academic, and human formation that prepares seminarians for priesthood and leadership in the Church and society.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.3 }}
              className="bg-card border border-primary/20 rounded-xl p-6 text-center shadow hover:shadow-lg transition-shadow"
            >
              <Icon name="Trophy" size={32} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Opportunities to Shine</h3>
              <p className="text-muted-foreground font-body">
                Liturgical, academic, and leadership programs to help seminarians discover and develop their gifts for the Church.
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
            transition={{ duration: 0.1 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Life Beyond the Chapel
            </h2>
            <p className="text-lg text-muted-foreground">
              Our seminarians enjoy a rich variety of clubs, sports, and creative activities that build confidence, brotherhood, and leadership.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Football" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Sports & Fitness</h3>
              <p className="text-muted-foreground font-body">
                Football, basketball, athletics and more—our sports programs encourage teamwork, discipline, and healthy living.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Music" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Music & Arts</h3>
              <p className="text-muted-foreground font-body">
                Choir, drama, and art clubs help seminarians express themselves and discover new talents.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Code" size={36} className="text-accent mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Intellectual & Innovation Clubs</h3>
              <p className="text-muted-foreground font-body">
                Science, debate, and technology clubs prepare seminarians for the future and foster curiosity.
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
            transition={{ duration: 0.1 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The foundation of Annunciation Seminary Amaudara is built on values that shape our seminarians for life and ministry.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="ShieldCheck" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Integrity</h3>
              <p className="text-muted-foreground font-body">
                We instill honesty, responsibility, and strong moral principles in every seminarian.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="Users" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Respect</h3>
              <p className="text-muted-foreground font-body">
                We celebrate diversity and foster a culture of respect for self, others, and the Church.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <Icon name="TrendingUp" size={36} className="text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary mb-2">Excellence</h3>
              <p className="text-muted-foreground font-body">
                We encourage our seminarians to strive for their best in academics, spirituality, and leadership.
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
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from parents, seminarians, and alumni about their Annunciation Seminary Amaudara experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              key="cynthia amaka"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" size={16} className="text-secondary fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 font-body italic">
                "Annunciation Seminary Amaudara has truly transformed my child's spiritual and academic journey. The dedicated formators and excellent facilities make it outstanding."
              </p>
              <div>
                <p className="font-heading font-semibold text-foreground">Cynthia Amaka</p>
                <p className="text-sm text-muted-foreground">Parent</p>
              </div>
            </motion.div>
            <motion.div
              key="Michael chibueze"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" size={16} className="text-secondary fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 font-body italic">
                "The formation I received here prepared me for seminary and beyond. The emphasis on holistic growth is remarkable."
              </p>
              <div>
                <p className="font-heading font-semibold text-foreground">Michael Chibueze</p>
                <p className="text-sm text-muted-foreground">Alumni</p>
              </div>
            </motion.div>
            <motion.div
              key="Ebuka David"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" size={16} className="text-secondary fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 font-body italic">
                "I love the prayerful environment and the support from formators. This seminary truly cares about each seminarian."
              </p>
              <div>
                <p className="font-heading font-semibold text-foreground">Ebuka David</p>
                <p className="text-sm text-muted-foreground">Seminarian</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-blue-100 border-t border-border py-12">
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
                <li><button onClick={() => handleNavigation('/announcements')} className="text-muted-foreground hover:text-primary">Announcements & Updates</button></li>
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
                  <span>Isiala Ngwa South, Abia State</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Phone" size={16} />
                  <span>+2347069386013</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Smartphone" size={16} />
                  <span>+2348143316441</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Briefcase" size={16} />
                  <span>+2348039360904</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Mail" size={16} />
                  <span>ubanichristian2282@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

function WelcomeAddressFull() {
  const [showFull, setShowFull] = useState(false);
  return (
    <div>
      {!showFull ? (
        <>
          <p className="text-base text-muted-foreground mb-4 font-body">
            We invite you to be active partners in this mission, sharing in our vision to form future leaders for the Church and society. Together, let us create an environment where every seminarian can thrive, discover his calling, and become a beacon of hope and service.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary"
            onClick={() => setShowFull(true)}
          >
            Read More
          </Button>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-base text-muted-foreground mb-4 font-body">
            We invite you to be active partners in this mission, sharing in our vision to form future leaders for the Church and society. Together, let us create an environment where every seminarian can thrive, discover his calling, and become a beacon of hope and service.<br /><br />
            Our doors are always open to you. We encourage you to visit, participate in our events, and engage with our formators and staff. Your presence and involvement enrich our seminary life and inspire our seminarians to reach greater heights.<br /><br />
            May God bless you abundantly for your trust and commitment. We look forward to a fruitful partnership and a rewarding experience for your sons and all members of our seminary family.<br /><br />
            With gratitude and prayers,<br />
            <span className="font-heading font-bold text-primary">Very Rev. Fr. Chidi Obilor</span><br />
            Rector, Annunciation Seminary Amaudara
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary"
            onClick={() => setShowFull(false)}
          >
            Show Less
          </Button>
        </div>
      )}
    </div>
  );
}