import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';

const Landing = lazy(() => import('./pages/Landing'));
const Contact = lazy(() => import('./pages/Contact'));
const SignUp = lazy(() => import('./pages/SignUp'));
const SignIn = lazy(() => import('./pages/SignIn'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <div className="bg-scene" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <a className="skip-link" href="#main" data-testid="skip-link">
        Skip to content
      </a>
      <Navbar />
      <ScrollManager />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" role="status" data-testid="page-loading">Loading</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
