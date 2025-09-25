import React from 'react';
import Image from '../../../components/AppImage';

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* School Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
          <Image 
            src="/assets/images/school_logo-1754996036714.jpg"
            alt="GOSHEN PRINATH ACADEMY Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* School Name and Welcome */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
          ANNUNCIATION SEMINARY AMAUDARA
        </h1>
        <p className="text-base font-body text-primary">
          RENOVARE FACEM TERRA
        </p>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      {/* Welcome Message */}
      <div className="mt-6 space-y-2">
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Welcome Back
        </h2>
        <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
          Sign in to access your personalized educational dashboard and continue your learning journey.
        </p>
      </div>
    </div>
  );
};

export default AuthHeader;