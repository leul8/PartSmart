import React, { useEffect, useState } from "react";
import { BsSun, BsMoon } from "react-icons/bs";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FaUserCircle, FaGlobe } from "react-icons/fa";
import SearchBar from '../components/SearchBar';
import Cart from '../components/Cart';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState('Normal'); 
  const colorTheme = theme === "light" ? "dark" : "light";


  const changeTheme = () => {
    setTheme(colorTheme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });
    changeTheme();
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
    return () => unsubscribe();
  }, [auth, i18n]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/", { replace: true });
        window.location.reload(true);
      })
      .catch((error) => console.log(error));
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (user) navigate("/sell");
    else navigate("/login");
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    setLanguageMenuOpen(false);
  };

  return (
    <div className="overflow-x-hidden">
      <section className="relative mx-auto my-12">
        <nav className="flex justify-between w-screen fixed z-50 top-0 bg-custom-white dark:bg-custom-dark">
          <div className="px-5 xl:px-12 py-6 flex w-full items-center justify-between">
            {/* Logo + Mobile Cart/Search */}
            <div className="flex items-center">
              <a className="font-ibmplex text-sm" href="#">
                {t('PartSmart')}
              </a>

              {/* Mobile Search & Cart */}
              <div className="flex items-center space-x-2 ml-4 md:hidden">
                <div className="relative flex items-center space-x-2">
                  {/* Search Type Dropdown */}
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md p-1"
                  >
                    <option value="normal">{t('Normal')}</option>
                    <option value="partNumber">{t('Part#')}</option>
                  </select>
                  <SearchBar searchType={searchType} /> {/* Pass searchType to SearchBar */}
                </div>

                <div className="relative">
  <a
    onClick={() => setIsCartOpen(prevState => !prevState)}  
    className="flex items-center hover:text-gray-600 cursor-pointer"
  >
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    {cartItems?.length > 0 && (
      <span className="flex absolute -mt-5 ml-4">
        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-pink-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 justify-center">
          <span className="text-white self-center text-[8px]">{cartItems?.length}</span>
        </span>
      </span>
    )}
  </a>
</div>

              </div>
            </div>

            {/* Desktop Nav Links */}
            <ul className="hidden md:flex px-4 mr-auto ml-12 font-poppins space-x-8 mt-1">
              <li><NavLink className="hover:text-green-600" to="/">{t('home')}</NavLink></li>
              <li><NavLink className="hover:text-gray-600" to="/category">{t('category')}</NavLink></li>
              <li><NavLink className="hover:text-gray-600" to="/contact">{t('contact')}</NavLink></li>
              <li>
                <a onClick={handleSellClick} className="hover:text-gray-600 cursor-pointer">{t('Sell')}</a>
              </li>
            </ul>

            {/* Desktop Right Side: Search, Cart, User, Theme, Language */}
            <div className="hidden md:flex items-center space-x-4 ml-8">
            <div className="relative flex items-center space-x-2 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mx-auto">
  {/* Search Type Dropdown */}
  <select
    value={searchType}
    onChange={(e) => setSearchType(e.target.value)}
    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md p-1"
  >
    <option value="normal">{t('Normal')}</option>
    <option value="partNumber">{t('Part#')}</option>
  </select>
  <SearchBar searchType={searchType} className="w-full" /> {/* Pass searchType to SearchBar */}
</div>


<div className="relative">
  <a
    onClick={() => setIsCartOpen(prevState => !prevState)}  
    className="flex items-center hover:text-gray-600 cursor-pointer"
  >
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    {cartItems?.length > 0 && (
      <span className="flex absolute -mt-5 ml-4">
        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-pink-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 justify-center">
          <span className="text-white self-center text-[8px]">{cartItems?.length}</span>
        </span>
      </span>
    )}
  </a>
</div>



              {/* Theme Toggle */}
              <button onClick={changeTheme}>
                {theme === "light" ? <BsSun size={20} /> : <BsMoon size={20} />}
              </button>

              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
                >
                  <FaGlobe size={20} className="text-gray-700 dark:text-white" />
                </button>
                {languageMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-48 ring-1 ring-gray-200 dark:ring-gray-700">
                    <button onClick={() => handleLanguageChange('en')} className="block py-2 text-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200">
                      {t('English')}
                    </button>
                    <button onClick={() => handleLanguageChange('am')} className="block py-2 text-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200">
                      {t('Amharic')}
                    </button>
                  </div>
                )}
              </div>
            </div>
           {/* User - Desktop only */}
