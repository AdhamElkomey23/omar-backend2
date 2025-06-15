import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <i className="ri-seedling-line text-2xl text-secondary mr-2"></i>
              <span className="font-heading text-xl font-bold text-white">Artisana</span>
            </div>
            <p className="text-gray-400 mb-4">Connecting you with unique handmade products from talented artisans in your community.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <i className="ri-facebook-circle-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <i className="ri-pinterest-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-all">All Products</Link></li>
              <li><Link href="/featured" className="text-gray-400 hover:text-white transition-all">Featured Items</Link></li>
              <li><Link href="/new-arrivals" className="text-gray-400 hover:text-white transition-all">New Arrivals</Link></li>
              <li><Link href="/sale" className="text-gray-400 hover:text-white transition-all">Sale Items</Link></li>
              <li><Link href="/gift-cards" className="text-gray-400 hover:text-white transition-all">Gift Cards</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/our-story" className="text-gray-400 hover:text-white transition-all">Our Story</Link></li>
              <li><Link href="/artisans" className="text-gray-400 hover:text-white transition-all">Artisans</Link></li>
              <li><Link href="/sustainability" className="text-gray-400 hover:text-white transition-all">Sustainability</Link></li>
              <li><Link href="/impact" className="text-gray-400 hover:text-white transition-all">Community Impact</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-all">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li><Link href="/faqs" className="text-gray-400 hover:text-white transition-all">FAQs</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-all">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-all">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-all">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Artisana. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <i className="ri-visa-line text-xl text-gray-400"></i>
              <i className="ri-mastercard-line text-xl text-gray-400"></i>
              <i className="ri-paypal-line text-xl text-gray-400"></i>
              <i className="ri-apple-fill text-xl text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
