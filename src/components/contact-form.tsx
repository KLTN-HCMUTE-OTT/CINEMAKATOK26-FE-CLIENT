import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Github, Twitter, Facebook } from "lucide-react";

const ContactForm = () => {
  return (
    <div className="mt-8 p-8 mx-auto w-full min-h-[400px] flex flex-col md:flex-row items-start justify-between gap-8 bg-transparent">
      {/* Left: Title & Social */}
      <div className="flex-1 text-white flex flex-col justify-center">
        <h2 className="text-5xl font-bold mb-4 leading-tight">
          Say hi! Don’t be shy.
        </h2>
        <p className="mb-6 text-lg text-gray-300 max-w-xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae
          purus a lectus semper consequat a at felis. Mauris sed neque id nisl
          lacinia imperdiet.
        </p>
        <div className="flex gap-4 mt-2">
          <a href="#" aria-label="Facebook" className="hover:text-blue-400">
            <Facebook size={22} />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-blue-400">
            <Twitter size={22} />
          </a>
          <a href="#" aria-label="Github" className="hover:text-blue-400">
            <Github size={22} />
          </a>
        </div>
      </div>
      {/* Right: Form */}
      <form className="flex-1 flex flex-col gap-6">
        <div>
          <label htmlFor="message" className="block mb-2 text-white text-lg">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            className="bg-[#23243a]/80 border-none text-white placeholder:text-gray-400 rounded-xl w-full h-32"
            placeholder="Type your message..."
          />
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label htmlFor="name" className="block mb-2 text-white text-lg">
              Your name
            </label>
            <Input
              id="name"
              name="name"
              className="bg-[#23243a]/80 border-none text-white placeholder:text-gray-400 rounded-xl w-full h-12"
              placeholder="Enter your name"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="email" className="block mb-2 text-white text-lg">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              className="bg-[#23243a]/80 border-none text-white placeholder:text-gray-400 rounded-xl w-full h-12"
              placeholder="Enter your email"
            />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            className="px-8 py-3 rounded-xl border-2 border-white text-white font-bold text-lg bg-transparent hover:bg-white hover:text-[#23243a] transition-all"
          >
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
