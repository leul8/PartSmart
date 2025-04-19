import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth, db } from "../components/Firebase"; 
import { FaGoogle, FaFacebook } from "react-icons/fa"; 
import { collection, doc, setDoc } from "firebase/firestore"; 
import { useTranslation } from "react-i18next"; 

const SignUp = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    if (!username.trim()) {
      setError(t("Please enter a username."));
      return false;
    }
    if (!validateEmail(email)) {
      setError(t("Please enter a valid email address."));
      return false;
    }
    if (!validatePassword(password)) {
      setError(t("Password must be at least 6 characters long."));
      return false;
    }
    if (password !== passwordConfirm) {
      setError(t("Passwords do not match."));
      return false;
    }
    if (!acceptTerms) {
      setError(t("You must accept the terms and conditions."));
      return false;
    }
    setError(""); 
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; 

    setLoading(true); 

    if (!validateForm()) {
      setLoading(false); 
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      await updateProfile(user, {
        displayName: username,
      });

      
      const userRef = doc(collection(db, "users"), user.uid);
      await setDoc(userRef, {
        username,
        email,
        uid: user.uid,
      });

      navigate("/"); 
    } catch (error) {
      setError(error.message); 
      setLoading(false); 
    }
  };

  
  const onGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      
      const userRef = doc(collection(db, "users"), user.uid);
      await setDoc(userRef, {
        username: user.displayName || t("Google User"),
        email: user.email,
        uid: user.uid,
      });

      navigate("/"); 
    } catch (error) {
      setError(error.message);
    }
  };

  
  const onFacebookSignUp = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      
      const userRef = doc(collection(db, "users"), user.uid);
      await setDoc(userRef, {
        username: user.displayName || t("Facebook User"),
        email: user.email,
        uid: user.uid,
      });

      navigate("/"); 
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <section className="bg-custom-white dark:bg-custom-dark pt-24"> {/* Add padding-top to avoid navbar overlap */}
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-custom-dark dark:border-gray-600">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">
                {t("Sign up for an account")}
              </h1>
              {error && (
                <div className="bg-red-100 border-t border-b border-red-500 text-red-700 px-4 py-3" role="alert">
                  <p className="font-bold">{t("Error")}</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("Your username")}
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={t("Username")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("Your email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("Password")}
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

                <div>
                  <label htmlFor="passwordConfirm" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("Confirm Password")}
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    id="passwordConfirm"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                </div>

                {/* Terms and conditions checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={acceptTerms}
                    onChange={() => setAcceptTerms(!acceptTerms)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {t("I agree to the")}{" "}
                    <a href="#" className="text-primary-600 hover:underline dark:text-primary-500">
                      {t("Terms and Conditions")}
                    </a>
                  </label>
                </div>

                {/* Error message for terms and conditions */}
                {!acceptTerms && error === t("You must accept the terms and conditions.") && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4"
                  disabled={loading}
                >
                  {loading ? t("Signing Up...") : t("Sign Up")}
                </button>

                {/* Google Sign-Up Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4"
                  onClick={onGoogleSignUp}
                >
                  <FaGoogle className="mr-2" /> {t("Sign Up with Google")}
                </button>

                {/* Facebook Sign-Up Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center text-white bg-blue-800 hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-800 dark:hover:bg-blue-900 dark:focus:ring-blue-800 mt-4"
                  onClick={onFacebookSignUp}
                >
                  <FaFacebook className="mr-2" /> {t("Sign Up with Facebook")}
                </button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                  {t("Already have an account?")}{" "}
                  <NavLink to="/signin" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                    {t("Sign in")}
                  </NavLink>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
