// src/app/contact/page.tsx
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-(--color-font) min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Get in Touch with HotShop</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl">
        We&apos;d love to hear from you! Whether you have a question about our products,
        need assistance with an order, or just want to provide feedback, our team
        is ready to help.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <Mail className="w-12 h-12 text-(--color-primary) mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Email Us</h3>
          <p className="text-gray-600 text-center mb-4">
            For general inquiries or support, feel free to send us an email.
          </p>
          <a
            href="mailto:support@hotshop.com"
            className="text-(--color-primary) hover:text-(--color-primary-hover) font-medium transition-colors"
          >
            support@hotshop.com
          </a>
        </div>

        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <Phone className="w-12 h-12 text-(--color-primary) mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Call Us</h3>
          <p className="text-gray-600 text-center mb-4">
            Speak directly with our customer service team during business hours.
          </p>
          <a
            href="tel:+15551234567"
            className="text-(--color-primary) hover:text-(--color-primary-hover) font-medium transition-colors"
          >
            +1 (555) 123-4567
          </a>
        </div>

        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <MapPin className="w-12 h-12 text-(--color-primary) mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Location</h3>
          <p className="text-gray-600 text-center">
            HotShop Headquarters
            <br />
            123 E-commerce Lane
            <br />
            Online City, OC 98765
            <br />
            Country
          </p>
        </div>
      </div>

      <p className="text-md text-gray-600 text-center">
        We aim to respond to all inquiries within 24-48 business hours.
      </p>
    </div>
  );
}
