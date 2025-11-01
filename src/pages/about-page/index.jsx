import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from '../../components/AppImage';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { MdMenu } from "react-icons/md";

const AboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);

  // Annunciation Seminary core values
  const coreValues = [
    {
      icon: 'BookOpen',
      title: 'Academic Excellence',
      description: 'We are committed to the highest standards of academic achievement and intellectual formation.'
    },
    {
      icon: 'Heart',
      title: 'Spiritual Growth',
      description: 'Fostering deep spiritual formation and Catholic values in every seminarian.'
    },
    {
      icon: 'Users',
      title: 'Community Life',
      description: 'Building a supportive, disciplined, and vibrant seminary community.'
    },
    {
      icon: 'Lightbulb',
      title: 'Holistic Formation',
      description: 'Nurturing the mind, body, and spirit for well-rounded priestly candidates.'
    },
    {
      icon: 'Target',
      title: 'Leadership',
      description: 'Forming future leaders for the Church and society.'
    },
    {
      icon: 'Globe',
      title: 'Service',
      description: 'Instilling a lifelong commitment to service and evangelization.'
    }
  ];

  // Seminary leadership (Rector only for now)
  const facultyMembers = [
    {
      name: 'Very Rev. Fr. Chidi Obilor',
      position: 'Rector',
      qualification: '',
      experience: '',
      photo: '/assets/images/rector-pic.WebP'
    }
  ];

  // Seminary facilities
  const facilities = [
    {
      name: 'Chapel',
      description: 'A newly dedicated Main Chapel for worship and spiritual activities.',
      icon: 'Church'
    },
    {
      name: 'Academic Blocks',
      description: 'Modern classrooms and administrative buildings for effective learning.',
      icon: 'Building'
    },
    {
      name: 'Science Laboratory',
      description: 'Well-equipped laboratory for scientific exploration.',
      icon: 'Flask'
    },
    {
      name: 'Library',
      description: 'A rich collection of theological and academic resources.',
      icon: 'BookOpen'
    },
    {
      name: 'Sports Facilities',
      description: 'Football fields, tennis, basketball, volleyball, badminton, and table tennis courts.',
      icon: 'Trophy'
    },
    {
      name: 'Hostels',
      description: 'Comfortable and secure accommodation for seminarians.',
      icon: 'Home'
    },
    {
      name: 'Farm Complex',
      description: 'Oil mill, goat pen, piggery, fish pond, and poultry for practical learning.',
      icon: 'Leaf'
    },
    {
      name: 'ICT Centre',
      description: 'Computer laboratory and digital resources for modern education.',
      icon: 'Computer'
    },
    {
      name: 'Clinic',
      description: 'On-site clinic for health and wellness.',
      icon: 'HeartPulse'
    }
  ];

  // Seminary milestones
  const milestones = [
    {
      year: '1980',
      title: 'Vision & Land Acquisition',
      description: 'Late Bishop Anthony Gogo Nwedo CSSp. initiated the founding of a second seminary; Amaudara village provided land.',
      logo: false
    },
    {
      year: '1984',
      title: 'Seminary Opens',
      description: 'Annunciation Seminary Amaudara began with 106 seminarians and Rev. Fr. Luke Odor as first Rector.',
      logo: true
    },
    {
      year: '1990',
      title: 'Aba Diocese Creation',
      description: 'Seminary became part of the new Catholic Diocese of Aba.',
      logo: false
    },
    {
      year: '1994',
      title: 'Main Chapel Foundation',
      description: 'Foundation of the Main Chapel was laid under Fr. Emmanuel Nwaokonko.',
      logo: false
    },
    {
      year: '2021–2024',
      title: 'Major Expansion',
      description: 'New multi-purpose administrative complex, solar power, new sports fields, and Chapel dedication for 40th anniversary.',
      logo: true
    }
  ];

  // Seminary images (update with actual images if available)
  const schoolImages = [
    {
      src: '/assets/images/front-gate.jpg',
      alt: 'Rector',
      caption:'Front Gate'
    },
    {
      src: '/assets/images/main-avenue.jpg',
      alt: 'Seminary Logo',
      caption: 'The Main Avenue'
    },
    {
      src: '/assets/images/chapel-pic.WebP',
      alt: 'Dean of Studies',
      caption: 'The Chapel'
    },
    {
      src: '/assets/images/bishop-ezeonya-hall.jpg',
      alt: 'Vice Rector',
      caption: 'Bishop Ezeonya Hall'
    },
    {
      src: '/assets/images/science-lab.jpg',
      alt: 'Spiritual Director',
      caption: 'Science Lab'
    },
    {
      src: '/assets/images/student-hostel.jpg',
      alt: 'Librarian',
      caption: 'Student Hostel'
    },
    {
      src: '/assets/images/administrative-complex.jpg',
      alt: 'Librarian',
      caption: 'Administrative Complex'
    },
    {      src: '/assets/images/adminitrative-complex2.jpg',
      src: '/assets/images/administrative-complex2.jpg',
      alt: 'Librarian',
      caption: 'Administrative Complex View '
    },
    {
      src: '/assets/images/senior-block.jpg',
      alt: 'Farm Manager',
      caption: 'Academic Senior Block'
    },
    {
      src: '/assets/images/volleyball-court.jpg',
      alt: 'Farm Manager',
      caption: 'Volleyball Court'
    },
    {
      src: '/assets/images/basketball-court.jpg',
      alt: 'Farm Manager',
      caption: 'Basketball Court'
    },
    {
      src: '/assets/images/mary-grotto.jpg',
      alt: 'Farm Manager',
      caption: 'The Annunciation Grotto'
    },
    {
      src: '/assets/images/clinic.jpg',
      alt: 'Farm Manager',
      caption: 'Seminary Clinic'
    }
  ];
  

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border z-50 rounded-b-2xl shadow-lg">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-primary/30 bg-white shadow-lg">
                <Image 
                  src="/assets/images/school_logo-1754996036714.jpg"
                  alt="Annunciation Seminary Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-foreground tracking-wide">ANNUNCIATION SEMINARY AMAUDARA</h1>
                <p className="font-caption text-xs text-muted-foreground tracking-widest">RENOVARE FACIEM TERRAE</p>
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
                className="font-body text-sm border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg shadow-sm"
              >
                Login
              </Button>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors shadow focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Open menu"
            >
              <MdMenu size={28} className="text-primary" />
            </button>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden border-t border-border bg-card/95 rounded-b-2xl shadow-lg py-4 mt-2"
            >
              <nav className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleNavigation('/landing-page')}
                  className="text-left font-body text-sm text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/10"
                >
                  Home
                </button>
                <button className="text-left font-body text-sm text-primary font-semibold">
                  About
                </button>
                <button 
                  onClick={() => handleNavigation('/admissions')}
                  className="text-left font-body text-sm text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/10"
                >
                  Admissions
                </button>
                <button 
                  onClick={() => handleNavigation('/contact')}
                  className="text-left font-body text-sm text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/10"
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
            transition={{ duration: 0.1 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-xl">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="Annunciation Seminary Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              About Annunciation Seminary Amaudara
            </h1>
            <p className="text-xl lg:text-2xl font-body text-primary mb-8">
              Renovare Faciem Terrae
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Annunciation Seminary Amaudara stands as a beacon of Catholic priestly formation, committed to nurturing young men in faith, academics, and character for service to the Church and society.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Slogan, Motto, Mission & Vision Section */}
      <section className="pt-12 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-primary mb-6 tracking-tight">
              Seminary Slogan
            </h2>
            <div className="flex flex-col items-center justify-center mb-8">
              <Icon name="Handshake" size={48} className="text-accent mb-2" />
              <p className="text-2xl lg:text-3xl font-body font-semibold text-muted-foreground bg-card px-6 py-3 rounded-xl shadow inline-block">
                Formation for Service and Leadership
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Motto
                </h3>
                <p className="text-xl font-body text-primary mb-4 bg-card px-4 py-2 rounded-lg shadow">
                  Renovare Faciem Terrae
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Mission Statement
                </h3>
                <p className="text-lg font-body text-muted-foreground mb-2">
                  To form young men for the Catholic priesthood through holistic education, spiritual growth, and leadership development.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                Vision Statement
              </h3>
              <div className="bg-card px-6 py-4 rounded-xl shadow-lg inline-block">
                <p className="text-lg font-body text-muted-foreground">
                  To be a leading seminary producing priests and leaders who renew the face of the earth through faith, knowledge, and service.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* School Image Gallery */}
      <section className="py-16 bg-muted/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
              Our Seminary Campus
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our serene campus, modern facilities, and vibrant community life.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {schoolImages.map((img, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.1, delay: index * 0.02 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer w-full"
                  onClick={() => setPreviewImg(img.src)}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold font-heading text-muted-foreground">{img.caption}</h3>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* --- INSERTED: Seminary History Section --- */}
      <section className="py-20 bg-card/80 border-y border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-6 text-center">
              📜 A Concise History of Annunciation Seminary Amaudara
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground bg-background/80 rounded-xl shadow-lg p-6">
              <p>
                In the year 1980, His Lordship, Late Bishop Anthony Gogo Nwedo CSSp., the then Bishop of the Old Umuahia Diocese proceeded to the zones of Bende, Okigwe and Aba, informed the Umuahia Diocesan priests of his intention to erect a second seminary to decongest the densely populated Immaculate Conception Seminary Ahiaeke. After preliminary setups, Amaudara was chosen as the location; and after due negotiations, the villagers gave a piece of land for this purpose. The new Seminary was meant to be a feeder Seminary to Immaculate Conception. The launching for the erection of buildings was done in 1983, and the Seminary took off in 1984, with Rev. Fr. Luke Odor appointed as the first Rector.
              </p>
              <p>
                Consequently, in the same year Late Bishop Nwedo celebrated the silver jubilee anniversary of his Episcopal Consecration (1959-1984). Consequently, the newly established Seminary named 'Bishop Nwedo Jubilee Seminary,' but was eventually renamed as 'Annunciation Seminary' following the Bishop's humble objections. The establishment of a Seminary in the Aba zone was one of the foundational prerequisites (alongside a hospital) for the creation of a new Diocese in Aba. Therefore, in 1990, when the Catholic Diocese of Aba was created, the six-year old Seminary became an institution of the newly created diocese.
              </p>
              <p>
                The Seminary began with about one hundred and six (106) seminarians in 1984, and the source of water was the Amaudara village stream. From her inception till date, the Seminary has had fourteen (14) Rectors. Structurally, the Seminary started with two buildings – one serving as the Fathers' House and the other as the students' dormitory, Chapel, classroom and refectory. Within the tenures of Fr. Luke Odor (1984-1986) and Late Msgr. Raph Nwosu (1986-1990), extra buildings were erected – the students' refectory, two classroom blocks, and the students' hostel.
              </p>
              <p>
                When Late Bishop Vincent Valentine Ezeonyia CSSp. was made the Bishop of the newly created Aba Diocese, he appointed Rev. Fr. Peter Nwaopara as the Rector of the Seminary (1990-1991). The school was making use of a hand pump for water supply, and the public power supply had not reached Amaudara as at then. It was during the rectorship of Msgr. Innocent Ajounu (1991-1993) that a new borehole was sunk in front of the plant house, and a generator was purchased to tackle the water problem. It was also within this period that the Science laboratory was built. Msgr. Ajounu was succeeded by Fr. Emmanuel Nwaokonko (1993-1994), who was in turn succeeded by Fr. Capian Ubenutu (1994-1995). It was within this period that the foundation of the Main Chapel was laid (in 1994), under the rectorship of Fr. Emmanuel Nwaokonko, with the contract given by the late Bishop Ezeonyia to Mr. Dennis Okafor.
              </p>
              <p>
                The structural development of the Seminary continued even while the building of the Main Chapel was ongoing, which took a very long time. There was remarkable structural and formational development during the tenures of Fr. Emeka Okite (1995-1997), Fr. Callistus Onwere (1997-2002), Fr. Augustine Nwankpa (2002-2005), Fr. Jephthah Asuoha (2005-2007), and Fr. Kevin Nwosu (2007-2012). This period saw the building of the PTA and Jubilee Hostels, and the establishment of the Seminary farm complex. It was during the tenure of Fr. Kevin Nwosu that the seminarians started to make use of the Main Chapel; it had not yet been fully completed, but it was ready for use. Remarkable formational progress and significant structural developments were also recorded during the tenures of successive rectors, Fr. Cyril Ibebunjo (2012-2016), and Fr. Francis Onuoha (2016-2021), who was the first alumnus to be appointed as the Rector of the Seminary.
              </p>
              <p>
                The structural development of the Seminary has been sustained and, in fact, taken to a greater level by the incumbent rector, Fr. Chidi Obilor (2021-date), the second alumnus to be appointed as the Rector of the Seminary. Worthy of note is the new gigantic multi-purpose administrative complex, which was started and completed within his tenure, as well as the dedication of the Chapel on this day of the
              </p>
              <p>
                Seminary's 40th anniversary, which officially marks the successful major structural completion of the Chapel under his administration. Other remarkable infrastructural developments within his same tenure include: the installation of a solar system which supplies light to the whole Seminary, the installation of a solar system for the submersible sump pump, the massive uprooting of bamboo and clearing of a strategic bushy portion of the Seminary compound and converting this into a football pitch in addition to the already existing field, the new Annunciation grotto, the structural design of the Seminary Main gate, the flooring of the Seminary Main Avenue, as well as many other structural renovations.
              </p>
              <p>
                With the combined efforts of the various Rectors, their various teams of formators, the parents, the pioneer Bishop of the Diocese, and the incumbent Bishop, Most Rev. Prof. Augustine Ndubueze Echema, Annunciation Seminary, which started with about 106 seminarians, can today boast of about 576 students, with thousands of alumni. The Seminary, which started with two buildings, can today boast of over twenty (20) buildings: the new Fathers' House with garage, the old administrative block inside the Main Chapel, the new multi-purpose administrative block, a teachers' lodge (located outside the Seminary compound), security house, science laboratory, junior and senior students' blocks with staff rooms, two students' hostels (storey buildings), two toilet buildings, a standard kitchen, students' refectory, a farm complex (oil mill, goat pen, piggery, fish pond and poultry), plant house, the Bishop Ezeonyia Memorial Complex, and the seminary clinic. The Seminary today also has various sports facilities: two football fields, a lawn tennis court, a basketball court, a volleyball court, a badminton court, and table tennis facilities. In addition, the Seminary has a big Leister generator, three submersible sump pumps (Sumo), a library, and a computer laboratory. The Seminary has drama groups, cultural groups, arts club, literary club, French club, et cetera. The Seminary also takes part in various competitions, ranging from sports to academic competitions, all for the wellbeing and development of the seminarians.
              </p>
              <p>
                The Seminary has always strived to live up to her motto "Renovare faciem terrae" (meaning, 'To renew the face of the earth'). The formation process is holistic, ranging from spiritual formation to the academic and human formation, thus yielding wanderful personalities in the society today.
              </p>
            </div>
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
              transition={{ duration: 0.1 }}
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
                To provide exceptional priestly formation that inspires seminarians to achieve their full potential, develop critical thinking, and become responsible leaders and priests for the Church and society.
              </p>
            </motion.div>
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
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
                To be recognized as a leading seminary that transforms lives through spiritual, academic, and human formation, creating priests and leaders who renew the face of the earth.
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
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These fundamental principles guide everything we do at Annunciation Seminary Amaudara, shaping our approach to priestly formation and community life.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues?.map((value, index) => (
              <motion.div
                key={value?.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1, delay: index * 0.02 }}
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
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Seminary Leadership
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the Rector who leads Annunciation Seminary Amaudara with vision and commitment to priestly formation.
            </p>
          </motion.div>
          {/* Rector Card Centered */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
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
                  alt={facultyMembers[0]?.name || 'Rector'}
                  className="w-full h-full object-cover object-top"
                  style={{ objectPosition: 'top center' }}
                />
              </div>
              <Icon name="Award" size={48} className="text-primary mb-4" />
              <h3 className="text-3xl font-heading font-bold text-primary mb-2 min-h-[1.5em]">
                {facultyMembers[0]?.name || <span className="text-muted-foreground italic">[Rector Name]</span>}
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
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Seminary Facilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our state-of-the-art facilities provide seminarians with the resources they need for holistic formation and academic excellence.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Chapel */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/chapel-pic.WebP"
                alt="Chapel"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Church" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Chapel
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                A newly dedicated Main Chapel for worship and spiritual activities.
              </p>
            </motion.div>
            {/* Academic Blocks */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/senior-block.jpg"
                alt="Academic Blocks"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Building" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Academic Blocks
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Modern classrooms and administrative buildings for effective learning.
              </p>
            </motion.div>
            {/* Science Laboratory */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/science-lab.jpg"
                alt="Science Laboratory"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Flask" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Science Laboratory
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Well-equipped laboratory for scientific exploration.
              </p>
            </motion.div>
            {/* Library */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/bishop-ezeonya-hall.jpg"
                alt="Library"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="BookOpen" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Library
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                A rich collection of theological and academic resources.
              </p>
            </motion.div>
            {/* Sports Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.5 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <div className="grid grid-cols-2 gap-2 w-full mb-4">
                <Image
                  src="/assets/images/volleyball-court.jpg"
                  alt="Volleyball Court"
                  className="h-20 object-cover rounded-lg w-full"
                />
                <Image
                  src="/assets/images/basketball-court.jpg"
                  alt="Basketball Court"
                  className="h-20 object-cover rounded-lg w-full"
                />
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Trophy" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Sports Facilities
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Football fields, tennis, basketball, volleyball, badminton, and table tennis courts.
              </p>
            </motion.div>
            {/* Hostels */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.6 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/student-hostel.jpg"
                alt="Hostels"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Home" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Hostels
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Comfortable and secure accommodation for seminarians.
              </p>
            </motion.div>
            {/* Farm Complex */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.7 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/main-avenue.jpg"
                alt="Farm Complex"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Leaf" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  AMDMIN BLOCK
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Oil mill, goat pen, piggery, fish pond, and poultry for practical learning.
              </p>
            </motion.div>
            {/* ICT Centre */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.8 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/administrative-complex.jpg"
                alt="ICT Centre"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Computer" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  ADMINISTRATIVE COMPLEX
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                Computer laboratory and digital resources for modern education.
              </p>
            </motion.div>
            {/* Clinic */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <Image
                src="/assets/images/clinic.jpg"
                alt="Clinic"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="HeartPulse" size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Clinic
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm text-center">
                On-site clinic for health and wellness.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Trace the growth and achievements of Annunciation Seminary Amaudara over the years.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            {milestones?.map((milestone, index) => (
              <motion.div
                key={milestone?.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: index * 0.2 }}
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
                            alt="Annunciation Seminary Logo"
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
            transition={{ duration: 0.1 }}
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
            transition={{ duration: 0.1 }}
            className="text-center text-primary-foreground"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary-foreground/20">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="Annunciation Seminary Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-4">
              Ready to Join Our Seminary Community?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Take the first step towards a life of service, leadership, and faith at Annunciation Seminary Amaudara.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Seminary Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                {/* Add seminary contact or logo here if needed */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;