import React, { useEffect, useState } from "react";
import Spinner from "./spinner";
import Image from "../components/AppImage";

const breakDuration = 1000; // ms

const getBreakStyle = (triggered, direction) => {
  if (!triggered) return {};
  const base = {
    opacity: 0,
    transform: `translate${direction === "up" ? "Y" : direction === "down" ? "Y" : "X"}(${
      direction === "up" ? "-120px" : direction === "down" ? "120px" : direction === "left" ? "-120px" : "120px"
    }) scale(0.7) rotate(${direction === "left" ? "-18deg" : direction === "right" ? "18deg" : "0deg"})`,
    transition: `all ${breakDuration}ms cubic-bezier(.5,-0.5,.5,1.5)`
  };
  return base;
};

const Loader = ({ visible = true, onBreakEnd }) => {
  const [breakApart, setBreakApart] = useState(false);

  useEffect(() => {
    if (!visible) {
      setBreakApart(true);
      const timer = setTimeout(() => {
        if (onBreakEnd) onBreakEnd();
      }, breakDuration);
      return () => clearTimeout(timer);
    } else {
      setBreakApart(false);
    }
  }, [visible, onBreakEnd]);

  if (!visible && !breakApart) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-background to-accent min-h-screen w-full"
      style={{
        pointerEvents: breakApart ? "none" : "auto",
        transition: `opacity ${breakDuration}ms`,
        opacity: breakApart ? 0.7 : 1,
      }}
    >
      <div className="flex flex-col items-center justify-center w-full px-4">
        <div
          className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg mb-8 border-4 border-primary/30 bg-white flex items-center justify-center"
          style={getBreakStyle(breakApart, "up")}
        >
          <Image
            src="/assets/images/school_logo-1754996036714.jpg"
            alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary mb-2 tracking-wide drop-shadow-lg text-center"
          style={getBreakStyle(breakApart, "left")}
        >
          ANNUNCIATION SEMINARY AMAUDARA
        </h1>
        <p
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 font-body text-center"
          style={getBreakStyle(breakApart, "right")}
        >
          RENOVARE FACEM TERRA
        </p>
        <div style={getBreakStyle(breakApart, "down")}>
          <Spinner message="Loading, please wait..." className="mt-2" />
        </div>
      </div>
    </div>
  );
};

export default Loader;

