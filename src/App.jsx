import { Route, Routes, HashRouter } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Navbar from './components/Navbar';
import { useSelector } from 'react-redux';
import Cart from './components/Cart';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Footer from './components/Footer';
import User from './pages/User';
import Sell from './components/Sell';  // Import Sell component
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import Category from './pages/Category';
import Contact from './pages/ContactUs';
import { I18nextProvider } from 'react-i18next';
import i18n from '/home/leul/Desktop/s/src/components/i18n.js';
function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const { drawer } = useSelector(state => state.drawer);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
    <div className="min-h-screen flex flex-col"> {/* Added flexbox and min-height */}
      <HashRouter>
        <Navbar />
        <div className="flex-grow"> {/* This will ensure the content takes up available space */}
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/category' element={<Category />} />
            <Route path='detail/:id' element={<Detail />} />
            <Route path='login' element={<SignIn />} />
            <Route path='signup' element={<SignUp />} />
            {user && <Route path='user' element={<User />} />}
            <Route path='sell' element={<Sell />} /> {/* Add Sell route */}
            <Route path='/contact' element={<Contact/>} />
            <Route path='/user' element={<User/>} />
          </Routes>
          
        </div>
        {drawer && <Cart />}
        <Footer />
      </HashRouter>
    </div>
    </I18nextProvider>
  );
}

export default App;
