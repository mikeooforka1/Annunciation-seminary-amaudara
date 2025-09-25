import React from "react";
import { TbFidgetSpinner } from "react-icons/tb";

/**
 * Spinner component for polished UX.
 * Usage: <Spinner message="Loading..." />
 */
const Spinner = ({ message = "Loading...", className = "" }) => (
  <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
    <TbFidgetSpinner className="animate-spin text-5xl text-primary mb-2" />
    <span className="text-primary font-medium">{message}</span>
  </div>
);

export default Spinner;