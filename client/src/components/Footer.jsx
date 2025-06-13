import React from "react";
import {
  InstagramLogo,
  FacebookLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

const Footer = () => {
  return (
    <div className="bg-secondary py-12 px-4 sm:px-8">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between lg:justify-around gap-10 text-sm text-white mb-12">
        {/* Left */}
        <div className="max-w-md">
          <h1 className="text-xl font-bold font-nunito italic">
            Find Your Peace,
          </h1>
          <h1 className="text-xl font-bold font-nunito italic mb-4">
            Live Your Best Life
          </h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos qui
            itaque impedit? Lorem ipsum dolor sit amet consectetur adipisicing
            elit.
          </p>
        </div>

        {/* Learn */}
        <div className="font-nunito">
          <h3 className="text-lg font-bold mb-4">Learn</h3>
          <ul className="flex flex-col gap-1">
            <li><a href="">Home</a></li>
            <li><a href="">Daily Tips & Inspiration</a></li>
            <li><a href="">Blog</a></li>
            <li><a href="">Program</a></li>
          </ul>
        </div>

        {/* Help */}
        <div className="font-nunito">
          <h3 className="text-lg font-bold mb-4">Help</h3>
          <ul className="flex flex-col gap-1">
            <li><a href="">FAQ</a></li>
            <li><a href="">Contact Us</a></li>
            <li><a href="">Terms</a></li>
            <li><a href="">Privacy Policy</a></li>
            <li><a href="">Security</a></li>
            <li><a href="">Cookies</a></li>
            <li><a href="">Accessibility Statement</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-400 my-4"></div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-4">
          <InstagramLogo color="#fff" weight="fill" size={28} />
          <FacebookLogo color="#fff" weight="fill" size={28} />
          <LinkedinLogo color="#fff" weight="fill" size={28} />
          <XLogo color="#fff" weight="fill" size={28} />
          <YoutubeLogo color="#fff" weight="fill" size={28} />
        </div>
        <p className="text-[17px] font-semibold text-white text-center">
          © 2025 Moolen. All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;