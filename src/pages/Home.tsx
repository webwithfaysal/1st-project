import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, DollarSign, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ResellHub</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">How it Works</a>
              <a href="#benefits" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Benefits</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Log in
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Start Reselling
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Start your own business</span>{' '}
                    <span className="block text-indigo-600 xl:inline">with zero investment</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Join our platform, pick winning products, sell them to your network, and keep the profit. We handle the inventory and delivery.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                        Get started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <a href="#how-it-works" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
                        Learn more
                      </a>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center p-12">
             <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transform translate-y-4">
                  <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">Premium Products</h3>
                  <p className="text-sm text-gray-500 mt-1">Access to high-quality inventory</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transform -translate-y-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">High Margins</h3>
                  <p className="text-sm text-gray-500 mt-1">Set your own selling price</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transform translate-y-4">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">Fast Payouts</h3>
                  <p className="text-sm text-gray-500 mt-1">Withdraw earnings easily</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center transform -translate-y-4">
                  <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">Affiliate Bonus</h3>
                  <p className="text-sm text-gray-500 mt-1">Earn by referring others</p>
                </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to succeed
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                We provide the tools, products, and logistics. You just focus on selling.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white pt-6 px-6 pb-8 rounded-lg shadow-sm border border-gray-100">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <ShoppingBag className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Curated Catalog</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Access hundreds of trending products at wholesale prices. We constantly update our inventory with high-demand items.
                    </p>
                  </div>
                </div>

                <div className="bg-white pt-6 px-6 pb-8 rounded-lg shadow-sm border border-gray-100">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Set Your Profit</h3>
                    <p className="mt-5 text-base text-gray-500">
                      You decide how much to sell for. The difference between your selling price and our wholesale price is your pure profit.
                    </p>
                  </div>
                </div>

                <div className="bg-white pt-6 px-6 pb-8 rounded-lg shadow-sm border border-gray-100">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Hassle-free Delivery</h3>
                    <p className="mt-5 text-base text-gray-500">
                      We handle packaging and delivery directly to your customers. You don't need to touch the inventory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-12">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How it works
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Sign Up</h3>
                  <p className="mt-2 text-sm text-gray-500">Create your free account to access our product catalog.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Share</h3>
                  <p className="mt-2 text-sm text-gray-500">Share products with your network via WhatsApp, Facebook, etc.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Order</h3>
                  <p className="mt-2 text-sm text-gray-500">Place orders on behalf of your customers when they buy.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white mx-auto text-xl font-bold mb-4">
                    4
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Earn</h3>
                  <p className="mt-2 text-sm text-gray-500">Get your profit automatically when the order is delivered.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to start earning?</span>
              <span className="block text-indigo-200">Create your account today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Join thousands of resellers who are already making a full-time income from their phones.
            </p>
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
            >
              Sign up for free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-indigo-500" />
                <span className="ml-2 text-xl font-bold text-white">ResellHub</span>
              </div>
              <p className="mt-4 text-gray-400 text-sm max-w-md">
                Empowering individuals to start their own business with zero investment. We provide the products, logistics, and technology.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Platform</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="text-base text-gray-400 hover:text-white">How it Works</a></li>
                <li><Link to="/login" className="text-base text-gray-400 hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex md:items-center md:justify-between">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} ResellHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
