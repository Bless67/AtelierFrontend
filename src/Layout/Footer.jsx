import { Link } from "react-router-dom";

import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-gray-800 to-gray-950 text-gray-200 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div>
          <h2 className="text-xl font-bold mb-3">
            <Link to={"/"}>Yabuwat Atelier</Link>
          </h2>
          <p className="text-sm">
            Quality fashion and accessories that blend tradition with elegance.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-3">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/search?category=Men" className="hover:underline">
                Men
              </Link>
            </li>
            <li>
              <Link to="/search?category=Women" className="hover:underline">
                Women
              </Link>
            </li>
            <li>
              <Link to="/search?category=Kids" className="hover:underline">
                Kids
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to={"/contact"} className="hover:underline">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to={"/about"} className="hover:underline">
                About us
              </Link>
            </li>
            <li>
              <Link to={"/orders"} className="hover:underline">
                Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 text-lg">
            <p
              aria-label="Facebook"
              className="hover:text-white cursor-pointer"
            >
              <FaFacebookF />
            </p>
            <p
              aria-label="Whatsapp"
              className="hover:text-white cursor-pointer"
            >
              <FaWhatsapp />
            </p>
            <p
              aria-label="Instagram"
              className="hover:text-white cursor-pointer"
            >
              <FaInstagram />
            </p>

            <p aria-label="Twitter" className="hover:text-white cursor-pointer">
              <BsTwitterX />
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Yabuwat Atelier. All rights reserved.
      </div>
    </footer>
  );
}
