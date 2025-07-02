import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 px-[16px] md:px-[88px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          
          {/* Brand Section */}
          <div className='flex md:block flex-col justify-center items-center w-1/2 md:w-full'>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <img src="/logo.svg" alt="logo-HotShop" />
              </div>
              <span className="text-xl font-bold">HotShop</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted online shopping destination for quality products at great prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/account" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My Account
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                📧 support@hotshop.com
              </p>
              <p className="text-gray-400 text-sm">
                📞 +1 (555) 123-4567
              </p>
              <div className="flex justify-center md:justify-start space-x-4 pt-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} HotShop. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made By Shahid Falah
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
