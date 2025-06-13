import React from "react";

function TrackingMoodPage() {
  return (
    <div className="w-full h-screen font-nunito flex overflow-hidden pt-8">
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl lg:text-5xl font-bold">Hello Mehbub!</h1>
          <img src="/pink.png" alt="" className="w-[280px]" />
          <img src="/anjeng.png" alt="" className="w-[280px] h-[420px] lg:w-[640px] object-cover rounded-3xl"/>
          <h3 className="text-3xl font-semibold">How are you feeling today?</h3>
        </div>
        <div className="">
          <button className="px-24 py-4 bg-secondary text-lg text-white font-semibold rounded-full">
            Track Your Mood
          </button>
        </div>
      </div>

      <div className="">
        <img src="/yellow.png" alt="" className="w-[240px] lg:w-[280px] absolute left-1/10 -top-1/12 xl:-top-1/10 xl:left-1/5 lg:-top-1/10 lg:left-1/10 -z-10" />
        <img src="/blue.png" alt="" className="w-[320px] absolute lg:bottom-52 lg:left-20 z-0" />
        <img src="/cream.png" alt="" className="w-[160px] absolute lg:bottom-10 lg:right-18 z-20" />
      </div>

    </div>
  );
}

export default TrackingMoodPage;