<div className="hidden md:block">
  <div className="relative">
    <button
      onClick={() => setUserMenuOpen(!userMenuOpen)}
      className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
    >
      <FaUserCircle size={24} className="text-gray-700 dark:text-white" />
    </button>
    {userMenuOpen && (
      <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-48 ring-1 ring-gray-200 dark:ring-gray-700">
        {!user ? (
          <>
            <NavLink to="/login" className="block py-2 text-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200" onClick={() => setUserMenuOpen(false)}>
              {t('Sign in')}
            </NavLink>
            <NavLink to="/signup" className="block py-2 text-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200" onClick={() => setUserMenuOpen(false)}>
              {t('Sign up')}
            </NavLink>
          </>
        ) : (
          <>
            <p className="text-center text-xs text-gray-500 dark:text-gray-300 mb-2">{user?.email}</p>
            <NavLink to="/user" className="block py-2 text-center text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200" onClick={() => setUserMenuOpen(false)}>
              {t('Profile')}
            </NavLink>
            <button className="block py-2 text-center w-full text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition duration-200" onClick={() => { setUserMenuOpen(false); handleLogout(); }}>
              {t('Sign out')}
            </button>
          </>
        )}
      </div>
    )}
  </div>
</div>


            {/* Mobile Hamburger */}
            <a onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="navbar-burger self-center ml-4 md:hidden">
              <svg className="h-6 w-6 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </a>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden flex flex-col items-center absolute top-20 left-0 w-full bg-white dark:bg-gray-800 p-4 space-y-4">
              <NavLink to="/" className="py-2 text-center" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</NavLink>
              <NavLink to="/category" className="py-2 text-center" onClick={() => setIsMobileMenuOpen(false)}>{t('category')}</NavLink>
              <NavLink to="/contact" className="py-2 text-center" onClick={() => setIsMobileMenuOpen(false)}>{t('contact')}</NavLink>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleSellClick(e);
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 text-center cursor-pointer"
              >
                {t('Sell')}
              </a>

              {/* Icons Only Section */}
              <div className="flex justify-center gap-6 pt-4">
                {/* User Icon */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
                >
                  <FaUserCircle size={24} className="text-gray-700 dark:text-white" />
                </button>
                {/* Theme Toggle Icon */}
                <button
                  onClick={() => {
                    changeTheme(); 
                  }}
                >
                  {theme === "light" ? (
                    <BsSun size={22} className="text-yellow-500" />
                  ) : (
                    <BsMoon size={22} className="text-gray-700" />
                  )}
                </button>

                {/* Language Icon */}
                <button onClick={() => setLanguageMenuOpen(!languageMenuOpen)}>
                  <FaGlobe size={20} className="text-gray-700 dark:text-white" />
                </button>
              </div>

              {/* Mobile User Menu */}
              {userMenuOpen && (
                <div className="flex flex-col items-center mt-2 space-y-2">
                  {!user ? (
                    <>
                      <NavLink to="/login" onClick={() => setUserMenuOpen(false)}>{t('signin')}</NavLink>
                      <NavLink to="/signup" onClick={() => setUserMenuOpen(false)}>{t('signup')}</NavLink>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</p>
                      <NavLink to="/user" onClick={() => setUserMenuOpen(false)}>{t('Profile')}</NavLink>
                      <button onClick={() => { handleLogout(); setUserMenuOpen(false); }}>{t('Sign out')}</button>
                    </>
                  )}
                  </div>
              )}

              {/* Mobile Language Menu */}
              {languageMenuOpen && (
                <div className="flex flex-col items-center mt-2 space-y-2">
                  <button onClick={() => { handleLanguageChange('en'); setLanguageMenuOpen(false); }} className="text-center">{t('English')}</button>
                  <button onClick={() => { handleLanguageChange('am'); setLanguageMenuOpen(false); }} className="text-center">{t('Amharic')}</button>
                </div>
              )}
            </div>
          )}
        </nav>

        {isCartOpen && (
  <Cart onClose={() => setIsCartOpen(false)} />
)}

      </section>
    </div>
  );

}

export default Navbar;