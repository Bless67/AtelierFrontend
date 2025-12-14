import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

export default function Footer() {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      url: "https://facebook.com/profile.php?id=61571468142528",
      color: "text-blue-400",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      url: `https://wa.me/${import.meta.env.VITE_CHECKOUT_WHATSAPP_NUMBER}`,
      color: "text-green-400",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://instagram.com/yabuwatatelier",
      color: "text-pink-400",
    },
    {
      name: "Twitter",
      icon: BsTwitterX,
      url: "https://twitter.com/yabuwatatelier",
      color: "text-gray-300",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-black via-gray-800 to-gray-950 text-gray-200 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            <Link to="/" className=" transition-opacity duration-200">
              Yabuwat Atelier
            </Link>
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Quality fashion that blend tradition with elegance. Crafting
            timeless pieces for the modern wardrobe.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-white">Shop</h3>
          <ul className="space-y-3 text-sm">
            {["Men", "Women", "Kids"].map((category) => (
              <li key={category}>
                <Link
                  to={`/search?category=${category}`}
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-white">Support</h3>
          <ul className="space-y-3 text-sm">
            {[{ label: "Contact Us", path: "/contact" }].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold mb-4 text-lg text-white">Follow Us</h3>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.name}`}
                  className={`p-2 rounded-full bg-gray-700 ${social.color} transition-all duration-300 transform hover:scale-110 hover:bg-gray-600 `}
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Stay updated with our latest collections and exclusive offers
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 pt-6 border-t border-gray-700 text-center">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} Yabuwat Atelier. All rights reserved.
          </p>
          {/* <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="/returns"
              className="hover:text-white transition-colors duration-200"
            >
              Returns
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
