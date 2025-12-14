import React from 'react';
import Image from '../components/AppImage';
import Icon from '../components/AppIcon';
import { motion } from 'framer-motion';

const updates = [
  {
    title: "Upcoming Episcopal Visit & Investiture",
    date: "November 5, 2025",
    image: "/assets/images/bishop-pic3.jpg",
    content: (
      <>
        <span className="block mb-2">
          <strong>We are honored to announce that His Lordship, Most Rev. Prof. Augustine Ndubueze Echema,</strong> Bishop of the Catholic Diocese of Aba, will be visiting Annunciation Seminary Amaudara for a special <strong>Investiture Ceremony</strong> on <span className="text-primary font-semibold">Wednesday, November 5th, 2025</span>.
        </span>
        <span className="block mb-2">
          This significant event will feature the investiture of new student leaders and a pastoral interaction with the entire seminary community. All seminarians, staff, and invited guests are expected to be seated by <strong>9:30am</strong>.
        </span>
        <span className="block">
          Let us prayerfully prepare for this memorable day as we welcome our Bishop and celebrate the gift of leadership and service in our seminary.
        </span>
      </>
    ),
    highlight: true,
  },
  {
    title: "Merry Christmas & Happy New Year to All Seminarians!",
    date: "December 14, 2025",
    image: "/assets/images/seminarians-pic.WebP", // Use a group photo of the seminarians
    content: (
      <>
        <span className="block mb-2">
          <strong>Wishing all our beloved seminarians a joyful Christmas and a prosperous New Year!</strong>
        </span>
        <span className="block mb-2">
          As we celebrate the birth of our Lord Jesus Christ, may your hearts be filled with peace, love, and renewed zeal for your vocation. We are proud of your dedication, discipline, and the spirit of brotherhood you show every day at Annunciation Seminary Amaudara.
        </span>
        <span className="block mb-2">
          May the coming year bring you greater wisdom, academic excellence, and spiritual growth. Remember, you are the light of the world and the hope of the Church. Keep striving for holiness and let your actions inspire others.
        </span>
        <span className="block">
          <strong>God bless you all and your families. Merry Christmas and a Happy New Year!</strong>
        </span>
      </>
    ),
    highlight: false,
  },
  // You can add more updates here as needed
];

const Announcements = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-3">
            Announcements & Updates
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Stay informed about the latest news, events, and important updates from Annunciation Seminary Amaudara.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-10">
          {updates.map((update, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: idx * 0.05 }}
              className={`bg-card border ${update.highlight ? 'border-primary shadow-xl' : 'border-border'} rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6`}
            >
              <div className="w-full md:w-56 flex-shrink-0 mb-4 md:mb-0">
                <Image
                  src={update.image}
                  alt={update.title}
                  className="w-full h-44 object-cover rounded-xl shadow"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Megaphone" size={22} className="text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {update.date}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold mb-2 text-foreground">
                  {update.title}
                </h2>
                <div className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  {update.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optionally, add a section for past updates or a "No updates" message */}
        {/* <div className="text-center mt-16 text-muted-foreground">
          No further updates at this time. Please check back soon!
        </div> */}
      </div>
    </div>
  );
};

export default Announcements;