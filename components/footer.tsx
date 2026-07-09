import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
              Truth<span className="text-red-500">Keeper</span>
            </h2>
            <p className="font-geist text-gray-300 mb-6 max-w-md">
              AI-powered news fact-checking with permanent, immutable proof stored on Filecoin. Check the news. Store the proof. Forever.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-orbitron text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#how-it-works"
                  className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#filecoin"
                  className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Filecoin Integration
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Why Permanent Proof
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Project */}
          <div>
            <h3 className="font-orbitron text-white font-semibold mb-4">Project</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200">
                  About TruthKeeper
                </a>
              </li>
              <li>
                <a href="#" className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200">
                  Filecoin Challenge
                </a>
              </li>
              <li>
                <a href="#" className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="font-geist text-gray-400 hover:text-red-500 transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-red-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-geist text-gray-400 text-sm">© 2025 TruthKeeper. Built for Filecoin Cycle 2 Challenge.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
