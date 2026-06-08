import React from "react";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

const ContactInfo = () => {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between w-full min-h-[400px] bg-[#0a0c1b] p-8 rounded-xl gap-8">
      {/* Left: Info */}
      <div className="flex-1 text-white">
        <h2 className="text-4xl font-bold mb-4">Contact info</h2>
        <p className="mb-6 text-lg text-gray-300">
          Review the contact options below to ensure we get your information to
          the right member of our team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div>
            <h3 className="font-semibold mb-1">Head Office</h3>
            <p className="text-gray-300">
              4517 Washington Ave. Manchester, Kentucky 39495
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Call Us</h3>
            <p className="text-gray-300">Support line: (808) 555-0111</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Support</h3>
            <p className="text-gray-300">support@streamvid.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Email Us</h3>
            <p className="text-gray-300">helle@example.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Press Inquires</h3>
            <p className="text-gray-300">pr@streamvid.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Advertising</h3>
            <p className="text-gray-300">ad_proposal@example.com</p>
          </div>
        </div>
      </div>
      {/* Right: Map */}
      <div className="flex-1 flex items-center justify-center min-w-[350px]">
        <Card className="w-full h-[350px] overflow-hidden shadow-lg">
          <CardContent className="p-0 h-full">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19816.96301361644!2d-0.143974!3d51.50643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b3333333333%3A0x3333333333333333!2sLondon!5e0!3m2!1sen!2suk!4v1633333333333!5m2!1sen!2suk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactInfo;
