import React from 'react';
import Image from '../components/AppImage';
import Icon from '../components/AppIcon';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-primary/20">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">Contact Info</h1>
            <p className="text-muted-foreground text-center">
              Reach out to us for inquiries, support, or more information about ANNUNCIATION SEMINARY AMAUDARA.<br />
              We are always happy to hear from you and will respond as soon as possible.<br />
              For urgent matters, please use the phone numbers below.
            </p>
          </div>
          <ul className="space-y-4 font-body text-base text-foreground mb-8">
            <li className="flex items-center space-x-3">
              <Icon name="MapPin" size={20} />
              <span>Isiala Ngwa South, Abia State</span>
            </li>
            <li className="flex items-center space-x-3">
              <Icon name="Phone" size={20} />
              <span>+2347069386013</span>
            </li>
            <li className="flex items-center space-x-3">
              <Icon name="Smartphone" size={20} />
              <span>+2348143316441</span>
            </li>
            <li className="flex items-center space-x-3">
              <Icon name="Briefcase" size={20} />
              <span>+2348039360904</span>
            </li>
            <li className="flex items-center space-x-3">
              <Icon name="Mail" size={20} />
              <span>ubanichristian2282@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;