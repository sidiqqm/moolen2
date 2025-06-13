import React from "react";

const Review = () => {
  return (
    <div>
      <div className="w-[286px] h-[300px] bg-[#FADADD] rounded-tr-[64px] shadow-2xl">
        <div className=" flex justify-between pt-8 pr-8 pl-6 items-center mb-12">
          <h1>Reza Sitohang</h1>
          <img src="/avatar.png" alt="" className="w-[36px] h-[36px]" />
        </div>
        <div className="font-nunito">
          <p className="text-sm max-w-sm text-center px-5 mb-3">
            “Since I started using MooLen regularly, I feel calmer and can face
            tough days more relaxedly. The daily tips are always right on
            target!”
          </p>
          <p className="text-md text-center">— Aulia, 24 years old</p>
        </div>
      </div>
    </div>
  );
};

export default Review;
