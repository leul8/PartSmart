import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, db } from "../components/Firebase"; 
import { FaGoogle, FaFacebook } from "react-icons/fa"; 
import { collection, query, where, getDocs } from "firebase/firestore"; 
import { useTranslation } from 'react-i18next'; 

const SignIn = () => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  
  const isEmail = (str) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(str);
  };

  
  const getEmailFromUsername = async (username) => {
    try {
      const usersRef = collection(db, "users"); 
      const q = query(usersRef, where("username", "==", username)); 
      const snapshot = await getDocs(q); 
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0]; 
        return userDoc.data().email; 
      } else {
        return null; 
      }
    } catch (error) {
      console.error("Error fetching user email from username:", error);
      return null;
    }
  };

  
  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!emailOrUsername || !password) {
      setError("Please enter both email/username and password.");
      setLoading(false);
      return;
    }

    try {
      let emailToUse = emailOrUsername;

      
      if (!isEmail(emailOrUsername)) {
        emailToUse = await getEmailFromUsername(emailOrUsername);
        if (!emailToUse) {
          setError("Username not found.");
          setLoading(false);
          return;
        }
      }

      
      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigate("/");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      setLoading(false);
    }
  };

  
  const onGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  
  const onFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <section className="bg-custom-white dark:bg-custom-dark">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-custom-dark dark:border-gray-600">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                {t('Login to your account')}
              </h1>
              {error && (
                <div className="bg-red-100 border-t border-b border-red-500 text-red-700 px-4 py-3" role="alert">
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form className="space-y-4 md:space-y-6" onSubmit={onLogin}>
                <div>
                  <label htmlFor="emailOrUsername" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t('Your email or username')}
                  </label>
                  <input
                    type="text"
                    name="emailOrUsername"
                    id="emailOrUsername"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@company.com or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value.toLowerCase())}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t('Password')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-black bg-custom-green hover:bg-custom-dark-green focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  disabled={loading}
                >
                  {loading ? t("Signing In...") : t("Sign In")}
                </button>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4"
                  onClick={onGoogleSignIn}
                >
                  <FaGoogle className="mr-2" /> {t('Sign In with Google')}
                </button>

                {/* Facebook Sign-In Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center text-white bg-blue-800 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-blue-800 mt-4"
                  onClick={onFacebookSignIn}
                >
                  <FaFacebook className="mr-2" /> {t('Sign In with Facebook')}
                </button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                {t("Don't have an account?")}{" "}
                  <button className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                    <NavLink to="/signup">{t('Sign up')}</NavLink>
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignIn;
