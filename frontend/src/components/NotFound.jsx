import React from 'react'

import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-bold text-red-500">ERROR</h1>
      <p className="text-lg text-gray-600 mt-2">Page You are trying to reach does not exist</p>
     

      <Link to={"/"} className={`btn btn-sm gap-2`}>
               
                <span className="hidden sm:inline">Return Home</span>
              </Link>
    </div>
  );
};

export default NotFound;
