import React from 'react';
import Image from '../components/AppImage';
import Icon from '../components/AppIcon';
import { motion } from 'framer-motion';

const classes = [
  { name: 'Creche', features: ['Safe and nurturing environment', 'Early childhood development', 'Play-based learning'] },
  { name: 'Pre-Nursery', features: ['Foundational skills', 'Creative activities', 'Social interaction'] },
  { name: 'Nursery', features: ['Literacy and numeracy', 'Music and movement', 'Personal development'] },
  { name: 'Kindergarten', features: ['Reading readiness', 'Hands-on activities', 'Group learning'] },
  { name: 'Primary 1', features: ['Core subjects', 'Interactive lessons', 'Continuous assessment'] },
  { name: 'Primary 2', features: ['Expanded curriculum', 'Project-based learning', 'Extracurricular activities'] },
  { name: 'Primary 3', features: ['Critical thinking', 'Science experiments', 'Sports'] },
  { name: 'Primary 4', features: ['Advanced reading', 'Mathematics focus', 'Leadership skills'] },
  { name: 'Primary 5', features: ['Preparation for upper classes', 'ICT integration', 'Team projects'] },
  { name: 'Primary 6', features: ['Transition to secondary', 'Exam readiness', 'Personal growth'] },
  { name: 'JSS1', features: ['Junior secondary curriculum', 'STEM focus', 'Clubs and societies'] },
  { name: 'JSS2', features: ['Expanded STEM', 'Creative arts', 'Community service'] },
  { name: 'JSS3', features: ['BECE preparation', 'Career guidance', 'Leadership development'] },
  { name: 'SS1', features: ['Senior secondary curriculum', 'Subject specialization', 'Laboratory work'] },
  { name: 'SS2', features: ['WAEC/NECO preparation', 'Research projects', 'Mentorship'] },
  { name: 'SS3', features: ['Final exam readiness', 'University prep', 'Graduation activities'] },
];

const Admissions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12"> {/* <-- Responsive padding */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-4">
            Admission is Ongoing
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            GOSHEN PRINATH ACADEMY welcomes students from Creche to SS3. Our classes are designed to nurture, inspire, and prepare students for lifelong success.
          </p>
          <div className="w-full max-w-lg mx-auto rounded-xl overflow-hidden shadow-lg mb-6">
            <Image
              src="/assets/images/student-pic.jpg"
              alt="GOSHEN PRINATH ACADEMY Students"
              className="w-full h-auto object-cover"
              style={{ maxHeight: '350px' }}
            />
          </div>
          <div className="flex flex-col items-center mb-2">
            <Icon name="CheckCircle" size={32} className="text-success mb-2" />
            <span className="font-semibold text-primary text-sm sm:text-base">For Enquiries: 07086326816, 0916781954</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-4 sm:mb-6 text-center">
            Our Classes & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"> {/* <-- Responsive grid and gap */}
            {classes.map((cls, idx) => (
              <motion.div
                key={cls.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-base sm:text-lg font-heading font-semibold text-primary mb-2">
                  {cls.name}
                </h3>
                <ul className="list-disc pl-4 sm:pl-5 text-muted-foreground text-xs sm:text-sm space-y-1">
                  {cls.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admissions;

// --- Mobile adaptive styles are handled by Tailwind's responsive classes (e.g. px-2, sm:px-4, grid-cols-1, md:grid-cols-2, text-base, sm:text-lg, etc).