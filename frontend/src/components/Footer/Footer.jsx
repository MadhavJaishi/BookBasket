import { FaGithub, FaLinkedin, FaMedium  } from "react-icons/fa";

const Footer = () => {
  const h2Style = "text-lg font-semibold text-white mb-4 ml-10 sm:ml-0";
  return (
    <footer className="bg-zinc-900 text-gray-300 px-8 py-10">
      <div className="flex flex-col mx-auto sm:flex-row lg:max-w-6xl gap-10  sm:justify-around">
        
        {/* Brand */}
        <div>
          <h1 className={h2Style}>BookBasket</h1>
          <p className="mt-2 text-sm ml-16 sm:ml-0">
            A place to explore, discover, and buy your favorite books.
          </p> 
        </div>

        {/* Links */}
        <div>
          <h2 className={h2Style}>Quick Links</h2>
          <ul className="space-y-1 text-sm ml-16 sm:ml-0">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">All Books</li>
            <li className="hover:text-white cursor-pointer">Cart</li>
            <li className="hover:text-white cursor-pointer">Profile</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h2 className={h2Style}>Connect</h2>
          <div className="flex gap-4 text-xl ml-16 sm:ml-0">
            <FaGithub className="hover:text-white cursor-pointer" />
            <FaLinkedin className="hover:text-white cursor-pointer" />
            <FaMedium  className="hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-zinc-700 mt-8 pt-4 text-center text-sm">
        © {new Date().getFullYear()} Madhav Jaishi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;